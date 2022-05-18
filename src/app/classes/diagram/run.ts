import { Element } from './element';

export class Run {
    private readonly _arcs: Array<Arc>;
    private readonly _elements: Array<Element>;

    constructor() {
        this._arcs = [];
        this._elements = [];
    }

    get elements(): Array<Element> {
        return this._elements;
    }

    get arcs(): Array<Arc> {
        return this._arcs;
    }

    addElement(element: Element): void {
        const contained = this._elements.some(
            (item) => item.label === element.label
        );
        if (contained) {
            return;
        }

        this._elements.push(element);
    }

    addArc(arc: Arc): void {
        const contained = this._arcs.some(
            (item) => item.source === arc.source && item.target === arc.target
        );
        if (contained) {
            return;
        }

        this._arcs.push(arc);
    }

    isEmpty(): boolean {
        return this.arcs.length + this.elements.length === 0;
    }
}

export type Arc = {
    source: string;
    target: string;
};
