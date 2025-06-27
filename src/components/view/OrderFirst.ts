import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/events';
import { IOrderForm } from '../../types';

export class OrderFirst extends Component<IOrderForm> {
	protected _onlineButton: HTMLButtonElement;
	protected _offlineButton: HTMLButtonElement;
	protected _addressInput: HTMLInputElement;
	protected _submitButton: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._onlineButton = ensureElement<HTMLButtonElement>(
			'button[name="card"]',
			container
		);
		this._offlineButton = ensureElement<HTMLButtonElement>(
			'button[name="cash"]',
			container
		);
		this._addressInput = ensureElement<HTMLInputElement>(
			'input[name="address"]',
			container
		);
		this._submitButton = ensureElement<HTMLButtonElement>(
			'button.order__button',
			container
		);
		this._errors = ensureElement<HTMLElement>('.form__errors', container);

		this._onlineButton.addEventListener('click', () => {
			this.toggleClass(this._onlineButton, 'button_alt-active', true);
			this.toggleClass(this._offlineButton, 'button_alt-active', false);
			events.emit('order.payment:change', { payment: 'online' });
		});

		this._offlineButton.addEventListener('click', () => {
			this.toggleClass(this._onlineButton, 'button_alt-active', false);
			this.toggleClass(this._offlineButton, 'button_alt-active', true);
			events.emit('order.payment:change', { payment: 'offline' });
		});

		this._addressInput.addEventListener('input', () => {
			events.emit('order.address:change', {
				address: this._addressInput.value,
			});
		});

		container.addEventListener('submit', (e) => {
			e.preventDefault();
			events.emit('order:submit');
		});
	}

	set address(value: string) {
		this._addressInput.value = value;
	}

	set valid(value: boolean) {
		if (this._submitButton) {
			this.setDisabled(this._submitButton, !value);
		}
	}

	set errors(value: string) {
		if (this._errors) {
			this._errors.textContent = value;
			this._errors.style.display = value ? 'block' : 'none';
		}
	}

	render(data: Partial<IOrderForm>): HTMLElement {
		super.render(data);

		// Сбрасываем состояние при рендере
		this.valid = false;
		this.errors = '';

		// Устанавливаем начальные значения
		if (data.payment === 'online') {
			this.toggleClass(this._onlineButton, 'button_alt-active', true);
			this.toggleClass(this._offlineButton, 'button_alt-active', false);
		} else if (data.payment === 'offline') {
			this.toggleClass(this._onlineButton, 'button_alt-active', false);
			this.toggleClass(this._offlineButton, 'button_alt-active', true);
		} else {
			// Сбрасываем выбор способа оплаты
			this.toggleClass(this._onlineButton, 'button_alt-active', false);
			this.toggleClass(this._offlineButton, 'button_alt-active', false);
		}

		if (data.address) {
			this.address = data.address;
		} else {
			this.address = '';
		}

		return this.container;
	}
}
