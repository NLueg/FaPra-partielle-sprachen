import { Component, EventEmitter, OnInit } from '@angular/core';

import { DownloadService } from '../../services/download/download.service';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss'],
})
export class DownloadComponent implements OnInit {
    _downloadName = '';
    _currentDownloadSelection = 'all';
    _hideDownload = true;
    constructor(private _downloadService: DownloadService) {}

    ngOnInit(): void {}

    // let downloadName: string = 'hello';

    changeHideDownload(): void {
        this._hideDownload = !this._hideDownload;
        this._downloadName = '';
        this._currentDownloadSelection = 'all';
    }

    public download(): void {
        if (this._currentDownloadSelection === 'all') {
            this._downloadService.downloadRuns(this._downloadName);
        } else if (this._currentDownloadSelection === 'current') {
            this._downloadService.downloadCurrentRun(this._downloadName);
        }
    }
}
