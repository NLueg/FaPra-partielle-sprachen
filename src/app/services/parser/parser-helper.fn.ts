import { Arc } from '../../classes/diagram/arc';
import { Element } from '../../classes/diagram/element';
import { Run } from '../../classes/diagram/run';

export function addElement(run: Run, element: Element): boolean {
    const contained = run.elements.some((item) => item.label === element.label);
    if (contained) {
        return false;
    }

    run.elements.push(element);
    return true;
}

export function addArc(run: Run, arc: Arc): boolean {
    const contained = run.arcs.some(
        (item) => item.source === arc.source && item.target === arc.target
    );
    if (contained) {
        return false;
    }

    run.arcs.push(arc);
    return true;
}

/**
 * set references from arcs to transitions and vice versa
 * @returns all references found?
 */
export function setRefs(run: Run): boolean {
    let check = true;
    run.elements.forEach((e) => {
        e.incomingArcs = [];
        e.outgoingArcs = [];
    });

    run.arcs.forEach((a) => {
        const source = run.elements.find((e) => e.label == a.source);
        const target = run.elements.find((e) => e.label == a.target);

        if (!source || !target) {
            check = false;
            run.arcs.slice(run.arcs.indexOf(a), 1);
        } else {
            source.outgoingArcs.push(a);
            target.incomingArcs.push(a);
        }
    });

    return check;
}
