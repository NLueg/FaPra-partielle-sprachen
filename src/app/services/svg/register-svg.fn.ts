import { Element } from '../../classes/diagram/element';

export function registerSvg(svg: SVGElement, element: Element): void {
    svg.onmousedown = () => handleMouseDown(svg, element);
    svg.onmouseup = () => handleMouseUp(svg, element);
}

function handleMouseDown(svg: SVGElement, element: Element) {
    svg.setAttribute('stroke', 'red');
}

function handleMouseUp(svg: SVGElement, element: Element) {
    svg.setAttribute('stroke', 'black');
}
