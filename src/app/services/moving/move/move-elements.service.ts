import { Coordinates } from '../../../classes/diagram/coordinates';
import { Draggable } from '../../../classes/diagram/draggable';
import { getIntersection } from '../../../classes/diagram/functions/display.fn';
import {
    originalYAttribute,
    textOffset,
    eventSize,
    fromTransitionAttribute,
    eventIdAttribute, toTransitionAttribute
} from '../../svg/svg-constants';
import {
    asInt,
    getAttributePrefix,
    getYAttribute,
} from '../dragging-helper.fn';
import { FindElementsService } from '../find/find-elements.service';

export class MoveElementsService {
    public static moveElement(draggable: Draggable, newY: number): void {
        const transition = draggable.event;
        const attributePraefix = getAttributePrefix(transition);
        transition.setAttribute(attributePraefix + 'y', `${newY}`);

        const newYInfo = newY + eventSize + textOffset;
        draggable.infoElement?.setAttribute('y', `${newYInfo}`);

        let offsetIncoming = 0;
        if (transition.nodeName === 'rect') {
            offsetIncoming = eventSize / 2;
        }
        const newYForLines = newY + offsetIncoming;
        const coords = FindElementsService.createCoordsFromElement(transition);

        if (transition.nodeName === 'rect') {
            for (let i = 0; i < draggable.incomingArcs.length; i++) {
                const c = getIntersection(
                    coords.x + eventSize / 2,
                    coords.y + eventSize / 2,
                    asInt(draggable.incomingArcs[i], 'x1'),
                    asInt(draggable.incomingArcs[i], 'y1'),
                    true
                );
                const arc = draggable.incomingArcs[i];
                arc.setAttribute('y2', `${c.y}`);
                arc.setAttribute('x2', `${c.x}`);
                MoveElementsService.rearrangeArcsForPredecessor(arc);
            }
            for (let j = 0; j < draggable.outgoingArcs.length; j++) {
                const c = getIntersection(
                    coords.x + eventSize / 2,
                    coords.y + eventSize / 2,
                    asInt(draggable.outgoingArcs[j], 'x2'),
                    asInt(draggable.outgoingArcs[j], 'y2'),
                    false
                );
                const arc = draggable.outgoingArcs[j];
                arc.setAttribute('y1', `${c.y}`);
                arc.setAttribute('x1', `${c.x}`);
                MoveElementsService.rearrangeArcsForSuccessor(arc);
            }
        } else {
            for (let i = 0; i < draggable.incomingArcs.length; i++) {
                draggable.incomingArcs[i].setAttribute('y2', `${newYForLines}`);
            }
            for (let j = 0; j < draggable.outgoingArcs.length; j++) {
                draggable.outgoingArcs[j].setAttribute('y1', `${newYForLines}`);
            }
        }
    }

    private static rearrangeArcsForPredecessor(arc: Element) {
        if (arc.getAttribute(fromTransitionAttribute)) {
            const selector = '[' + eventIdAttribute + '="' + arc.getAttribute(fromTransitionAttribute) + '"]';
            const coords = FindElementsService.createCoordsFromElement(document.querySelector(selector) as HTMLElement);
            const c = getIntersection(
                coords.x + eventSize / 2,
                coords.y + eventSize / 2,
                asInt(arc, 'x2'),
                asInt(arc, 'y2'),
                false
            );
            arc.setAttribute('y1', `${c.y}`);
            arc.setAttribute('x1', `${c.x}`);
        }
    }

    private static rearrangeArcsForSuccessor(arc: Element) {
        if (arc.getAttribute(toTransitionAttribute)) {
            const selector = '[' + eventIdAttribute + '="' + arc.getAttribute(toTransitionAttribute) + '"]';
            const coords = FindElementsService.createCoordsFromElement(document.querySelector(selector) as HTMLElement);
            const c = getIntersection(
                coords.x + eventSize / 2,
                coords.y + eventSize / 2,
                asInt(arc, 'x1'),
                asInt(arc, 'y1'),
                true
            );
            arc.setAttribute('x2', `${c.x}`);
            arc.setAttribute('y2', `${c.y}`);
        }
    }

