import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';

import { isRunEmpty, Run } from '../classes/diagram/run';
import { CoordinatesInfo } from '../components/canvas/canvas.component';

function getEmptyRun(): Run {
    return {
        text: '',
        arcs: [],
        elements: [],
        warnings: [],
    };
}

@Injectable({
    providedIn: 'root',
})
export class DisplayService implements OnDestroy {
    private _currentRun$: BehaviorSubject<Run>;

    private readonly _runs$: BehaviorSubject<Run[]>;

    private coordinatesInfo$: BehaviorSubject<Array<CoordinatesInfo>>;

    constructor() {
        const emptyRun = getEmptyRun();
        this._runs$ = new BehaviorSubject<Run[]>([emptyRun]);
        this._currentRun$ = new BehaviorSubject<Run>(emptyRun);
        this.coordinatesInfo$ = new BehaviorSubject<Array<CoordinatesInfo>>([
            {
                transitionName: '',
                coordinates: {
                    x: 0,
                    y: 0,
                },
            },
        ]);
    }

    ngOnDestroy(): void {
        this._currentRun$.complete();
    }

    public setCoordsInfo(coordsInfos: Array<CoordinatesInfo>): void {
        this.coordinatesInfo$.next(coordsInfos);
    }

    public coordsInfoAdded(): Observable<CoordinatesInfo[]> {
        return this.coordinatesInfo$.asObservable();
    }

    public get runs$(): Observable<Run[]> {
        return this._runs$.asObservable();
    }

    public get currentRun$(): Observable<Run> {
        return this._currentRun$.asObservable();
    }

    public addEmptyRun(): Run {
        this.registerRun(getEmptyRun());
        return this._currentRun$.getValue();
    }

    public registerRun(run: Run): void {
        const runs = this._runs$.getValue();

        //add run or update current run if empty
        if (isRunEmpty(this._currentRun$.getValue()) && runs.length > 0) {
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
            this._runs$.next(runs);
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
        return this._currentRun$.pipe(map((run) => isRunEmpty(run)));
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
