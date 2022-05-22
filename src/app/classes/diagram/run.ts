import { Arc } from './arc';
import { Element } from './element';

export class Run {
    private readonly _arcs: Array<Arc>;
    private readonly _elements: Array<Element>;
    private readonly _warnings: Set<string>;
    private _text = '';

    constructor() {
        this._arcs = [];
        this._elements = [];
        this._warnings = new Set<string>();
    }

    get elements(): Array<Element> {
        return this._elements;
    }

    get arcs(): Array<Arc> {
        return this._arcs;
    }

    get warnings(): Set<string> {
        return this._warnings;
    }

    get text(): string {
        return this._text;
    }

    setText(text: string): void {
        this._text = text;
    }

    addWarning(warning: string): void {
        this._warnings.add(warning);
    }

    clearWarnings(): void {
        this._warnings.clear();
    }

    addElement(element: Element): boolean {
        const contained = this._elements.some(
            (item) => item.label === element.label
        );
        if (contained) {
            return false;
        }

        this._elements.push(element);
        return true;
    }

    addArc(arc: Arc): boolean {
        const contained = this._arcs.some(
            (item) => item.source === arc.source && item.target === arc.target
        );
        if (contained) {
            return false;
        }

        this._arcs.push(arc);
        return true;
    }

    isEmpty(): boolean {
        return this.arcs.length + this.elements.length === 0;
    }

    /**
     * resolve warnings (removes duplicates and invalid arcs)
     */
    resolveWarnings(): void {
        const lines = ['.type ps'];
        lines.push('.transitions');
        this.elements.forEach((e) => {
            lines.push(e.label);
        });

        lines.push('.arcs');
        this.arcs.forEach((e) => {
            if (e.sourceEl && e.targetEl) lines.push(e.source + ' ' + e.target);
        });

        this.setText(lines.join('\n'));
        this.clearWarnings();
    }

    /**
     * set reference from arcs to transitions and vice versa
     * @returns all references found?
     */
    setRefs(): boolean {
        let check = true;
        this.elements.forEach((e) => {
            e.resetArcs();
        });

        this.arcs.forEach((a) => {
            const source = this.elements.find((e) => e.label == a.source);
            const target = this.elements.find((e) => e.label == a.target);

            if (source) {
                a.sourceEl = source;
                source.addOutgoingArc(a);
            } else {
                check = false;
            }

            if (target) {
                a.targetEl = target;
                target.addIncomingArc(a);
            } else {
                check = false;
            }
        });

        return check;
    }
}
