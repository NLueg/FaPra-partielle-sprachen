import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';

import { Run } from './classes/diagram/run';
import { DisplayService } from './services/display.service';
import { ParserService } from './services/parser.service';
import { exampleContent } from './services/upload/example-file';
import { UploadService } from './services/upload/upload.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnDestroy {
    public textareaFc: FormControl;
    public Valid = Valid;

    private _sub: Subscription;
    private _fileSub: Subscription;
    private _isRunValid: Valid | undefined;
    private _runHint = '';

    constructor(
        private _parserService: ParserService,
        private _displayService: DisplayService,
        private _uploadService: UploadService
    ) {
        this.textareaFc = new FormControl();
        this._sub = this.textareaFc.valueChanges
            .pipe(debounceTime(400))
            .subscribe((val) => this.processSourceChange(val));
        this.textareaFc.setValue(exampleContent);

        this._fileSub = this._uploadService.upload$.subscribe((content) =>
            this.processNewSource(content)
        );
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this._fileSub.unsubscribe();
    }

    private processSourceChange(newSource: string): void {
        const errors = new Set<string>();
        const result = this._parserService.parse(newSource, errors);
        this.updateValidation(result, errors);

        if (!result) return;

        this._displayService.updateCurrentRun(result);
    }

    private processNewSource(newSource: string): void {
        const errors = new Set<string>();
        const result = this._parserService.parse(newSource, errors);
        this.updateValidation(result, errors);

        if (!result) return;

        this._displayService.registerRun(result);
        this.textareaFc.setValue(newSource, { emitEvent: false });
    }

    private updateValidation(run: Run | null, errors: Set<string>): void {
        this._runHint = [...errors, ...(run ? run.warnings : [])].join('\n');

        if (!run || errors.size > 0) {
            this.textareaFc.setErrors({ 'invalid run': true });
            this._isRunValid = Valid.Error;
        } else if (run.warnings.size > 0) {
            this._isRunValid = Valid.Warn;
        } else {
            this._isRunValid = Valid.Success;
        }
    }

    get isRunValid(): number | undefined {
        return this._isRunValid;
    }

    get runHint(): string {
        return this._runHint;
    }

    public openFileSelector(): void {
        this._uploadService.openFileSelector();
    }

    public dropFiles(event: DragEvent): void {
        if (event.dataTransfer?.files) {
            this._uploadService.uploadFiles(event.dataTransfer.files);
        }
    }
}

export enum Valid {
    Error,
    Warn,
    Success,
}
