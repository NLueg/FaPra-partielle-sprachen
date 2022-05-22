import { Injectable } from '@angular/core';

import { Arc } from '../classes/diagram/arc';
import { Element } from '../classes/diagram/element';
import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    public createSvgElements(run: Run): Array<SVGElement> {
        const result: Array<SVGElement> = [];

        run.elements.forEach((el) => {
            result.push(...createSvgForElement(el));
        });

        run.arcs.forEach((arc) => {
            const source = run.elements.find((el) => el.label === arc.source);
            const target = run.elements.find((el) => el.label === arc.target);

            const arrow = createSvgForArc(arc, source, target);
            if (arrow) {
                result.push(arrow);
            }
        });

        return result;
    }
}

function createSvgForElement(element: Element): SVGElement[] {
    const svg = createSvgElement('rect');

    svg.setAttribute('x', `${element.x}`);
    svg.setAttribute('y', `${element.y}`);
    svg.setAttribute('width', '50');
    svg.setAttribute('height', '50');
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');

    const text = createSvgElement('text');
    text.textContent = element.label;
    text.setAttribute('x', `${element.x + 25}`);
    text.setAttribute('y', `${element.y + 75}`);

    element.registerSvg(svg);

    return [svg, text];
}

function createSvgElement(name: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createSvgForArc(
    arc: Arc,
    source: Element | undefined,
    target: Element | undefined
): SVGElement | null {
    if (!source || !target) {
        return null;
    }

    const arrow = createSvgElement('line');
    arrow.setAttribute('stroke', 'black');
    arrow.setAttribute('stroke-width', '1');
    arrow.setAttribute('marker-end', 'url(#arrowhead)');
    arrow.setAttribute('x1', `${source.x + 50}`);
    arrow.setAttribute('y1', `${source.y + 25}`);
    arrow.setAttribute('x2', `${target.x + 50}`);
    arrow.setAttribute('y2', `${target.y + 25}`);

    return arrow;
}
