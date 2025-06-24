import { IOrderForm } from '../../types';
import { IEvents } from '../base/events';

export class FormModel {
	protected payment: string;
	protected address: string;
	protected email: string;
	protected phone: string;

	constructor(protected events: IEvents) {}

	setOrderData(data: IOrderForm) {}
    
	getFormData(): IOrderForm {}

	validate(): boolean {}
}
