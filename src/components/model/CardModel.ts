import { ICard } from "../../types"
import { IEvents } from "../base/events";

export class CardModel {
  protected _cards: ICard[];
 
  constructor(protected events: IEvents){}
  
  get cards(): ICard[] {
    return this._cards;
  }

  set cards(cards: ICard[]) {
    this._cards = cards;
    this.events.emit('catalog:changed')
  }

  getCardById(id: string): ICard {
    return this._cards.find((card) => card.id === id);
  }
}