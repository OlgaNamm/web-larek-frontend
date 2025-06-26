import { IOrderForm } from '../../types';
import { IEvents } from '../base/events';

export class FormModel {
	protected _payment: string = '';
	protected _address: string = '';
	protected _email: string = '';
	protected _phone: string = '';
	protected _valid: boolean = false;
	public _currentStep: 'order' | 'contacts' = 'order';

	constructor(protected events: IEvents) {
		// Подписываемся на изменения полей
		events.on('order.payment:change', (data: { payment: string }) => {
			this._payment = data.payment;
			this.validate();
		});

		events.on('order.address:change', (data: { address: string }) => {
			this._address = data.address.trim();
			this.validate();
		});

		events.on('contacts.email:change', (data: { email: string }) => {
			this._email = data.email.trim();
			this.validate();
		});

		events.on('contacts.phone:change', (data: { phone: string }) => {
			this._phone = data.phone.trim();
			this.validate();
		});
	}

	// Устанавливает данные формы
	setOrderData(data: Partial<IOrderForm>): void {
		if (data.payment !== undefined) this._payment = data.payment;
		if (data.address !== undefined) this._address = data.address.trim();
		if (data.email !== undefined) this._email = data.email.trim();
		if (data.phone !== undefined) this._phone = data.phone.trim();
		this.validate();
	}

	// Возвращает все данные формы
	getFormData(): IOrderForm {
		return {
			payment: this._payment,
			address: this._address,
			email: this._email,
			phone: this._phone,
		};
	}

	// Устанавливает текущий шаг для валидации
	setStep(step: 'order' | 'contacts'): void {
		this._currentStep = step;
		this.validate();
	}

	// Валидация формы
	validate(): boolean {
    const errors: Partial<IOrderForm> = {};
    let isValid = true;

    if (this._currentStep === 'order') {
        if (!this._payment) {
            errors.payment = 'Не выбран способ оплаты';
            isValid = false;
        }
        if (!this._address?.trim()) {
            errors.address = 'Укажите адрес доставки';
            isValid = false;
        }
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!this._email || !emailRegex.test(this._email)) {
            errors.email = 'Укажите корректный email';
            isValid = false;
        }

        const phoneRegex = /^\+?[\d\s\-\(\)]{7,}$/;
        if (!this._phone || !phoneRegex.test(this._phone)) {
            errors.phone = 'Укажите корректный номер телефона';
            isValid = false;
        }
    }

    this._valid = isValid;
    
    this.events.emit('order:validation', {
        valid: isValid,
        errors: Object.values(errors).filter(Boolean).join(', ')
    });
    
    return isValid;
}

	get valid(): boolean {
		return this._valid;
	}

	// Очищает данные формы
	reset(): void {
		this._payment = '';
		this._address = '';
		this._email = '';
		this._phone = '';
		this._valid = false;
		this._currentStep = 'order';
	}
}
