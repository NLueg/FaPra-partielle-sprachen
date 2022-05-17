export class Element {
    private _x: number;
    private _y: number;
    private _label: string;
    private _svgElement: SVGElement | undefined;

    constructor(label: string) {
        this._x = 0;
        this._y = 0;
        this._label = label;
    }

    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get label(): string {
        return this._label;
    }

    set label(value: string) {
        this._label = value;
    }

    public registerSvg(svg: SVGElement): void {
        this._svgElement = svg;
        this._svgElement.onmousedown = () => this.processMouseDown();
        this._svgElement.onmouseup = () => this.processMouseUp();
    }

    private processMouseDown() {
        if (this._svgElement === undefined) {
            return;
        }
        this._svgElement.setAttribute('stroke', 'red');
    }

    private processMouseUp() {
        if (this._svgElement === undefined) {
            return;
        }
        this._svgElement.setAttribute('stroke', 'black');
    }
}
