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

    parse(content: string): Run | null {
        const contentLines = content.split('\n');

        const run: Run = new Run();

        let currentParsingState: ParsingStates | undefined = undefined;

        for (const line of contentLines) {
            if (line.startsWith(typeAttribute)) {
                if (line.endsWith('ps')) {
                    continue;
                } else {
                    this.toastr.error(
                        `The type of the file has to be 'ps'`,
                        `Unable to parse file`
                    );
                    return null;
                }
            } else if (line.startsWith(transitionsAttribute)) {
                currentParsingState = 'transitions';
                continue;
            } else if (line.startsWith(arcsAttribute)) {
                currentParsingState = 'arcs';
                continue;
            }

            if (currentParsingState === 'transitions') {
                run.addElement(new Element(line.split(' ')[0]));
            } else if (currentParsingState === 'arcs') {
                const splitLine = line.split(' ');
                run.addArc({
                    source: splitLine[0],
                    target: splitLine[1],
                });
            }
        }

        return run;
    }
}
