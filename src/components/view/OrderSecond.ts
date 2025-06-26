import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";
import { IOrderForm } from "../../types";

export class OrderSecond extends Component<IOrderForm> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;
    protected _submitButton: HTMLButtonElement;
    protected _errors: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);
        this._submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', container);
        this._errors = ensureElement<HTMLElement>('.form__errors', container);
        this._errors.textContent = ''; // Очищаем ошибки при инициализации

        // Обработчики изменения полей
        this._emailInput.addEventListener('input', () => {
            this.events.emit('contacts.email:change', { email: this._emailInput.value });
        });

        this._phoneInput.addEventListener('input', () => {
            this.events.emit('contacts.phone:change', { phone: this._phoneInput.value });
        });

        // Обработчик отправки формы
        container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit('contacts:submit', {
                email: this._emailInput.value,
                phone: this._phoneInput.value
            });
        });
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }

    set valid(value: boolean) {
        this.setDisabled(this._submitButton, !value);
    }

    set errors(value: string) {
        // Показываем ошибки только если поле было изменено
        if (this._errors && (value || this._emailInput.value || this._phoneInput.value)) {
            this._errors.textContent = value;
        } else {
            this._errors.textContent = '';
        }
    }

    render(data: Partial<IOrderForm>): HTMLElement {
    super.render(data);
    
    // Сбрасываем состояние при рендере
    this.valid = false;
    this.errors = '';
    
    if (data.email) {
        this.email = data.email;
    }
    
    if (data.phone) {
        this.phone = data.phone;
    }
    
    return this.container;
}
}