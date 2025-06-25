import { ICard } from '../../types';
import { IEvents } from '../base/events';

export class CartModel {
	protected cards: ICard[] = [];

	constructor(protected events: IEvents) {}

	addItems(card: ICard) {
		this.cards.push(card);
	}

	removeItem(cardId: string) {
		this.cards = this.cards.filter((item) => item.id !== cardId);
	}

	clear(): void {
		this.cards = [];
	}

	//getItems(): ICard[] {}

	//getTotalPrice(): number {}

	//hasItem(id: string): boolean {}

	//getItemCount(): number {}
}
