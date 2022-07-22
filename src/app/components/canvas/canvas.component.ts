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
import { DraggingService } from '../../services/dragging/dragging.service';
import {
    asInt,
    createCoordsFromElement,
    findElementsInYAxis,
    findIncomingArcs,
    findInfoElementForTransition,
    findOutgoingArcs,
    getElementFromCanvas,
    getMoveDirection,
    getXAttribute,
    getYAttribute,
    moveElement,
} from '../../services/dragging/dragging-helper.fn';
import { SvgService } from '../../services/svg/svg.service';
import {
    breakpointPositionAttribute,
    breakpointTrail,
    fromTransitionAttribute,
    layerPosYAttibute,
    originalYAttribute,
    toTransitionAttribute,
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
    private _localChangesRun: Coordinates = { x: 0, y: 0 };
    private _globalChangesRun: Coordinates = { x: 0, y: 0 };
    private _movedChildElement?: Draggable;
    private _activeNeighbourElement?: Draggable;
    highlightColor: string | undefined;
    private _sub: Subscription | undefined;
    private _offsetSub: Subscription;
    private _updateOffsetSub: Subscription;

    constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _draggingService: DraggingService,
        private _colorService: ColorService
    ) {
        this._mouseMove = false;
        this._childElementInFocus = false;
        this._runMoved = false;
        this._offsetSub = this._displayService
            .offsetInfoAdded()
            .pipe()
            .subscribe((val) => this.resetOffset(val));
        this._updateOffsetSub = this._displayService
            .offsetInfoUpdated()
            .pipe()
            .subscribe((val) => this.resetOffset(val));
        this._draggingService.setDrawingArea(this.drawingArea);
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

    private resetOffset(newCoordinates: Coordinates): void {
        this._globalChangesRun.x = newCoordinates.x;
        this._globalChangesRun.y = newCoordinates.y;
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
            this._localChangesRun = {
                x: 0,
                y: 0,
            };
            this._globalChanges = {
                x: e.offsetX,
                y: e.offsetY,
            };
        };
        drawingArea.onmousemove = (e) => {
            if (this._movedChildElement && !this._childElementInFocus) {
                this.moveDraggable(this._movedChildElement);
                this.updateChangeStateDraggable(e);
            }
            if (
                this._mouseMove &&
                !this._childElementInFocus &&
                !this._movedChildElement
            ) {
                this.updateChangeStateRun(e);
                this.moveRun(drawingArea);
            }
        };
        drawingArea.onmouseup = () => {
            if (this.persistCoordinates) {
                this.persistOffset();
            }
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

    private persistOffset() {
        if (this._runMoved) {
            this._displayService.setOffsetInfo({
                x: this._globalChangesRun.x,
                y: this._globalChangesRun.y,
            });
        }
    }

    private moveRun(drawingArea: SVGElement) {
        Array.from(drawingArea.children).forEach((e) => {
            const x = this._localChangesRun.x;
            const y = this._localChangesRun.y;
            if (x !== 0 || y !== 0) {
                this._runMoved = true;
            }
            if (e.nodeName === 'rect' || e.nodeName === 'text') {
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
        element.transition.onmouseenter = () => {
            this._mouseMove = false;
        };
        element.transition.onmousedown = (e) => {
            this.initMouseDownForDraggable(e);
        };
        element.transition.onmousemove = (e) => {
            if (this._childElementInFocus) {
                if (this._movedChildElement === undefined) {
                    this._movedChildElement = element;
                }
                this.updateChangeStateDraggable(e);
                this.moveDraggable(this._movedChildElement);
            }
        };
        element.transition.onmouseleave = () => {
            this._childElementInFocus = false;
        };
        element.transition.onmouseup = (e) => {
            if (this._movedChildElement !== undefined) {
                this.resetDraggable(this._movedChildElement);
            }
            this.resetGlobalHandlers();
            this.updateChangeStateDraggable(e);
        };
    }

    private moveDraggable(draggable: Draggable) {
        if (this._activeNeighbourElement === undefined) {
            this.findActiveNeighbourElement(draggable);
        }
        const transition = draggable.transition;
        const y = this._localChanges.y;
        const currentCoords = createCoordsFromElement(transition);
        const currentY = currentCoords.y;
        const newY = currentY + y;
        const originalY = asInt(transition, originalYAttribute);
        if (originalY === 0) {
            transition.setAttribute(originalYAttribute, `${currentY}`);
        }
        if (this.checkForPassedElement(transition)) {
            this.handlePassedElement(draggable);
        } else {
            moveElement(draggable, newY);
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
                newYMoving = asInt(passedElement, 'cy') - transitionSize / 2;
                newYPassed =
                    asInt(movingElement, originalYAttribute) +
                    transitionSize / 2;
            } else {
                newYMoving = asInt(passedElement, 'y');
                newYPassed = asInt(movingElement, originalYAttribute);
            }
        } else {
            if (nodeTypeOfPassedElement === 'circle') {
                newYPassed = asInt(movingElement, originalYAttribute);
                newYMoving = asInt(passedElement, 'cy');
            } else {
                newYPassed =
                    asInt(movingElement, originalYAttribute) -
                    transitionSize / 2;
                newYMoving = asInt(passedElement, 'y') + transitionSize / 2;
            }
        }
        moveElement(
            this.createDraggableFromElement(passedElement) as Draggable,
            newYPassed
        );
        moveElement(draggable, newYMoving);

        if (this.persistCoordinates) {
            const movedLayerPos = asInt(movingElement, layerPosYAttibute);
            const passedLayerPos = asInt(passedElement, layerPosYAttibute);
            movingElement.setAttribute(layerPosYAttibute, `${passedLayerPos}`);
            passedElement.setAttribute(layerPosYAttibute, `${movedLayerPos}`);
            this.persistLayerPosition([passedElement, movingElement]);
        }
        movingElement.removeAttribute(originalYAttribute);
        passedElement.removeAttribute(originalYAttribute);

        this.resetCanvasHandlers();
    }

    private checkForPassedElement(movingElement: HTMLElement): boolean {
        if (this._activeNeighbourElement === undefined) {
            return false;
        }
        const yMoving = asInt(movingElement, getYAttribute(movingElement));
        const yOriginal = asInt(movingElement, originalYAttribute);
        const yPassed = asInt(
            this._activeNeighbourElement.transition,
            getYAttribute(this._activeNeighbourElement.transition)
        );
        const direction = getMoveDirection(movingElement);
        if (!direction) {
            return false;
        }
        const offset = this.calculateOffset(movingElement, direction);
        if (direction === 'up') {
            return yMoving < yPassed + offset && yOriginal > yPassed;
        }
        return yMoving > yPassed + offset && yOriginal < yPassed;
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
        const newY = asInt(transition, originalYAttribute);
        if (newY > 0) {
            moveElement(e, newY);
        }
    }

    private findInfoElementForTransition(transition: HTMLElement): HTMLElement {
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
        return getElementFromCanvas(selector, this.drawingArea);
    }

    persistLayerPosition(elements: Array<HTMLElement>): void {
        const coordinates = [] as CoordinatesInfo[];
        elements.forEach((element) => {
            const y = asInt(element, layerPosYAttibute);
            let x = -1;
            let infoText =
                this.findInfoElementForTransition(element)?.textContent ?? '';
            if (element.nodeName === 'circle') {
                x = asInt(element, breakpointPositionAttribute);
                infoText =
                    element.getAttribute(fromTransitionAttribute) +
                    ' ' +
                    element.getAttribute(toTransitionAttribute);
                const breakPoints =
                    element.getAttribute(breakpointTrail)?.split(',') ?? [];
                for (let i = 0; i < breakPoints.length; i++) {
                    const breakPoint = breakPoints[i].split(':');
                    if (i === x) {
                        infoText += '[' + (y + 1) + ']';
                    } else {
                        infoText += '[' + (parseInt(breakPoint[1]) + 1) + ']';
                    }
                }
            }
            coordinates.push({
                transitionName: infoText.trim(),
                transitionType: element.nodeName,
                coordinates: {
                    x: x + 1,
                    y: y + 1,
                },
                globalOffset: {
                    x: x + 1,
                    y: y + 1,
                },
            });
        });
        this._displayService.setCoordsInfo(coordinates);
    }

    private initMouseDownForDraggable(event: MouseEvent) {
        this._globalChanges = {
            x: event.offsetX,
            y: event.offsetY,
        };
        this._mouseMove = false;
        this._childElementInFocus = true;
    }

    private updateChangeStateRun(event: MouseEvent) {
        this._localChangesRun = {
            x: event.offsetX - this._globalChanges.x,
            y: event.offsetY - this._globalChanges.y,
        };
        this._globalChangesRun.x += this._localChangesRun.x;
        this._globalChangesRun.y += this._localChangesRun.y;
        this._localChanges = {
            x: event.offsetX - this._globalChanges.x,
            y: event.offsetY - this._globalChanges.y,
        };
        this._globalChanges = {
            x: event.offsetX,
            y: event.offsetY,
        };
    }

    private updateChangeStateDraggable(event: MouseEvent) {
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
        const yAttribute = getYAttribute(transition);
        const direction = getMoveDirection(transition);
        if (!direction) {
            return;
        }
        const potentialNeighbours = findElementsInYAxis(
            transition,
            this.drawingArea
        );
        potentialNeighbours.forEach((e) => {
            const eLocal = e as HTMLElement;
            if (
                asInt(eLocal, originalYAttribute) > 0 &&
                eLocal.getAttribute(originalYAttribute) ===
                    transition.getAttribute(originalYAttribute)
            ) {
                return;
            }
            const localYAttribute = getYAttribute(eLocal);
            const draggable = this.createDraggableFromElement(eLocal);
            if (direction === 'up') {
                if (asInt(e, localYAttribute) < asInt(transition, yAttribute)) {
                    if (draggable !== null) {
                        this.setActiveNeighbourElement(draggable, direction);
                    }
                }
            }
            if (direction === 'down') {
                if (
                    asInt(eLocal, localYAttribute) >
                    asInt(transition, yAttribute)
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
        const movingCoords = createCoordsFromElement(draggable.transition);
        if (this._activeNeighbourElement) {
            const neighbourCoords = createCoordsFromElement(
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

    private createDraggableFromElement(element: HTMLElement): Draggable | null {
        if (element.nodeName !== 'rect' && element.nodeName !== 'circle') {
            return null;
        }
        const draggable = {
            transition: element,
        } as Draggable;
        draggable.infoElement = findInfoElementForTransition(
            element,
            this.drawingArea
        );
        draggable.incomingArcs = findIncomingArcs(element, this.drawingArea);
        draggable.outgoingArcs = findOutgoingArcs(element, this.drawingArea);
        return draggable;
    }
}

export type CoordinatesInfo = {
    transitionName: string;
    transitionType: string;
    coordinates: Coordinates;
    globalOffset: Coordinates;
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
