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
        return (
            !this.text.trim() && this.arcs.length + this.elements.length === 0
        );
    }

    /**
     * resolve warnings (removes duplicates and invalid arcs)
     */
    resolveWarnings(): void {
        this.removeCycles();

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
     * set references from arcs to transitions and vice versa
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

    public hasCycles(): boolean {
        return this.getCycles().length > 0;
    }

    public removeCycles(): void {
        this.getCycles().forEach((arc) => {
            return this.arcs.splice(
                this.arcs.findIndex((a) => a === arc),
                1
            );
        });
    }

    /**
     * check all arcs sequences for cycles
     * @returns Last arcs in cyclic arc sequences
     */
    private getCycles(): Arc[] {
        const visitedArcs = new Set<Arc>();
        const cyclicArcs = new Array<Arc>();

        this._arcs.forEach((arc) => {
            const visitedTransitions = new Set<Element>();
            if (arc.sourceEl) visitedTransitions.add(arc.sourceEl);
            this.checkArcCycle(
                arc,
                visitedArcs,
                visitedTransitions,
                cyclicArcs
            );
        });
        return cyclicArcs;
    }

    /**
     * checks an arc sequence for cycles
     * @param arc starting arc
     * @param visitedArcs already visited arcs
     * @param visitedTransitions already visited transition
     * @param cyclicArcs last arcs when a cycle occurs
     */
    private checkArcCycle(
        arc: Arc,
        visitedArcs: Set<Arc>,
        visitedTransitions: Set<Element>,
        cyclicArcs: Arc[]
    ): void {
        if (visitedArcs.has(arc) || !arc.targetEl) {
            return;
        }
        visitedArcs.add(arc);

        //transition already visited in this sequence?

        if (visitedTransitions.has(arc.targetEl)) {
            cyclicArcs.push(arc);
            return;
        }
        visitedTransitions.add(arc.targetEl);

        //continue with the sequences

        arc.targetEl.outgoingArcs.forEach((outArc) => {
            this.checkArcCycle(
                outArc,
                visitedArcs,
                visitedTransitions,
                cyclicArcs
            );
        });

        visitedTransitions.delete(arc.targetEl);
    }

    clearPositioningData(): void {
        this.arcs.forEach((a) => {
            a.breakpoints.splice(0, a.breakpoints.length);
        });

        this.elements.forEach((e) => {
            e.x = 0;
            e.y = 0;
        });
    }
}
