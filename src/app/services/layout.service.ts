import { Injectable } from '@angular/core';

import { Arc, Breakpoint } from '../classes/diagram/arc';
import { Element } from '../classes/diagram/element';
import { Run } from '../classes/diagram/run';

@Injectable({
    providedIn: 'root',
})
export class LayoutService {
    private static readonly MIN_HEIGHT = 400;
    private static readonly OFFSET = 20;
    private static readonly RANGE = 300;
    private static readonly ELEMENT_HEIGHT = 80;
    private static readonly LAYER_WIDTH = 100;

    public layout(run: Run): void {
        run.clearPositioningData();
        //if run hast no cycles use sugiyama layout
        if (!run.hasCycles()) {
            const layers = this.assignLayers(run);
            this.addBreakpoints(layers);
            this.minimizeCrossing(layers);
            this.calculatePosition(layers);
        } else {
            run.elements.forEach((el) => {
                el.x =
                    Math.floor(Math.random() * LayoutService.RANGE) +
                    LayoutService.OFFSET;
                el.y =
                    Math.floor(Math.random() * LayoutService.RANGE) +
                    LayoutService.OFFSET;
            });
        }
    }

    /**
     * Sets the layer of all elements of the run
     * All elements without incoming arcs are assigned to the next layer
     * The outgoing arcs of all elements in the current layer are deleted to identify the next layer
     * @param run run for which the layout is to be determined
     * @returns layers with elements and breakpoints
     */
    private assignLayers(run: Run): Array<Element[]> {
        const layers = new Array<Element[]>();
        const elements = [...run.elements];
        let arcs = run.arcs;

        while (elements.length > 0) {
            const layer = new Array<Element>();
            const elementsWithIncomingArcs = arcs.map((a) => a.targetEl);
            //filter all elements without incoming arcs => add them to the current layer and remove their outgoing arcs
            elements
                .filter((e) => elementsWithIncomingArcs.indexOf(e) === -1)
                .forEach((e) => {
                    layer.push(e);
                    elements.splice(elements.indexOf(e), 1);
                    arcs = arcs.filter((a) => e.outgoingArcs.indexOf(a) === -1);
                });
            layers.push(layer);
        }
        return layers;
    }

    /**
     * Adds breakpoints to layers for arcs if there are layers between the source and target elements
     * 1. Loop through all layers
     *  2. Loop through all elements in the layer
     *   3. Loop through all outgoing arcs of the element
     *    4. check distance/layers between arc source and target
     *     5. add breakpoint to arc for each enclosed layer
     * @param layers layers with elements and breakpoints
     */
    private addBreakpoints(layers: Array<(Element | Breakpoint)[]>): void {
        for (let i = 0; i < layers.length - 1; i++) {
            layers[i].forEach((elm) => {
                //element loop
                if (elm instanceof Element) {
                    elm.outgoingArcs.forEach((a) => {
                        //arc loop
                        const target = a.targetEl;
                        //find layer of target
                        const targetLayerIndx = layers.findIndex(
                            (l) => l.findIndex((e) => e === target) >= 0
                        );

                        for (let y = i + 1; y < targetLayerIndx; y++) {
                            const b: Breakpoint = {
                                x: 0,
                                y: 0,
                                arc: a,
                            };
                            a.breakpoints.push(b);
                            layers[y].push(b);
                        }
                    });
                }
            });
        }
    }

    /**
     * Rearrange order of elements/breakpoints per layer to minimize crossing of lines
     * For every layer check to optimal ordering with the lowest crossing of incoming and outgoing lines
     * Note: This will not always find the optimal order throughout all layers!
     * @param layers layers with elements and breakpoints
     */
    private minimizeCrossing(layers: Array<(Element | Breakpoint)[]>): void {
        layers.forEach((layer, index) => {
            const layerTmp = new Array<Element | Breakpoint>();
            this.reorderLayer(layers, layer, index, 0, layerTmp);
            layer.splice(0, layer.length);
            layer.push(...layerTmp);
        });
    }

