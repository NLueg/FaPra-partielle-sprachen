import { Arc } from '../arc';
import { Element } from '../element';
import { Run } from '../run';

export function hasCycles(run: Run): boolean {
    return getCycles(run).length > 0;
}

export function getCycles(run: Run): Arc[] {
    const visitedArcs = new Set<Arc>();
    const cyclicArcs = new Array<Arc>();

    run.arcs.forEach((arc) => {
        const visitedTransitions = new Set<Element>();
        if (arc.sourceEl) visitedTransitions.add(arc.sourceEl);
        checkArcCycle(arc, visitedArcs, visitedTransitions, cyclicArcs);
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
function checkArcCycle(
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
        checkArcCycle(outArc, visitedArcs, visitedTransitions, cyclicArcs);
    });

    visitedTransitions.delete(arc.targetEl);
}
