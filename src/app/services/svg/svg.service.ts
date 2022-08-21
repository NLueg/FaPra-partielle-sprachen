import { Injectable } from '@angular/core';

import {
    Arc,
    Breakpoint,
    doesArcBelongToCurrentRun,
} from '../../classes/diagram/arc';
import { Coordinates } from '../../classes/diagram/coordinates';
import {
    doesElementBelongToCurrentRun,
    Element,
} from '../../classes/diagram/element';
import { getIntersection } from '../../classes/diagram/functions/display.fn';
import { Run } from '../../classes/diagram/run';
import { ColorService } from '../color.service';
import {
    breakpointPositionAttribute,
    breakpointTrail,
    circleSize,
    eventId,
    fromTransitionAttribute,
    layerPosYAttibute,
    toTransitionAttribute,
    transitionSize,
} from './svg-constants';

let highlightColor: string;

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    constructor(private _colorService: ColorService) {
        _colorService.getHighlightColor().subscribe((color) => {
            highlightColor = color;
        });
    }

    public createSvgElements(run: Run, merge: boolean): Array<SVGElement> {
        const result: Array<SVGElement> = [];
        const offset = run.offset ?? { x: 0, y: 0 };

        run.elements.forEach((el) => {
            result.push(...createSvgForElement(el, merge, offset));
        });
        run.arcs.forEach((arc) => {
            const source = run.elements.find((el) => el.id === arc.source);
            const target = run.elements.find((el) => el.id === arc.target);
            const arrow = createSvgForArc(arc, source, target, merge, offset);
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
    hightlight: boolean,
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
    svg.setAttribute(eventId, `${element.id}`);

    const text = createSvgElement('foreignObject');
    text.setAttribute('x', `${x - (100 - transitionSize) / 2}`);
    text.setAttribute('y', `${y + transitionSize + 2}`);
    const height = 40;
    const width = 100;
    text.setAttribute('height', `${height}`);
    text.setAttribute('width', `${width}`);
    const span = document.createElement('span');
    span.setAttribute('title', element.label);
    span.textContent = element.label;
    text.append(span);

    if (doesElementBelongToCurrentRun(element) && hightlight) {
        svg.setAttribute('stroke', highlightColor);
        text.setAttribute('style', `color: ${highlightColor};`);
    }

    return [svg, text];
}

function createSvgElement(name: string): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}

function createSvgForArc(
    arc: Arc,
    source: Element | undefined,
    target: Element | undefined,
    hightlight: boolean,
    offset: Coordinates
): SVGElement[] {
    const elements: SVGElement[] = [];

    if (!source || !target) {
        return elements;
    }

    if (arc.breakpoints.length == 0) {
        const start = getIntersection(
            (source.x ?? 0) + transitionSize / 2,
            (source.y ?? 0) + transitionSize / 2,
            (target.x ?? 0) + transitionSize / 2,
            (target.y ?? 0) + transitionSize / 2,
            false
        );
        const end = getIntersection(
            (target.x ?? 0) + transitionSize / 2,
            (target.y ?? 0) + transitionSize / 2,
            (source.x ?? 0) + transitionSize / 2,
            (source.y ?? 0) + transitionSize / 2,
            true
        );
        elements.push(
            createLine(
                start.x + offset.x,
                start.y + offset.y,
                end.x + offset.x,
                end.y + offset.y,
                true,
                hightlight && doesArcBelongToCurrentRun(arc)
            )
        );
    } else {
        //source -> first breakpoint
        const start = getIntersection(
            (source.x ?? 0) + transitionSize / 2,
            (source.y ?? 0) + transitionSize / 2,
            arc.breakpoints[0].x + transitionSize / 2,
            arc.breakpoints[0].y + transitionSize / 2,
            false
        );
        elements.push(
            createLine(
                start.x + offset.x,
                start.y + offset.y,
                arc.breakpoints[0].x + transitionSize / 2 + offset.x,
                arc.breakpoints[0].y + transitionSize / 2 + offset.y,
                false,
                hightlight && doesArcBelongToCurrentRun(arc)
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
                    false,
                    hightlight && doesArcBelongToCurrentRun(arc)
                )
            );
        }
        //last breakpoint -> target
        const end = getIntersection(
            (target.x ?? 0) + transitionSize / 2,
            (target.y ?? 0) + transitionSize / 2,
            arc.breakpoints[arc.breakpoints.length - 1].x + transitionSize / 2,
            arc.breakpoints[arc.breakpoints.length - 1].y + transitionSize / 2,
            true
        );
        elements.push(
            createLine(
                arc.breakpoints[arc.breakpoints.length - 1].x +
                    transitionSize / 2 +
                    offset.x,
                arc.breakpoints[arc.breakpoints.length - 1].y +
                    transitionSize / 2 +
                    offset.y,
                end.x + offset.x,
                end.y + offset.y,
                true,
                hightlight && doesArcBelongToCurrentRun(arc)
            )
        );
        elements.push(
            createCircle(arc.breakpoints, 0, source.id, target.id, offset)
        );
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createCircle(
                    arc.breakpoints,
                    i + 1,
                    source.id,
                    target.id,
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
    showArrow: boolean,
    hightlight: boolean
): SVGElement {
    const line = createSvgElement('line');
    if (hightlight) {
        line.setAttribute('stroke', highlightColor);
    } else {
        line.setAttribute('stroke', 'black');
    }

    line.setAttribute('stroke-width', '1');
    if (hightlight && showArrow) {
        line.setAttribute('marker-end', 'url(#arrowheadhightlight )');
    } else if (showArrow) {
        line.setAttribute('marker-end', 'url(#arrowhead)');
    }
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
