import { ElementRef, Injectable } from '@angular/core';

import { transitionSize } from '../svg/svg-constants';
import {
    asInt,
    createCoordsFromElement,
    getXAttribute,
    getYAttribute,
} from './dragging-helper.fn';

@Injectable({
    providedIn: 'root',
})
export class DraggingService {
    private drawingArea?: ElementRef<SVGElement> | null;

    public setDrawingArea(drawingArea?: ElementRef<SVGElement>): void {
        this.drawingArea = drawingArea;
    }

    private getElementFromCanvas(selector: string): HTMLElement {
        return this.drawingArea?.nativeElement.querySelector(
            selector
        ) as HTMLElement;
    }

    private getAllElementsFromCanvas(selector: string): NodeListOf<Element> {
        return this.drawingArea?.nativeElement.querySelectorAll(
            selector
        ) as NodeListOf<Element>;
    }

    public findElementsInYAxis(element: HTMLElement): NodeListOf<Element> {
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
        return this.getAllElementsFromCanvas(
            circleSelector + ',' + rectSelector
        );
    }

    public findInfoElementForTransition(transition: HTMLElement): HTMLElement {
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
        return this.getElementFromCanvas(selector);
    }

    public findIncomingArcs(transition: HTMLElement): Array<HTMLElement> {
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
        const matchingNodes = this.getAllElementsFromCanvas(
            selectorForIncomingLines
        );
        const incomingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            incomingLines.push(matchingNodes[i] as HTMLElement);
        }
        return incomingLines;
    }

    public findOutgoingArcs(transition: HTMLElement): Array<HTMLElement> {
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
        const matchingNodes = this.getAllElementsFromCanvas(
            selectorForOutgoingLines
        );
        const outgoingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            outgoingLines.push(matchingNodes[i] as HTMLElement);
        }
        return outgoingLines;
    }
}
