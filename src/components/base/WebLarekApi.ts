import { Api, ApiListResponse } from './api';
import { ICard, IOrderForm, IOrderResult } from '../../types';

export interface IWebLarekApi {
	getProductList: () => Promise<ICard[]>;
	createOrder: (order: IOrderForm) => Promise<IOrderResult>;
}

export class WebLarekApi extends Api implements IWebLarekApi {
	readonly cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<ICard[]> {
		return this.get<ApiListResponse<ICard>>('/product').then((data) =>
			data.items.map((item) => ({
				...item,
				image: item.image.replace('.svg', '.png'), // только замена расширения
			}))
		);
	}

	createOrder(order: IOrderForm): Promise<IOrderResult> {
		return this.post('/order', order).then((data: IOrderResult) => data);
	}
}
