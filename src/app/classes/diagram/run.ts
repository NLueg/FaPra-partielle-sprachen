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
        this._elements.push(element);
    }

    addArc(arc: Arc): void {
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
