import { Component, OnDestroy, OnInit } from '@angular/core';
import { map, Observable, Subscription, tap } from 'rxjs';
import { DisplayService } from 'src/app/services/display.service';

import { Run } from '../../classes/diagram/run';
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

    constructor(
        private mergeService: MergeService,
        private layoutService: LayoutService,
        private svgService: SvgService,
        private _displayService: DisplayService
    ) {}
    ngOnInit(): void {
        this._sub = this._displayService.runs$.subscribe(() => {
            this.svgElements$ = this.mergeService.getMergedRuns$().pipe(
                tap((runs) => console.log('Merged runs:', runs)),
                map((currentRuns) => this.layoutMergedRuns(currentRuns)),
                map(({ runs, totalDiagrammHeight }) => ({
                    list: runs.flatMap((run) =>
                        this.svgService.createSvgElements(run, true)
                    ),
                    height: totalDiagrammHeight,
                }))
            );
        });
    }
    ngOnDestroy(): void {
        this._sub?.unsubscribe();
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
