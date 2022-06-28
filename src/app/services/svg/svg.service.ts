import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../../classes/diagram/arc';
import { Element } from '../../classes/diagram/element';
import { Run } from '../../classes/diagram/run';
import { ColorService } from '../color.service';
import { DisplayService } from '../display.service';
import { registerSvg } from './register-svg.fn';

let highlightColor: string;

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    constructor(
        public displayService: DisplayService,
        private _colorService: ColorService
    ) {
        highlightColor = this._colorService.getHighlightColor();
    }

    public createSvgElements(run: Run, merge: boolean): Array<SVGElement> {
        const result: Array<SVGElement> = [];

        run.elements.forEach((el) => {
            let currentRun = false;
            this.displayService.currentRun$.subscribe((run) => {
                run.elements.forEach((element) => {
                    if (element.label == el.label) {
                        currentRun = true;
                        return;
                    }
                });
            });
            result.push(...createSvgForElement(el, currentRun && merge));
        });

        run.arcs.forEach((arc) => {
            const source = run.elements.find((el) => el.label === arc.source);
            const target = run.elements.find((el) => el.label === arc.target);
            let currentRun = false;
            this.displayService.currentRun$.subscribe((run) => {
                run.arcs.forEach((currentArc) => {
                    if (
                        currentArc.source == arc.source &&
                        currentArc.target == arc.target
                    ) {
                        currentRun = true;
                        return;
                    }
                });
            });

            const arrow = createSvgForArc(
                arc,
                source,
                target,
                currentRun && merge
            );
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
    hightlight: boolean
): SVGElement[] {
    const svg = createSvgElement('rect');

    svg.setAttribute('x', `${element.x ?? 0}`);
    svg.setAttribute('y', `${element.y ?? 0}`);
    svg.setAttribute('width', '50');
    svg.setAttribute('height', '50');
    svg.setAttribute('stroke', 'black');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('fill-opacity', '0');

    const text = createSvgElement('text');
    text.textContent = element.label;
    text.setAttribute('x', `${(element.x ?? 0) + 25}`);
    text.setAttribute('y', `${(element.y ?? 0) + 75}`);
    if (hightlight) {
        svg.setAttribute('stroke', highlightColor);
        text.setAttribute('fill', highlightColor);
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
    hightlight: boolean
): SVGElement[] {
    const elements: SVGElement[] = [];

    if (!source || !target) {
        return elements;
    }

    if (arc.breakpoints.length == 0) {
        elements.push(
            createLine(
                (source.x ?? 0) + 50,
                (source.y ?? 0) + 25,
                target.x ?? 0,
                (target.y ?? 0) + 25,
                true,
                hightlight
            )
        );
    } else {
        //source -> first breakpoint
        elements.push(
            createLine(
                (source.x ?? 0) + 50,
                (source.y ?? 0) + 25,
                arc.breakpoints[0].x + 25,
                arc.breakpoints[0].y + 25,
                false,
                hightlight
            )
        );
        //breakpoint -> next breakpoint
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(
                createLine(
                    arc.breakpoints[i].x + 25,
                    arc.breakpoints[i].y + 25,
                    arc.breakpoints[i + 1].x + 25,
                    arc.breakpoints[i + 1].y + 25,
                    false,
                    hightlight
                )
            );
        }
        //last breakpoint -> target
        elements.push(
            createLine(
                arc.breakpoints[arc.breakpoints.length - 1].x + 25,
                arc.breakpoints[arc.breakpoints.length - 1].y + 25,
                target.x ?? 0,
                (target.y ?? 0) + 25,
                true,
                hightlight
            )
        );
        elements.push(createCircle(arc.breakpoints[0]));
        for (let i = 0; i < arc.breakpoints.length - 1; i++) {
            elements.push(createCircle(arc.breakpoints[i + 1]));
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
    if (hightlight) {
        if (showArrow)
            line.setAttribute('marker-end', 'url(#arrowheadhightlight )');
    } else {
        if (showArrow) line.setAttribute('marker-end', 'url(#arrowhead)');
    }
    line.setAttribute('x1', `${x1}`);
    line.setAttribute('y1', `${y1}`);
    line.setAttribute('x2', `${x2}`);
    line.setAttribute('y2', `${y2}`);

    return line;
}

function createCircle(breakpoint: Breakpoint): SVGElement {
    const x = breakpoint.x + 25;
    const y = breakpoint.y + 25;
    const circle = createSvgElement('circle');
    circle.setAttribute('r', `10`);
    circle.setAttribute('cx', `${x}`);
    circle.setAttribute('cy', `${y}`);
    circle.setAttribute('class', `move-helper`);
    return circle;
}
