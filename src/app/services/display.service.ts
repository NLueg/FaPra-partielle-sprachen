import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';

import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class DisplayService implements OnDestroy {
    private _currentRun$: BehaviorSubject<Run>;

    private readonly _runs$: BehaviorSubject<Run[]>;

    constructor() {
        this._runs$ = new BehaviorSubject<Run[]>(new Array<Run>());
        this.runs.push(new Run());
        this._currentRun$ = new BehaviorSubject<Run>(this.runs[0]);
    }

    ngOnDestroy(): void {
        this._currentRun$.complete();
    }

    public get currentRun$(): Observable<Run> {
        return this._currentRun$.asObservable();
    }

    public get currentRun(): Run {
        return this._currentRun$.getValue();
    }
    private display(net: Run): void {
        this._currentRun$.next(net);
        this._runs$.next(this.runs);
    }

    public get runs(): Run[] {
        return this._runs$.getValue();
    }

    public addEmptyRun(): Run {
        this.registerRun(new Run());
        return this.currentRun;
    }

    public registerRun(run: Run): void {
        //add run or update current run if empty
        if (this.currentRun.isEmpty() && this.runs.length > 0) {
            this.updateCurrentRun(run);
        } else {
            this.runs.push(run);
            this.display(run);
        }
    }

    public getRunIndex(run: Run): number {
        return this.runs.indexOf(run);
    }

    public getCurrentRunIndex(): number {
        return this.runs.indexOf(this.currentRun);
    }

    public updateCurrentRun(run: Run): void {
        const index = this.getCurrentRunIndex();
        this.runs[index] = run;
        this.display(run);
    }

    /**
     * @returns new active/current run
     */
    public removeRun(run: Run): Run {
        const index = this.getRunIndex(run);
        if (index > -1) {
            this.runs.splice(index, 1);
        }

        if (this.runs.length > 0) {
            this.display(this.runs[Math.max(index - 1, 0)]); //set previous run as active
        } else {
            this.addEmptyRun(); //create new empty run
        }

        return this.currentRun;
    }

    /**
     * @returns new active/current run
     */
    public removeCurrentRun(): Run {
        return this.removeRun(this.currentRun);
    }

    public clearRuns(): void {
        this.runs.splice(0, this.runs.length);
        this.addEmptyRun();
    }

    public hasPreviousRun$(): Observable<boolean> {
        return this._runs$.pipe(
            map((runs) => runs.indexOf(this.currentRun) > 0)
        );
    }

    public hasNextRun$(): Observable<boolean> {
        return this._runs$.pipe(
            map((runs) => runs.indexOf(this.currentRun) < runs.length - 1)
        );
    }

    public isCurrentRunEmpty$(): Observable<boolean> {
        return this._currentRun$.pipe(map((run) => run.isEmpty()));
    }

    public getCurrentRunIndex$(): Observable<number> {
        return this._currentRun$.pipe(map((run) => this.getCurrentRunIndex()));
    }

    public getRunCount$(): Observable<number> {
        return this._runs$.pipe(map((runs) => runs.length));
    }

    /**
     * @returns new active/current run
     */
    public setNextRun(): Run {
        const index = this.getCurrentRunIndex();
        if (this.runs.length - 1 > index) {
            this.display(this.runs[index + 1]);
        }

        return this.currentRun;
    }

    /**
     * @returns new active/current run
     */
    public setPreviousRun(): Run {
        const index = this.getCurrentRunIndex();
        if (index > 0) {
            this.display(this.runs[index - 1]);
        }

        return this.currentRun;
    }
}
