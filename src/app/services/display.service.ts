import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';

import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class DisplayService implements OnDestroy {
    private _currentRun$: BehaviorSubject<Run>;

    private readonly _runs$: BehaviorSubject<Run[]>;

    constructor() {
        const emptyRun = new Run();

        this._runs$ = new BehaviorSubject<Run[]>([emptyRun]);
        this._currentRun$ = new BehaviorSubject<Run>(emptyRun);
    }

    ngOnDestroy(): void {
        this._currentRun$.complete();
    }

    public get currentRun$(): Observable<Run> {
        return this._currentRun$.asObservable();
    }

    public addEmptyRun(): Run {
        this.registerRun(new Run());
        return this._currentRun$.getValue();
    }

    public registerRun(run: Run): void {
        const runs = this._runs$.getValue();

        //add run or update current run if empty
        if (this._currentRun$.getValue().isEmpty() && runs.length > 0) {
            this.updateCurrentRun(run);
        } else {
            runs.push(run);
            this._runs$.next(runs);
            this._currentRun$.next(run);
        }
    }

    private getRunIndex(run: Run): number {
        return this._runs$.getValue().indexOf(run);
    }

    private getCurrentRunIndex(): number {
        return this._runs$.getValue().indexOf(this._currentRun$.getValue());
    }

    public updateCurrentRun(run: Run): void {
        const index = this.getCurrentRunIndex();

        const runs = this._runs$.getValue();
        runs[index] = run;
        this._runs$.next(runs);
        this._currentRun$.next(run);
    }

    /**
     * @returns new active/current run
     */
    private removeRun(run: Run): Run {
        const index = this.getRunIndex(run);
        const runs = this._runs$.getValue();

        if (index === -1) {
            return this._currentRun$.getValue();
        }

        runs.splice(index, 1);

        if (runs.length > 0) {
            this._currentRun$.next(runs[Math.max(index - 1, 0)]); //set previous run as active
        } else {
            this.addEmptyRun(); //create new empty run
        }

        return this._currentRun$.getValue();
    }

    /**
     * @returns new active/current run
     */
    public removeCurrentRun(): Run {
        return this.removeRun(this._currentRun$.getValue());
    }

    public clearRuns(): void {
        this._runs$.next([]);
        this.addEmptyRun();
    }

    public hasPreviousRun$(): Observable<boolean> {
        return this._runs$.pipe(
            switchMap((runs) =>
                this._currentRun$.pipe(
                    map((currentRun) => runs.indexOf(currentRun) > 0)
                )
            )
        );
    }

    public hasNextRun$(): Observable<boolean> {
        return this._runs$.pipe(
            switchMap((runs) =>
                this._currentRun$.pipe(
                    map(
                        (currentRun) =>
                            runs.indexOf(currentRun) < runs.length - 1
                    )
                )
            )
        );
    }

    public isCurrentRunEmpty$(): Observable<boolean> {
        return this._currentRun$.pipe(map((run) => run.isEmpty()));
    }

    public getCurrentRunIndex$(): Observable<number> {
        return this._currentRun$.pipe(
            switchMap((run) =>
                this._runs$.pipe(map((runs) => runs.indexOf(run)))
            )
        );
    }

    public getRunCount$(): Observable<number> {
        return this._runs$.pipe(map((runs) => runs.length));
    }

    /**
     * @returns new active/current run
     */
    public setNextRun(): Run {
        const index = this.getCurrentRunIndex();
        const runs = this._runs$.getValue();

        if (runs.length - 1 > index) {
            this._currentRun$.next(runs[index + 1]);
        }

        return this._currentRun$.getValue();
    }

    /**
     * @returns new active/current run
     */
    public setPreviousRun(): Run {
        const index = this.getCurrentRunIndex();
        if (index > 0) {
            const runs = this._runs$.getValue();
            this._currentRun$.next(runs[index - 1]);
        }

        return this._currentRun$.getValue();
    }
}
