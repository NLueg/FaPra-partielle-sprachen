import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class DisplayService implements OnDestroy {
    private _diagram$: BehaviorSubject<Run>;

    private readonly _runs: Run[] = [];
    private _currentRun: Run;

    constructor() {
        this._currentRun = new Run();
        this.runs.push(this.currentRun);
        this._diagram$ = new BehaviorSubject<Run>(this.currentRun);
    }

    ngOnDestroy(): void {
        this._diagram$.complete();
    }

    public get diagram$(): Observable<Run> {
        return this._diagram$.asObservable();
    }

    public get diagram(): Run {
        return this._diagram$.getValue();
    }

    private display(net: Run): void {
        this._diagram$.next(net);
    }

    public get currentRun(): Run {
        return this._currentRun;
    }

    public set currentRun(value: Run) {
        this._currentRun = value;
        this.display(this.currentRun);
    }

    public get runs(): Run[] {
        return this._runs;
    }

    public addEmptyRun(): void {
        this.registerRun(new Run());
    }

    public registerRun(run: Run): void {
        //add run or update current run if empty
        if (this.currentRun.isEmpty()) {
            this.updateCurrentRun(run);
        } else {
            this.runs.push(run);
        }

        this.currentRun = run;
    }

    public getRunIndex(run: Run): number {
        return this.runs.indexOf(run);
    }

    public updateCurrentRun(run: Run): void {
        const index = this.getRunIndex(this.currentRun);
        this.runs[index] = run;
        this.currentRun = run;
    }

    public removeRun(run: Run): void {
        const index = this.getRunIndex(run);
        if (index > -1) {
            this.runs.splice(index, 1);
        }

        if (this.runs.length > 0) {
            this.currentRun = this.runs[Math.max(index - 1, 0)]; //set previous run as active
        } else {
            this.addEmptyRun(); //create new empty run
        }
    }

    public removeCurrentRun(): void {
        this.removeRun(this.currentRun);
    }

    public clearRuns(): void {
        this.runs.splice(0, this.runs.length);
        this.addEmptyRun();
    }
}
