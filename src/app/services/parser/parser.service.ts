import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Breakpoint } from 'src/app/classes/diagram/arc';

import { hasCycles } from '../../classes/diagram/functions/cycles.fn';
import {
    addArc,
    addElement,
    setRefs,
} from '../../classes/diagram/functions/run-helper.fn';
import { Run } from '../../classes/diagram/run';
import {
    arcsAttribute,
    transitionsAttribute,
    typeKey,
} from './parsing-constants';

type ParsingStates = 'initial' | 'type' | 'transitions' | 'arcs';

@Injectable({
    providedIn: 'root',
})
export class ParserService {
    constructor(private toastr: ToastrService) {}
    static transitionRegex = new RegExp(
        '^([^\\[ ]+)(\\s?\\[\\d+,\\s?\\d+\\])?$'
    );
    static arcRegex = new RegExp(
        '^([^\\[ ]+)\\s([^\\[ ]+)(\\s?\\[\\d+,\\s?\\d+\\])*$'
    );
    static breakpointRegex = new RegExp('\\[\\d+,\\s?\\d+\\]');

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
                    } else if (trimmedLine === typeKey) {
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
                        let label: string;
                        let posX: number | undefined;
                        let posY: number | undefined;
                        if (!ParserService.transitionRegex.test(trimmedLine)) {
                            label = trimmedLine.split(' ')[0];
                            run.warnings.push(`Invalid transition definition`);
                            this.toastr.warning(
                                `Invalid transition definition`,
                                `Only first word is used`
                            );
                        } else {
                            const match =
                                ParserService.transitionRegex.exec(trimmedLine);
                            if (match) {
                                label = match[1];
                                if (match[2]) {
                                    //extract coordinates
                                    posX = parseInt(
                                        match[2].substring(
                                            match[2].indexOf('[') + 1,
                                            match[2].indexOf(',')
                                        )
                                    );
                                    posY = parseInt(
                                        match[2].substring(
                                            match[2].indexOf(',') + 1,
                                            match[2].indexOf(']')
                                        )
                                    );
                                }
                            } else {
                                label = trimmedLine.split(' ')[0];
                            }
                        }

                        if (
                            !addElement(run, {
                                label: label,
                                x: posX,
                                y: posY,
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
                                `Duplicate transitions are ignored`
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
                    } else if (trimmedLine !== transitionsAttribute) {
                        let source: string, target: string;
                        const breakpoints: Breakpoint[] = [];

                        if (ParserService.arcRegex.test(trimmedLine)) {
                            const match =
                                ParserService.arcRegex.exec(trimmedLine);

                            if (match) {
                                source = match[1];
                                target = match[2];
                            } else {
                                const splitLine = trimmedLine.split(' ');
                                source = splitLine[0];
                                target = splitLine[1];
                            }

                            if (
                                !addArc(run, {
                                    source: source,
                                    target: target,
                                    breakpoints: breakpoints,
                                })
                            ) {
                                run.warnings.push(
                                    `File contains duplicate arc (${source} ${target})`
                                );
                                this.toastr.warning(
                                    `File contains duplicate arcs`,
                                    `Duplicate arcs are ignored`
                                );
                            } else {
                                const arc = run.arcs.find(
                                    (a) =>
                                        a.source === source &&
                                        a.target === target
                                );
                                if (arc) {
                                    let trimmedLineTmp = trimmedLine;
                                    while (
                                        ParserService.breakpointRegex.test(
                                            trimmedLineTmp
                                        )
                                    ) {
                                        const posX =
                                            parseInt(
                                                trimmedLineTmp.substring(
                                                    trimmedLineTmp.indexOf(
                                                        '['
                                                    ) + 1,
                                                    trimmedLineTmp.indexOf(',')
                                                )
                                            ) - 25; // center breakpoints
                                        const posY =
                                            parseInt(
                                                trimmedLineTmp.substring(
                                                    trimmedLineTmp.indexOf(
                                                        ','
                                                    ) + 1,
                                                    trimmedLineTmp.indexOf(']')
                                                )
                                            ) - 25; // center breakpoints
                                        breakpoints.push({
                                            x: posX,
                                            y: posY,
                                            arc: arc,
                                        });
                                        trimmedLineTmp =
                                            trimmedLineTmp.substring(
                                                trimmedLineTmp.indexOf(']') + 1
                                            );
                                    }
                                }
                            }
                        } else {
                            run.warnings.push(`File contains invalid arcs`);
                            this.toastr.warning(
                                `File contains invalid arcs`,
                                `Invalid arcs are ignored`
                            );
                        }
                        break;
                    } else if (trimmedLine === transitionsAttribute) {
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
                    `Invalid arcs are ignored`
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
