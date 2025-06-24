import { ensureElement } from "../../utils/utils";
import { Component } from "../base/Component";
import { IEvents } from "../base/events";

interface IModal {
  content: HTMLElement;
}

export class Modal extends Component<IModal> {

    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement
    constructor(container: HTMLElement, protected events: IEvents) {
        super(container)

        this._closeButton = ensureElement('.modal__close', this.container) as HTMLButtonElement
        this._content = ensureElement('.modal__content', this.container)

        this._closeButton.addEventListener('click', () => {
            this.close()
        })

        document.addEventListener('keydown', (evt) => {
            if (evt.key === 'Escape') {
                this.close()
            }
        })

        this.container.addEventListener('click', (evt) => {
            if (evt.currentTarget === evt.target) {
                this.close()
            }
        })
    }

    set content(value: HTMLElement) {
        this._content.replaceChildren(value)
    }

    open() {
        this.container.classList.add('modal_active');
        this.events.emit('modal:open')
    }

    close() {
        this.container.classList.remove('modal_active')
        this.content = null
        this.events.emit('modal:close')
    }

    render(data: IModal): HTMLElement {
        super.render(data);
        this.open()
        return this.container
    }
}