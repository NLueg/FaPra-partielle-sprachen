import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ColorService {
    private highlightColor = 'green';

    getHighlightColor(): string {
        return this.highlightColor;
    }
    setHighlightColor(color: string): void {
        this.highlightColor = color;
    }
}
