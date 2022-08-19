import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

import { Arc } from '../../classes/diagram/arc';
import {
    doesElementBelongToCurrentRun,
    Element,
} from '../../classes/diagram/element';
import {
    addArc,
    addElement,
    copyArc,
    copyElement,
    copyRun,
    generateTextForRun,
    getEmptyRun,
    setRefs,
} from '../../classes/diagram/functions/run-helper.fn';
import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';

@Injectable({
    providedIn: 'root',
})
export class MergeService {
    private currentRuns$: Observable<Run[]>;

    private readonly mergedRun$: Observable<Run>;

    constructor(displayService: DisplayService) {
        this.currentRuns$ = displayService.runs$;

        this.mergedRun$ = displayService.runs$.pipe(
            map((runs) => this.mergeRunsNew(runs)),
            shareReplay(1)
        );
    }

    getMergedRun$(): Observable<Run> {
        return this.mergedRun$;
    }

    mergeRunsNew(runs: Run[]): Run {
        const primeEventStructure = getEmptyRun();
        let nextArcs: Array<Arc> = [];
        let nextElements: Array<Element> = [];
        if (runs.length === 0) {
            return getEmptyRun();
        } else {
            for (let index = 0; index < runs.length; index++) {
                const runToMerge = copyRun(runs[index], false);
                runToMerge.elements.forEach(
                    (element) => (element.id = index + '_' + element.id)
                );
                runToMerge.arcs.forEach((arc) => {
                    arc.source = index + '_' + arc.source;
                    arc.target = index + '_' + arc.target;
                });
                primeEventStructure.elements.push(...runToMerge.elements);
                primeEventStructure.arcs.push(...runToMerge.arcs);
            }
            let end = false;
            let first = true;
            while (!end) {
                if (first) {
                    primeEventStructure.elements.forEach((element) => {
                        if (element.incomingArcs.length == 0) {
                            nextElements.push(element);
                        }
                    });
                } else {
                    primeEventStructure.elements.forEach((element) => {
                        let allIncomingArcs = true;
                        if (element.incomingArcs.length > 0) {
                            for (
                                let index = 0;
                                index < element.incomingArcs.length;
                                index++
                            ) {
                                if (
                                    !nextArcs.includes(
                                        element.incomingArcs[index]
                                    )
                                ) {
                                    allIncomingArcs = false;
                                }
                            }
                            if (allIncomingArcs) {
                                nextElements.push(element);
                                element.incomingArcs.forEach((arc) => {
                                    nextArcs = nextArcs.filter(
                                        (arc2) => arc != arc2
                                    );
                                });
                            }
                        }
                    });
                }
                if (nextElements.length > 1) {
                    for (
                        let index = 0;
                        index < nextElements.length - 1;
                        index++
                    ) {
                        for (
                            let index2 = index + 1;
                            index2 < nextElements.length;
                            index2++
                        ) {
                            if (
                                nextElements[index].label ==
                                    nextElements[index2].label &&
                                haveSameIncomingArcs(
                                    nextElements[index],
                                    nextElements[index2]
                                )
                            ) {
                                nextElements[index2].outgoingArcs.forEach(
                                    (arc) => {
                                        arc.source = nextElements[index].id;
                                        nextElements[index].outgoingArcs.push(
                                            arc
                                        );
                                    }
                                );
                                if (
                                    doesElementBelongToCurrentRun(
                                        nextElements[index2]
                                    )
                                ) {
                                    nextElements[index].currentRun = true;
                                    nextElements[index].incomingArcs.forEach(
                                        (arc) => (arc.currentRun = true)
                                    );
                                }
                                primeEventStructure.elements =
                                    primeEventStructure.elements.filter(
                                        (element) =>
                                            element != nextElements[index2]
                                    );

                                primeEventStructure.arcs =
                                    primeEventStructure.arcs.filter(
                                        (arc) =>
                                            arc.target !=
                                            nextElements[index2].id
                                    );
                                nextElements = nextElements.filter(
                                    (element) => element != nextElements[index2]
                                );
                                index2 = index2 - 1;
                            }
                        }
                    }
                }

                nextElements.forEach((element) => {
                    element.outgoingArcs.forEach((arc) => {
                        nextArcs.push(arc);
                    });
                });

                nextElements = [];

                if (nextArcs.length == 0) {
                    end = true;
                }
                first = false;
            }

            setRefs(primeEventStructure);
            primeEventStructure.text = generateTextForRun(primeEventStructure);

            return primeEventStructure;
        }
    }
}

//     mergeRuns(runs: Run[]): Run[] {
//         if (runs.length === 0) {
//             return [];
//         }

//         const baseRun = copyRun(runs[0], false);
//         const runsToCheck: Run[] = [];

//         for (let index = 1; index < runs.length; index++) {
//             const runToMerge = runs[index];

//             const baseStart = getStartOfRun(baseRun);
//             const startElementForMerge = getStartOfRun(runToMerge);
//             if (!baseStart || !startElementForMerge) {
//                 continue;
//             }

//             if (baseStart.id === startElementForMerge.id) {
//                 mergeRuns(baseRun, runToMerge, startElementForMerge);
//             } else {
//                 runsToCheck.push(runToMerge);
//             }
//         }
//         setRefs(baseRun);
//         baseRun.text = generateTextForRun(baseRun);
//         return [baseRun, ...this.mergeRuns(runsToCheck)];
//     }
// }
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
        (element) => element.id === startElementOfRunToMerge.id
    );
    if (!foundElement) {
        addElement(baseRun, copyElement(startElementOfRunToMerge));
    }

    mergeArcs(baseRun, runToMerge.arcs);

    for (const outgoingArc of startElementOfRunToMerge.outgoingArcs) {
        const element = runToMerge.elements.find(
            (element) => element.id === outgoingArc.target
        );
        if (!element) {
            continue;
        }

        mergeRuns(baseRun, runToMerge, element);
    }
}

function mergeArcs(baseRun: Run, arcsToMerge: Arc[]): void {
    arcsToMerge.forEach((arcToMerge) => {
        const foundArc = baseRun.arcs.find(
            (arc) =>
                arc.source === arcToMerge.source &&
                arc.target === arcToMerge.target
        );
        if (!foundArc) {
            addArc(baseRun, copyArc(arcToMerge));
        }
    });
}

function haveSameIncomingArcs(element1: Element, element2: Element): boolean {
    let haveSame = true;
    element1.incomingArcs.forEach((arc1) => {
        if (
            element2.incomingArcs.find((arc2) => {
                arc2.source == arc1.source;
            })
        ) {
            haveSame = false;
        }
    });

    if (haveSame) {
        element2.incomingArcs.forEach((arc1) => {
            if (
                element1.incomingArcs.find((arc2) => {
                    arc2.source == arc1.source;
                })
            ) {
                haveSame = false;
            }
        });
    }

    return haveSame;
}
