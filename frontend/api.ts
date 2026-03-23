import type { Graph, TVulnerabilityData, TFlowData } from "./types.ts";

const API = "http://127.0.0.1:8000";

export const getGraph = async (): Promise<Graph> => {
	const res = await fetch(`${API}/graph`);
	const data = await res.json();
	return data.graph;
};

export const computeMST = async (graph: Graph): Promise<any> => {
	const res = await fetch(`${API}/mst`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(graph),
	});
	return (await res.json()).mst;
};

export const computeVulnerability = async (
	graph: Graph,
): Promise<TVulnerabilityData> => {
	const res = await fetch(`${API}/vulnerability`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(graph),
	});
	return res.json();
};

export const computeFlow = async (graph: Graph): Promise<TFlowData> => {
	const res = await fetch(`${API}/max-flow`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(graph),
	});
	return res.json();
};

export const removeNode = async (
	graph: Graph,
	node_id: number,
): Promise<Graph> => {
	const res = await fetch(`${API}/graph/remove-node`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ graph, node_id }),
	});
	return (await res.json()).graph;
};
