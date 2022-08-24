import { Component } from '@angular/core';
import { Subject } from 'rxjs';

import { DownloadableContent } from './components/download/download.const';
import { DownloadService } from './services/download/download.service';
import { UploadService } from './services/upload/upload.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    selectedDataToDownload: DownloadableContent = 'separateRuns';
    resetPositioningSubject: Subject<void> = new Subject<void>();
    resetPositioningInMergeViewSubject: Subject<void> = new Subject<void>();

    constructor(
        private _uploadService: UploadService,
        private _downloadService: DownloadService
    ) {}

    resetSvgPositioning(): void {
        this.resetPositioningSubject.next();
    }

    resetPositioningInMergeView(): void {
        this.resetPositioningInMergeViewSubject.next();
    }

    public openFileSelector(): void {
        this._uploadService.openFileSelector();
    }

    public dropFiles(event: DragEvent): void {
        if (event.dataTransfer?.files) {
            this._uploadService.uploadFiles(event.dataTransfer.files);
        }
    }

    updateTabIndex(index: number): void {
        this.selectedDataToDownload = getContentByIndex(index);
    }
}

function getContentByIndex(index: number): DownloadableContent {
    switch (index) {
        case 1:
            return 'mergeRuns';
        default:
            return 'separateRuns';
    }
}
