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
import { Draggable } from 'src/app/classes/diagram/draggable';

import { ColorService } from '../../services/color.service';
import { DisplayService } from '../../services/display.service';
import { DraggingService } from '../../services/moving/dragging.service';
import { asInt, getYAttribute } from '../../services/moving/dragging-helper.fn';
import { DraggingCreationService } from '../../services/moving/factory/draggable-creation.service';
import { FindElementsService } from '../../services/moving/find/find-elements.service';
import { MoveElementsService } from '../../services/moving/move/move-elements.service';
import { StatehandlerService } from '../../services/moving/statehandler/statehandler.service';
import { SvgService } from '../../services/svg/svg.service';
import {
    layerPosYAttibute,
    originalYAttribute,
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

    highlightColor: string | undefined;
    private _sub: Subscription | undefined;
    private _offsetSub: Subscription;
    private _updateOffsetSub: Subscription;

    constructor(
        private _svgService: SvgService,
        private _displayService: DisplayService,
        private _draggingService: DraggingService,
        private _colorService: ColorService,
        private _stateHandler: StatehandlerService
    ) {
        this._offsetSub = this._displayService
            .offsetInfoAdded()
            .subscribe((val) => this._stateHandler.resetOffset(val));
        this._updateOffsetSub = this._displayService
            .offsetInfoUpdated()
            .subscribe((val) => this._stateHandler.resetOffset(val));
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
        this._draggingService.setDrawingArea(this.drawingArea);
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
            this._stateHandler.initMouseDownForRun(e);
        };
        drawingArea.onmousemove = (e) => {
            if (this._stateHandler.childIsBeingDragged()) {
                this.moveChildElementIfExisting();
                this._stateHandler.updateChangeStateDraggable(e);
            }
            if (this._stateHandler.runIsMoving()) {
                this._stateHandler.updateChangeStateRun(e);
                MoveElementsService.moveRun(
                    drawingArea,
                    this._stateHandler.getLocalChangesForRun()
                );
            }
        };
        drawingArea.onmouseup = () => {
            if (this.persistCoordinates) {
                this.persistOffset();
            }
            this._stateHandler.resetCanvasHandlers();
        };
        drawingArea.onmouseenter = () => {
            this._stateHandler.resetCanvasHandlers();
        };
        drawingArea.onmouseleave = () => {
            this._stateHandler.resetCanvasHandlers();
        };
    }

    private persistOffset() {
        if (this._stateHandler.runIsMoved()) {
            this._displayService.setOffsetInfo(
                this._stateHandler.getGlobalChangesForRun()
            );
        }
    }

    private registerSingleMouseHandler(drawingArea: SVGElement) {
        for (let i = 0; i < drawingArea.children.length; i++) {
            const e = drawingArea.children[i] as HTMLElement;
            if (e.nodeName === 'rect' || e.nodeName === 'circle') {
                this.registerMouseHandlerForDraggable(
                    this._draggingService.createDraggable(e)
                );
            }
        }
    }

    private registerMouseHandlerForDraggable(element: Draggable | null) {
        if (element === null) {
            return;
        }
        element.transition.onmouseenter = () => {
            this._stateHandler.disableMouseMoveForRun();
        };

        element.transition.onmousedown = (e) => {
            this._stateHandler.initMouseDownForDraggable(e);
        };

        element.transition.onmousemove = (e) => {
            if (this._stateHandler.draggableCanBeMoved(element, e)) {
                this.moveDraggable(element);
            }
        };
        element.transition.onmouseleave = () => {
            this._stateHandler.disableFocusForChildElement();
        };
        element.transition.onmouseup = (e) => {
            this.resetChildElementIfExisting();
            this._stateHandler.resetGlobalHandlers();
            this._stateHandler.updateChangeStateDraggable(e);
        };
    }

    private resetChildElementIfExisting(): void {
        const movedChildElement = this._stateHandler.getMovedDraggable();
        if (movedChildElement !== undefined) {
            MoveElementsService.resetPositionForDraggable(movedChildElement);
        }
    }

    private moveChildElementIfExisting(): void {
        const movedChildElement = this._stateHandler.getMovedDraggable();
        if (movedChildElement !== undefined) {
            this.moveDraggable(movedChildElement);
        }
    }

    private moveDraggable(draggable: Draggable) {
        this.determineActiveNeighbourElement(draggable);
        const y = this._stateHandler.getVerticalChanges();
        const transition = draggable.transition;
        const currentCoords =
            FindElementsService.createCoordsFromElement(transition);
        const currentY = currentCoords.y;
        const newY = currentY + y;
        const originalY = asInt(transition, originalYAttribute);
        if (originalY === 0) {
            transition.setAttribute(originalYAttribute, `${currentY}`);
        }
        if (this.checkForPassedElement(transition)) {
            this.handlePassedElement(draggable);
        } else {
            MoveElementsService.moveElement(draggable, newY);
        }
    }

    private handlePassedElement(draggable: Draggable) {
        const passedElement = this._stateHandler.getActiveNeighbourElement()
            ?.transition as HTMLElement;
        const movingElement = draggable.transition;
        if (passedElement === undefined) {
            return;
        }
        MoveElementsService.switchElements(
            draggable,
            this._draggingService.createDraggable(passedElement) as Draggable
        );
        if (this.persistCoordinates) {
            const movedLayerPos = asInt(movingElement, layerPosYAttibute);
            const passedLayerPos = asInt(passedElement, layerPosYAttibute);
            movingElement.setAttribute(layerPosYAttibute, `${passedLayerPos}`);
            passedElement.setAttribute(layerPosYAttibute, `${movedLayerPos}`);
            this.persistLayerPosition([passedElement, movingElement]);
        }
        movingElement.removeAttribute(originalYAttribute);
        passedElement.removeAttribute(originalYAttribute);

        this._stateHandler.resetCanvasHandlers();
    }

    private checkForPassedElement(movingElement: HTMLElement): boolean {
        const activeNeighbour = this._stateHandler.getActiveNeighbourElement();
        if (activeNeighbour === undefined) {
            return false;
        }

        const yMoving = asInt(movingElement, getYAttribute(movingElement));
        const yOriginal = asInt(movingElement, originalYAttribute);
        const yPassed = asInt(
            activeNeighbour.transition,
            getYAttribute(activeNeighbour.transition)
        );
        const direction = MoveElementsService.getMoveDirection(movingElement);
        if (!direction) {
            return false;
        }
        const offset = MoveElementsService.calculateOffset(
            movingElement,
            activeNeighbour,
            direction
        );
        if (direction === 'up') {
            return yMoving < yPassed + offset && yOriginal > yPassed;
        }
        return yMoving > yPassed + offset && yOriginal < yPassed;
    }

    private determineActiveNeighbourElement(movedElement: Draggable): void {
        if (!movedElement || !this.drawingArea) {
            null;
        }
        const transition = movedElement.transition;
        const yAttribute = getYAttribute(transition);
        const direction = MoveElementsService.getMoveDirection(transition);
        if (!direction) {
            return;
        }
        const potentialNeighbours = FindElementsService.findElementsInYAxis(
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
            const draggable =
                DraggingCreationService.createDraggableFromElement(
                    eLocal,
                    this.drawingArea
                );
            if (direction === 'up') {
                if (asInt(e, localYAttribute) < asInt(transition, yAttribute)) {
                    if (draggable !== null) {
                        this._stateHandler.setActiveNeighbourElement(
                            draggable,
                            direction
                        );
                    }
                }
            }
            if (direction === 'down') {
                if (
                    asInt(eLocal, localYAttribute) >
                    asInt(transition, yAttribute)
                ) {
                    if (draggable !== null) {
                        this._stateHandler.setActiveNeighbourElement(
                            draggable,
                            direction
                        );
                    }
                }
            }
        });
    }

    persistLayerPosition(elements: Array<HTMLElement>): void {
        this._draggingService.setDrawingArea(this.drawingArea);
        this._displayService.setCoordsInfo(
            this._draggingService.getCoordinates(elements)
        );
    }
}
