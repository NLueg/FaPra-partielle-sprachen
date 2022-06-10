import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { hasCycles } from '../../classes/diagram/functions/cycles.fn';
import { Run } from '../../classes/diagram/run';
import { addArc, addElement, setRefs } from './parser-helper.fn';

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
        const run: Run = {
            text: content,
            arcs: [],
            elements: [],
            warnings: [],
        };

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
                            run.warnings.push(
                                `Transition names are not allow to contain blank`
                            );
                            this.toastr.warning(
                                `Transition names are not allow to contain blank`,
                                `Only first word is used`
                            );
                        }
                        if (
                            !addElement(run, {
                                label: trimmedLine.split(' ')[0],
                                incomingArcs: [],
                                outgoingArcs: [],
                            })
                        ) {
                            run.warnings.push(
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
                                !addArc(run, {
                                    source: splitLine[0],
                                    target: splitLine[1],
                                    breakpoints: [],
                                })
                            ) {
                                run.warnings.push(
                                    `File contains duplicate arc (${splitLine[0]} ${splitLine[1]})`
                                );
                                this.toastr.warning(
                                    `File contains duplicate arcs`,
                                    `Duplicate arcs are ingnored`
                                );
                            }
                        } else {
                            run.warnings.push(`File contains invalid arcs`);
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
            if (!setRefs(run)) {
                run.warnings.push(
                    `File contains arcs for non existing transitions`
                );
                this.toastr.warning(
                    `File contains arcs for non existing transitions`,
                    `Invalid arcs are ingnored`
                );
            }

            //check cycles in run
            if (hasCycles(run)) {
                run.warnings.push(`File contains cycles`);
                this.toastr.warning(
                    `File contains cycles`,
                    `Could not apply Sugiyama layout`
                );
            }

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
