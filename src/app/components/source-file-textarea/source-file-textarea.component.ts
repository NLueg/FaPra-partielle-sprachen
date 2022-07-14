import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
    debounceTime,
    distinctUntilChanged,
    first,
    Observable,
    of,
    Subscription,
} from 'rxjs';

import { resolveWarnings } from '../../classes/diagram/functions/run-helper.fn';
import { isRunEmpty, Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';
import { ParserService } from '../../services/parser/parser.service';
import { exampleContent } from '../../services/upload/example-file';
import { UploadService } from '../../services/upload/upload.service';
import { CoordinatesInfo } from '../canvas/canvas.component';

type Valid = 'error' | 'warn' | 'success';

@Component({
    selector: 'app-source-file-textarea',
    templateUrl: './source-file-textarea.component.html',
    styleUrls: ['./source-file-textarea.component.scss'],
})
export class SourceFileTextareaComponent implements OnDestroy, OnInit {
    private eventsSubscription: Subscription | undefined;
    @Input() events: Observable<void> | undefined;
    private _sub: Subscription;
    private _fileSub: Subscription;
    private _coordsSub: Subscription;
    private _resetEventSubscription!: Subscription;

    textareaFc: FormControl;

    hasPreviousRun$: Observable<boolean>;
    hasNextRun$: Observable<boolean>;
    isCurrentRunEmpty$: Observable<boolean>;
    getCurrentRunIndex$: Observable<number>;
    getRunCount$: Observable<number>;

    @Input()
    resetEvent: Observable<void> = of(undefined);

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

        this._coordsSub = this._displayService
            .coordsInfoAdded()
            .pipe(debounceTime(400))
            .subscribe((val) => this.addCoordinatesInfo(val));

        this._fileSub = this._uploadService
            .getUpload$()
            .subscribe((content) => this.processNewSource(content));

        this.textareaFc.setValue(exampleContent);
    }

    ngOnInit(): void {
        this._resetEventSubscription = this.resetEvent.subscribe(() =>
            this.removeCoordinates()
        );
    }

    ngOnDestroy(): void {
        this._resetEventSubscription.unsubscribe();
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
                currentRun = resolveWarnings(currentRun);
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

    private addCoordinatesInfo(coordinatesInfo: CoordinatesInfo): void {
        if (coordinatesInfo.transitionName !== '') {
            const currentValue = this.textareaFc.value;
            const coordsString =
                '\n' +
                coordinatesInfo.transitionName +
                ' [' +
                coordinatesInfo.coordinates.x +
                ',' +
                +coordinatesInfo.coordinates.y +
                ']\n';
            const patternString =
                '\\n' +
                coordinatesInfo.transitionName +
                '( \\[\\d+,\\d+\\])?\\n';
            const replacePattern = new RegExp(patternString, 'g');
            const newValue = currentValue.replace(replacePattern, coordsString);
            this.textareaFc.setValue(newValue, { emitEvent: true });
        }
    }

    public removeCoordinates(): void {
        const contentLines = this.textareaFc.value.split('\n');
        let newText = '';
        let first = true;
        for (const line of contentLines) {
            if (first) {
                newText = newText + line.split('[')[0];
                first = false;
            } else {
                newText = newText + '\n' + line.split('[')[0];
            }
        }
        this.textareaFc.setValue(newText);
        this.processSourceChange(newText);
    }

    private updateShownRun(run: Run, emitEvent = true): void {
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
        } else if (run.warnings.length > 0) {
            this.runValidationStatus = 'warn';
        } else if (!isRunEmpty(run)) {
            this.runValidationStatus = 'success';
        } else {
            this.runValidationStatus = null;
        }
    }
}
