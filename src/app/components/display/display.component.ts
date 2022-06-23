import { Component } from '@angular/core';
import { map, Observable } from 'rxjs';

import { DisplayService } from '../../services/display.service';
import { LayoutService } from '../../services/layout.service';
import { SvgService } from '../../services/svg/svg.service';

@Component({
    selector: 'app-display',
    templateUrl: './display.component.html',
    styleUrls: ['./display.component.scss'],
})
export class DisplayComponent {
    svgElements$: Observable<SVGElement[]>;

    constructor(
        private _layoutService: LayoutService,
        private _svgService: SvgService,
        private _displayService: DisplayService
    ) {
        this.svgElements$ = this._displayService.currentRun$.pipe(
            map((currentRun) => this._layoutService.layout(currentRun).run),
            map((modifiedRun) =>
                this._svgService.createSvgElements(modifiedRun)
            )
        );
    }
}
