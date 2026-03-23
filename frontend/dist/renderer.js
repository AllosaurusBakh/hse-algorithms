const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
export const draw = (graph, mst, vul, flow) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!graph)
        return;
    // Рёбра
    graph.edges.forEach((e) => {
        const u = graph.nodes.find((n) => n.id === e.u);
        const v = graph.nodes.find((n) => n.id === e.v);
        ctx.beginPath();
        ctx.moveTo(u.x * 800, u.y * 800);
        ctx.lineTo(v.x * 800, v.y * 800);
        ctx.strokeStyle = "lightgray";
        ctx.lineWidth = 1;
        if (mst?.some((m) => (m[0] === e.u && m[1] === e.v) ||
            (m[0] === e.v && m[1] === e.u))) {
            ctx.strokeStyle = "green";
            ctx.lineWidth = 3;
        }
        if (flow?.bottlenecks.some((b) => (b[0] === e.u && b[1] === e.v) ||
            (b[0] === e.v && b[1] === e.u))) {
            ctx.strokeStyle = "blue";
            ctx.lineWidth = 4;
        }
        if (vul?.bridges.some((b) => (b[0] === e.u && b[1] === e.v) ||
            (b[0] === e.v && b[1] === e.u))) {
            ctx.strokeStyle = "red";
            ctx.lineWidth = 4;
        }
        ctx.stroke();
    });
    // Узлы
    graph.nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x * 800, n.y * 800, 6, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        if (vul?.articulation_points.includes(n.id)) {
            ctx.fillStyle = "yellow";
        }
        ctx.fill();
    });
};
