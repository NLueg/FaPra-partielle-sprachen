import { Injectable, OnDestroy } from '@angular/core';
import { first, Subject } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { MergeService } from '../../components/display-merged-run/merge.service';
import {
    DownloadableContent,
    DownloadFormat,
} from '../../components/download/download.const';
import { DisplayService } from '../display.service';
import { RunToPnmlService } from './run-to-pnml/run-to-pnml.service';

@Injectable({
    providedIn: 'root',
})
export class DownloadService implements OnDestroy {
    private _download$: Subject<string>;

    constructor(
        private _displayService: DisplayService,
        private _mergeService: MergeService,
        private _runToPnmlService: RunToPnmlService
    ) {
        this._download$ = new Subject<string>();
    }

    ngOnDestroy(): void {
        this._download$.complete();
    }

    downloadRuns(
        name: string,
        contentToDownload: DownloadableContent,
        formatToDownload: DownloadFormat
    ): void {
        const runsToDownload =
            contentToDownload === 'mergeRuns'
                ? this._mergeService.getMergedRuns$()
                : this._displayService.runs$;

        runsToDownload.pipe(first()).subscribe((runs) => {
            const timestamp = Date.now();
            const fileEnding = getFileEndingForFormat(formatToDownload);

            runs.forEach((run, index) => {
                const fileName = name
                    ? `${name}_${index + 1}.${fileEnding}`
                    : `${timestamp}_run_${index + 1}.${fileEnding}`;

                this.downloadRun(fileName, formatToDownload, run);
            });
        });
    }

    downloadCurrentRun(name: string, formatToDownload: DownloadFormat): void {
        this._displayService.currentRun$.pipe(first()).subscribe((run) => {
            const fileEnding = getFileEndingForFormat(formatToDownload);
            const fileName = name
                ? `${name}.${fileEnding}`
                : `${Date.now()}_run.${fileEnding}`;

            this.downloadRun(fileName, formatToDownload, run);
        });
    }

    private downloadRun(
        name: string,
        formatToDownload: DownloadFormat,
        run: Run
    ): void {
        const fileContent =
            formatToDownload === 'run'
                ? run.text.trim()
                : this._runToPnmlService.parseRunToPnml(name, run);

        const downloadLink: HTMLAnchorElement = document.createElement('a');
        downloadLink.download = name;
        downloadLink.href = 'data:text/plain;charset=utf-16,' + fileContent;
        downloadLink.click();
        downloadLink.remove();
    }
}

function downloadFile(name: string, content: string): void {
    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.download = name;
    downloadLink.href =
        'data:application/text/html,' + encodeURIComponent(content);
    downloadLink.click();
    downloadLink.remove();

function getFileEndingForFormat(format: DownloadFormat): string {
    switch (format) {
        case 'run':
            return 'ps';
        case 'pnml':
            return 'pnml';
    }
}
