import { Component, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    debounceTime,
    distinctUntilChanged,
    first,
    Observable,
    Subscription,
} from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser.service';
import { exampleContent } from '../../services/upload/example-file';
import { UploadService } from '../../services/upload/upload.service';

type Valid = 'error' | 'warn' | 'success';

@Component({
    selector: 'app-source-file-textarea',
    templateUrl: './source-file-textarea.component.html',
    styleUrls: ['./source-file-textarea.component.scss'],
})
export class SourceFileTextareaComponent implements OnDestroy {
    private _sub: Subscription;
    private _fileSub: Subscription;

    textareaFc: FormControl;

    hasPreviousRun$: Observable<boolean>;
    hasNextRun$: Observable<boolean>;
    isCurrentRunEmpty$: Observable<boolean>;
    getCurrentRunIndex$: Observable<number>;
    getRunCount$: Observable<number>;

    runValidationStatus: Valid | null = null;
    runHint = '';

    constructor(
        private _parserService: ParserService,
        private _displayService: DisplayService,
        private _uploadService: UploadService
    ) {
        this.textareaFc = new FormControl();

        this.hasPreviousRun$ = this._displayService
            .hasPreviousRun$()
            .pipe(distinctUntilChanged());

        this.hasNextRun$ = this._displayService
            .hasNextRun$()
            .pipe(distinctUntilChanged());

        this.isCurrentRunEmpty$ = this._displayService
            .isCurrentRunEmpty$()
            .pipe(distinctUntilChanged());

        this.getCurrentRunIndex$ = this._displayService
            .getCurrentRunIndex$()
            .pipe(distinctUntilChanged());

        this.getRunCount$ = this._displayService
            .getRunCount$()
            .pipe(distinctUntilChanged());

        this._sub = this.textareaFc.valueChanges
            .pipe(debounceTime(400))
            .subscribe((val) => this.processSourceChange(val));

        this._fileSub = this._uploadService
            .getUpload$()
            .subscribe((content) => this.processNewSource(content));

        this.textareaFc.setValue(exampleContent);
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
        this._fileSub.unsubscribe();
    }

    nextRun(): void {
        const run = this._displayService.setNextRun();
        this.updateShownRun(run);
    }

    previousRun(): void {
        const run = this._displayService.setPreviousRun();
        this.updateShownRun(run);
    }

    removeRun(): void {
        const run = this._displayService.removeCurrentRun();
        this.updateShownRun(run);
    }

    addRun(): void {
        const run = this._displayService.addEmptyRun();
        this.updateShownRun(run);
    }

    reset(): void {
        this._displayService.clearRuns();

        this._displayService.currentRun$
            .pipe(first())
            .subscribe((currentRun) => {
                this.updateShownRun(currentRun);
            });
    }

    resolveWarnings(): void {
        this._displayService.currentRun$
            .pipe(first())
            .subscribe((currentRun) => {
                currentRun.resolveWarnings();
                this.updateShownRun(currentRun, true);
            });
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
        this.textareaFc.setValue(newSource);
    }

    private updateShownRun(run: Run, emitEvent = false): void {
        this.textareaFc.setValue(run.text, { emitEvent: emitEvent });
        this.updateValidation(run);
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
}
