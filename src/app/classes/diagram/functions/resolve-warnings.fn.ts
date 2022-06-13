import { Run } from '../run';
import { getCycles } from './cycles.fn';

/**
 * resolve warnings (removes duplicates and invalid arcs)
 */
export function resolveWarnings(run: Run): Run {
    removeCycles(run);

    const lines = ['.type ps'];
    lines.push('.transitions');
    run.elements.forEach((e) => {
        lines.push(e.label);
    });

    lines.push('.arcs');
    run.arcs.forEach((e) => {
        if (e.sourceEl && e.targetEl) lines.push(e.source + ' ' + e.target);
    });

    run.text = lines.join('\n');
    run.warnings = [];
    return run;
}

function removeCycles(run: Run): void {
    getCycles(run).forEach((arc) => {
        return run.arcs.splice(
            run.arcs.findIndex((a) => a === arc),
            1
        );
    });
}