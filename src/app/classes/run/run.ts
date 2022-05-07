import { Transition } from './transition';

export class Run {
    private readonly _transitions: Array<Transition>;

    constructor() {
        this._transitions = [];
    }

    get transitions(): Array<Transition> {
        return this._transitions;
    }

    public addTransition(transition: Transition): void {
        this._transitions.push(transition);
    }
}
