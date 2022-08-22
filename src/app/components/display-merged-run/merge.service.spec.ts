import { TestBed } from '@angular/core/testing';

import { Run } from '../../classes/diagram/run';
import { MergeService } from './merge.service';

describe('MergeService', () => {
    let service: MergeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MergeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should merge example correctly', () => {
        const result = service.mergeRuns([
            firstExampleFirstRun,
            firstExampleSecondRun,
            secondExampleFirstRun,
            secondExampleSecondRun,
        ]);

        expect(result).toEqual({
            arcs: [
                {
                    breakpoints: [],
                    source: '0_t1',
                    target: '0_t2',
                },
                {
                    breakpoints: [],
                    source: '0_t2',
                    target: '0_t4',
                },
                {
                    breakpoints: [],
                    source: '0_t4',
                    target: '0_t7',
                },
                {
                    breakpoints: [],
                    source: '0_t2',
                    target: '0_t7',
                },
                {
                    breakpoints: [],
                    source: '0_t4',
                    target: '1_t5',
                },
                {
                    breakpoints: [],
                    source: '1_t5',
                    target: '1_t6',
                },
                {
                    breakpoints: [],
                    source: '1_t6',
                    target: '1_t3',
                },
                {
                    breakpoints: [],
                    source: '1_t5',
                    target: '1_t3',
                },
                {
                    breakpoints: [],
                    source: '0_t4',
                    target: '1_t3',
                },
                {
                    breakpoints: [],
                    source: '2_t6',
                    target: '2_t21',
                },
                {
                    breakpoints: [],
                    source: '2_t6',
                    target: '2_t22',
                },
                {
                    breakpoints: [],
                    source: '2_t22',
                    target: '2_t3',
                },
                {
                    breakpoints: [],
                    source: '2_t21',
                    target: '2_t3',
                },
                {
                    breakpoints: [],
                    source: '2_t6',
                    target: '3_t33',
                },
                {
                    breakpoints: [],
                    source: '2_t21',
                    target: '3_t10',
                },
            ],
            elements: [
                {
                    id: '0_t1',
                    incomingArcs: [],
                    label: 't1',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t1',
                            target: '0_t2',
                        },
                    ],
                },
                {
                    id: '0_t2',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t1',
                            target: '0_t2',
                        },
                    ],
                    label: 't2',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t2',
                            target: '0_t4',
                        },
                        {
                            breakpoints: [],
                            source: '0_t2',
                            target: '0_t7',
                        },
                    ],
                },
                {
                    id: '0_t4',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t2',
                            target: '0_t4',
                        },
                    ],
                    label: 't4',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '0_t7',
                        },
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '1_t5',
                        },
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '1_t3',
                        },
                    ],
                },
                {
                    id: '0_t7',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '0_t7',
                        },
                        {
                            breakpoints: [],
                            source: '0_t2',
                            target: '0_t7',
                        },
                    ],
                    label: 't7',
                    outgoingArcs: [],
                },
                {
                    id: '1_t3',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '1_t6',
                            target: '1_t3',
                        },
                        {
                            breakpoints: [],
                            source: '1_t5',
                            target: '1_t3',
                        },
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '1_t3',
                        },
                    ],
                    label: 't3',
                    outgoingArcs: [],
                },
                {
                    id: '1_t5',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '0_t4',
                            target: '1_t5',
                        },
                    ],
                    label: 't5',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '1_t5',
                            target: '1_t6',
                        },
                        {
                            breakpoints: [],
                            source: '1_t5',
                            target: '1_t3',
                        },
                    ],
                },
                {
                    id: '1_t6',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '1_t5',
                            target: '1_t6',
                        },
                    ],
                    label: 't6',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '1_t6',
                            target: '1_t3',
                        },
                    ],
                },
                {
                    id: '2_t6',
                    incomingArcs: [],
                    label: 't6',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '2_t21',
                        },
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '2_t22',
                        },
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '3_t33',
                        },
                    ],
                },
                {
                    id: '2_t21',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '2_t21',
                        },
                    ],
                    label: 't21',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t21',
                            target: '2_t3',
                        },
                        {
                            breakpoints: [],
                            source: '2_t21',
                            target: '3_t10',
                        },
                    ],
                },
                {
                    id: '2_t22',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '2_t22',
                        },
                    ],
                    label: 't22',
                    outgoingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t22',
                            target: '2_t3',
                        },
                    ],
                },
                {
                    id: '2_t3',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t22',
                            target: '2_t3',
                        },
                        {
                            breakpoints: [],
                            source: '2_t21',
                            target: '2_t3',
                        },
                    ],
                    label: 't3',
                    outgoingArcs: [],
                },
                {
                    id: '3_t33',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t6',
                            target: '3_t33',
                        },
                    ],
                    label: 't33',
                    outgoingArcs: [],
                },
                {
                    id: '3_t10',
                    incomingArcs: [
                        {
                            breakpoints: [],
                            source: '2_t21',
                            target: '3_t10',
                        },
                    ],
                    label: 't10',
                    outgoingArcs: [],
                },
            ],
            text: '.type run\n.events\n0_t1 | t1\n0_t2 | t2\n0_t4 | t4\n0_t7 | t7\n1_t3 | t3\n1_t5 | t5\n1_t6 | t6\n2_t6 | t6\n2_t21 | t21\n2_t22 | t22\n2_t3 | t3\n3_t33 | t33\n3_t10 | t10\n.arcs\n0_t1 0_t2\n0_t2 0_t4\n0_t4 0_t7\n0_t2 0_t7\n0_t4 1_t5\n1_t5 1_t6\n1_t6 1_t3\n1_t5 1_t3\n0_t4 1_t3\n2_t6 2_t21\n2_t6 2_t22\n2_t22 2_t3\n2_t21 2_t3\n2_t6 3_t33\n2_t21 3_t10',
            warnings: [],
        });
    });
});

