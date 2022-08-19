import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../../classes/diagram/arc';
import { Coordinates } from '../../classes/diagram/coordinates';
import { Element } from '../../classes/diagram/element';
import { getIntersection } from '../../classes/diagram/functions/display.fn';
import { Run } from '../../classes/diagram/run';
import { ColorService } from '../color.service';
import { DisplayService } from '../display.service';
import {
    breakpointPositionAttribute,
    breakpointTrail,
    circleSize,
    eventIdAttribute,
    fromTransitionAttribute,
    layerPosYAttibute, textOffset,
    toTransitionAttribute,
    eventSize,
} from './svg-constants';

let highlightColor: string;
let currentRun: Run;

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    constructor(
        public displayService: DisplayService,
        private _colorService: ColorService
    ) {
        _colorService.getHighlightColor().subscribe((color) => {
            highlightColor = color;
        });
        displayService.currentRun$.subscribe((run) => {
            currentRun = run;
        });
    }

    public createSvgElements(run: Run, merge: boolean): Array<SVGElement> {
        const result: Array<SVGElement> = [];
        const offset = run.offset ?? { x: 0, y: 0 };
        let samePrefix = false;

        if (merge) {
            const elementWithNoIncomingArc: Array<Element> = [];
            currentRun.elements.forEach((el) => {
                if (el.incomingArcs.length == 0) {
                    elementWithNoIncomingArc.push(el);
                }
            });

            run.elements.forEach((el) => {
                elementWithNoIncomingArc.forEach((e) => {
                    if (el.incomingArcs.length == 0 && el.id == e.id) {
                        samePrefix = true;
                    }
                });
            });
        }

        if (merge && samePrefix) {
            run.elements.forEach((el) => {
                let isCurrentRun = false;
                currentRun.elements.forEach((element) => {
                    if (element.id == el.id) {
                        isCurrentRun = true;
                        return;
                    }
                });
                result.push(...createSvgForElement(el, isCurrentRun, offset));
            });
            run.arcs.forEach((arc) => {
                const source = run.elements.find((el) => el.id === arc.source);
                const target = run.elements.find((el) => el.id === arc.target);
                let isCurrentRun = false;
                currentRun.arcs.forEach((currentArc) => {
                    if (
                        currentArc.source == arc.source &&
                        currentArc.target == arc.target
                    ) {
                        isCurrentRun = true;
                        return;
                    }
                });

                const arrow = createSvgForArc(
                    arc,
                    source,
                    target,
                    isCurrentRun && merge && samePrefix,
                    offset
                );
                if (arrow) {
                    arrow.forEach((a) => {
                        result.push(a);
                    });
                }
            });
        } else {
            run.elements.forEach((el) => {
                result.push(...createSvgForElement(el, false, offset));
            });
            run.arcs.forEach((arc) => {
                const source = run.elements.find((el) => el.id === arc.source);
                const target = run.elements.find((el) => el.id === arc.target);
                const arrow = createSvgForArc(
                    arc,
                    source,
                    target,
                    false,
                    offset
                );
                if (arrow) {
                    arrow.forEach((a) => {
                        result.push(a);
                    });
                }
            });
        }
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
    svg.setAttribute('width', `${eventSize}`);
    svg.setAttribute('height', `${eventSize}`);
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');
    svg.setAttribute(layerPosYAttibute, `${element.layerPos ?? 0}`);
    svg.setAttribute(eventIdAttribute, `${element.id}`);

    const text = createSvgElement('text');
    text.setAttribute('x', `${x + eventSize / 2 - cropText(element.label).length*3.2}`);
    text.setAttribute('y', `${y + eventSize + textOffset}`);
    const height = 40;
    const width = 100;
    text.setAttribute('height', `${height}`);
    text.setAttribute('width', `${width}`);
    text.setAttribute('describes-event', element.id)
    text.innerHTML = '<title>' + element.label + '</title>' + cropText(element.label);
    if (hightlight) {
        svg.setAttribute('stroke', highlightColor);
        text.setAttribute('style', `color: ${highlightColor};`);
    }

    return [svg, text];
}

function cropText(text: string): string {
    if (text.length > 15) {
        return text.substring(0, 12) + "...";
    }
    return text;
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
            (source.x ?? 0) + eventSize / 2,
            (source.y ?? 0) + eventSize / 2,
            (target.x ?? 0) + eventSize / 2,
            (target.y ?? 0) + eventSize / 2,
            false
        );
        const end = getIntersection(
            (target.x ?? 0) + eventSize / 2,
            (target.y ?? 0) + eventSize / 2,
            (source.x ?? 0) + eventSize / 2,
            (source.y ?? 0) + eventSize / 2,
            true
        );
        elements.push(
            createLine(
                start.x + offset.x,
                start.y + offset.y,
                end.x + offset.x,
                end.y + offset.y,
                true,
                hightlight,
                arc
            )
        );
    } else {
        //source -> first breakpoint
        const start = getIntersection(
            (source.x ?? 0) + eventSize / 2,
            (source.y ?? 0) + eventSize / 2,
            arc.breakpoints[0].x + eventSize / 2,
            arc.breakpoints[0].y + eventSize / 2,
            false
        );
        elements.push(
            createLine(
                start.x + offset.x,
                start.y + offset.y,
                arc.breakpoints[0].x + eventSize / 2 + offset.x,
                arc.breakpoints[0].y + eventSize / 2 + offset.y,
                false,
                hightlight,
                arc
            )
        );
        //breakpoint -> next breakpoint
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createLine(
                    arc.breakpoints[i].x + eventSize / 2 + offset.x,
                    arc.breakpoints[i].y + eventSize / 2 + offset.y,
                    arc.breakpoints[i + 1].x + eventSize / 2 + offset.x,
                    arc.breakpoints[i + 1].y + eventSize / 2 + offset.y,
                    false,
                    hightlight,
                    arc
                )
            );
        }
        //last breakpoint -> target
        const end = getIntersection(
            (target.x ?? 0) + eventSize / 2,
            (target.y ?? 0) + eventSize / 2,
            arc.breakpoints[arc.breakpoints.length - 1].x + eventSize / 2,
            arc.breakpoints[arc.breakpoints.length - 1].y + eventSize / 2,
            true
        );
        elements.push(
            createLine(
                arc.breakpoints[arc.breakpoints.length - 1].x +
                eventSize / 2 +
                offset.x,
                arc.breakpoints[arc.breakpoints.length - 1].y +
                eventSize / 2 +
                offset.y,
                end.x + offset.x,
                end.y + offset.y,
                true,
                hightlight,
                arc
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
    hightlight: boolean,
    arc: Arc
): SVGElement {
    const line = createSvgElement('line');
    if (hightlight) {
        line.setAttribute('stroke', highlightColor);
    } else {
        line.setAttribute('stroke', 'black');
    }
    line.setAttribute('stroke-width', '1');
    if (arc.breakpoints.length === 0) {
        line.setAttribute(fromTransitionAttribute, arc.source);
        line.setAttribute(toTransitionAttribute, arc.target);
    }
    if (showArrow) {
        if (hightlight) {
            line.setAttribute('marker-end', 'url(#arrowheadhightlight )');
        } else {
            line.setAttribute('marker-end', 'url(#arrowhead)');
        }
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
    const x = breakpoint.x + eventSize / 2 + offset.x;
    const y = breakpoint.y + eventSize / 2 + offset.y;
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
