export class Transition {
    private _x: number;
    private _y: number;
    private _index: number;
    private _label: string;

    constructor(index: number, name: string) {
        this._x = 0;
        this._y = 0;
        this._index = index;
        this._label = name;
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

    get index(): number {
        return this._index;
    }

    set index(index: number) {
        this._index = index;
    }

    get label(): string {
        return this._label;
    }

    set label(label: string) {
        this._label = label;
    }
}
