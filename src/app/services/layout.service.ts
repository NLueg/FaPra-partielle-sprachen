import { Injectable } from '@angular/core';

import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    private static readonly OFFSET = 20;
    private static readonly RANGE = 300;

    // TODO: Implement displaying of the run
    public layout(diagram: Run): void {
        diagram.elements.forEach((el) => {
            el.x =
                Math.floor(Math.random() * LayoutService.RANGE) +
                LayoutService.OFFSET;
            el.y =
                Math.floor(Math.random() * LayoutService.RANGE) +
                LayoutService.OFFSET;
        });
    }
}
