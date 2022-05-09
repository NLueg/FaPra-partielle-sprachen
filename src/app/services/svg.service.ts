import { Injectable } from '@angular/core';

import { Element } from '../classes/diagram/element';
import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class SvgService {
    public createSvgElements(diagram: Run): Array<SVGElement> {
        const result: Array<SVGElement> = [];
        diagram.elements.forEach((el) => {
            result.push(this.createSvgForElement(el));
        });
        return result;
    }

    private createSvgForElement(element: Element): SVGElement {
        const svg = this.createSvgElement('circle');

        svg.setAttribute('cx', `${element.x}`);
        svg.setAttribute('cy', `${element.y}`);
        svg.setAttribute('r', '25');
        svg.setAttribute('fill', 'black');

        element.registerSvg(svg);

        return svg;
    }

    private createSvgElement(name: string): SVGElement {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
}
