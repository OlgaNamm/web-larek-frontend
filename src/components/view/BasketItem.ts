import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { ICard } from '../../types';

export class BasketItem extends Component<ICard> {
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement) {
		super(container);

		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__item-delete',
			container
		);
	}

	set index(value: number) {
		this.setText(this._index, value.toString());
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
	}

	set onClick(callback: () => void) {
		this._button.addEventListener('click', (event) => {
			event.preventDefault();
			callback();
		});
	}

	render(data?: Partial<ICard & { index: number }>): HTMLElement {
		if (data) {
			if (data.title) this.title = data.title;
			if (data.price !== undefined) this.price = data.price;
			if (data.index !== undefined) this.index = data.index;
		}
		return this.container;
	}
}
