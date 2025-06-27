# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом
- src/components/model/ - папка с кодом слоя данных
- src/components/view/ - папка с кодом слоя представления

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```
# Документация

Выбрана модель данных в паттерне MVP (Model-View-Presenter).\
Модель (Model) предоставляет данные для пользовательского интерфейса.\
Представление (View) реализует отображение данных (Модели) и маршрутизацию пользовательских команд или событий Presenterʼу.\
Presenter управляет Моделью и Представлением. Например извлекает данные из Модели и форматирует их для отображения в Представлении.

## Данные и типы данных в приложении
 
Данные карточки товара:
```
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
```

Данные покупателя (для заполнения форм попапов):
```
interface IOrderForm {
    payment: string;
	address: string;
	email: string;
	phone: string;
}
```


## Описание базовых классов, их предназначение и функции

#### Класс API

Класс для работы с API. Обеспечивает выполнение запросав GET, POST.\
Поля:
- readonly baseUrl: string
- protected options: RequestInit

Методы класса:
- handleResponse - метод для обработки ответа от сервера
- get(uri: string) - выполняет GET-апрос к указанному URI
- post(uri: string, body: any) - выполняет POST-запрос к указанному URI

#### Класс EventEmitter
Позволяет подписываться на события, уведомлять и управлять подписками.\
Методы класса:
- on(event: string, callback: () => void) - установить обработчик на событие
- off(event: string) - снять обработчик с события
- emit(event: string, data?: any) - инициировать событие с данными
- onAll(callback: () => void) - слушать все события
- offAll() - сбросить все обработчики
- trigger(callback: () => void) - сделать коллбек триггер, генерирующий событие при вызове

#### Класс Modal
Отвечает за открытие и закрытие модальных окон (попапов) приложения.\
Поля:
- _closeButton: HTMLButtonElement - Кнопка закрытия
- _content: HTMLElement - Контейнер содержимого
- _page: HTMLElement - Обёртка главной страницы (осуществляется блокировка скролла)

Методы:
- set content(value: HTMLElement) - устанавливает содержимое попапа
- open() - открывает попап, устанавливает блок скролла
- close() - закрывает попап, снимает блок скролла
- render() - рендерит попап

#### Класс Component
Абстрактный класс компонента для работы с DOM.\
Методы:
- toggleClass(className: string) - переключает CSS-класс у элемента
- setText(text: string) - устанавливает текстовое содержимое элемента
- setDisabled(isDisabled: boolean) - устанавливает/снимает атрибут disabled у элемента
- setHidden() - скрывает элемент через display: none
- setVisible() - показывает элемент, удаляя display: none
- setImage(src: string, alt: string) - устанавливает изображение и альтернативный текст

#### Класс Form
Абстрактный класс для форм, родительский для класса OrderFirst и класса OrderSecond.\
Поля:
- _submit: HTMLButtonElement - Кнопка отправки формы
- _errors: HTMLElement - Контейнер для ошибок

Методы:
- onInputChange() - метод обработки изменения поля ввода
- set valid(value: boolean) - сеттер для установки валидности формы
- set errors(value: string) - сеттер для установки сообщений об ошибках
- render() - метод рендеринга формы

### Слой данных (Model)

#### Класс CardModel
Хранит данные товаров.\
Поля:
- _cards: ICard[] - массив всех товаров

Методы:
- set cards(cards: ICard[]) - сохраняет список товаров
- get cards(): ICard[] - возвращает список товаров
- getCardById(id: string): ICard - возвращает конкретный товар по id

#### Класс FormModel
Хранит данные пользователя для оформления заказа.\
Поля:
- payment: string - способ оплаты
- address: string - адрес доставки
- email: string - почта покупателя
- phone: string - номер телефона покупателя
- _valid: boolean - для валидации
- _currentStep: 'order' | 'contacts' = 'order' - для перехода на шаг 1 или шаг 2
- _initialLoad: boolean - проверка на начальную загрузку полей
- _hasPaymentInteraction: boolean - проверка не было взаимодействия и данных с оплатой
- _hasAddressInteraction: boolean - проверка не было взаимодействия и данных с адресом

Методы:
- setOrderData(data: IOrderForm) - устанавливает контактные данные
- getFormData(): IOrderForm - возвращает введенные контактные данные
- setStep(step: 'order' | 'contacts') - устанавливает текущий шаг для валидации
- validate(): boolean - проверяет корректность введённых данных пользователя на двух шагах оформления заказа
- get valid(): boolean - проверка
- reset() - очистка данных формы

#### Класс CartModel
Хранит данные корзины товаров.\
Поля:
- items: ICard[] - массив товаров в корзине

Методы:
- addItem(item: ICard): void - добавляет конкретный товар в корзину (в массив cards)
- removeItem(id: string): void - удаляет конкретный товар из корзины
- clear(): void - очищает всю корзину (пустой массив)
- getItems(): ICard[] - возвращает массив товаров (карточек) в корзине
- getTotal(): number - вычисляет общую стоимость товаров в корзине
- getItemCount(): number - индекс товара в списке
- isItemInCart(id: string): boolean - проверяет, есть ли товар с данным id в корзине

### Слой представления (View)

#### Класс Page
Наследует класс Component. Отображает главную страницу приложения.\
Поля:
- _counter: HTMLSpanElement - счетчик товаров в корзине
- _catalog: HTMLElement - контейнер для товаров
- _wrapper: HTMLElement - обёртка страницы
- _basket: HTMLElement - корзина на главной странице

Методы:
- set counter(value: number) - устанавливает значение счетчика
- set catalog(items: HTMLElement[]) - устанавливает карточки товаров на странице
- renderCard(data: ICard): HTMLElement - рендерит карточки

#### Класс Card
Отображает карточку с информацией о товаре.
Поля:
- _id: HTMLSpanElement - идентификатор товара
- _title: HTMLTitleElement - название товара
- _price: HTMLSpanElement - стоимость товара
- _category: HTMLSpanElement - категория товара
- _image: HTMLImageElement - изображение товара
- _button: HTMLButtonElement | null - кнопка 

Методы: 
- set id(value: string) - устанавливает идентификатор товара
- set title(value: string) - устанавливает заголовок товара
- set price(value: number) - устанавливает цену товара
- set category(value: string) - устанавливает категорию товара класс
- set image(value: string) - устанавливает изображение товара
- getCategoryClass(category: categories): string - устанавливает категорию тип

#### Класс Basket
Отображает корзину товаров со списком товаров, их колличеством и суммой заказа.\
Поля:
- _list: HTMLElement - список товаров в корзине
- _total: HTMLElement - стоимость заказа
- _button: HTMLButtonElement - кнопка "Оформить"

Методы:
- set items(items: HTMLElement[]) - устанавливает список товаров
- set selected(items: string[]) - устанавливает состояние кнопки
- set total(total: number) - устанавливает стоимость заказа

#### Класс OrderFirst
Отображает форму с выбором способа оплаты, полем ввода адреса доставки.\
Поля:
- onlineButton: HTMLButtonElement - кнопка для онлайн оплаты
- offlineButton: HTMLButtonElement - кнопка для оплаты при получении
- submitButton: HTMLButtonElement - кнопка подтверждения
- addressInput: HTMLInputElement - поле формы для адреса
- _errors: HTMLElement - для ошибок валидации

Методы:
- set address - устанавливает адрес дооставки
- set valid(value: boolean) - валидность для активности кнопки
- set errors(value: string) - для вывода ошибок
- render(data: Partial<IOrderForm>): HTMLElement - рендер 

#### Класс OrderSecond
Отображает форму с полями ввода данных пользователя.\
Поля: 
- _emailInput: HTMLInputElement — поле для ввода email
- _phoneInput: HTMLInputElement — поле для ввода номера телефона
- _submitButton: HTMLButtonElement — кнопка подтверждения
- _errors: HTMLElement - для ошибок валидации полей

Методы:
- set email - устанавливает email пользователя
- set phone - устанавливает номер телефона пользователя
- set valid(value: boolean) - валидность для активности кнопки
- set errors(value: string) - для вывода ошибок
- render(data: Partial<IOrderForm>): HTMLElement - рендер

#### Класс OrderSuccess
Отображает попап с сообщением об успешном оформлении заказа.\
Поля:
- _close: HTMLElement - кнопка для закрытия модального окна
- _description: HTMLElement - стоимость заказа, который был оформлен (сколько списано)

Методы:
- set total - отображает сколько списано (стоимость заказа)

### Презентер (Presenter)
Обрабатывает события от View, взаимодействует с Model, обновляет интерфейс методами View.\
События:
- catalog:changed - изменения в список товаров
- card:open - открыть моальное окно карточки товара (превью)
- basket:open - открыть модальное окно корзины товаров
- cart:changed - изменения в корзине товаров
- order:open - открыть модальное окно оформления заказа шаг 1
- contacts:open - открыть модальное окно оформления заказа шаг 2
- order:submit - для перехода к шагу 2 оформления заказа
- contacts:submit - отправка на сервер форм
- order:validation - для валидации форм
- formErrors:change - для ошибок

## Описание компонентов, их функций и связей с другими компонентами

### Главная страница
Отображает массив карточек товаров с данными в каждой карточке, позволяет открыть попап Карточка товара и попап Корзина.
Связь: получает данные массив карточек, количество товаров в корзине.

### Попап Карточка товара
Отображает информацию о выбранном товаре, кнопка "Купить" отправляет товар в корзину.

### Попап Корзина
Отображает список товаров в корзине, общей стоимости заказа, кнопка "Удалить" убирает выбранный товар из корзины, кнопка "Оформить" открывает попап Оформление заказа 1 шаг.

### Попап Оформление заказа 1 шаг
Отображает форму выбора способа оплаты (онлайн / при получении), поля ввода адреса доставки, кнопка "Далее" открывает попап Попап Оформление заказа 2 шаг, если поле валидно.

### Попап Оформление заказа 2 шаг
Отображает форму ввода e-mail и номера телефона покупателя, кнопка "Оплатить" завершает оформление заказа и открывает попап Заказ оформлен, если поле валидно.

### Попап Заказ оформлен
Отображает сообщение об успешном оформлении заказа, кнопка "За новыми покупками!" закрывает попап, переход на Главную страницу, корзина товаров очищается.