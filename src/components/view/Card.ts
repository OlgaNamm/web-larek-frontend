import { Component } from '../base/Component';
import { ICard, categories } from '../../types';
import { CDN_URL } from '../../utils/constants';
import { IEvents } from '../base/events';

export class Card extends Component<ICard> {
	protected _id: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _category: HTMLElement;
	protected _image: HTMLImageElement;
	protected _button: HTMLButtonElement | null;

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
			this.container.addEventListener('click', (e) => {
				events.emit('card:open', { id: this.container.dataset.id });
			});

			if (this._button) {
				this._button.addEventListener('click', () => {
					events.emit('card:select', { id: this.container.dataset.id });
				});
			}
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
                this._button.disabled = true;
                this._button.textContent = 'Недоступно';
                this._button.classList.add('card__button_disabled');
            }
            return;
        } else {
            this.setText(this._price, `${value} синапсов`);
            if (this._button) {
                this.setDisabled(this._button, false);
                this.setText(this._button, 'В корзину');
            }
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

	/*set button(value: string) {
		if (
			this._button &&
			!this._button.classList.contains('basket__item-delete')
		) {
			this.setText(this._button, value);
		}
	}*/

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
}
