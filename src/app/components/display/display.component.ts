import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { map, Unsubscribable } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements OnDestroy {
    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    private _sub: Unsubscribable;

    constructor(
        private _layoutService: LayoutService,
        private _svgService: SvgService,
        private _displayService: DisplayService
    ) {
        this._sub = this._displayService.currentRun$
            .pipe(
                map((currentRun) => this._layoutService.layout(currentRun).run)
            )
            .subscribe((modifiedRun) => this.draw(modifiedRun));
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    private draw(currentRun: Run) {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet');
            return;
        }

        this.clearDrawingArea();
        const elements = this._svgService.createSvgElements(currentRun);
        for (const element of elements) {
            this.drawingArea.nativeElement.appendChild(element);
        }
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 1 /* keep arrowhead marker */) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
    }
}
