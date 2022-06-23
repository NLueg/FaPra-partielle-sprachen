import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { map, Unsubscribable } from 'rxjs';

import { Run } from '../../classes/diagram/run';
import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.scss'],
})
export class DisplayComponent implements OnDestroy {
    @ViewChild('drawingArea') drawingArea: ElementRef<SVGElement> | undefined;

    private _sub: Unsubscribable;
    private _mouseMove: boolean;
    private _childElementInFocus: boolean;
    private _globalChangesProcessed: boolean;
    private _globalChanges: Coordinates = { x: 0, y: 0 };
    private _localChanges: Coordinates = { x: 0, y: 0 };
    private _movedChildElement?: HTMLElement;

    constructor(
        private _layoutService: LayoutService,
        private _svgService: SvgService,
        private _displayService: DisplayService
    ) {
        this._sub = this._displayService.currentRun$
            .pipe(
                map((currentRun) => this._layoutService.layout(currentRun).run)
            )
            .subscribe((modifiedRun) => this.draw(modifiedRun));
        this._mouseMove = false;
        this._childElementInFocus = false;
        this._globalChangesProcessed = false;
    }

    ngOnDestroy(): void {
        this._sub.unsubscribe();
    }

    private draw(currentRun: Run) {
        if (this.drawingArea === undefined) {
            console.debug('drawing area not ready yet');
            return;
        }

        this.clearDrawingArea();
        const elements = this._svgService.createSvgElements(currentRun);
        for (const element of elements) {
            this.drawingArea.nativeElement.appendChild(element);
        }
        this.registerCanvasMouseHandler(this.drawingArea.nativeElement);
        this.registerSingleMouseHandler(this.drawingArea.nativeElement);
    }

