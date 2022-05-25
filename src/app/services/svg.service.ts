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
                arrow.forEach((a) => {
                    result.push(a);
                });
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
): SVGElement[] {
    const elements: SVGElement[] = [];

    if (!source || !target) {
        return elements;
    }

    if (arc.breakpoints.length == 0) {
        elements.push(
            createLine(
                source.x + 50,
                source.y + 25,
                target.x,
                target.y + 25,
                true
            )
        );
    } else {
        //source -> first breakpoint
        elements.push(
            createLine(
                source.x + 50,
                source.y + 25,
                arc.breakpoints[0].x + 25,
                arc.breakpoints[0].y + 25,
                false
            )
        );
        //breakpoint -> next breaktpoint
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createLine(
                    arc.breakpoints[i].x + 25,
                    arc.breakpoints[i].y + 25,
                    arc.breakpoints[i + 1].x + 25,
                    arc.breakpoints[i + 1].y + 25,
                    false
                )
            );
        }
        //last breakpoint -> target
        elements.push(
            createLine(
                arc.breakpoints[arc.breakpoints.length - 1].x + 25,
                arc.breakpoints[arc.breakpoints.length - 1].y + 25,
                target.x,
                target.y + 25,
                true
            )
        );
    }

    return elements;
}

function createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    showArrow: boolean
): SVGElement {
    const line = createSvgElement('line');
    line.setAttribute('stroke', 'black');
    line.setAttribute('stroke-width', '1');
    if (showArrow) line.setAttribute('marker-end', 'url(#arrowhead)');
    line.setAttribute('x1', `${x1}`);
    line.setAttribute('y1', `${y1}`);
    line.setAttribute('x2', `${x2}`);
    line.setAttribute('y2', `${y2}`);

    return line;
}
