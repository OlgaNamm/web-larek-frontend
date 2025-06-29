import { ICard } from '../../types';
import { IEvents } from '../base/events';

export class CartModel {
	protected items: ICard[] = [];

	constructor(protected events: IEvents) {}

	addItem(item: ICard): void {

        if (item.price === null) return;

		if (!this.items.some((existing) => existing.id === item.id)) {
			this.items.push(item);
			this.events.emit('cart:changed');
		}
	}

	removeItem(id: string): void {
		this.items = this.items.filter((item) => item.id !== id);
		this.events.emit('cart:changed');
	}

	clear(): void {
		this.items = [];
		this.events.emit('cart:changed');
	}

	getItems(): ICard[] {
		return this.items;
	}

	getTotal(): number {
    return this.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        return total + price;
    }, 0);
}

	getItemCount(): number {
		return this.items.length;
	}

	isItemInCart(id: string): boolean {
		return this.items.some((item) => item.id === id);
	}
}