import { Component } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';
import { MergeService } from './merge.service';

@Component({
    selector: 'app-display-merged-run',
    templateUrl: './display-merged-run.component.html',
    styleUrls: ['./display-merged-run.component.scss'],
})
export class DisplayMergedRunComponent {
    svgElements$: Observable<{ list: SVGElement[]; height: number }>;

    constructor(
        mergeService: MergeService,
        private layoutService: LayoutService,
        private svgService: SvgService
    ) {
        this.svgElements$ = mergeService.getMergedRuns$().pipe(
            tap((runs) => console.log('Merged runs:', runs)),
            map((currentRuns) => this.layoutMergedRuns(currentRuns)),
            map(({ runs, totalDiagrammHeight }) => ({
                list: runs.flatMap((run) =>
                    this.svgService.createSvgElements(run)
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
