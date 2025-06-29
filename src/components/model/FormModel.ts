import { IOrderForm } from '../../types';
import { IEvents } from '../base/events';

export class FormModel {
	protected _payment: string = '';
	protected _address: string = '';
	protected _email: string = '';
	protected _phone: string = '';
	protected _valid: boolean = false;
	public _currentStep: 'order' | 'contacts' = 'order';
	protected _initialLoad: boolean = true; // проверка начальной загрузки модалки
	protected _hasPaymentInteraction: boolean = false;
	protected _hasAddressInteraction: boolean = false;

	constructor(protected events: IEvents) {
		// Подписываемся на изменения полей
		events.on('order.payment:change', (data: { payment: string }) => {
			this._payment = data.payment;
			this._hasPaymentInteraction = true;
			this.validate();
		});

		events.on('order.address:change', (data: { address: string }) => {
			this._address = data.address.trim();
			this._hasAddressInteraction = true;
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
			// Проверяем валидность полей
			const paymentSelected = !!this._payment;
			const addressValid = !!this._address?.trim();

			// Устанавливаем общую валидность
			isValid = paymentSelected && addressValid;

			// Показываем ошибки только после взаимодействия (выбран способ оплаты)
			if (paymentSelected && !addressValid) {
            errors.address = 'Введите адрес доставки';
        }
		} else {
			// Для второго шага
			const emailValid = !!this._email;
        const phoneValid = !!this._phone;

			// Кнопка должна быть неактивна при первом открытии
			isValid = emailValid && phoneValid;

			// Показываем ошибки только если поле было изменено
			if (!emailValid) {
				errors.email = 'Введите email';
			}

			if (!phoneValid) {
				errors.phone = 'Введите номер телефона';
			}
		}

		this._valid = isValid;

		this.events.emit('order:validation', {
			valid: isValid,
			errors: Object.values(errors).filter(Boolean).join('. '),
		});

		return isValid;
	}

	get valid(): boolean {
		return this._valid;
	}

	// Очищает данные формы
	reset(): void {
		this._initialLoad = true; // Сброс флага при перезагрузке
		this._payment = '';
		this._address = '';
		this._email = '';
		this._phone = '';
		this._valid = false;
		this._currentStep = 'order';
		this._hasPaymentInteraction = false;
		this._hasAddressInteraction = false;
	}
}
