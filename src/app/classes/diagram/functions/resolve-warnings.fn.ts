import {
    arcsAttribute,
    transitionsAttribute,
    typeKey,
} from '../../../services/parser/parsing-constants';
import { Arc } from '../arc';
import { Run } from '../run';
import { getCycles } from './cycles.fn';

/**
 * resolve warnings (removes duplicates and invalid arcs)
 */
export function resolveWarnings(run: Run): Run {
    removeCycles(run);

    run.text = generateTextForRun(run);
    run.warnings = [];
    return run;
}

export function generateTextForRun(run: Run): string {
    const lines = [typeKey];
    lines.push(transitionsAttribute);
    run.elements.forEach((e) => {
        if (e.x && e.y) lines.push(`${e.label} [${e.x}, ${e.y}]`);
        else lines.push(e.label);
    });

    lines.push(arcsAttribute);
    lines.push(
        ...run.arcs
            .filter((arc) => {
                const source = run.elements.find(
                    (element) => element.label === arc.source
                );
                const target = run.elements.find(
                    (element) => element.label === arc.target
                );
                return source && target;
            })
            .map(
                (arc) => arc.source + ' ' + arc.target + getBreakpointInfo(arc)
            )
    );
    return lines.join('\n');
}

function getBreakpointInfo(arc: Arc): string {
    let text = '';
    if (arc.breakpoints.length > 0) {
        text = '';
        arc.breakpoints.forEach((breakpoint) => {
            text += `[${breakpoint.x + 25}, ${breakpoint.y + 25}]`;
        });
    }

    return text;
}

function removeCycles(run: Run): void {
    getCycles(run).forEach((arc) => {
        return run.arcs.splice(
            run.arcs.findIndex((a) => a === arc),
            1
        );
    });
}
