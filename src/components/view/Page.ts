import { Component } from '../base/Component';
import { ICard, ICardRenderer } from '../../types';
import { IEvents } from '../base/events';

interface IPage {
	content: HTMLElement;
}

export class Page extends Component<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;
	protected _cardRenderer: ICardRenderer;

	constructor(container: HTMLElement, protected events?: IEvents) {
		super(container);

		this._counter = container.querySelector('.header__basket-counter');
		this._catalog = container.querySelector('.gallery');
		this._wrapper = container.querySelector('.page__wrapper');
		this._basket = container.querySelector('.header__basket');

		if (this._basket && events) {
			// оброботчик клика по корзине
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

	set cardRenderer(renderer: ICardRenderer) {
		this._cardRenderer = renderer;
	}
}
