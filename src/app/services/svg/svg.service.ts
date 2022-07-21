import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../../classes/diagram/arc';
import { Element } from '../../classes/diagram/element';
import { Run } from '../../classes/diagram/run';
import { Coordinates } from '../../components/canvas/canvas.component';
import { registerSvg } from './register-svg.fn';
import {
    breakpointPositionAttribute,
    breakpointTrail,
    circleSize,
    fromTransitionAttribute,
    layerPosYAttibute,
    toTransitionAttribute,
    transitionSize,
} from './svg-constants';

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    public createSvgElements(run: Run): Array<SVGElement> {
        const result: Array<SVGElement> = [];
        const offset = run.offset ?? { x: 0, y: 0 };
        run.elements.forEach((el) => {
            result.push(...createSvgForElement(el, offset));
        });

        run.arcs.forEach((arc) => {
            const source = run.elements.find((el) => el.label === arc.source);
            const target = run.elements.find((el) => el.label === arc.target);

            const arrow = createSvgForArc(arc, source, target, offset);
            if (arrow) {
                arrow.forEach((a) => {
                    result.push(a);
                });
            }
        });

        return result;
    }
}

function createSvgForElement(
    element: Element,
    offset: Coordinates
): SVGElement[] {
    const svg = createSvgElement('rect');
    const x = (element.x ?? 0) + offset.x;
    const y = (element.y ?? 0) + offset.y;
    svg.setAttribute('x', `${x}`);
    svg.setAttribute('y', `${y}`);
    svg.setAttribute('width', `${transitionSize}`);
    svg.setAttribute('height', `${transitionSize}`);
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');
    svg.setAttribute(layerPosYAttibute, `${element.layerPos ?? 0}`);

    const text = createSvgElement('text');
    text.textContent = element.label;
    text.setAttribute('x', `${x + transitionSize / 2}`);
    text.setAttribute('y', `${y + transitionSize * 1.5}`);

    registerSvg(svg);

    return [svg, text];
}

function createSvgElement(name: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createSvgForArc(
    arc: Arc,
    source: Element | undefined,
    target: Element | undefined,
    offset: Coordinates
): SVGElement[] {
    const elements: SVGElement[] = [];

    if (!source || !target) {
        return elements;
    }

    if (arc.breakpoints.length == 0) {
        elements.push(
            createLine(
                (source.x ?? 0) + transitionSize + offset.x,
                (source.y ?? 0) + transitionSize / 2 + offset.y,
                (target.x ?? 0) + offset.x,
                (target.y ?? 0) + transitionSize / 2 + offset.y,
                true
            )
        );
    } else {
        //source -> first breakpoint
        elements.push(
            createLine(
                (source.x ?? 0) + transitionSize + offset.x,
                (source.y ?? 0) + transitionSize / 2 + offset.y,
                arc.breakpoints[0].x + transitionSize / 2 + offset.x,
                arc.breakpoints[0].y + transitionSize / 2 + offset.y,
                false
            )
        );
        //breakpoint -> next breakpoint
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createLine(
                    arc.breakpoints[i].x + transitionSize / 2 + offset.x,
                    arc.breakpoints[i].y + transitionSize / 2 + offset.y,
                    arc.breakpoints[i + 1].x + transitionSize / 2 + offset.x,
                    arc.breakpoints[i + 1].y + transitionSize / 2 + offset.y,
                    false
                )
            );
        }
        //last breakpoint -> target
        elements.push(
            createLine(
                arc.breakpoints[arc.breakpoints.length - 1].x +
                    transitionSize / 2 +
                    offset.x,
                arc.breakpoints[arc.breakpoints.length - 1].y +
                    transitionSize / 2 +
                    offset.y,
                (target.x ?? 0) + offset.x,
                (target.y ?? 0) + 25 + offset.y,
                true
            )
        );
        elements.push(
            createCircle(arc.breakpoints, 0, source.label, target.label, offset)
        );
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createCircle(
                    arc.breakpoints,
                    i + 1,
                    source.label,
                    target.label,
                    offset
                )
            );
        }
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

function createCircle(
    breakpoints: Array<Breakpoint>,
    positionInRun: number,
    sourceLabel: string,
    targetLabel: string,
    offset: Coordinates
): SVGElement {
    const breakpoint = breakpoints[positionInRun];
    const x = breakpoint.x + transitionSize / 2 + offset.x;
    const y = breakpoint.y + transitionSize / 2 + offset.y;
    const circle = createSvgElement('circle');
    circle.setAttribute('r', `${circleSize}`);
    circle.setAttribute('cx', `${x}`);
    circle.setAttribute('cy', `${y}`);
    circle.setAttribute('class', `move-helper`);
    circle.setAttribute(layerPosYAttibute, `${breakpoint.layerPos}` ?? '');
    circle.setAttribute(breakpointPositionAttribute, `${positionInRun}` ?? '');
    circle.setAttribute(fromTransitionAttribute, sourceLabel);
    circle.setAttribute(toTransitionAttribute, targetLabel);
    let trail = '';
    for (let i = 0; i < breakpoints.length; i++) {
        trail += i.toString() + ':' + breakpoints[i].layerPos?.toString() ?? '';
        if (i < breakpoints.length - 1) {
            trail += ',';
        }
    }
    circle.setAttribute(breakpointTrail, trail);
    return circle;
}
