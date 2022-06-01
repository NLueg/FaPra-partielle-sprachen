import { Component } from '@angular/core';

import { DisplayService } from './services/display.service';
import { DownloadService } from './services/download/download.service';
import { UploadService } from './services/upload/upload.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        private _displayService: DisplayService,
        private _uploadService: UploadService,
        private _downloadService: DownloadService
    ) {}

    public openFileSelector(): void {
        this._uploadService.openFileSelector();
    }

    public dropFiles(event: DragEvent): void {
        if (event.dataTransfer?.files) {
            this._uploadService.uploadFiles(event.dataTransfer.files);
        }
    }

    public downloadRuns(): void {
        this._downloadService.downloadRuns(this._displayService.runs);
    }
    public downloadCurrentRun(): void {
        this._downloadService.downloadCurrentRun(
            this._displayService.currentRun
        );
    }
}
