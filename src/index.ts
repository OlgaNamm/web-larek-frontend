import './scss/styles.scss';

import { Api } from './components/base/api';
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

//console.log('API_URL:', API_URL); // Проверка URL

const api = new Api(API_URL);
const events = new EventEmitter();

const cardModel = new CardModel(events);
const cartModel = new CartModel(events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

//подписка на все события для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

// Обновляет список карточек на главной странице при изменении данных
events.on('catalog:changed', () => {
	if (!Array.isArray(cardModel.cards)) {
		console.error('cardModel.cards не массив:', cardModel.cards);
		return;
	}
	const cards = cardModel.cards.map((card) => page.renderCard(card));
	page.catalog = cards;
});

// Загрузка товаров
api
	.get<{ items: ICard[] }>('/product')
	.then((response) => {
		console.log('Получены данные:', {
			count: response.items.length,
			firstItem: response.items[0],
			imagePath: response.items[0]?.image,
		});

		// Преобразую из SVG в PNG
		const modifiedItems = response.items.map((item) => ({
			...item,
			image: item.image.replace('.svg', '.png'),
		}));
		cardModel.cards = modifiedItems;
	})
	.catch((error) => {
		console.error('Ошибка загрузки:', error);
	});

// Открывает карточку товара в модальном окне
events.on('card:open', (data: { id: string }) => {
	const item = cardModel.getCardById(data.id);
	if (!item) return;
	const preview = new Card('card', cloneTemplate('#card-preview'), events);
	preview.id = item.id;
	preview.title = item.title;
	preview.price = item.price;
	preview.category = item.category;
	preview.image = item.image;

	const cardElement = preview.render();
	
	 const button = cardElement.querySelector<HTMLButtonElement>('.card__button');
    if (button) {
        preview.setDisabled(button, item.price === null || cartModel.isItemInCart(item.id));
        
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (item.price !== null) {
                cartModel.addItem(item);
                modal.close();
                preview.setDisabled(button, true); // Блокируем после добавления
            }
        });
    }

	modal.render({
		content: cardElement,
	});
});

// Добавляет товар в корзину и закрывает модальное окно
events.on('card:select', (data: { id: string }) => {
	const item = cardModel.getCardById(data.id);
	if (item && item.price !== null) {
		cartModel.addItem(item);
		modal.close(); // НЕ РАБОТАЕТ
	}
});

// Обработчик ошибок формы
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

// Обработчик открытия формы заказа
events.on('order:open', () => {
	formModel.setStep('order');
	formModel.reset();

	modal.render({
		content: orderFirst.render({
			payment: '',
			address: '',
		}),
	});
});

// Обработчики изменений полей
events.on('order.payment:change', (data: { payment: string }) => {
	formModel.setOrderData({ payment: data.payment });
});

events.on('order.address:change', (data: { address: string }) => {
	formModel.setOrderData({ address: data.address });
});

// Обработчик открытия второго шага
events.on('contacts:open', () => {
	formModel.setStep('contacts');

	// Очищаем предыдущие ошибки
	orderSecond.errors = '';
	modal.render({
		content: orderSecond.render({
			email: '',
			phone: '',
		}),
	});
});

const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);

// Открывает модальное окно корзины
events.on('basket:open', () => {
	modal.render({
		content: basket.render({
			items: [], // пустой массив должен обновиться через cart:changed
			total: cartModel.getTotal(),
			selected: cartModel.getItems().map((item) => item.id),
		}),
	});
	// Принудительно триггерим обновление корзины
	events.emit('cart:changed');
});

// Обновляет счетчик, список товаров и сумму в корзине
events.on('cart:changed', () => {
    page.counter = cartModel.getItemCount();

    const basketItems = cartModel.getItems().map((item, index) => {
        const template = cloneTemplate('#card-basket');
        const basketCard = new Card('card', template);
        basketCard.title = item.title;
        basketCard.price = item.price;

        const cardElement = basketCard.render();

        // Устанавливаем номер позиции
        const indexElement = cardElement.querySelector('.basket__item-index');
        if (indexElement) {
            indexElement.textContent = (index + 1).toString();
        }

        // Обработчик удаления
        const deleteButton = cardElement.querySelector('.basket__item-delete');
        if (deleteButton) {
            // Полностью заменяем кнопку для сброса всех обработчиков
            const newDeleteButton = deleteButton.cloneNode(true) as HTMLButtonElement;
            deleteButton.replaceWith(newDeleteButton);
            
            newDeleteButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                cartModel.removeItem(item.id);
            });
        }

        return cardElement;
    });

    basket.items = basketItems;
    basket.total = cartModel.getTotal();
    basket.selected = cartModel.getItems().map(item => item.id);

    // Обновление кнопки в модальном окне карточки
   const modalCard = document.querySelector<HTMLElement>('#modal-container .card');
    if (modalCard) {
        const cardId = modalCard.dataset.id;
        const button = modalCard.querySelector<HTMLButtonElement>('.card__button');
        const cardComponent = new Card('card', modalCard, events);
        
        if (button && cardId) {
            cardComponent.setDisabled(button, cartModel.isItemInCart(cardId));
        }
    }
});

const formModel = new FormModel(events);
const orderFirst = new OrderFirst(cloneTemplate<HTMLElement>('#order'), events);
const orderSecond = new OrderSecond(
	cloneTemplate<HTMLElement>('#contacts'),
	events
);

// Обработчик валидации формы
events.on('order:validation', (data: { valid: boolean; errors: string }) => {
	console.log('Validation:', {
		step: formModel._currentStep,
		valid: data.valid,
		errors: data.errors,
	});

	if (formModel._currentStep === 'order') {
		orderFirst.errors = data.errors;
		orderFirst.valid = data.valid;
	} else {
		orderSecond.errors = data.errors;
		orderSecond.valid = data.valid;
	}
});

// Обработчик отправки формы
events.on('order:submit', () => {
	if (formModel.valid) {
		events.emit('contacts:open');
	} else {
		console.warn('Форма не валидна!');
	}
});

const successTemplate = cloneTemplate<HTMLElement>('#success');
const success = new Success(successTemplate, {
	onClick: () => {
		modal.close();
	},
});

// Обработчик отправки формы контактов
events.on('contacts:submit', () => {
	if (formModel.valid) {
		const orderData = {
			...formModel.getFormData(),
			total: cartModel.getTotal(), // Вычисляем сумму через getTotal()
			items: cartModel.getItems().map((item) => item.id),
		};

		console.log('Отправка заказа:', orderData); // Для отладки

		api
			.post('/order', orderData)
			.then(() => {
				// Показываем попап успешного оформления
				success.total = cartModel.getTotal();
				modal.render({
					content: success.render({}),
				});

				// Очищаем корзину
				cartModel.clear();
			})
			.catch((err) => {
				console.error('Ошибка оформления заказа:', err);
			});
	}
});

// Обработчик очистки корзины
events.on('cart:cleared', () => {
	console.log('Корзина очищена');
});
