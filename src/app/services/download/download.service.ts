import { Injectable, OnDestroy } from '@angular/core';
import { first, Subject } from 'rxjs';

import { DisplayService } from '../display.service';

@Injectable({
    providedIn: 'root',
})
export class DownloadService implements OnDestroy {
    private _download$: Subject<string>;

    constructor(private _displayService: DisplayService) {
        this._download$ = new Subject<string>();
    }

    ngOnDestroy(): void {
        this._download$.complete();
    }

    public downloadRuns(): void {
        this._displayService.runs$.pipe(first()).subscribe((runs) => {
            const timestamp = Date.now();

            runs.forEach((run, index) => {
                const myFileContent = run.text.trim();
                const myFileName = timestamp + '_run_' + index + '.ps';
                const dlink: HTMLAnchorElement = document.createElement('a');
                dlink.download = myFileName;
                dlink.href = 'data:text/plain;charset=utf-16,' + myFileContent;
                dlink.click();
                dlink.remove();
            });
        });
    }

    public downloadCurrentRun(): void {
        this._displayService.currentRun$.pipe(first()).subscribe((run) => {
            const myFileContent = run.text.trim();
            const myFileName = Date.now() + '_run' + '.ps';
            const dlink: HTMLAnchorElement = document.createElement('a');
            dlink.download = myFileName;
            dlink.href = 'data:text/plain;charset=utf-16,' + myFileContent;
            dlink.click();
            dlink.remove();
        });
    }
}
