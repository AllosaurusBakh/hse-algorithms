export type TNode = {
	id: number;
	x: number;
	y: number;
};

export type TEdge = {
	u: number;
	v: number;
	w: number;
};

export type Graph = {
	nodes: Array<TNode>;
	edges: Array<TEdge>;
	obstacles?: Array<{ id: string; x: number; y: number }>;
};

export type TVulnerabilityData = {
	bridges: Array<[number, number]>;
	articulation_points: Array<number>;
};

export type TFlowData = {
	source: number;
	sinks: Array<number>;
	max_flow: number;
	bottlenecks: Array<[number, number]>;
};
