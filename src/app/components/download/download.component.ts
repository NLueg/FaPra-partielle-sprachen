import { Component, Input } from '@angular/core';

import { DownloadService } from '../../services/download/download.service';
import { DownloadableContent } from './download.const';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss'],
})
export class DownloadComponent {
    @Input()
    contentToDownload: DownloadableContent = 'separateRuns';

    downloadName = '';
    hideDownload = true;
    currentDownloadSelection = 'all';

    constructor(private _downloadService: DownloadService) {}

    toggleHideDownload(): void {
        this.hideDownload = !this.hideDownload;
        this.downloadName = '';
        this.currentDownloadSelection = 'all';
    }

    download(): void {
        if (this.currentDownloadSelection === 'all') {
            this._downloadService.downloadRuns(
                this.downloadName,
                this.contentToDownload
            );
        } else if (this.currentDownloadSelection === 'current') {
            this._downloadService.downloadCurrentRun(this.downloadName);
        }
        this.changeHideDownload();
    }
}
