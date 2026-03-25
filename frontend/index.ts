import {
	getGraph,
	computeMST,
	computeVulnerability,
	computeFlow,
	removeNode,
	removeEdge,
} from "./api";
import { draw } from "./renderer";
import type { Graph, TVulnerabilityData, TFlowData } from "./types.ts";

let graph: Graph;
let mst: any = null;
let vul: TVulnerabilityData | null = null;
let flow: TFlowData | null = null;

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const button = document.getElementById("generateBtn");
const stats = document.getElementById("stats");

const init = async (): Promise<void> => {
	graph = await getGraph();
	await recompute();
};

const distanceToSegment = (
	px: number,
	py: number,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): number => {
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

const recompute = async (): Promise<void> => {
	mst = await computeMST(graph);
	vul = await computeVulnerability(graph);
	flow = await computeFlow(graph);

	if (stats) {
		if (flow) {
			stats.innerHTML = `Источник: ${flow.source}`;
			stats.innerHTML += `<br/>Стоки: ${flow.sinks.join(", ")}`;
			stats.innerHTML += `<br/>Максимальный поток: ${flow.max_flow} литров`;

			if (flow.bottlenecks.length > 0) {
				const list = flow.bottlenecks
					.map(([u, v]) => `(${u} → ${v})`)
					.join(", ");

				stats.innerHTML += `<br/>Бутылочные горла: ${list}`;
			} else {
				stats.innerHTML += `<br/>Бутылочные горла: нет`;
			}
		}

		if (vul) {
			if (flow.bottlenecks.length > 0) {
				const list = vul.bridges
					.map(([u, v]) => `(${u} → ${v})`)
					.join(", ");

				stats.innerHTML += `<br/>Мосты: ${list}`;
			} else {
				stats.innerHTML += `<br/>Мосты: нет`;
			}

			if (vul.articulation_points.length > 0) {
				const list = vul.articulation_points
					.map((u) => `(${u})`)
					.join(", ");

				stats.innerHTML += `<br/>Критические узлы: ${list}`;
			} else {
				stats.innerHTML += `<br/>Критические узлы: нет`;
			}
		}
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

	// 1. Сначала проверяем узлы (как было)
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
		return;
	}

	// 2. Теперь проверяем рёбра
	let edgeToRemove: { u: number; v: number } | null = null;
	let edgeDist = 0.02; // чувствительность

	for (const e of graph.edges) {
		const u = graph.nodes.find((n) => n.id === e.u)!;
		const v = graph.nodes.find((n) => n.id === e.v)!;

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
