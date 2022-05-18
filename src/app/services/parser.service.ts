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

    // TODO: More validation (see PAR-10)
    parse(content: string): Run | null {
        const contentLines = content.split('\n');
        const run: Run = new Run();

        let currentParsingState: ParsingStates = 'initial';
        let fileContainsTransitions = false;
        let fileContainsArcs = false;
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
                        this.toastr.error(
                            `The file contains unvalid parts`,
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
                            this.toastr.warning(
                                `Transition names are not allow to contain blank`,
                                `Only first word is used`
                            );
                        }
                        run.addElement(new Element(trimmedLine.split(' ')[0]));
                        break;
                    } else if (trimmedLine === '.arcs') {
                        currentParsingState = 'arcs';
                        fileContainsArcs = true;
                        break;
                    } else {
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
                case 'arcs':
                    if (trimmedLine === '' || trimmedLine === arcsAttribute) {
                        break;
                    } else if (trimmedLine !== '.transitions') {
                        if (trimmedLine.split(' ').length === 2) {
                            const splitLine = trimmedLine.split(' ');
                            run.addArc({
                                source: splitLine[0],
                                target: splitLine[1],
                            });
                        } else {
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
                        this.toastr.error(`Error`, `Unable to parse file`);
                        return null;
                    }
            }
        }
        if (fileContainsTransitions && fileContainsArcs) {
            return run;
        } else {
            this.toastr.error(
                `File does not contain transitions and arcs`,
                `Unable to parse file`
            );
            return null;
        }
    }
}
