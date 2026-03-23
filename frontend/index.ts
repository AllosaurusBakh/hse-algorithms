import {
    getGraph,
    computeMST,
    computeVulnerability,
    computeFlow,
    removeNode,
} from "./api";
import { draw } from "./renderer";
import type { Graph, TVulnerabilityData, TFlowData } from "./types.ts";

let graph: Graph;
let mst: any = null;
let vul: TVulnerabilityData | null = null;
let flow: TFlowData | null = null;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const button = document.getElementById("generateBtn");

const init = async (): Promise<void> => {
    graph = await getGraph();
    await recompute();
};

const recompute = async (): Promise<void> => {
    mst = await computeMST(graph);
    vul = await computeVulnerability(graph);
    flow = await computeFlow(graph);

    draw(graph, mst, vul, flow);
};

if (button) {
    button.addEventListener("click", () => {
        init();
    });
}

canvas.addEventListener("click", async (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / 800;
    const y = (e.clientY - rect.top) / 800;

    let nearest: number | null = null;
    let minDist = 0.03;

    graph.nodes.forEach((n) => {
        const dx = n.x - x;
        const dy = n.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
            nearest = n.id;
            minDist = dist;
        }
    });

    if (nearest !== null) {
        graph = await removeNode(graph, nearest);
        await recompute();
    }
});
