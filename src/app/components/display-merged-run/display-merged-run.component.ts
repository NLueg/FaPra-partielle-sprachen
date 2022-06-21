import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { map, tap, Unsubscribable } from 'rxjs';

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

    private _sub: Unsubscribable;

    constructor(
        mergeService: MergeService,
        private layoutService: LayoutService,
        private svgService: SvgService
    ) {
        this._sub = mergeService
            .getMergedRuns$()
            .pipe(
                tap((runs) => console.log('Merged runs:', runs)),
                map((currentRuns) => this.layoutMergedRuns(currentRuns)),
                tap(({ totalDiagrammHeight }) =>
                    this.clearDrawingArea(totalDiagrammHeight)
                )
            )
            .subscribe(({ runs }) => this.draw(runs));
    }

    private layoutMergedRuns(currentRuns: Run[]): {
        runs: Run[];
        totalDiagrammHeight: number;
    } {
        let totalDiagrammHeight = 0;

        const runs = currentRuns.map((currentRun) => {
            const { run, diagrammHeight } = this.layoutService.layout(
                currentRun,
                totalDiagrammHeight
            );
            totalDiagrammHeight += diagrammHeight;
            return run;
        });

        return {
            runs,
            totalDiagrammHeight,
        };
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

    private clearDrawingArea(totalDiagrammHeight: number) {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 1 /* keep arrowhead marker */) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }

        drawingArea.style.height = `${totalDiagrammHeight}px`;
    }
}
