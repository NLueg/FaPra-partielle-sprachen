import { ElementRef, Injectable } from '@angular/core';

import { CoordinatesInfo } from '../../classes/diagram/coordinates';
import { Draggable } from '../../classes/diagram/draggable';
import {
    breakpointPositionAttribute,
    breakpointTrail,
    fromTransitionAttribute,
    layerPosYAttibute,
    toTransitionAttribute,
} from '../svg/svg-constants';
import { asInt } from './dragging-helper.fn';
import { DraggingCreationService } from './factory/draggable-creation.service';

@Injectable({
    providedIn: 'root',
})
export class DraggingService {
    private drawingArea?: ElementRef<SVGElement> | null;

    public setDrawingArea(drawingArea?: ElementRef<SVGElement>): void {
        this.drawingArea = drawingArea;
    }

    public createDraggable(element: HTMLElement): Draggable | null {
        if (!this.drawingArea) {
            return null;
        }
        return DraggingCreationService.createDraggableFromElement(
            element,
            this.drawingArea
        );
    }

    public findInfoText(element: HTMLElement): string {
        if (!this.drawingArea) {
            return '';
        }
        return (
            DraggingCreationService.findInfoElementForTransition(
                element,
                this.drawingArea
            )?.textContent ?? ''
        );
    }

    public getCoordinates(elements: Array<HTMLElement>): CoordinatesInfo[] {
        const coordinatesInfo = [] as CoordinatesInfo[];
        elements.forEach((element) => {
            const y = asInt(element, layerPosYAttibute);
            let x = -1;
            let infoText = this.findInfoText(element);
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
            coordinatesInfo.push({
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
        return coordinatesInfo;
    }
}
