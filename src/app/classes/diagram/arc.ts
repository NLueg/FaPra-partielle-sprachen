import { Element } from './element';

export type Arc = {
    source: string;
    target: string;
    sourceEl?: Element;
    targetEl?: Element;
    breakpoints: Breakpoint[];
};

export type Breakpoint = {
    x: number;
    y: number;
    arc: Arc;
};
