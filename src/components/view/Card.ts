import { Component } from '../base/Component';
import { ICard, categories } from '../../types';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';
import { cloneTemplate } from '../../utils/utils';

export class Card extends Component<ICard> {
	protected _id: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	public _button: HTMLButtonElement | null;

	constructor(
		protected blockName: string,
		container: HTMLElement,
		events?: IEvents
	) {
		super(container);

		const isBasketItem =
			container.classList.contains('card_compact') ||
			container.closest('.basket__list');

		this._title = container.querySelector(`.${blockName}__title`);
		this._price = container.querySelector(`.${blockName}__price`);
		this._category = container.querySelector(`.${blockName}__category`);
		this._image = container.querySelector(`.${blockName}__image`);
		this._button = isBasketItem
			? null
			: container.querySelector(`.${blockName}__button`);

		if (events && !isBasketItem) {
			this.container.addEventListener('click', () => {
				events.emit('card:open', { id: this.container.dataset.id });
			});
		}
	}

	set buttonDisabled(state: boolean) {
		if (this._button) {
			this.setDisabled(this._button, state);
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: number | null) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			if (this._button) {
				this._button.disabled = true; // Блокируем кнопку для бесценных товаров
			}
			return;
		}

		this.setText(this._price, `${value} синапсов`);
		if (this._button) {
			this._button.disabled = false; // Разблокируем для товаров с ценой
		}
	}

	set category(value: categories) {
		this.setText(this._category, value);
		this._category.className = `${this.blockName}__category ${
			this.blockName
		}__category_${this.getCategoryClass(value)}`;
	}

	set image(value: string) {
		// проверка пути
		const imagePath = value.startsWith('/') ? value : `/${value}`;
		const fullPath = `${CDN_URL}${imagePath}`;
		this.setImage(this._image, fullPath, this._title.textContent);
	}

	private getCategoryClass(category: categories): string {
		switch (category) {
			case 'софт-скил':
				return 'soft';
			case 'хард-скил':
				return 'hard';
			case 'дополнительное':
				return 'additional';
			case 'кнопка':
				return 'button';
			default:
				return 'other';
		}
	}

	static createCard(
        template: HTMLTemplateElement,
        data: ICard,
        events?: IEvents
    ): HTMLElement {
        const cardElement = cloneTemplate(template);
        const card = new Card('card', cardElement, events);
        card.id = data.id;
        card.title = data.title;
        card.price = data.price;
        card.category = data.category;
        card.image = data.image;
        return card.render();
    }
}
