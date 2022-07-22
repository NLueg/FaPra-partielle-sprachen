import { TestBed } from '@angular/core/testing';

import { Run } from '../../../classes/diagram/run';
import { RunToPnmlService } from './run-to-pnml.service';

describe('RunToPnmlService', () => {
    let service: RunToPnmlService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RunToPnmlService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should parse example run to pnml', () => {
        const result = service.parseRunToPnml(`my name.pnml`, exampleRun);

        expect(result).toEqual(parsedPnml);
    });
});

const parsedPnml = `<?xml version="1.0" encoding="UTF-8"?>

<pnml>
     <net id="" type="http://www.pnml.org/version-2009/grammar/ptnet">
          <name>
               <text>my name.pnml</text>
          </name>
          <page id="p1">
               <transition id="t1">
                    <name>
                         <text>t1</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="100" y="160"/>
                    </graphics>
               </transition>
               <transition id="t2">
                    <name>
                         <text>t2</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="300" y="160"/>
                    </graphics>
               </transition>
               <transition id="t3">
                    <name>
                         <text>t3</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="1100" y="160"/>
                    </graphics>
               </transition>
               <transition id="t4">
                    <name>
                         <text>t4</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="500" y="160"/>
                    </graphics>
               </transition>
               <transition id="t5">
                    <name>
                         <text>t5</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="700" y="160"/>
                    </graphics>
               </transition>
               <transition id="t6">
                    <name>
                         <text>t6</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="900" y="160"/>
                    </graphics>
               </transition>
               <place id="t1t2">
                    <name>
                         <text>t1t2</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="200" y="160"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t2t4">
                    <name>
                         <text>t2t4</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="400" y="160"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t4t3">
                    <name>
                         <text>t4t3</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="600" y="80"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t4t5">
                    <name>
                         <text>t4t5</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="600" y="240"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t5t3">
                    <name>
                         <text>t5t3</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="800" y="80"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t5t6">
                    <name>
                         <text>t5t6</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="800" y="240"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <place id="t6t3">
                    <name>
                         <text>t6t3</text>
                         <graphics>
                              <offset x="0" y="0"/>
                         </graphics>
                    </name>
                    <graphics>
                         <position x="1000" y="160"/>
                    </graphics>
                    <initialMarking>
                         <text>1</text>
                    </initialMarking>
               </place>
               <arc id="A"
                    source="t1" target="t1t2">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t1t2" target="t2">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t2" target="t2t4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t2t4" target="t4">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4" target="t4t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4t3" target="t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4" target="t4t5">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t4t5" target="t5">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5" target="t5t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5t3" target="t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5" target="t5t6">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t5t6" target="t6">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t6" target="t6t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
                <arc id="A"
                    source="t6t3" target="t3">
                    <inscription>
                         <text>1</text>
                    </inscription>
                    <graphics/>
               </arc>
          </page>
     </net>
</pnml>`;

const exampleRun: Run = {
    text: '.type ps\n.transitions\nt1\nt2\nt3\nt4\nt5\nt6\n.arcs\nt1 t2\nt2 t4\nt4 t3\nt4 t5\nt5 t3\nt5 t6\nt6 t3\n',
    arcs: [
        { source: 't1', target: 't2', breakpoints: [] },
        { source: 't2', target: 't4', breakpoints: [] },
        { source: 't4', target: 't3', breakpoints: [] },
        { source: 't4', target: 't5', breakpoints: [] },
        { source: 't5', target: 't3', breakpoints: [] },
        { source: 't5', target: 't6', breakpoints: [] },
        { source: 't6', target: 't3', breakpoints: [] },
    ],
    elements: [
        {
            label: 't1',
            incomingArcs: [],
            outgoingArcs: [],
        },
        {
            label: 't2',
            incomingArcs: [],
            outgoingArcs: [],
        },
        {
            label: 't3',
            incomingArcs: [],
            outgoingArcs: [],
        },
        {
            label: 't4',
            incomingArcs: [],
            outgoingArcs: [],
        },
        {
            label: 't5',
            incomingArcs: [],
            outgoingArcs: [],
        },
        {
            label: 't6',
            incomingArcs: [],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};
