import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

import { exampleContent } from './example-file';

const allowedExtensions = ['ps'];

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private _upload$: Subject<string>;

    constructor(private toastr: ToastrService) {
        this._upload$ = new Subject<string>();
    }

    ngOnDestroy(): void {
        this._upload$.complete();
    }

    public get upload$(): Observable<string> {
        return this._upload$.asObservable();
    }

    public checkFiles(files: FileList): boolean {
        var check: boolean = true;

        Array.from(files).forEach(file => {
            if (!fileExtensionIsValid(file.name)) {
                check = false;
                this.toastr.error(
                    `File '${file.name}' has to be a valid extension`,
                    `Unable to parse file`
                );
            }
        });

        return check;
    }

    public openFileSelector() {
        var fileUpload = document.createElement("input");
        fileUpload.setAttribute("type", "file");
        fileUpload.setAttribute("multiple", "multiple");
        fileUpload.setAttribute("accept", allowedExtensions.map(e => "." + e).join(","));
        fileUpload.onchange = (event) => {
            if (event.target instanceof HTMLInputElement && event.target?.files) {
                this.uploadFiles(event.target.files);
            }
        };

        fileUpload.click();
    }

    public uploadFiles(files: FileList) {
        if (!this.checkFiles(files)) {
            return;
        }

        Array.from(files).forEach(file => {
            var reader = new FileReader();

            reader.onload = () => {
                const content: string = reader.result as string;
                this._upload$.next(content);
            };

            reader.readAsText(file);
        });
    }
}

function fileExtensionIsValid(fileName: string): boolean {
    const fileExtension = fileName.split('.').pop();
    if (!fileExtension) {
        return false;
    }
    return allowedExtensions.includes(fileExtension);
}
