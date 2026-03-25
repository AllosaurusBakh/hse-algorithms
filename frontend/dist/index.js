import { getGraph, computeMST, computeVulnerability, computeFlow, removeNode, removeEdge, } from "./api.js";
import { draw } from "./renderer.js";
let graph;
let mst = null;
let vul = null;
let flow = null;
const canvas = document.getElementById("canvas");
const button = document.getElementById("generateBtn");
const sourceEl = document.getElementById("source");
const sinkEl = document.getElementById("sink");
const maxFlowEl = document.getElementById("max_flow");
const bottleneckEl = document.getElementById("bottleneck");
const bridgesEl = document.getElementById("bridges");
const articulationEl = document.getElementById("articulation_points");
const init = async () => {
    graph = await getGraph();
    await recompute();
};
const distanceToSegment = (px, py, x1, y1, x2, y2) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let t = dot / lenSq;
    t = Math.max(0, Math.min(1, t));
    const projX = x1 + t * C;
    const projY = y1 + t * D;
    const dx = px - projX;
    const dy = py - projY;
    return Math.sqrt(dx * dx + dy * dy);
};
const recompute = async () => {
    mst = await computeMST(graph);
    vul = await computeVulnerability(graph);
    flow = await computeFlow(graph);
    if (flow) {
        sourceEl.textContent = `Источник: ${flow.source}`;
        sinkEl.textContent = `Стоки: ${flow.sinks.join(", ")}`;
        maxFlowEl.textContent = `Максимальный поток: ${flow.max_flow} литров`;
        bottleneckEl.textContent =
            flow.bottlenecks.length > 0
                ? `Бутылочные горла: ${flow.bottlenecks
                    .map(([u, v]) => `(${u} → ${v})`)
                    .join(", ")}`
                : "Бутылочные горла: нет";
    }
    if (vul) {
        bridgesEl.textContent =
            vul.bridges.length > 0
                ? `Мосты: ${vul.bridges
                    .map(([u, v]) => `(${u} → ${v})`)
                    .join(", ")}`
                : "Мосты: нет";
        articulationEl.textContent =
            vul.articulation_points.length > 0
                ? `Критические узлы: ${vul.articulation_points
                    .map((u) => `(${u})`)
                    .join(", ")}`
                : "Критические узлы: нет";
    }
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
    const mapNodes = new Map();
    // 1. Проверяем узлы
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
        if (!mapNodes.has(n.id)) {
            mapNodes.set(n.id, { x: n.x, y: n.y });
        }
    });
    if (nearest !== null) {
        graph = await removeNode(graph, nearest);
        await recompute();
        return;
    }
    // 2.Проверяем рёбра
    let edgeToRemove = null;
    let edgeDist = 0.02;
    for (const e of graph.edges) {
        const u = mapNodes.get(e.u);
        const v = mapNodes.get(e.v);
        if (!u || !v) {
            continue;
        }
        const dist = distanceToSegment(x, y, u.x, u.y, v.x, v.y);
        if (dist < edgeDist) {
            edgeToRemove = { u: e.u, v: e.v };
            edgeDist = dist;
        }
    }
    if (edgeToRemove) {
        graph = await removeEdge(graph, edgeToRemove.u, edgeToRemove.v);
        await recompute();
    }
});
