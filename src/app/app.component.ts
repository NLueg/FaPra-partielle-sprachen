import { Component } from '@angular/core';

import { UploadService } from './services/upload/upload.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(private _uploadService: UploadService) {}

    public openFileSelector(): void {
        this._uploadService.openFileSelector();
    }

    public dropFiles(event: DragEvent): void {
        if (event.dataTransfer?.files) {
            this._uploadService.uploadFiles(event.dataTransfer.files);
        }
    }
}
