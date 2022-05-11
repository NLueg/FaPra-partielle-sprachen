import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

import { Element } from '../classes/diagram/element';
import { Run } from '../classes/diagram/run';

type ParsingStates = 'transitions' | 'arcs';

const typeAttribute = '.type';
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

        let currentParsingState: ParsingStates | undefined = undefined;

        for (const line of contentLines) {
            const trimmedLine = line.trim();

            if (trimmedLine.startsWith(typeAttribute)) {
                if (trimmedLine.endsWith('ps')) {
                    continue;
                } else {
                    this.toastr.error(
                        `The type of the file has to be 'ps'`,
                        `Unable to parse file`
                    );
                    return null;
                }
            } else if (trimmedLine.startsWith(transitionsAttribute)) {
                currentParsingState = 'transitions';
                continue;
            } else if (trimmedLine.startsWith(arcsAttribute)) {
                currentParsingState = 'arcs';
                continue;
            }

            if (currentParsingState === 'transitions') {
                run.addElement(new Element(trimmedLine.split(' ')[0]));
            } else if (currentParsingState === 'arcs') {
                const splitLine = trimmedLine.split(' ');
                run.addArc({
                    source: splitLine[0],
                    target: splitLine[1],
                });
            }
        }

        return run;
    }
}