    /**
     * Find the optimal order for a single layer
     * @param layers all layers
     * @param layer current layer
     * @param layerIndex index of current layer
     * @param currentLayerPositon current position in the layer which must be filled with an element
     * @param reorderedLayer layer with rearranged order
     * @returns number of crossings
     */
    private reorderLayer(
        layers: Array<(Element | Breakpoint)[]>,
        layer: (Element | Breakpoint)[],
        layerIndex: number,
        currentLayerPositon: number,
        reorderedLayer: (Element | Breakpoint)[]
    ): number {
        let min = this.countCrossings(layers, layerIndex);
        let minLayer = layer;

        if (currentLayerPositon == layer.length - 1) {
            const crossings = this.countCrossings(layers, layerIndex);
            if (crossings < min) {
                min = crossings;
                minLayer = [...layer];
            }
        } else {
            //Loop through all remaining elements and set each element once to the current position
            for (let i = currentLayerPositon + 1; i < layer.length; i++) {
                const tmp = layer[currentLayerPositon];
                layer[currentLayerPositon] = layer[i];
                layer[i] = tmp;

                const layerTmp = new Array<Element | Breakpoint>();
                const crossings = this.reorderLayer(
                    layers,
                    layer,
                    layerIndex,
                    currentLayerPositon + 1,
                    layerTmp
                );
                if (crossings < min) {
                    min = crossings;
                    minLayer = layerTmp;
                }

                layer[i] = layer[currentLayerPositon];
                layer[currentLayerPositon] = tmp;
            }
        }

        reorderedLayer.push(...minLayer);
        return min;
    }

    /**
     * Identifies the number of crossing between the actual and previous/next layer
     * @param layers all layers
     * @param layerIndex index of the current layer
     * @returns number of crossings
     */
    private countCrossings(
        layers: Array<(Element | Breakpoint)[]>,
        layerIndex: number
    ): number {
        const connections: ElementArrows = {
            incoming: [],
            outgoing: [],
        };
        console.log(layers);
        layers[layerIndex].forEach((e, index) => {
            const layerInfo = {
                layers,
                index,
                layerIndex,
            };
            if (e instanceof Element) {
                //Check outgoing and incomoing lines from element to the next/previous breakpoint or element
                connections.incoming.push(
                    ...this.findIncomingConnections(e.incomingArcs, layerInfo)
                );
                connections.outgoing.push(
                    ...this.findOutgoingConnections(e.outgoingArcs, layerInfo)
                );
            } else {
                this.getElementArrowsFromBreakpoint(connections, e, layerInfo);
            }
        });

        return (
            this.calculateCrossings(connections.incoming) +
            this.calculateCrossings(connections.outgoing)
        );
    }

    private getElementArrowsFromBreakpoint(
        connections: ElementArrows,
        breakpoint: Breakpoint,
        layerInfo: LayerInfoParameter
    ): void {
        //check incoming and outgoing line from breakpoint to the next/previous breakpoint or element
        let prev: Element | Breakpoint | undefined;
        let next: Element | Breakpoint | undefined;

        const layers = layerInfo.layers;
        const index = layerInfo.index;
        const layerIndex = layerInfo.layerIndex;
        const bIdx = breakpoint.arc.breakpoints.indexOf(breakpoint);

        if (bIdx == 0 && breakpoint.arc.sourceEl) {
            prev = breakpoint.arc.sourceEl;
        } else if (bIdx > 0) {
            prev = breakpoint.arc.breakpoints[bIdx - 1];
        }

        if (
            bIdx == breakpoint.arc.breakpoints.length - 1 &&
            breakpoint.arc.targetEl
        ) {
            next = breakpoint.arc.targetEl;
        } else if (breakpoint.arc.breakpoints.length > bIdx + 1) {
            next = breakpoint.arc.breakpoints[bIdx + 1];
        }

        if (prev)
            connections.incoming.push({
                sourcePos: layers[layerIndex - 1].indexOf(prev),
                targetPos: index,
            });
        if (next)
            connections.outgoing.push({
                sourcePos: index,
                targetPos: layers[layerIndex + 1].indexOf(next),
            });
    }

