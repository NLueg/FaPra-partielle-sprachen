import { Injectable } from '@angular/core';
import clonedeep from 'lodash.clonedeep';
import { map, Observable, shareReplay } from 'rxjs';

import { Arc } from '../../classes/diagram/arc';
import { Element } from '../../classes/diagram/element';
import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';

@Injectable({
    providedIn: 'root',
})
export class MergeService {
    private currentRuns$: Observable<Run[]>;

    private readonly mergedRun$: Observable<Run[]>;

    constructor(displayService: DisplayService) {
        this.currentRuns$ = displayService.runs$;

        this.mergedRun$ = displayService.runs$.pipe(
            map((runs) => this.mergeRuns(runs)),
            shareReplay(1)
        );
    }

    getMergedRuns$(): Observable<Run[]> {
        return this.mergedRun$;
    }

    mergeRuns(runs: Run[]): Run[] {
        if (runs.length === 0) {
            return [];
        }

        const baseRun = clonedeep(runs[0]);
        const runsToCheck: Run[] = [];

        for (let index = 1; index < runs.length; index++) {
            const runToMerge = runs[index];

            const baseStart = getStartOfRun(baseRun);
            const startElementForMerge = getStartOfRun(runToMerge);
            if (!baseStart || !startElementForMerge) {
                continue;
            }

            if (baseStart.label === startElementForMerge.label) {
                mergeRuns(baseRun, runToMerge, startElementForMerge);
            } else {
                runsToCheck.push(runToMerge);
            }
        }

        return [baseRun, ...this.mergeRuns(runsToCheck)];
    }
}

/**
 * Receives the first element of a run
 * @param run run to analyze
 * @returns found run or undefined
 */
function getStartOfRun(run: Run): Element | undefined {
    return run.elements.find(
        (element) =>
            element.incomingArcs.length === 0 && element.outgoingArcs.length > 0
    );
}

function mergeRuns(
    baseRun: Run,
    runToMerge: Run,
    startElementOfRunToMerge: Element | undefined
): void {
    if (!startElementOfRunToMerge) {
        return;
    }

    const foundElement = baseRun.elements.find(
        (element) => element.label === startElementOfRunToMerge.label
    );
    if (!foundElement) {
        baseRun.elements.push(startElementOfRunToMerge);
    } else {
        foundElement.outgoingArcs = mergeArcs(
            foundElement.outgoingArcs,
            startElementOfRunToMerge.outgoingArcs
        );
    }

    baseRun.arcs = mergeArcs(baseRun.arcs, runToMerge.arcs);

    for (const outgoingArc of startElementOfRunToMerge.outgoingArcs) {
        const element = runToMerge.elements.find(
            (element) => element.label === outgoingArc.target
        );
        if (!element) {
            continue;
        }

        mergeRuns(baseRun, runToMerge, element);
    }
}

function mergeArcs(baseArcs: Arc[], arcsToMerge: Arc[]): Arc[] {
    arcsToMerge.forEach((arcToMerge) => {
        const foundArc = baseArcs.find(
            (arc) =>
                arc.source === arcToMerge.source &&
                arc.target === arcToMerge.target
        );
        if (!foundArc) {
            baseArcs.push(arcToMerge);
        }
    });
    return baseArcs;
}
