type categories =
	| 'другое'
	| 'софт-скилс'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';

interface ICard {
	id: string;
	title: string;
	price: number | null;
	category: categories;
	description: string;
	image: string;
}

interface IOrderForm {
    payment: string;
	address: string;
	email: string;
	phone: string;
}
