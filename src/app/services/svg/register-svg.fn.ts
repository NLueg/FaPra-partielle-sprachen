export function registerSvg(svg: SVGElement): void {
    svg.onmousedown = () => handleMouseDown(svg);
    svg.onmouseup = () => handleMouseUp(svg);
}

function handleMouseDown(svg: SVGElement) {
    svg.setAttribute('stroke', 'red');
}

function handleMouseUp(svg: SVGElement) {
    svg.setAttribute('stroke', 'black');
}
