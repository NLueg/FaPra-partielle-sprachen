import { Injectable, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

import { Run } from '../../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class DownloadService implements OnDestroy {
    private _download$: Subject<string>;

    constructor(private toastr: ToastrService) {
        this._download$ = new Subject<string>();
    }

    ngOnDestroy(): void {
        this._download$.complete();
    }

    public get download$(): Observable<string> {
        return this._download$.asObservable();
    }
    public downloadRuns(runs: Run[]): void {
        const timestamp = Date.now();
        let index = 1;
        runs.forEach((run) => {
            const myFileContent = run.text.trim();
            const myFileName = timestamp + '_run_' + index + '.ps';
            index++;
            const dlink: HTMLAnchorElement = document.createElement('a');
            dlink.download = myFileName;
            dlink.href = 'data:text/plain;charset=utf-16,' + myFileContent;
            dlink.click();
            dlink.remove();
        });
    }

    public downloadCurrentRun(run: Run): void {
        const myFileContent = run.text.trim();
        const myFileName = Date.now() + '_run' + '.ps';
        const dlink: HTMLAnchorElement = document.createElement('a');
        dlink.download = myFileName;
        dlink.href = 'data:text/plain;charset=utf-16,' + myFileContent;
        dlink.click();
        dlink.remove();
    }
}
