export type Arc = {
    source: string;
    target: string;
    breakpoints: Breakpoint[];
};

export type Breakpoint = {
    x: number;
    y: number;
    arc: Arc;
};
