import { ElementRef } from '@angular/core';

import { Coordinates } from '../../../classes/diagram/coordinates';
import { Draggable } from '../../../classes/diagram/draggable';
import { transitionSize } from '../../svg/svg-constants';
import { asInt, getXAttribute, getYAttribute } from '../dragging-helper.fn';
import { FindElementsService } from '../find/find-elements.service';

export class DraggingCreationService {
    public static createDraggableFromElement(
        element: HTMLElement,
        drawingArea: ElementRef<SVGElement> | undefined
    ): Draggable | null {
        if (
            !drawingArea ||
            (element.nodeName !== 'rect' && element.nodeName !== 'circle')
        ) {
            return null;
        }
        const draggable = {
            transition: element,
        } as Draggable;
        draggable.infoElement =
            DraggingCreationService.findInfoElementForTransition(
                element,
                drawingArea
            );
        draggable.incomingArcs = DraggingCreationService.findIncomingArcs(
            element,
            drawingArea
        );
        draggable.outgoingArcs = DraggingCreationService.findOutgoingArcs(
            element,
            drawingArea
        );
        return draggable;
    }

    static findInfoElementForTransition(
        transition: HTMLElement,
        drawingArea: ElementRef<SVGElement>
    ): HTMLElement {
        const x = asInt(transition, getXAttribute(transition));
        const y = asInt(transition, getYAttribute(transition));
        const currentXForInfolement = x - (100 - transitionSize) / 2;
        const currentYInfoElement = y + transitionSize + 2;
        const selector =
            'foreignObject[y="' +
            currentYInfoElement +
            '"][x="' +
            currentXForInfolement +
            '"]';
        return FindElementsService.getElementFromCanvas(selector, drawingArea);
    }

    private static createCoordsFromElement(element: HTMLElement): Coordinates {
        return {
            x: asInt(element, getXAttribute(element)),
            y: asInt(element, getYAttribute(element)),
        };
    }

    private static findIncomingArcs(
        transition: HTMLElement,
        drawingArea?: ElementRef<SVGElement>
    ): Array<HTMLElement> {
        const coords =
            DraggingCreationService.createCoordsFromElement(transition);
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
        const matchingNodes = FindElementsService.getAllElementsFromCanvas(
            selectorForIncomingLines,
            drawingArea
        );
        const incomingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            incomingLines.push(matchingNodes[i] as HTMLElement);
        }
        return incomingLines;
    }

    private static findOutgoingArcs(
        transition: HTMLElement,
        drawingArea?: ElementRef<SVGElement>
    ): Array<HTMLElement> {
        const coords = FindElementsService.createCoordsFromElement(transition);
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
        const matchingNodes = FindElementsService.getAllElementsFromCanvas(
            selectorForOutgoingLines,
            drawingArea
        );
        const outgoingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            outgoingLines.push(matchingNodes[i] as HTMLElement);
        }
        return outgoingLines;
    }
}
