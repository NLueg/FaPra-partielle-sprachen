import { Injectable } from '@angular/core';
import { map, Observable, shareReplay } from 'rxjs';

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
            map((runs) => mergeRuns(runs)),
            shareReplay(1)
        );
    }

    getMergedRuns$(): Observable<Run[]> {
        return this.mergedRun$;
    }
}

// TODO: Implement run merging
function mergeRuns(runs: Run[]): Run[] {
    return runs;
}
