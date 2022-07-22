import { Injectable } from '@angular/core';

import { Arc } from '../../../classes/diagram/arc';
import { Element } from '../../../classes/diagram/element';
import { Run } from '../../../classes/diagram/run';
import { LayoutService } from '../../layout.service';

const encoding = '<?xml version="1.0" encoding="UTF-8"?>\n';

@Injectable({
    providedIn: 'root',
})
export class RunToPnmlService {
    constructor(private _layoutService: LayoutService) {}

    parseRunToPnml(name: string, run: Run): string {
        const { parsedRun, places } = this.layoutRun(run);

        const parsedPlaces = parsedRun.elements.filter((element) =>
            places.find((place) => element.label === place.label)
        );

        const transitionText = parsedRun.elements
            .filter(
                (element) =>
                    !places.find((place) => element.label === place.label)
            )
            .map((element) => parseTransition(element))
            .join(`\n`);

        const placesText = parsePlaces(parsedPlaces);
        const arcsText = parseArcs(parsedRun);

        return `${encoding}
<pnml>
     <net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">
          <name>
               <text>${name}</text>
          </name>
          <page id="p1">\n${transitionText}\n${placesText}\n${arcsText}
          </page>
     </net>
</pnml>`;
    }

    private layoutRun(run: Run): { parsedRun: Run; places: Element[] } {
        const places: Element[] = run.arcs.map((arc) => ({
            label: getPlaceNameByArc(arc),
            incomingArcs: [],
            outgoingArcs: [],
        }));

        const newArcArray: Arc[] = run.arcs.flatMap((arc) => {
            const placeName = getPlaceNameByArc(arc);
            return [
                { source: arc.source, target: placeName, breakpoints: [] },
                { source: placeName, target: arc.target, breakpoints: [] },
            ];
        });

        const parsedRun = this._layoutService.layout({
            arcs: newArcArray,
            elements: [...run.elements, ...places],
            warnings: [],
            text: '',
        }).run;

        return {
            places,
            parsedRun,
        };
    }
}

function parseTransition(transition: Element): string {
    return `               <transition id="${transition.label}">
                    <name>
                         <text>${transition.label}</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="${transition.x ?? 0}" y="${
        transition.y ?? 0
    }"/>
                    </graphics>
               </transition>`;
}

function parsePlaces(places: Element[]): string {
    return places
        .map((place) => {
            return `               <place id="${place.label}">
                    <name>
                         <text>${place.label}</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="${place.x ?? 0}" y="${place.y ?? 0}"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>`;
        })
        .join(`\n`);
}

function parseArcs(run: Run): string {
    return run.arcs
        .map(
            (arc) => `               <arc id="A"
                    source="${arc.source}" target="${arc.target}">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>`
        )
        .join(`\n `);
}

function getPlaceNameByArc(arc: Arc): string {
    return `${arc.source}${arc.target}`;
}
