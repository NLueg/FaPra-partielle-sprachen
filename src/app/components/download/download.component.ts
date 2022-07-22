import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { DownloadableContent } from './download.const';
import { DownloadPopoverComponent } from './download-popover/download-popover.component';

@Component({
    selector: 'app-download',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss'],
})
export class DownloadComponent {
    @Input()
    contentToDownload: DownloadableContent = 'separateRuns';

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        this.dialog.open(DownloadPopoverComponent, {
            data: { contentToDownload: this.contentToDownload },
        });
    }
}
