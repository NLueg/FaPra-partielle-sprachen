import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { map, Subscription, tap } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { MergeService } from './merge.service';

@Component({
    selector: 'app-display-merged-run',
    templateUrl: './display-merged-run.component.html',
    styleUrls: ['./display-merged-run.component.scss'],
})
export class DisplayMergedRunComponent implements OnDestroy {
    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    private _sub: Subscription;

    constructor(
        mergeService: MergeService,
        private layoutService: LayoutService,
        private svgService: SvgService
    ) {
        this._sub = mergeService
            .getMergedRuns$()
            .pipe(
                map((currentRuns) =>
                    currentRuns.map((run) => this.layoutService.layout(run))
                ),
                tap(() => this.clearDrawingArea())
            )
            .subscribe((modifiedRuns) => this.draw(modifiedRuns));
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    private draw(modifiedRuns: Run[]) {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet');
            return;
        }

        for (const run of modifiedRuns) {
            const elements = this.svgService.createSvgElements(run);
            for (const element of elements) {
                this.drawingArea.nativeElement.appendChild(element);
            }
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
