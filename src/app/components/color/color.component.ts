import { Component } from '@angular/core';
import { ColorService } from 'src/app/services/color.service';

@Component({
    selector: 'app-color',
    templateUrl: './color.component.html',
    styleUrls: ['./color.component.scss'],
})
export class ColorComponent {
    highlightColor = '0';
    currentHighlightSelection = false;
    constructor(private _colorService: ColorService) {
        _colorService.getHighlightColor().subscribe((color) => {
            this.highlightColor = color;
        });
    }
    public changeHighlightSelection(): void {
        this._colorService.changeHighlightSelection(
            this.currentHighlightSelection
        );
    }
    public changeColor(): void {
        this._colorService.setHighlightColor(this.highlightColor);
    }
}
