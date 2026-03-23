from collections import defaultdict, deque


def build_capacity_graph(graph):
    capacity = defaultdict(lambda: defaultdict(int))

    for u in graph.edges:
        for v, w in graph.edges[u]:
            capacity[u][v] += w  # пропускная способность

    return capacity


def edmonds_karp(graph, source, sinks):
    capacity = build_capacity_graph(graph)
    flow = 0
    parent = {}

    def bfs():
        visited = set()
        queue = deque([source])
        visited.add(source)
        parent.clear()

        while queue:
            u = queue.popleft()
            for v in capacity[u]:
                if v not in visited and capacity[u][v] > 0:
                    visited.add(v)
                    parent[v] = u
                    queue.append(v)

                    if v in sinks:
                        return v
        return None

    while True:
        sink = bfs()
        if sink is None:
            break

        # ищем минимальную пропускную способность по пути
        path_flow = float("inf")
        s = sink
        while s != source:
            path_flow = min(path_flow, capacity[parent[s]][s])
            s = parent[s]

        # обновляем остаточную сеть
        v = sink
        while v != source:
            u = parent[v]
            capacity[u][v] -= path_flow
            capacity[v][u] += path_flow
            v = u

        flow += path_flow

    return flow, capacity


def find_bottlenecks(original_graph, residual_capacity):
    bottlenecks = []

    for u in original_graph.edges:
        for v, w in original_graph.edges[u]:
            if residual_capacity[u][v] == 0:
                bottlenecks.append((u, v))

    return bottlenecks