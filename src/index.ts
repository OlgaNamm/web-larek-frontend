import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { ICard, IOrderForm } from './types';
import { Card } from './components/view/Card';
import { CardModel } from './components/model/CardModel';
import { EventEmitter } from './components/base/events';
import { CartModel } from './components/model/CartModel';
import { Page } from './components/view/Page';
import { Modal } from './components/base/Modal';
import { Basket } from './components/view/Basket';
import { cloneTemplate, ensureElement } from './utils/utils';
import { FormModel } from './components/model/FormModel';
import { OrderFirst } from './components/view/OrderFirst';
import { OrderSecond } from './components/view/OrderSecond';
import { Success } from './components/view/OrderSuccess';
import { WebLarekApi } from './components/base/WebLarekApi';
import { BasketItem } from './components/view/BasketItem';

//console.log('API_URL:', API_URL); // Проверка URL

const api = new WebLarekApi(API_URL, CDN_URL);
const events = new EventEmitter();

const cardModel = new CardModel(events);
const cartModel = new CartModel(events);
const formModel = new FormModel(events);

const modalTemplate = ensureElement<HTMLElement>('#modal-container');
const basketTemplate = cloneTemplate<HTMLElement>('#basket');
const orderTemplate = cloneTemplate<HTMLElement>('#order');
const contactsTemplate = cloneTemplate<HTMLElement>('#contacts');
const successTemplate = cloneTemplate<HTMLElement>('#success');

const template =
	document.querySelector<HTMLTemplateElement>('#card-catalog');

const page = new Page(document.body, events);
const modal = new Modal(modalTemplate, events);
const basket = new Basket(basketTemplate, events);
const orderFirst = new OrderFirst(orderTemplate, events);
const orderSecond = new OrderSecond(contactsTemplate, events);
const success = new Success(successTemplate, {
	onClick: () => modal.close(),
});

//подписка на все события для отладки
//events.onAll(({ eventName, data }) => {
//	console.log(eventName, data);
//});


// Загрузка товаров
api.getProductList()
    .then(items => {
        cardModel.cards = items;
        page.catalog = items.map(card => 
            Card.createCard(template, card, events)  // Рендерим через статический метод
        );
    })
    .catch(console.error);

// Обновляет каталог (список карточек товаров)
events.on('catalog:changed', () => {
	const cardElements = cardModel.cards.map(cardData => 
        Card.createCard(template, cardData, events)  // Используем статический метод
    );
    page.catalog = cardElements;
});

// Карточка товара
events.on('card:open', (data: { id: string }) => {
	const item = cardModel.getCardById(data.id);
	if (!item) return;

	const preview = new Card('card', cloneTemplate('#card-preview'), events);
	preview.render({
		id: item.id,
		title: item.title,
		price: item.price,
		category: item.category,
		image: item.image,
	});

	// состояние кнопки
	preview.buttonDisabled =
		item.price === null || cartModel.isItemInCart(item.id);

	// Обработчик клика по кнопке
	if (preview._button) {
		preview._button.addEventListener('click', (e) => {
			e.stopPropagation();
			cartModel.addItem(item);
			preview.buttonDisabled = true; // Блокируем кнопку после добавления
			modal.close();
		});
	}

	modal.render({
		content: preview.render(),
	});
});

// Корзина товаров
events.on('basket:open', () => {
	modal.render({
		content: basket.render(),
	});
});

events.on('cart:changed', () => {
	page.counter = cartModel.getItemCount();

	const items = cartModel.getItems().map((item, index) => {
		const basketItem = new BasketItem(cloneTemplate('#card-basket'));
		basketItem.index = index + 1;
		basketItem.title = item.title;
		basketItem.price = item.price;
		basketItem.onClick = () => cartModel.removeItem(item.id);
		return basketItem.render();
	});

	basket.items = items;
	basket.total = cartModel.getTotal();
	basket.selected = cartModel.getItems().map((item) => item.id);
});

// Форма заказа
events.on('order:open', () => {
	// шаг 1
	formModel.setStep('order');
	formModel.reset();

	modal.render({
		content: orderFirst.render({
			payment: '',
			address: '',
		}),
	});
});

events.on('contacts:open', () => {
	// шаг 2
	formModel.setStep('contacts');

	orderSecond.errors = '';
	modal.render({
		content: orderSecond.render({
			email: '',
			phone: '',
		}),
	});
});

// Обработчик отправки формы шаг 1 для шага 2
events.on('order:submit', () => {
	if (formModel.valid) {
		events.emit('contacts:open');
	}
});

// Обработчик отправки формы
events.on('contacts:submit', () => {
	api
		.createOrder({
			...formModel.getFormData(),
			total: cartModel.getTotal(),
			items: cartModel.getItems().map((item) => item.id),
		})
		.then((result) => {
			success.total = result.total;
			modal.render({ content: success.render({}) });
			cartModel.clear();
		})
		.catch((err) => {
			console.error('Ошибка оформления заказа:', err);
		});
});

// Обработчики изменений полей
events.on('order.payment:change', (data: { payment: string }) => {
	formModel.setOrderData({ payment: data.payment });
});

events.on('order.address:change', (data: { address: string }) => {
	formModel.setOrderData({ address: data.address });
});

// Валидация формы
events.on('order:validation', (data: { valid: boolean; errors: string }) => {
	//console.log('Validation:', {
	//	step: formModel._currentStep,
	//	valid: data.valid,
	//	errors: data.errors,
	//});

	if (formModel._currentStep === 'order') {
		orderFirst.errors = data.errors;
		orderFirst.valid = data.valid;
	} else {
		orderSecond.errors = data.errors;
		orderSecond.valid = data.valid;
	}
});

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	if (formModel._currentStep === 'order') {
		const errorMessages = Object.values({
			payment: errors.payment,
			address: errors.address,
		})
			.filter(Boolean)
			.join(', ');

		orderFirst.errors = errorMessages;
		orderFirst.valid = !errorMessages;
	}
});
