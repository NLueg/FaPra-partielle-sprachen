import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private highlightColor = '#e66465';
    private highlight = false;

    private _highlightColor$: BehaviorSubject<string>;
    private _hightlightSelection$: BehaviorSubject<boolean>;

    constructor() {
        this._highlightColor$ = new BehaviorSubject<string>(
            this.highlightColor
        );
        this._hightlightSelection$ = new BehaviorSubject<boolean>(
            this.highlight
        );
    }

    getHighlightColor(): Observable<string> {
        return this._highlightColor$.asObservable();
    }

    setHighlightColor(color: string): void {
        this.highlightColor = color;
        this._highlightColor$.next(this.highlightColor);
    }

    getHighlightSelection(): Observable<boolean> {
        return this._hightlightSelection$.asObservable();
    }

    changeHighlightSelection(value: boolean): void {
        this.highlight = value;
        this._hightlightSelection$.next(this.highlight);
    }
}
