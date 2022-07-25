import { ElementRef } from '@angular/core';

import { Coordinates } from '../../classes/diagram/coordinates';
import { Draggable } from '../../components/canvas/canvas.component';
import { originalYAttribute, transitionSize } from '../svg/svg-constants';

export function asInt(elem: Element, attribute: string): number {
    return parseInt(elem.getAttribute(attribute) ?? '0');
}

export function getYAttribute(element: HTMLElement): string {
    return element.nodeName === 'rect' ? 'y' : 'cy';
}

export function getXAttribute(element: HTMLElement): string {
    return element.nodeName === 'rect' ? 'x' : 'cx';
}

export function createCoordsFromElement(element: HTMLElement): Coordinates {
    return {
        x: asInt(element, getXAttribute(element)),
        y: asInt(element, getYAttribute(element)),
    };
}

export function getMoveDirection(movedElement: HTMLElement): string {
    const originalY = asInt(movedElement, originalYAttribute);
    const yAttribute = getYAttribute(movedElement);
    const currentY = asInt(movedElement, yAttribute);
    if (originalY === 0 || originalY === currentY) {
        return '';
    }
    return originalY > currentY ? 'up' : 'down';
}

export function getElementFromCanvas(
    selector: string,
    drawingArea?: ElementRef<SVGElement>
): HTMLElement {
    return drawingArea?.nativeElement.querySelector(selector) as HTMLElement;
}

export function getAllElementsFromCanvas(
    selector: string,
    drawingArea?: ElementRef<SVGElement>
): NodeListOf<Element> {
    return drawingArea?.nativeElement.querySelectorAll(
        selector
    ) as NodeListOf<Element>;
}

export function findElementsInYAxis(
    element: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
): NodeListOf<Element> {
    let relevantXCircle = 0;
    let relevantXRect = 0;
    if (element.nodeName === 'circle') {
        relevantXCircle = asInt(element, 'cx');
        relevantXRect = +relevantXCircle - transitionSize / 2;
    }
    if (element.nodeName === 'rect') {
        relevantXRect = asInt(element, 'x');
        relevantXCircle = relevantXRect + transitionSize / 2;
    }
    const rectSelector = 'rect[x="' + relevantXRect + '"]';
    const circleSelector = 'circle[cx="' + relevantXCircle + '"]';
    return getAllElementsFromCanvas(
        circleSelector + ',' + rectSelector,
        drawingArea
    );
}

export function findInfoElementForTransition(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
): HTMLElement {
    const x = asInt(transition, getXAttribute(transition));
    const y = asInt(transition, getYAttribute(transition));
    const currentXForInfolement = +x + +transitionSize / 2;
    const currentYInfoElement = +y + transitionSize * 1.5;
    const selector =
        'text[y="' +
        currentYInfoElement +
        '"][x="' +
        currentXForInfolement +
        '"]';
    return getElementFromCanvas(selector, drawingArea);
}

export function findIncomingArcs(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
): Array<HTMLElement> {
    const coords = createCoordsFromElement(transition);
    let offsetIncoming = 0;
    if (transition.nodeName === 'rect') {
        offsetIncoming = transitionSize / 2;
    }
    const currentXForIncomingLines = coords.x;
    const currentYForLines = coords.y + offsetIncoming;
    const selectorForIncomingLines =
        'line[y2="' +
        currentYForLines +
        '"][x2="' +
        currentXForIncomingLines +
        '"]';
    const matchingNodes = getAllElementsFromCanvas(
        selectorForIncomingLines,
        drawingArea
    );
    const incomingLines = [];
    for (let i = 0; i < matchingNodes.length; i++) {
        incomingLines.push(matchingNodes[i] as HTMLElement);
    }
    return incomingLines;
}

export function findOutgoingArcs(
    transition: HTMLElement,
    drawingArea?: ElementRef<SVGElement>
): Array<HTMLElement> {
    const coords = createCoordsFromElement(transition);
    let offsetXOutgoing = 0;
    let offsetYOutgoing = 0;
    if (transition.nodeName === 'rect') {
        offsetXOutgoing = transitionSize;
        offsetYOutgoing = transitionSize / 2;
    }
    const currentXForOutgoingLines = coords.x + offsetXOutgoing;
    const currentYForLines = coords.y + offsetYOutgoing;
    const selectorForOutgoingLines =
        'line[y1="' +
        currentYForLines +
        '"][x1="' +
        currentXForOutgoingLines +
        '"]';
    const matchingNodes = getAllElementsFromCanvas(
        selectorForOutgoingLines,
        drawingArea
    );
    const outgoingLines = [];
    for (let i = 0; i < matchingNodes.length; i++) {
        outgoingLines.push(matchingNodes[i] as HTMLElement);
    }
    return outgoingLines;
}

export function getAttributePraefix(e: HTMLElement): string {
    if (e.nodeName === 'circle') {
        return 'c';
    }
    return '';
}

export function moveElement(draggable: Draggable, newY: number): void {
    const transition = draggable.transition;
    const attributePraefix = getAttributePraefix(transition);
    transition.setAttribute(attributePraefix + 'y', `${newY}`);
    const newYInfo = newY + transitionSize * 1.5;
    draggable.infoElement?.setAttribute('y', `${newYInfo}`);
    let offsetIncoming = 0;
    if (transition.nodeName === 'rect') {
        offsetIncoming = transitionSize / 2;
    }
    const newYForLines = newY + offsetIncoming;

    for (let i = 0; i < draggable.incomingArcs.length; i++) {
        draggable.incomingArcs[i].setAttribute('y2', `${newYForLines}`);
    }
    for (let j = 0; j < draggable.outgoingArcs.length; j++) {
        draggable.outgoingArcs[j].setAttribute('y1', `${newYForLines}`);
    }
}
