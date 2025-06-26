import './scss/styles.scss';

import { Api } from './components/base/api';
import { API_URL, CDN_URL } from './utils/constants';
import { ICard } from './types';
import { Card } from './components/view/Card';
import { CardModel } from './components/model/CardModel';
import { EventEmitter } from './components/base/events';
import { CartModel } from './components/model/CartModel';
import { Page } from './components/view/Page';
import { Modal } from './components/base/Modal';
import { Basket } from './components/view/Basket';
import { cloneTemplate, ensureElement } from './utils/utils';

//console.log('API_URL:', API_URL); // Проверка URL

const api = new Api(API_URL);
const events = new EventEmitter();

//подписка на все события для отладки
events.onAll(({ eventName, data }) => {
	console.log(eventName, data);
});

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cardModel = new CardModel(events);
const cartModel = new CartModel(events);

const basket = new Basket(cloneTemplate<HTMLElement>('#basket'), events);

// Подписка на событие обновления каталога
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

// открытия карточки в модальном окне
events.on('card:open', (data: { id: string }) => {
	const item = cardModel.getCardById(data.id);
	if (!item) return;

	const preview = new Card('card', cloneTemplate('#card-preview'), events);
	preview.id = item.id;
	preview.title = item.title;
	preview.price = item.price;
	preview.category = item.category;
	preview.image = item.image;
	preview.button = 'В корзину';

	modal.render({
		content: preview.render(),
	});
});

events.on('card:select', (data: { id: string }) => {
	const item = cardModel.getCardById(data.id);
	if (item) {
        cartModel.addItem(item);
        modal.close();
    }
});

events.on('basket:open', () => {
	modal.render({
		content: basket.render({
			items: [],
			total: cartModel.getTotal(),
			selected: cartModel.getItems().map((item) => item.id),
		}),
	});
});

events.on('cart:changed', () => {
	// Обновляем счетчик в шапке
    page.counter = cartModel.getItemCount();
    
    // Создаем элементы корзины
    const basketItems = cartModel.getItems().map((item, index) => {
        const card = new Card('card', cloneTemplate('#card-basket'));
        card.title = item.title;
        card.price = item.price;
        
        const cardElement = card.render();
        
        // Устанавливаем номер позиции
        const indexElement = cardElement.querySelector('.basket__item-index');
        if (indexElement) indexElement.textContent = (index + 1).toString();
        
        // Вешаем обработчик удаления напрямую
        const deleteButton = cardElement.querySelector('.basket__item-delete');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => {
                cartModel.removeItem(item.id); // Удаляем сразу через модель
            });
        }
        
        return cardElement;
    });
    
    // Обновляем корзину
    basket.items = basketItems;
    basket.total = cartModel.getTotal();
    basket.selected = cartModel.getItems().map(item => item.id);
});
