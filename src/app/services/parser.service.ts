import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Element } from '../classes/diagram/element';
import { Run } from '../classes/diagram/run';

type ParsingStates = 'initial' | 'type' | 'transitions' | 'arcs';
const transitionsAttribute = '.transitions';
const arcsAttribute = '.arcs';

@Injectable({
    providedIn: 'root',
})
export class ParserService {
    constructor(private toastr: ToastrService) {}

    parse(content: string, errors: Set<string>): Run | null {
        const contentLines = content.split('\n');
        const run: Run = new Run();

        run.setText(content);

        let currentParsingState: ParsingStates = 'initial';
        let fileContainsTransitions = false;
        let fileContainsArcs = false;

        this.toastr.toasts.forEach((t) => {
            this.toastr.remove(t.toastId);
        });

        for (const line of contentLines) {
            const trimmedLine = line.trim();

            switch (currentParsingState) {
                case 'initial':
                    if (trimmedLine === '') {
                        break;
                    } else if (trimmedLine === '.type ps') {
                        currentParsingState = 'type';
                        break;
                    } else {
                        errors.add(`The type of the file has to be 'ps'`);
                        this.toastr.error(
                            `The type of the file has to be 'ps'`,
                            `Unable to parse file`
                        );
                        return null;
                    }
                case 'type':
                    if (trimmedLine === '') {
                        break;
                    } else if (trimmedLine === transitionsAttribute) {
                        currentParsingState = 'transitions';
                        fileContainsTransitions = true;
                        break;
                    } else if (trimmedLine === arcsAttribute) {
                        currentParsingState = 'arcs';
                        fileContainsArcs = true;
                        break;
                    } else {
                        errors.add(`The file contains invalid parts`);
                        this.toastr.error(
                            `The file contains invalid parts`,
                            `Unable to parse file`
                        );
                        return null;
                    }
                case 'transitions':
                    if (
                        trimmedLine === '' ||
                        trimmedLine === transitionsAttribute
                    ) {
                        break;
                    } else if (trimmedLine !== arcsAttribute) {
                        if (trimmedLine.split(' ').length !== 1) {
                            run.addWarning(
                                `Transition names are not allow to contain blank`
                            );
                            this.toastr.warning(
                                `Transition names are not allow to contain blank`,
                                `Only first word is used`
                            );
                        }
                        if (
                            !run.addElement(
                                new Element(trimmedLine.split(' ')[0])
                            )
                        ) {
                            run.addWarning(
                                `File contains duplicate transition (${
                                    trimmedLine.split(' ')[0]
                                })`
                            );
                            this.toastr.warning(
                                `File contains duplicate transitions`,
                                `Duplicate transitions are ingnored`
                            );
                        }
                        break;
                    } else if (trimmedLine === '.arcs') {
                        currentParsingState = 'arcs';
                        fileContainsArcs = true;
                        break;
                    } else {
                        errors.add(`Unable to parse file`);
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
                case 'arcs':
                    if (trimmedLine === '' || trimmedLine === arcsAttribute) {
                        break;
                    } else if (trimmedLine !== '.transitions') {
                        if (trimmedLine.split(' ').length === 2) {
                            const splitLine = trimmedLine.split(' ');
                            if (
                                !run.addArc({
                                    source: splitLine[0],
                                    target: splitLine[1],
                                })
                            ) {
                                run.addWarning(
                                    `File contains duplicate arc (${splitLine[0]} ${splitLine[1]})`
                                );
                                this.toastr.warning(
                                    `File contains duplicate arcs`,
                                    `Duplicate arcs are ingnored`
                                );
                            }
                        } else {
                            run.addWarning(`File contains invalid arcs`);
                            this.toastr.warning(
                                `File contains invalid arcs`,
                                `Invalid arcs are ingnored`
                            );
                        }
                        break;
                    } else if (trimmedLine === '.transitions') {
                        currentParsingState = 'transitions';
                        fileContainsTransitions = true;
                        break;
                    } else {
                        errors.add(`Unable to parse file`);
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
            }
        }
        if (fileContainsTransitions && fileContainsArcs) {
            if (!run.setRefs()) {
                run.addWarning(
                    `File contains arcs for non existing transitions`
                );
                this.toastr.warning(
                    `File contains arcs for non existing transitions`,
                    `Invalid arcs are ingnored`
                );
            }

            //Todo check circles in run
            return run;
        } else {
            errors.add(`File does not contain transitions and arcs`);
            this.toastr.error(
                `File does not contain transitions and arcs`,
                `Unable to parse file`
            );
            return null;
        }
    }
}
