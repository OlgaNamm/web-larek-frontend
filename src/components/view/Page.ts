import { Component } from '../base/Component';
import { ICard } from '../../types';
import { Card } from './Card';
import { IEvents } from '../base/events';
import { template } from '../..';

interface IPage {
	content: HTMLElement;
}

export class Page extends Component<IPage> {
    protected _counter: HTMLElement;
    protected _catalog: HTMLElement;
    protected _wrapper: HTMLElement;
    protected _basket: HTMLElement;

    constructor(container: HTMLElement, protected events?: IEvents) {
        super(container);

        this._counter = container.querySelector('.header__basket-counter');
        this._catalog = container.querySelector('.gallery');
        this._wrapper = container.querySelector('.page__wrapper');
        this._basket = container.querySelector('.header__basket');

        if (this._basket && events) { // оброботчик клика по корзине
            this._basket.addEventListener('click', () => {
                events.emit('basket:open');
            });
        }
    }

    set counter(value: number) {
        this.setText(this._counter, String(value));
    }

    set catalog(items: HTMLElement[]) {
        this._catalog.replaceChildren(...items);
    }

    renderCard(data: ICard): HTMLElement {
        const card = template.content.cloneNode(true) as HTMLElement;
        const cardComponent = new Card('card', card.querySelector('.card'), this.events);

        cardComponent.id = data.id;
        cardComponent.title = data.title;
        cardComponent.price = data.price;
        cardComponent.category = data.category;
        cardComponent.image = data.image;

        return card;
    }
}