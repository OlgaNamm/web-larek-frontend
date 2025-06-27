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
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		this._list.addEventListener('click', (e) => {
			const deleteButton = (e.target as HTMLElement).closest(
				'.basket__item-delete'
			);
			if (deleteButton) {
				e.stopPropagation();
			}
		});

		//если кнопка есть - обработчик клика
		if (this._button) {
			this._button.addEventListener('click', () => {
				console.log('Клик по кнопке оформления');
				this.events.emit('order:open');
			});
		}

		// Инициализируем массив товаров пустым массивом
		this.items = [];
	}
	// устанавливаем список товаров
	set items(items: HTMLElement[]) {
		this._list.replaceChildren(...items);
	}
	// установка состояния кнопки
	set selected(items: string[]) {
		if (items.length) {
			this.setDisabled(this._button, false);
		} else {
			this.setDisabled(this._button, true);
		}
	}
	// установка стоимости заказа
	set total(total: number) {
		this.setText(this._total, `${total} синапсов`);
	}
}
