import { Injectable, OnDestroy } from '@angular/core';
import { first, Subject } from 'rxjs';

import { MergeService } from '../../components/display-merged-run/merge.service';
import { DownloadableContent } from '../../components/download/download.const';
import { DisplayService } from '../display.service';

@Injectable({
    providedIn: 'root',
})
export class DownloadService implements OnDestroy {
    private _download$: Subject<string>;

    constructor(
        private _displayService: DisplayService,
        private _mergeService: MergeService
    ) {
        this._download$ = new Subject<string>();
    }

    ngOnDestroy(): void {
        this._download$.complete();
    }

    downloadRuns(name: string, contentToDownload: DownloadableContent): void {
        const runsToDownload =
            contentToDownload === 'mergeRuns'
                ? this._mergeService.getMergedRuns$()
                : this._displayService.runs$;

        runsToDownload.pipe(first()).subscribe((runs) => {
            const timestamp = Date.now();
            runs.forEach((run, index) => {
                let fileName = '';
                if (!name) {
                    fileName = `${timestamp}_run_${index + 1}.ps`;
                } else {
                    fileName = `${name}_run_${index + 1}.ps`;
                }
                downloadFile(fileName, run.text.trim());
            });
        });
    }

    downloadCurrentRun(name: string): void {
        this._displayService.currentRun$.pipe(first()).subscribe((run) => {
            let fileName = '';
            if (!name) {
                fileName = Date.now() + '_run.ps';
            } else {
                fileName = name + '_run.ps';
            }
            downloadFile(fileName, run.text.trim());
        });
    }
}

function downloadFile(name: string, content: string): void {
    const downloadLink: HTMLAnchorElement = document.createElement('a');
    downloadLink.download = name;
    downloadLink.href = 'data:text/plain;charset=utf-16,' + content;
    downloadLink.click();
    downloadLink.remove();
}
