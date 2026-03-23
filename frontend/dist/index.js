import { getGraph, computeMST, computeVulnerability, computeFlow, removeNode, } from "./api.js";
import { draw } from "./renderer.js";
let graph;
let mst = null;
let vul = null;
let flow = null;
const canvas = document.getElementById("canvas");
const button = document.getElementById("generateBtn");
const init = async () => {
    graph = await getGraph();
    await recompute();
};
const recompute = async () => {
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
    let nearest = null;
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
