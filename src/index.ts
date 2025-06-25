import './scss/styles.scss';

import { Api } from './components/base/api';
import { API_URL } from './utils/constants';
import { ICard } from './types';
import { EventEmitter } from './components/base/events';
import { CardModel } from './components/model/CardModel';
import { Page } from './components/view/Page';

//console.log('API_URL:', API_URL); // Проверка URL

const api = new Api(API_URL);

const events = new EventEmitter();
const cardModel = new CardModel(events);
const page = new Page(document.body);

// Подписка на событие обновления каталога
events.on('catalog:changed', () => {
    if (!Array.isArray(cardModel.cards)) {
        console.error('cardModel.cards не массив:', cardModel.cards);
        return;
    }
    const cards = cardModel.cards.map((card) => page.renderCard(card));
    page.catalog = cards;
});

// Получение данных и обновление модели
api.get<{ items: ICard[] }>('/product')
    .then((response) => {
        console.log('Data received:', response.items); 

        // Преобразую из SVG в PNG
        const modifiedItems = response.items.map(item => ({
            ...item,
            image: item.image.replace('.svg', '.png') 
        }));

        cardModel.cards = response.items; 
    })
    .catch((error) => {
        console.error('Error:', error);
    });