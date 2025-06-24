import { Component } from '../base/Component';
import { ICard, categories } from '../../types';
import { CDN_URL } from '../../utils/constants'

export class Card extends Component<ICard> {
    protected _id: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _category: HTMLElement;
    protected _image: HTMLImageElement;
    protected _button?: HTMLButtonElement;

    constructor(protected blockName: string, container: HTMLElement) {
        super(container);

        this._title = container.querySelector(`.${blockName}__title`);
        this._price = container.querySelector(`.${blockName}__price`);
        this._category = container.querySelector(`.${blockName}__category`);
        this._image = container.querySelector(`.${blockName}__image`);
        this._button = container.querySelector(`.${blockName}__button`);
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
        } else {
            this.setText(this._price, `${value} синапсов`);
        }
    }

    set category(value: categories) {
        this.setText(this._category, value);
        this._category.className = `${this.blockName}__category ${this.blockName}__category_${this.getCategoryClass(value)}`;
    }

    set image(value: string) {
        this.setImage(this._image, `${CDN_URL}${value}`, this._title.textContent);
    }

    set button(value: string) {
        if (this._button) {
            this.setText(this._button, value);
        }
    }

    private getCategoryClass(category: categories): string {
        switch (category) {
            case 'софт-скилс':
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