import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { DownloadService } from '../../../services/download/download.service';
import { DownloadableContent, DownloadFormat } from '../download.const';

@Component({
    selector: 'app-download-popover',
    templateUrl: './download-popover.component.html',
    styleUrls: ['./download-popover.component.scss'],
})
export class DownloadPopoverComponent {
    fileFormat: DownloadFormat = 'run';
    downloadName = '';
    currentDownloadSelection: 'all' | 'current' = 'all';
    compression = false;

    constructor(
        private dialogRef: MatDialogRef<DownloadPopoverComponent>,
        @Inject(MAT_DIALOG_DATA)
        public data: { contentToDownload: DownloadableContent },
        private _downloadService: DownloadService
    ) {}

    download(): void {
        if (this.currentDownloadSelection === 'all') {
            this._downloadService.downloadRuns(
                this.downloadName,
                this.data.contentToDownload,
                this.fileFormat,
                this.compression
            );
        } else if (this.currentDownloadSelection === 'current') {
            this._downloadService.downloadCurrentRun(
                this.downloadName,
                this.fileFormat
            );
        }
        this.closePopover();
    }

    closePopover(): void {
        this.dialogRef.close();
    }
}