    static resetPositionForDraggable(e: Draggable): void {
        const transition = e.event;
        const newY = asInt(transition, originalYAttribute);
        if (newY > 0) {
            MoveElementsService.moveElement(e, newY);
        }
    }

    static getMoveDirection(movedElement: HTMLElement): string {
        const originalY = asInt(movedElement, originalYAttribute);
        const yAttribute = getYAttribute(movedElement);
        const currentY = asInt(movedElement, yAttribute);
        if (originalY === 0 || originalY === currentY) {
            return '';
        }
        return originalY > currentY ? 'up' : 'down';
    }

    static calculateOffset(
        movingElement: HTMLElement,
        activeNeighbour: Draggable,
        direction: string
    ): number {
        const movingNode = movingElement.nodeName;
        const passedNode = activeNeighbour.event.nodeName;
        if (passedNode === 'circle') {
            if (movingNode === 'circle') {
                return 0;
            }
            if (movingNode === 'rect') {
                if (direction === 'up') {
                    return eventSize / 2;
                }
                return -eventSize / 2;
            }
        }
        if (passedNode === 'rect') {
            if (movingNode === 'circle') {
                if (direction === 'up') {
                    return eventSize / 2;
                }
                return -eventSize / 2;
            }
            if (movingNode === 'rect') {
                return 0;
            }
        }
        return 0;
    }

    public static moveRun(drawingArea: SVGElement, changes: Coordinates): void {
        Array.from(drawingArea.children).forEach((e) => {
            const x = changes.x;
            const y = changes.y;
            if (
                e.nodeName === 'rect' ||
                e.nodeName === 'text' ||
                e.nodeName === 'foreignObject'
            ) {
                const currentX = +asInt(e, 'x') + +x;
                const currentY = +asInt(e, 'y') + +y;
                e.setAttribute('x', `${currentX}`);
                e.setAttribute('y', `${currentY}`);
                e.removeAttribute(originalYAttribute);
            }
            if (e.nodeName === 'line') {
                const currentX1 = +asInt(e, 'x1') + +x;
                const currentY1 = +asInt(e, 'y1') + +y;
                const currentX2 = +asInt(e, 'x2') + +x;
                const currentY2 = +asInt(e, 'y2') + +y;
                e.setAttribute('x1', `${currentX1}`);
                e.setAttribute('y1', `${currentY1}`);
                e.setAttribute('x2', `${currentX2}`);
                e.setAttribute('y2', `${currentY2}`);
            }
            if (e.nodeName === 'circle') {
                const newX = +asInt(e, 'cx') + +x;
                const newY = +asInt(e, 'cy') + +y;
                e.setAttribute('cx', `${newX}`);
                e.setAttribute('cy', `${newY}`);
                e.removeAttribute(originalYAttribute);
            }
        });
    }

    public static switchElements(
        movingElement: Draggable,
        passedElement: Draggable
    ): void {
        const movingElementNode = movingElement.event;
        const passedElementNode = passedElement.event;
        const nodeTypeOfMovingElement = movingElementNode.nodeName;
        const nodeTypeOfPassedElement = passedElementNode.nodeName;
        let newYMoving;
        let newYPassed;
        if (nodeTypeOfMovingElement === 'rect') {
            if (nodeTypeOfPassedElement === 'circle') {
                newYMoving =
                    asInt(passedElementNode, 'cy') - eventSize / 2;
                newYPassed =
                    asInt(movingElementNode, originalYAttribute) +
                    eventSize / 2;
            } else {
                newYMoving = asInt(passedElementNode, 'y');
                newYPassed = asInt(movingElementNode, originalYAttribute);
            }
        } else {
            if (nodeTypeOfPassedElement === 'circle') {
                newYPassed = asInt(movingElementNode, originalYAttribute);
                newYMoving = asInt(passedElementNode, 'cy');
            } else {
                newYPassed =
                    asInt(movingElementNode, originalYAttribute) -
                    eventSize / 2;
                newYMoving = asInt(passedElementNode, 'y') + eventSize / 2;
            }
        }
        MoveElementsService.moveElement(movingElement, newYMoving);
        MoveElementsService.moveElement(passedElement, newYPassed);
    }
}
