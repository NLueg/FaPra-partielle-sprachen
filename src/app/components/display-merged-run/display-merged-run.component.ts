import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription, tap } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { ColorService } from '../../services/color.service';
import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { MergeService } from './merge.service';

@Component({
    selector: 'app-display-merged-run',
    templateUrl: './display-merged-run.component.html',
    styleUrls: ['./display-merged-run.component.scss'],
})
export class DisplayMergedRunComponent implements OnInit, OnDestroy {
    svgElements$?: Observable<{ list: SVGElement[]; height: number }>;
    private _sub?: Subscription;
    private _colorSub?: Subscription;
    private _highlightSub?: Subscription;
    private highlight = false;

    constructor(
        private mergeService: MergeService,
        private layoutService: LayoutService,
        private svgService: SvgService,
        private _displayService: DisplayService,
        private _colorService: ColorService
    ) {}
    ngOnInit(): void {
        this._sub = this._displayService.runs$.subscribe(() => {
            this.update();
        });
        this._colorSub = this._colorService
            .getHighlightColor()
            .subscribe(() => {
                this.update();
            });
        this._highlightSub = this._colorService
            .getHighlightSelection()
            .subscribe((highlight) => {
                this.highlight = highlight;
                this.update();
            });
    }
    ngOnDestroy(): void {
        this._sub?.unsubscribe();
        this._colorSub?.unsubscribe();
        this._highlightSub?.unsubscribe();
    }

    private update(): void {
        this.svgElements$ = this.mergeService.getMergedRuns$().pipe(
            tap((runs) => console.log('Merged runs:', runs)),
            map((currentRuns) => this.layoutMergedRuns(currentRuns)),
            map(({ runs, totalDiagrammHeight }) => ({
                list: runs.flatMap((run) =>
                    this.svgService.createSvgElements(run, this.highlight)
                ),
                height: totalDiagrammHeight,
            }))
        );
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
}
