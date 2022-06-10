import { Arc } from './arc';
import { Element } from './element';

export interface Run {
    text: string;
    arcs: Arc[];
    elements: Element[];
    warnings: string[];
}

export function isRunEmpty(run: Run): boolean {
    return (
        !run.text.trim() && run.arcs.length === 0 && run.elements.length === 0
    );
}
