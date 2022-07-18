import {
    Component,
    ElementRef,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
    ViewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';

import { ColorService } from '../../services/color.service';
import { DisplayService } from '../../services/display.service';
import { SvgService } from '../../services/svg/svg.service';
import {
    originalYAttribute,
    transitionSize,
} from '../../services/svg/svg-constants';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnChanges, OnInit, OnDestroy {
    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    @Input()
    svgElements: SVGElement[] = [];

    @Input()
    canvasHeight = 400;

    @Input()
    persistCoordinates = true;

    private _mouseMove: boolean;
    private _childElementInFocus: boolean;
    private _runMoved: boolean;
    private _globalChanges: Coordinates = { x: 0, y: 0 };
    private _localChanges: Coordinates = { x: 0, y: 0 };
    private _movedChildElement?: Draggable;
    private _activeNeighbourElement?: Draggable;
    highlightColor: string | undefined;
    private _sub: Subscription | undefined;

    constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _colorService: ColorService
    ) {
        this._mouseMove = false;
        this._childElementInFocus = false;
        this._runMoved = false;
    }

    ngOnInit(): void {
        this._sub = this._colorService
            .getHighlightColor()
            .subscribe((color) => {
                this.highlightColor = color;
            });
    }

    ngOnDestroy(): void {
        this._sub?.unsubscribe();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['svgElements'] && this.drawingArea) {
            this.clearDrawingArea();

            for (const element of this.svgElements) {
                this.drawingArea.nativeElement.appendChild(element);
            }
            this.registerCanvasMouseHandler(this.drawingArea.nativeElement);
            this.registerSingleMouseHandler(this.drawingArea.nativeElement);
        }
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 1 /* keep arrowhead marker */) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }

        drawingArea.style.height = `${this.canvasHeight}px`;
    }

    private registerCanvasMouseHandler(drawingArea: SVGElement) {
        drawingArea.onmousedown = (e) => {
            this._mouseMove = true;
            this._globalChanges = {
                x: e.offsetX,
                y: e.offsetY,
            };
        };
        drawingArea.onmousemove = (e) => {
            this.updateChangeState(e);
            if (this._movedChildElement && !this._childElementInFocus) {
                this.moveDraggable(this._movedChildElement);
            }
            if (
                this._mouseMove &&
                !this._childElementInFocus &&
                !this._movedChildElement
            ) {
                this.moveRun(drawingArea);
            }
        };
        drawingArea.onmouseup = () => {
            this.persistAllCoordinates();
            this.resetCanvasHandlers();
        };
        drawingArea.onmouseleave = () => {
            this.resetCanvasHandlers();
        };
    }

    private resetCanvasHandlers() {
        if (this._movedChildElement !== undefined) {
            this.resetDraggable(this._movedChildElement);
        }
        this.resetGlobalHandlers();
    }

    private resetGlobalHandlers() {
        this._childElementInFocus = false;
        this._mouseMove = false;
        this._movedChildElement = undefined;
        this._activeNeighbourElement = undefined;
        this._runMoved = false;
    }

    private persistAllCoordinates() {
        if (this._runMoved) {
            const transitions =
                this.drawingArea?.nativeElement.querySelectorAll('rect') ?? [];
            const transitionElements = [];
            for (let i = 0; i < transitions.length; i++) {
                const transition = transitions[i] as unknown as HTMLElement;
                transitionElements.push(transition);
            }
            this.persistCoords(transitionElements);
        }
    }

    private moveRun(drawingArea: SVGElement) {
        Array.from(drawingArea.children).forEach((e) => {
            const x = this._localChanges.x;
            const y = this._localChanges.y;
            if (x !== 0 || y !== 0) {
                this._runMoved = true;
            }
            if (e.nodeName === 'rect' || e.nodeName === 'text') {
                const currentX = +this.asInt(e, 'x') + +x;
                const currentY = +this.asInt(e, 'y') + +y;
                e.setAttribute('x', `${currentX}`);
                e.setAttribute('y', `${currentY}`);
                e.removeAttribute(originalYAttribute);
            }
            if (e.nodeName === 'line') {
                const currentX1 = +this.asInt(e, 'x1') + +x;
                const currentY1 = +this.asInt(e, 'y1') + +y;
                const currentX2 = +this.asInt(e, 'x2') + +x;
                const currentY2 = +this.asInt(e, 'y2') + +y;
                e.setAttribute('x1', `${currentX1}`);
                e.setAttribute('y1', `${currentY1}`);
                e.setAttribute('x2', `${currentX2}`);
                e.setAttribute('y2', `${currentY2}`);
            }
            if (e.nodeName === 'circle') {
                const newX = +this.asInt(e, 'cx') + +x;
                const newY = +this.asInt(e, 'cy') + +y;
                e.setAttribute('cx', `${newX}`);
                e.setAttribute('cy', `${newY}`);
                e.removeAttribute(originalYAttribute);
            }
        });
    }

    private registerSingleMouseHandler(drawingArea: SVGElement) {
        for (let i = 0; i < drawingArea.children.length; i++) {
            const e = drawingArea.children[i] as HTMLElement;
            if (e.nodeName === 'rect' || e.nodeName === 'circle') {
                this.registerMouseHandlerForDraggable(
                    this.createDraggableFromElement(e)
                );
            }
        }
    }

    private registerMouseHandlerForDraggable(element: Draggable | null) {
        if (element === null) {
            return;
        }
        element.transition.onmousedown = (e) => {
            this.initMouseDownForDraggable(e);
        };
        element.transition.onmousemove = (e) => {
            if (this._childElementInFocus) {
                this.updateChangeState(e);
                if (this._movedChildElement === undefined) {
                    this._movedChildElement = element;
                }
                this.moveDraggable(this._movedChildElement);
            }
        };
        element.transition.onmouseleave = () => {
            this._childElementInFocus = false;
            this._activeNeighbourElement = undefined;
        };
        element.transition.onmouseup = (e) => {
            if (this._movedChildElement !== undefined) {
                this.resetDraggable(this._movedChildElement);
            }
            this.resetGlobalHandlers();
            this.updateChangeState(e);
        };
    }

    private moveDraggable(draggable: Draggable) {
        if (this._activeNeighbourElement === undefined) {
            this.findActiveNeighbourElement(draggable);
        }
        const transition = draggable.transition;
        const y = this._localChanges.y;
        const currentCoords = this.createCoordsFromElement(transition);
        const currentY = currentCoords.y;
        const newY = currentY + y;
        const originalY = this.asInt(transition, originalYAttribute);
        if (originalY === 0) {
            transition.setAttribute(originalYAttribute, `${currentY}`);
        }
        if (this.checkForPassedElement(transition)) {
            this.handlePassedElement(draggable);
        } else {
            this.moveElement(draggable, newY);
        }
    }

    private moveElement(draggable: Draggable, newY: number) {
        const transition = draggable.transition;
        const attributePraefix = this.getAttributePraefix(transition);
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

    private handlePassedElement(draggable: Draggable) {
        const passedElement = this._activeNeighbourElement
            ?.transition as HTMLElement;
        const movingElement = draggable.transition;
        if (passedElement === undefined) {
            return;
        }
        const nodeTypeOfMovingElement = movingElement.nodeName;
        const nodeTypeOfPassedElement = passedElement.nodeName;
        let newYMoving;
        let newYPassed;
        if (nodeTypeOfMovingElement === 'rect') {
            if (nodeTypeOfPassedElement === 'circle') {
                newYMoving =
                    this.asInt(passedElement, 'cy') - transitionSize / 2;
                newYPassed =
                    this.asInt(movingElement, originalYAttribute) +
                    transitionSize / 2;
            } else {
                newYMoving = this.asInt(passedElement, 'y');
                newYPassed = this.asInt(movingElement, originalYAttribute);
            }
        } else {
            if (nodeTypeOfPassedElement === 'circle') {
                newYPassed = this.asInt(movingElement, originalYAttribute);
                newYMoving = this.asInt(passedElement, 'cy');
            } else {
                newYPassed =
                    this.asInt(movingElement, originalYAttribute) -
                    transitionSize / 2;
                newYMoving =
                    this.asInt(passedElement, 'y') + transitionSize / 2;
            }
        }
        this.moveElement(
            this.createDraggableFromElement(passedElement) as Draggable,
            newYPassed
        );
        this.moveElement(draggable, newYMoving);
        if (this.persistCoordinates) {
            this.persistCoords([passedElement, movingElement]);
        }
        movingElement.removeAttribute(originalYAttribute);
        passedElement.removeAttribute(originalYAttribute);
        this.resetCanvasHandlers();
    }

    private getAttributePraefix(e: HTMLElement): string {
        if (e.nodeName === 'circle') {
            return 'c';
        }
        return '';
    }

    private checkForPassedElement(movingElement: HTMLElement): boolean {
        if (this._activeNeighbourElement === undefined) {
            return false;
        }
        const yMoving = this.asInt(
            movingElement,
            this.getYAttribute(movingElement)
        );
        const yPassed = this.asInt(
            this._activeNeighbourElement.transition,
            this.getYAttribute(this._activeNeighbourElement.transition)
        );
        const direction = this.getMoveDirection(movingElement);
        if (!direction) {
            return false;
        }
        const offset = this.calculateOffset(movingElement, direction);
        if (direction === 'up') {
            return yMoving < yPassed + offset + transitionSize / 2;
        }
        return yMoving > yPassed + offset - transitionSize / 2;
    }

    private calculateOffset(
        movingElement: HTMLElement,
        direction: string
    ): number {
        const movingNode = movingElement.nodeName;
        const passedNode = this._activeNeighbourElement?.transition.nodeName;
        if (passedNode === 'circle') {
            if (movingNode === 'circle') {
                return 0;
            }
            if (movingNode === 'rect') {
                if (direction === 'up') {
                    return transitionSize / 2;
                }
                return -transitionSize / 2;
            }
        }
        if (passedNode === 'rect') {
            if (movingNode === 'circle') {
                if (direction === 'up') {
                    return transitionSize / 2;
                }
                return -transitionSize / 2;
            }
            if (movingNode === 'rect') {
                return 0;
            }
        }
        return 0;
    }

    private resetDraggable(e: Draggable) {
        const transition = e.transition;
        const newY = this.asInt(transition, originalYAttribute);
        if (newY > 0) {
            this.moveElement(e, newY);
        }
    }

    private findInfoElement(transition: HTMLElement): HTMLElement {
        const x = this.asInt(transition, this.getXAttribute(transition));
        const y = this.asInt(transition, this.getYAttribute(transition));
        const currentXForInfolement = +x + +transitionSize / 2;
        const currentYInfoElement = +y + transitionSize * 1.5;
        const selector =
            'text[y="' +
            currentYInfoElement +
            '"][x="' +
            currentXForInfolement +
            '"]';
        return this.drawingArea?.nativeElement.querySelector(
            selector
        ) as HTMLElement;
    }

    private findIncomingArcs(transition: HTMLElement): Array<HTMLElement> {
        const coords = this.createCoordsFromElement(transition);
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
        const matchingNodes =
            this.drawingArea?.nativeElement.querySelectorAll(
                selectorForIncomingLines
            ) ?? [];
        const incomingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            incomingLines.push(matchingNodes[i] as HTMLElement);
        }
        return incomingLines;
    }

    private findOutgoingArcs(transition: HTMLElement): Array<HTMLElement> {
        const coords = this.createCoordsFromElement(transition);
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
        this.drawingArea?.nativeElement.append(
            '<p>' + selectorForOutgoingLines + '</p>'
        );
        const matchingNodes =
            this.drawingArea?.nativeElement.querySelectorAll(
                selectorForOutgoingLines
            ) ?? [];
        const outgoingLines = [];
        for (let i = 0; i < matchingNodes.length; i++) {
            outgoingLines.push(matchingNodes[i] as HTMLElement);
        }
        return outgoingLines;
    }

    persistCoords(elements: Array<HTMLElement>): void {
        const coordinates = [] as CoordinatesInfo[];
        elements.forEach((element) => {
            if (element.nodeName === 'rect') {
                const currentY = this.asInt(element, 'y');
                const originalY = this.asInt(element, originalYAttribute);
                const x = this.asInt(element, 'x');
                if (currentY !== originalY) {
                    const infoText =
                        this.findInfoElement(element).textContent ?? '';
                    coordinates.push({
                        transitionName: infoText,
                        coordinates: {
                            x: x,
                            y: currentY,
                        },
                    });
                }
            }
        });
        this._displayService.setCoordsInfo(coordinates);
    }

    private initMouseDownForDraggable(event: MouseEvent) {
        this._globalChanges = {
            x: event.offsetX,
            y: event.offsetY,
        };
        this._childElementInFocus = true;
    }

    private updateChangeState(event: MouseEvent) {
        this._localChanges = {
            x: event.offsetX - this._globalChanges.x,
            y: event.offsetY - this._globalChanges.y,
        };
        this._globalChanges = {
            x: event.offsetX,
            y: event.offsetY,
        };
    }

    private findActiveNeighbourElement(movedElement: Draggable): void {
        if (!movedElement) {
            return;
        }
        const transition = movedElement.transition;
        const yAttribute = this.getYAttribute(transition);
        const direction = this.getMoveDirection(transition);
        if (!direction) {
            return;
        }
        const potentialNeighbours = this.findElementsInYAxis(transition);
        potentialNeighbours?.forEach((e) => {
            const eLocal = e as HTMLElement;
            if (
                this.asInt(eLocal, originalYAttribute) > 0 &&
                eLocal.getAttribute(originalYAttribute) ===
                    transition.getAttribute(originalYAttribute)
            ) {
                return;
            }
            const localYAttribute = this.getYAttribute(eLocal);
            const draggable = this.createDraggableFromElement(eLocal);
            if (direction === 'up') {
                if (
                    this.asInt(e, localYAttribute) <
                    this.asInt(transition, yAttribute)
                ) {
                    if (draggable !== null) {
                        this.setActiveNeighbourElement(draggable, direction);
                    }
                }
            }
            if (direction === 'down') {
                if (
                    this.asInt(eLocal, localYAttribute) >
                    this.asInt(transition, yAttribute)
                ) {
                    if (draggable !== null) {
                        this.setActiveNeighbourElement(draggable, direction);
                    }
                }
            }
        });
    }

    private setActiveNeighbourElement(
        draggable: Draggable,
        direction: string
    ): void {
        if (this._activeNeighbourElement === undefined) {
            this._activeNeighbourElement = draggable;
        }
        const movingCoords = this.createCoordsFromElement(draggable.transition);
        if (this._activeNeighbourElement) {
            const neighbourCoords = this.createCoordsFromElement(
                this._activeNeighbourElement.transition
            );
            if (direction === 'up' && movingCoords.y > neighbourCoords.y) {
                this._activeNeighbourElement = draggable;
            }
            if (direction === 'down' && movingCoords.y < neighbourCoords.y) {
                this._activeNeighbourElement = draggable;
            }
        }
    }

    private getMoveDirection(movedElement: HTMLElement): string {
        const originalY = this.asInt(movedElement, originalYAttribute);
        const yAttribute = this.getYAttribute(movedElement);
        const currentY = this.asInt(movedElement, yAttribute);
        if (originalY === 0 || originalY === currentY) {
            return '';
        }
        return originalY > currentY ? 'up' : 'down';
    }

    private getYAttribute(element: HTMLElement): string {
        return element.nodeName === 'rect' ? 'y' : 'cy';
    }

    private getXAttribute(element: HTMLElement): string {
        return element.nodeName === 'rect' ? 'x' : 'cx';
    }

    private findElementsInYAxis(
        element: HTMLElement
    ): NodeListOf<Element> | null {
        let relevantXCircle = 0;
        let relevantXRect = 0;
        if (element.nodeName === 'circle') {
            relevantXCircle = this.asInt(element, 'cx');
            relevantXRect = +relevantXCircle - transitionSize / 2;
        }
        if (element.nodeName === 'rect') {
            relevantXRect = this.asInt(element, 'x');
            relevantXCircle = relevantXRect + transitionSize / 2;
        }
        const rectSelector = 'rect[x="' + relevantXRect + '"]';
        const circleSelector = 'circle[cx="' + relevantXCircle + '"]';
        return (
            this.drawingArea?.nativeElement.querySelectorAll(
                circleSelector + ',' + rectSelector
            ) ?? null
        );
    }

    private createDraggableFromElement(element: HTMLElement): Draggable | null {
        if (element.nodeName !== 'rect' && element.nodeName !== 'circle') {
            return null;
        }
        const draggable = {
            transition: element,
        } as Draggable;
        draggable.infoElement = this.findInfoElement(element);
        draggable.incomingArcs = this.findIncomingArcs(element);
        draggable.outgoingArcs = this.findOutgoingArcs(element);
        return draggable;
    }

    private asInt(elem: Element, attribute: string): number {
        return parseInt(elem.getAttribute(attribute) ?? '0');
    }

    private createCoordsFromElement(element: HTMLElement): Coordinates {
        return {
            x: this.asInt(element, this.getXAttribute(element)),
            y: this.asInt(element, this.getYAttribute(element)),
        };
    }
}

export type CoordinatesInfo = {
    transitionName: string;
    coordinates: Coordinates;
};

export type Coordinates = {
    x: number;
    y: number;
};

export type Draggable = {
    transition: HTMLElement;
    infoElement?: HTMLElement;
    incomingArcs: Array<HTMLElement>;
    outgoingArcs: Array<HTMLElement>;
};
