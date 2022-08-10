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
    eventsAttribute,
    offsetAttribute,
    typeKey,
} from './parsing-constants';

type ParsingStates = 'initial' | 'type' | 'events' | 'arcs' | 'offset';

@Injectable({
    providedIn: 'root',
})
export class ParserService {
    constructor(private toastr: ToastrService) {}
    // static transitionRegex = new RegExp('^([^\\[ ]+)(\\s?\\[\\d+\\])?$');
    static arcRegex = new RegExp('^([^\\[ ]+)\\s([^\\[ ]+)(\\s?\\[\\d+\\])*$');
    static breakpointRegex = new RegExp('\\[\\d+\\]');
    static offsetRegex = new RegExp('-?\\d+ -?\\d+');

    parse(content: string, errors: Set<string>): Run | null {
        const contentLines = content.split('\n');
        const run: Run = {
            text: content,
            arcs: [],
            elements: [],
            warnings: [],
            offset: { x: 0, y: 0 },
        };

        let currentParsingState: ParsingStates = 'initial';
        let fileContainsTransitions = false;
        let fileContainsArcs = false;
        let fileHasOffset = false;

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
                        errors.add(`The type has to be '` + typeKey + `'`);
                        this.toastr.error(
                            `The type has to be '` + typeKey + `'`,
                            `Unable to parse file`
                        );
                        return null;
                    }
                case 'type':
                    if (trimmedLine === '') {
                        break;
                    } else if (trimmedLine === eventsAttribute) {
                        currentParsingState = 'events';
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
                case 'events':
                    if (trimmedLine === '' || trimmedLine === eventsAttribute) {
                        break;
                    } else if (
                        trimmedLine !== arcsAttribute &&
                        trimmedLine !== offsetAttribute
                    ) {
                        let label: string;
                        let id: string;
                        let layerPos: number | undefined;
                        if (
                            trimmedLine.split(' | ').length == 0 ||
                            trimmedLine.split(' | ')[0] == '' ||
                            trimmedLine.split(' | ')[1] == ''
                        ) {
                            run.warnings.push(`Invalid event definition`);
                            this.toastr.error(
                                `Invalid event definition`,
                                `Events have to have a label and an ID separated by '|'`
                            );
                            return null;
                        } else {
                            label = trimmedLine.split(' | ')[0];
                            id = trimmedLine.split(' | ')[1];
                            // const match =
                            //     ParserService.transitionRegex.exec(trimmedLine);
                            // if (match) {
                            //     label = match[1];
                            //     if (match[2]) {
                            //         //extract coordinates
                            //         layerPos = parseInt(
                            //             match[2].substring(
                            //                 match[2].indexOf('[') + 1,
                            //                 match[2].indexOf(']')
                            //             )
                            //         );
                            //     }
                            // } else {
                            //     label = trimmedLine.split(' ')[0];
                            // }
                        }

                        if (
                            !addElement(run, {
                                label: label,
                                layerPos: layerPos,
                                incomingArcs: [],
                                outgoingArcs: [],
                                id: id,
                            })
                        ) {
                            run.warnings.push(
                                `File contains duplicate events (${
                                    trimmedLine.split(' ')[0]
                                })`
                            );
                            this.toastr.warning(
                                `File contains duplicate events`,
                                `Duplicate events are ignored`
                            );
                        }
                        break;
                    } else if (trimmedLine === '.arcs') {
                        currentParsingState = 'arcs';
                        fileContainsArcs = true;
                        break;
                    } else if (trimmedLine === offsetAttribute) {
                        currentParsingState = 'offset';
                        break;
                    } else {
                        errors.add(`Unable to parse file`);
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
                case 'arcs':
                    if (trimmedLine === '' || trimmedLine === arcsAttribute) {
                        break;
                    } else if (trimmedLine === offsetAttribute) {
                        currentParsingState = 'offset';
                        break;
                    } else if (trimmedLine !== eventsAttribute) {
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
                                        const layerPos = parseInt(
                                            trimmedLineTmp.substring(
                                                trimmedLineTmp.indexOf('[') + 1,
                                                trimmedLineTmp.indexOf(']')
                                            )
                                        );
                                        breakpoints.push({
                                            x: 0,
                                            y: 0,
                                            layerPos: layerPos,
                                            arc: arc,
                                        });
                                        arc.breakpoints = breakpoints;
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
                    } else if (trimmedLine === eventsAttribute) {
                        currentParsingState = 'events';
                        fileContainsTransitions = true;
                        break;
                    } else {
                        errors.add(`Unable to parse file`);
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
                case 'offset':
                    if (
                        trimmedLine === '' ||
                        trimmedLine === offsetAttribute ||
                        fileHasOffset
                    ) {
                        break;
                    } else if (ParserService.offsetRegex.test(trimmedLine)) {
                        const matches =
                            ParserService.offsetRegex.exec(trimmedLine);
                        if (matches) {
                            fileHasOffset = true;
                            const coordinates = matches[0].split(' ');
                            run.offset = {
                                x: parseInt(coordinates[0]),
                                y: parseInt(coordinates[1]),
                            };
                        }
                    }
            }
        }
        if (fileContainsTransitions && fileContainsArcs) {
            if (!setRefs(run)) {
                run.warnings.push(`File contains arcs for non existing events`);
                this.toastr.warning(
                    `File contains arcs for non existing events`,
                    `Invalid arcs are ignored`
                );
            }

            //check cycles in run
            if (hasCycles(run)) {
                run.warnings.push(`File contains cycles`);
                this.toastr.warning(
                    `File contains cycles`,
                    `A partial language cannot contain cycles`
                );
            }

            return run;
        } else {
            errors.add(`File does not contain events and arcs`);
            this.toastr.error(
                `File does not contain events and arcs`,
                `Unable to parse file`
            );
            return null;
        }
    }
}