    /**
     *
     * @param arcs
     * @param layerInfo
     * @private
     */
    private findIncomingConnections(
        arcs: Arc[],
        layerInfo: LayerInfoParameter
    ) {
        // TODO: Am Anfang ein Arc zu viel
        console.log(arcs);
        console.log(layerInfo);

        const layers = layerInfo.layers;
        const index = layerInfo.index;
        const layerIndex = layerInfo.layerIndex;
        const incomings = new Array<Connection>();
        arcs.forEach((arc) => {
            let sourcePos: number | undefined;
            if (arc.breakpoints.length > 0) {
                sourcePos = layers[layerIndex - 1].indexOf(
                    arc.breakpoints[arc.breakpoints.length - 1]
                );
            } else if (arc.sourceEl) {
                sourcePos = layers[layerIndex - 1].indexOf(arc.sourceEl);
            }

            if (sourcePos)
                incomings.push({
                    sourcePos: sourcePos,
                    targetPos: index,
                });
        });
        return incomings;
    }

    /**
     *
     * @param arcs
     * @param layerInfo
     * @private
     */
    private findOutgoingConnections(
        arcs: Arc[],
        layerInfo: LayerInfoParameter
    ): Connection[] {
        const layers = layerInfo.layers;
        const index = layerInfo.index;
        const layerIndex = layerInfo.layerIndex;
        const outgoings = new Array<Connection>();
        arcs.forEach((arc) => {
            let targetPos: number | undefined;
            if (arc.breakpoints.length > 0) {
                targetPos = layers[layerIndex + 1].indexOf(arc.breakpoints[0]);
            } else if (arc.targetEl) {
                targetPos = layers[layerIndex + 1].indexOf(arc.targetEl);
            }

            if (targetPos)
                outgoings.push({
                    sourcePos: index,
                    targetPos: targetPos,
                });
        });
        return outgoings;
    }

    /**
     *
     * @param connections
     * @private
     */
    private calculateCrossings(connections: Array<Connection>): number {
        let crossings = 0;
        connections.forEach((e, index) => {
            for (let i = index + 1; i < connections.length; i++) {
                if (
                    (e.sourcePos < connections[i].sourcePos &&
                        e.targetPos > connections[i].targetPos) ||
                    (e.sourcePos > connections[i].sourcePos &&
                        e.targetPos < connections[i].targetPos)
                ) {
                    crossings++;
                }
            }
        });
        return crossings;
    }

    /**
     * Sets the position of elements and breakpoints based on their layer and location in the layer
     * @param layers layers with elements and breakpoints
     */
    private calculatePosition(layers: Array<(Element | Breakpoint)[]>): void {
        let height = LayoutService.MIN_HEIGHT;

        //calculate the diagram height based on the largest layer
        layers.forEach((layer) => {
            height = Math.max(
                height,
                layer.length * LayoutService.ELEMENT_HEIGHT
            );
        });

        layers.forEach((layer, index) => {
            const s = layer.length;
            const offsetY =
                (height - s * LayoutService.ELEMENT_HEIGHT) / (s + 1);

            const offsetX = LayoutService.LAYER_WIDTH * (index + 1);

            layer.forEach((el, idx) => {
                el.x = offsetX;
                el.y = offsetY * (idx + 1) + idx * LayoutService.ELEMENT_HEIGHT;
            });
        });
    }
}

type Connection = {
    sourcePos: number;
    targetPos: number;
};

type ElementArrows = {
    incoming: Connection[];
    outgoing: Connection[];
};

type LayerInfoParameter = {
    layers: Array<(Element | Breakpoint)[]>;
    layerIndex: number;
    index: number;
};