    private clearDrawingArea() {
        const drawingArea = this.drawingArea?.nativeElement;
        if (drawingArea?.childElementCount === undefined) {
            return;
        }

        while (drawingArea.childElementCount > 1 /* keep arrowhead marker */) {
            drawingArea.removeChild(drawingArea.lastChild as ChildNode);
        }
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
                if (!this._globalChangesProcessed) {
                    this._globalChangesProcessed = true;
                }
                this.moveRun(drawingArea);
            }
        };
        drawingArea.onmouseup = () => {
            this._globalChangesProcessed = false;
            this._childElementInFocus = false;
            this._mouseMove = false;
            if (this._movedChildElement !== undefined) {
                this.resetDraggable(this._movedChildElement);
            }
            this._movedChildElement = undefined;
        };
        drawingArea.onmouseleave = () => {
            this._globalChangesProcessed = false;
            this._mouseMove = false;
            if (this._movedChildElement !== undefined) {
                this.resetDraggable(this._movedChildElement);
            }
            this._childElementInFocus = false;
            this._movedChildElement = undefined;
        };
    }

    private moveRun(drawingArea: SVGElement) {
        Array.from(drawingArea.children).forEach((e) => {
            const x = this._localChanges.x;
            const y = this._localChanges.y;
            if (e.nodeName === 'rect' || e.nodeName === 'text') {
                const currentX = +parseInt(e.getAttribute('x') ?? '0') + +x;
                const currentY = +parseInt(e.getAttribute('y') ?? '0') + +y;
                e.setAttribute('x', `${currentX}`);
                e.setAttribute('y', `${currentY}`);
                e.removeAttribute('original-y');
            }
            if (e.nodeName === 'line') {
                const currentX1 = +parseInt(e.getAttribute('x1') ?? '0') + +x;
                const currentY1 = +parseInt(e.getAttribute('y1') ?? '0') + +y;
                const currentX2 = +parseInt(e.getAttribute('x2') ?? '0') + +x;
                const currentY2 = +parseInt(e.getAttribute('y2') ?? '0') + +y;
                e.setAttribute('x1', `${currentX1}`);
                e.setAttribute('y1', `${currentY1}`);
                e.setAttribute('x2', `${currentX2}`);
                e.setAttribute('y2', `${currentY2}`);
            }
            if (e.nodeName === 'circle') {
                const newX = +parseInt(e.getAttribute('cx') ?? '0') + +x;
                const newY = +parseInt(e.getAttribute('cy') ?? '0') + +y;
                e.setAttribute('cx', `${newX}`);
                e.setAttribute('cy', `${newY}`);
                e.removeAttribute('original-y');
            }
        });
    }

    private registerSingleMouseHandler(drawingArea: SVGElement) {
        for (let i = 0; i < drawingArea.children.length; i++) {
            const e = drawingArea.children[i] as HTMLElement;
            if (e.nodeName === 'rect' || e.nodeName === 'circle') {
                this.registerMouseHandlerForDraggable(e);
            }
        }
    }

    private registerMouseHandlerForDraggable(element: HTMLElement) {
        element.onmousedown = (e) => {
            this.initMouseDownForDraggable(e);
        };
        element.onmousemove = (e) => {
            if (this._childElementInFocus) {
                if (!this._globalChangesProcessed) {
                    this._globalChangesProcessed = true;
                }
                this.updateChangeState(e);
                this.moveDraggable(element);
            }
        };
        element.onmouseleave = () => {
            this._childElementInFocus = false;
        };
        element.onmouseup = (e) => {
            if (this._childElementInFocus) {
                this.resetDraggable(element);
            }
            this._childElementInFocus = false;
            this._movedChildElement = undefined;
            this.updateChangeState(e);
        };
    }

    private moveDraggable(movedElement: HTMLElement) {
        const y = this._localChanges.y;
        const attributePraefix = this.getAttributePraefix(movedElement);
        const yAttribute = attributePraefix + 'y';
        const xAttribute = attributePraefix + 'x';
        const currentY = parseInt(movedElement.getAttribute(yAttribute) ?? '0');
        const newY =
            +parseInt(movedElement.getAttribute(yAttribute) ?? '0') + +y;
        const currentX = parseInt(movedElement.getAttribute(xAttribute) ?? '0');
        const originalY = parseInt(
            movedElement.getAttribute('original-y') ?? '0'
        );
        if (originalY === 0) {
            movedElement.setAttribute('original-y', `${currentY}`);
        }

        const passedElement = this.checkForPassedElement(
            movedElement
        ) as HTMLElement;
        if (passedElement !== null) {
            this.handlePassedElement(movedElement, passedElement);
        } else {
            this.moveElement(movedElement, newY, currentY, currentX);
        }
    }

    private moveElement(
        e: HTMLElement,
        newY: number,
        currentY: number,
        currentX: number
    ) {
        const attributePraefix = this.getAttributePraefix(e);
        e.setAttribute(attributePraefix + 'y', `${newY}`);
        this.moveInfoElement(currentX, currentY, newY);
        this.moveLines(currentX, currentY, newY, e);
        if (this._movedChildElement === undefined) {
            this._movedChildElement = e;
        }
    }

    private handlePassedElement(
        movingElement: HTMLElement,
        passedElement: HTMLElement
    ) {
        const nodeTypeOfMovingElement = movingElement.nodeName;
        const nodeTypeOfPassedElement = passedElement.nodeName;
        let currentYPassed;
        let currentXPassed;
        let currentYMoving;
        let currentXMoving;
        let newYMoving;
        let newYPassed;
        if (nodeTypeOfPassedElement === 'rect') {
            currentXPassed = parseInt(passedElement.getAttribute('x') ?? '0');
            currentYPassed = parseInt(passedElement.getAttribute('y') ?? '0');
        } else {
            currentXPassed = parseInt(passedElement.getAttribute('cx') ?? '0');
            currentYPassed = parseInt(passedElement.getAttribute('cy') ?? '0');
        }
        if (nodeTypeOfMovingElement === 'rect') {
            currentXMoving = parseInt(movingElement.getAttribute('x') ?? '0');
            currentYMoving = parseInt(movingElement.getAttribute('y') ?? '0');
            if (nodeTypeOfPassedElement === 'circle') {
                newYMoving =
                    parseInt(passedElement.getAttribute('cy') ?? '0') - 25;
                newYPassed =
                    parseInt(movingElement.getAttribute('original-y') ?? '0') +
                    25;
            } else {
                newYMoving = parseInt(passedElement.getAttribute('y') ?? '0');
                newYPassed = parseInt(
                    movingElement.getAttribute('original-y') ?? '0'
                );
            }
        } else {
            currentXMoving = parseInt(movingElement.getAttribute('cx') ?? '0');
            currentYMoving = parseInt(movingElement.getAttribute('cy') ?? '0');
            if (nodeTypeOfPassedElement === 'circle') {
                let offset = 2;
                if (currentYMoving > currentYPassed) {
                    offset = -2;
                }
                newYPassed =
                    parseInt(movingElement.getAttribute('original-y') ?? '0') +
                    offset;
                newYMoving = parseInt(passedElement.getAttribute('cy') ?? '0');
            } else {
                newYMoving =
                    parseInt(passedElement.getAttribute('y') ?? '0') + 25;
                newYPassed =
                    parseInt(movingElement.getAttribute('original-y') ?? '0') -
                    25;
            }
        }

        this.moveElement(
            passedElement,
            newYPassed,
            currentYPassed,
            currentXPassed
        );
        this.moveElement(
            movingElement,
            newYMoving,
            currentYMoving,
            currentXMoving
        );
        this.persistCoords(passedElement);
        this.persistCoords(movingElement);
        movingElement.setAttribute('original-y', `${newYMoving}`);
        passedElement.setAttribute('original-y', `${newYPassed}`);
        this._childElementInFocus = false;
        this._movedChildElement = undefined;
        this._mouseMove = false;
    }

    private checkForPassedElement(
        movingElement: HTMLElement
    ): HTMLElement | null {
        let relevantY = 0;
        let relevantX = 0;
        let relevantXRect = 0;
        let circleSelector;
        let rectSelector;
        if (movingElement.nodeName === 'circle') {
            relevantX = parseInt(movingElement.getAttribute('cx') ?? '0');
            relevantXRect =
                parseInt(movingElement.getAttribute('cx') ?? '0') + -25;
            relevantY = parseInt(movingElement.getAttribute('cy') ?? '0');
            const relevantYRect1 = relevantY + 25;
            const relevantYRect2 = relevantY - 25;
            const relevantYCircle1 = relevantY - 2;
            const relevantYCircle2 = relevantY + 2;
            rectSelector =
                'rect[y="' +
                relevantYRect1 +
                '"][x="' +
                relevantXRect +
                '"], rect[y="' +
                relevantYRect2 +
                '"][x="' +
                relevantXRect +
                '"]';
            circleSelector =
                'circle[cy="' +
                relevantYCircle1 +
                '"][cx="' +
                relevantX +
                '"], circle[cy="' +
                relevantYCircle2 +
                '"][cx="' +
                relevantX +
                '"]';
        }
        if (movingElement.nodeName === 'rect') {
            relevantX = parseInt(movingElement.getAttribute('x') ?? '0');
            const relevantXCircle = relevantX + 25;
            relevantY = parseInt(movingElement.getAttribute('y') ?? '0');
            const relevantYCircle1 = relevantY + 2;
            const relevantYRect2 = relevantY - 2;
            const relevantYCircle2 = relevantY + 23;
            circleSelector =
                'circle[cy="' +
                relevantYCircle1 +
                '"][cx="' +
                relevantXCircle +
                '"], circle[cy="' +
                relevantYCircle2 +
                '"][cx="' +
                relevantXCircle +
                '"]';
            rectSelector =
                'rect[y="' +
                relevantYCircle1 +
                '"][x="' +
                relevantX +
                '"], rect[y="' +
                relevantYRect2 +
                '"][x="' +
                relevantX +
                '"]';
        }
        return (
            this.drawingArea?.nativeElement.querySelector(
                circleSelector + ',' + rectSelector
            ) ?? null
        );
    }

    private getAttributePraefix(e: HTMLElement): string {
        if (e.nodeName === 'circle') {
            return 'c';
        }
        return '';
    }

    private resetDraggable(e: HTMLElement) {
        const newY = parseInt(e.getAttribute('original-y') ?? '0');
        const attributePraefix = this.getAttributePraefix(e);
        const yAttribute = attributePraefix + 'y';
        const xAttribute = attributePraefix + 'x';
        const currentX = parseInt(e.getAttribute(xAttribute) ?? '0');
        const currentY = parseInt(e.getAttribute(yAttribute) ?? '0');
        this.moveElement(e, newY, currentY, currentX);
    }

    private moveInfoElement(currentX: number, currentY: number, newY: number) {
        const newYInfolement = newY + 75;
        const infoElement = this.getInfoElement(currentX, currentY);
        if (infoElement !== null) {
            infoElement.setAttribute('y', `${newYInfolement}`);
        }
    }

    /**
     *
     * @param x
     * @param y
     * @private
     */
    private getInfoElement(x: number, y: number): HTMLElement {
        const currentXForInfolement = +x + +25;
        const currentYInfolement = +y + 75;
        const selector =
            'text[y="' +
            currentYInfolement +
            '"][x="' +
            currentXForInfolement +
            '"]';
        return this.drawingArea?.nativeElement.querySelector(
            selector
        ) as HTMLElement;
    }

    private moveLines(
        currentX: number,
        currentY: number,
        newY: number,
        element: HTMLElement
    ) {
        let offsetIncoming = 0;
        if (element.nodeName === 'rect') {
            offsetIncoming = 25;
        }
        const currentXForIncomingLines = +currentX;
        const currentYForLines = +currentY + offsetIncoming;
        const newYForLines = +newY + offsetIncoming;
        const selectorForIncomingLines =
            'line[y2="' +
            currentYForLines +
            '"][x2="' +
            currentXForIncomingLines +
            '"]';
        const incomingLines = document.querySelectorAll(
            selectorForIncomingLines
        );
        for (let i = 0; i < incomingLines.length; i++) {
            const line = incomingLines[i] as HTMLElement;
            line.setAttribute('y2', `${newYForLines}`);
        }
        let offsetOutgoing = 0;
        if (element.nodeName === 'rect') {
            offsetOutgoing = 50;
        }
        const currentXForOutgoingLines = +currentX + offsetOutgoing;
        const selectorForOutgoingLines =
            'line[y1="' +
            currentYForLines +
            '"][x1="' +
            currentXForOutgoingLines +
            '"]';
        const outgoingLines = document.querySelectorAll(
            selectorForOutgoingLines
        );
        for (let i = 0; i < outgoingLines.length; i++) {
            const line = outgoingLines[i] as HTMLElement;
            line.setAttribute('y1', `${newYForLines}`);
        }
    }

    persistCoords(element: HTMLElement): void {
        if (element.nodeName === 'rect') {
            const currentY = parseInt(element.getAttribute('y') ?? '0');
            const originalY = parseInt(
                element.getAttribute('original-y') ?? '0'
            );
            const x = parseInt(element.getAttribute('x') ?? '0');
            if (currentY !== originalY) {
                const infoText =
                    this.getInfoElement(x, currentY).textContent ?? '';
                this._displayService.setCoordsInfo({
                    transitionName: infoText,
                    coordinates: {
                        x: x,
                        y: currentY,
                    },
                });
                const observable = this._displayService.coordsInfoAdded();
            }
        }
    }

    private initMouseDownForDraggable(event: MouseEvent) {
        this._childElementInFocus = true;
        this._globalChanges = {
            x: event.offsetX,
            y: event.offsetY,
        };
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
}

export type CoordinatesInfo = {
    transitionName: string;
    coordinates: Coordinates;
};

export type Coordinates = {
    x: number;
    y: number;
};
