import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, Observable, Subscription } from 'rxjs';

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

    hasPreviousRun$: Observable<boolean>;
    hasNextRun$: Observable<boolean>;
    isCurrentRunEmpty$: Observable<boolean>;
    getCurrentRunIndex$: Observable<number>;
    getRunCount$: Observable<number>;

    private _sub: Subscription;
    private _fileSub: Subscription;
    runValidationStatus: Valid | null = null;
    runHint = '';

    constructor(
        private _parserService: ParserService,
        private _displayService: DisplayService,
        private _uploadService: UploadService
    ) {
        this.textareaFc = new FormControl();

        this.hasPreviousRun$ = this._displayService.hasPreviousRun$();
        this.hasNextRun$ = this._displayService.hasNextRun$();
        this.isCurrentRunEmpty$ = this._displayService.isCurrentRunEmpty$();
        this.getCurrentRunIndex$ = this._displayService.getCurrentRunIndex$();
        this.getRunCount$ = this._displayService.getRunCount$();

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
        this.updateTextarea(newSource);
    }

    private updateValidation(
        run: Run | null,
        errors: Set<string> = new Set<string>()
    ): void {
        this.runHint = [...errors, ...(run ? run.warnings : [])].join('\n');

        if (!run || errors.size > 0) {
            this.textareaFc.setErrors({ 'invalid run': true });
            this.runValidationStatus = 'error';
        } else if (run.warnings.size > 0) {
            this.runValidationStatus = 'warn';
        } else if (!run.isEmpty()) {
            this.runValidationStatus = 'success';
        } else {
            this.runValidationStatus = null;
        }
    }

    public openFileSelector(): void {
        this._uploadService.openFileSelector();
    }

    public dropFiles(event: DragEvent): void {
        if (event.dataTransfer?.files) {
            this._uploadService.uploadFiles(event.dataTransfer.files);
        }
    }

    public nextRun(): void {
        const run = this._displayService.setNextRun();
        this.updateTextarea(run.text);
        this.updateValidation(run);
    }

    public previousRun(): void {
        const run = this._displayService.setPreviousRun();
        this.updateTextarea(run.text);
        this.updateValidation(run);
    }

    public removeRun(): void {
        const run = this._displayService.removeCurrentRun();
        this.updateTextarea(run.text);
        this.updateValidation(run);
    }

    public addRun(): void {
        const run = this._displayService.addEmptyRun();
        this.updateTextarea(run.text);
        this.updateValidation(run);
    }

    public reset(): void {
        this._displayService.clearRuns();
        this.updateTextarea(this._displayService.currentRun.text);
        this.updateValidation(this._displayService.currentRun);
    }

    public resolveWarnings(): void {
        this._displayService.currentRun.resolveWarnings();
        this.updateTextarea(this._displayService.currentRun.text, true);
        this.updateValidation(this._displayService.currentRun);
    }

    private updateTextarea(content: string, emitEvent = false): void {
        this.textareaFc.setValue(content, { emitEvent: emitEvent });
    }
}

type Valid = 'error' | 'warn' | 'success';
