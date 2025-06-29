import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
	total: number;
	selected: string[];
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._button = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		//если кнопка есть - обработчик клика
		if (this._button) {
			this._button.addEventListener('click', () => {
				//console.log('Клик по кнопке оформления');
				this.events.emit('order:open');
			});
		}
	}

	// устанавливаем список товаров
	set items(items: HTMLElement[]) {
		this._list.replaceChildren(...items);
	}

	// установка состояния кнопки
	set selected(items: string[]) {
		this.setDisabled(this._button, items.length === 0);
	}

	// установка стоимости заказа
	set total(total: number) {
		this.setText(this._total, `${total} синапсов`);
	}

	render(data?: Partial<IBasketView>): HTMLElement {
		if (data) {
			if (data.items) this.items = data.items;
			if (data.total !== undefined) this.total = data.total;
			if (data.selected) this.selected = data.selected;
		}
		return this.container;
	}
}
