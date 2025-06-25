export type categories =
	| 'другое'
	| 'софт-скил'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

export interface ICard {
	id: string;
	title: string;
	price: number;
	category: categories;
	description: string;
	image: string;
}



export interface IOrderForm {
    payment: string;
	address: string;
	email: string;
	phone: string;
}
