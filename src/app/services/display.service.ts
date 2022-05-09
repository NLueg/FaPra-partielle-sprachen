import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class DisplayService implements OnDestroy {
    private _diagram$: BehaviorSubject<Run>;

    constructor() {
        this._diagram$ = new BehaviorSubject<Run>(new Run());
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

    public display(net: Run): void {
        this._diagram$.next(net);
    }
}
