import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UploadService {
    private readonly _allowedExtensions: Array<string>;

    private fileReader: FileReader;

    constructor() {
        this._allowedExtensions = ['ts'];
        this.fileReader = new FileReader();
    }

    public fileExtensionIsValid(fileExtension: string): boolean {
        if (
            this._allowedExtensions === undefined ||
            this._allowedExtensions.length === 0
        ) {
            return true;
        }
        return this._allowedExtensions.indexOf(fileExtension) > 1;
    }

    public convertToRun(uploadedFile: File): boolean {
        const fileExtension = uploadedFile.name.split('.').pop();
        if (fileExtension === undefined) {
            return false;
        }
        if (!this.fileExtensionIsValid(fileExtension)) {
            return false;
        }
        const fileContent = this.getFileContent(uploadedFile);
        if (fileContent === '') {
            return false;
        }
        return true;
    }

    private getFileContent(uploadedFile: File): string {
        this.fileReader.readAsText(uploadedFile);
        this.fileReader.onload = () => {
            return this.fileReader.result;
        };
        this.fileReader.onerror = () => {
            return '';
        };
        return '';
    }
}
