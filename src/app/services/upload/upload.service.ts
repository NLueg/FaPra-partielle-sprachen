import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { exampleContent } from './example-file';

const allowedExtensions = ['ps'];

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private fileReader: FileReader;

    constructor(private toastr: ToastrService) {
        this.fileReader = new FileReader();
    }

    // TODO: Needs to get a path or something
    uploadFile(): Promise<string | null> {
        const uploadedFile = new File([exampleContent], `example-file.ps`);

        if (!fileExtensionIsValid(uploadedFile.name)) {
            this.toastr.error(
                `File has to be a valid extension`,
                `Unable to parse file`
            );
            return Promise.resolve(null);
        }

        return this.getFileContent(uploadedFile);
    }

    private getFileContent(uploadedFile: File): Promise<string> {
        this.fileReader.readAsText(uploadedFile);

        return new Promise((resolve) => {
            this.fileReader.onload = () => {
                resolve(this.fileReader.result as string);
            };
            this.fileReader.onerror = () => {
                resolve('');
            };
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