const firstExampleFirstRun: Run = {
    text: '.type run\r\n.events\r\nt1\r\nt2\r\nt4\r\nt7\r\n.arcs\r\nt1 t2\r\nt2 t4\r\nt4 t7\r\nt2 t7\r\n',
    arcs: [
        { source: 't1', target: 't2', breakpoints: [] },
        { source: 't2', target: 't4', breakpoints: [] },
        { source: 't4', target: 't7', breakpoints: [] },
        { source: 't2', target: 't7', breakpoints: [] },
    ],
    elements: [
        {
            id: 't1',
            label: 't1',
            incomingArcs: [],
            outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
        },
        {
            id: 't2',
            label: 't2',
            incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
            outgoingArcs: [
                { source: 't2', target: 't4', breakpoints: [] },
                { source: 't2', target: 't7', breakpoints: [] },
            ],
        },
        {
            id: 't4',
            label: 't4',
            incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
            outgoingArcs: [{ source: 't4', target: 't7', breakpoints: [] }],
        },
        {
            id: 't7',
            label: 't7',
            incomingArcs: [
                { source: 't4', target: 't7', breakpoints: [] },
                { source: 't2', target: 't7', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};

const firstExampleSecondRun: Run = {
    text: '.type run\r\n.events\r\nt1\r\nt2\r\nt3\r\nt4\r\nt5\r\nt6\r\n.arcs\r\nt1 t2\r\nt2 t4\r\nt4 t5\r\nt5 t6\r\nt6 t3\r\nt5 t3\r\nt4 t3\r\n',
    arcs: [
        { source: 't1', target: 't2', breakpoints: [] },
        { source: 't2', target: 't4', breakpoints: [] },
        { source: 't4', target: 't5', breakpoints: [] },
        { source: 't5', target: 't6', breakpoints: [] },
        { source: 't6', target: 't3', breakpoints: [] },
        { source: 't5', target: 't3', breakpoints: [] },
        { source: 't4', target: 't3', breakpoints: [] },
    ],
    elements: [
        {
            id: 't1',
            label: 't1',
            incomingArcs: [],
            outgoingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
        },
        {
            id: 't2',
            label: 't2',
            incomingArcs: [{ source: 't1', target: 't2', breakpoints: [] }],
            outgoingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
        },
        {
            id: 't3',
            label: 't3',
            incomingArcs: [
                { source: 't6', target: 't3', breakpoints: [] },
                { source: 't5', target: 't3', breakpoints: [] },
                { source: 't4', target: 't3', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
        {
            id: 't4',
            label: 't4',
            incomingArcs: [{ source: 't2', target: 't4', breakpoints: [] }],
            outgoingArcs: [
                { source: 't4', target: 't5', breakpoints: [] },
                { source: 't4', target: 't3', breakpoints: [] },
            ],
        },
        {
            id: 't5',
            label: 't5',
            incomingArcs: [{ source: 't4', target: 't5', breakpoints: [] }],
            outgoingArcs: [
                { source: 't5', target: 't6', breakpoints: [] },
                { source: 't5', target: 't3', breakpoints: [] },
            ],
        },
        {
            id: 't6',
            label: 't6',
            incomingArcs: [{ source: 't5', target: 't6', breakpoints: [] }],
            outgoingArcs: [{ source: 't6', target: 't3', breakpoints: [] }],
        },
    ],
    warnings: [],
};

const secondExampleFirstRun: Run = {
    text: '.type run\r\n.events\r\nt6\r\nt21\r\nt22\r\nt3\r\n.arcs\r\nt6 t21\r\nt6 t22\r\nt22 t3\r\nt21 t3',
    arcs: [
        { source: 't6', target: 't21', breakpoints: [] },
        { source: 't6', target: 't22', breakpoints: [] },
        { source: 't22', target: 't3', breakpoints: [] },
        { source: 't21', target: 't3', breakpoints: [] },
    ],
    elements: [
        {
            id: 't6',
            label: 't6',
            incomingArcs: [],
            outgoingArcs: [
                { source: 't6', target: 't21', breakpoints: [] },
                { source: 't6', target: 't22', breakpoints: [] },
            ],
        },
        {
            id: 't21',
            label: 't21',
            incomingArcs: [{ source: 't6', target: 't21', breakpoints: [] }],
            outgoingArcs: [{ source: 't21', target: 't3', breakpoints: [] }],
        },
        {
            id: 't22',
            label: 't22',
            incomingArcs: [{ source: 't6', target: 't22', breakpoints: [] }],
            outgoingArcs: [{ source: 't22', target: 't3', breakpoints: [] }],
        },
        {
            id: 't3',
            label: 't3',
            incomingArcs: [
                { source: 't22', target: 't3', breakpoints: [] },
                { source: 't21', target: 't3', breakpoints: [] },
            ],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};

const secondExampleSecondRun: Run = {
    text: '.type run\r\n.events\r\nt6\r\nt21\r\nt33\r\nt10\r\n.arcs\r\nt6 t21\r\nt6 t33\r\nt21 t10',
    arcs: [
        { source: 't6', target: 't21', breakpoints: [] },
        { source: 't6', target: 't33', breakpoints: [] },
        { source: 't21', target: 't10', breakpoints: [] },
    ],
    elements: [
        {
            id: 't6',
            label: 't6',
            incomingArcs: [],
            outgoingArcs: [
                { source: 't6', target: 't21', breakpoints: [] },
                { source: 't6', target: 't33', breakpoints: [] },
            ],
        },
        {
            id: 't21',
            label: 't21',
            incomingArcs: [{ source: 't6', target: 't21', breakpoints: [] }],
            outgoingArcs: [{ source: 't21', target: 't10', breakpoints: [] }],
        },
        {
            id: 't33',
            label: 't33',
            incomingArcs: [{ source: 't6', target: 't33', breakpoints: [] }],
            outgoingArcs: [],
        },
        {
            id: 't10',
            label: 't10',
            incomingArcs: [{ source: 't21', target: 't10', breakpoints: [] }],
            outgoingArcs: [],
        },
    ],
    warnings: [],
};
