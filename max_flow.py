from collections import defaultdict, deque


def build_capacity_graph(graph):
    # capacity[u][v] = сколько потока можно пропустить по ребру u -> v
    capacity = defaultdict(lambda: defaultdict(int))

    for u in graph.edges:
        for v, w in graph.edges[u]:
            # если между u и v несколько рёбер — суммируем их capacity
            capacity[u][v] += w  # пропускная способность

    return capacity


def edmonds_karp(graph, source, sinks):
    # строим остаточный граф (residual graph)
    capacity = build_capacity_graph(graph)

    # общий максимальный поток
    flow = 0

    # parent[v] = откуда пришли в v (для восстановления пути)
    parent = {}

    def bfs():
        """
        Поиск кратчайшего пути от source до любого sink
        в остаточной сети (по числу рёбер).
        """

        visited = set()

        # очередь для BFS
        queue = deque([source])
        visited.add(source)

        # очищаем родителей перед новым поиском пути
        parent.clear()

        while queue:
            u = queue.popleft()

            # проходим по всем соседям u
            for v in capacity[u]:

                # если вершина ещё не посещена
                # и есть доступная пропускная способность
                if v not in visited and capacity[u][v] > 0:

                    visited.add(v)
                    parent[v] = u  # запоминаем путь
                    queue.append(v)

                    # если достигли любого sink — путь найден
                    if v in sinks:
                        return v

        # путь не найден
        return None

    # основной цикл: ищем пути и увеличиваем поток
    while True:

        # ищем путь от source к sink
        sink = bfs()

        # если пути больше нет — алгоритм завершён
        if sink is None:
            break

        # ищем минимальную пропускную способность на пути
        # (это и есть bottleneck пути)
        path_flow = float("inf")

        s = sink
        while s != source:
            path_flow = min(path_flow, capacity[parent[s]][s])
            s = parent[s]

        # обновляем остаточный граф
        v = sink
        while v != source:
            u = parent[v]

            # уменьшаем пропускную способность по прямому ребру
            capacity[u][v] -= path_flow

            # увеличиваем по обратному ребру (можем "откатить" поток)
            capacity[v][u] += path_flow

            v = u

        # увеличиваем общий поток
        flow += path_flow

    return flow, capacity


def find_bottlenecks(original_graph, residual_capacity):
    """
    Ищем "бутылочные горлышки" — рёбра,
    которые полностью исчерпали свою пропускную способность.
    """

    bottlenecks = []

    for u in original_graph.edges:
        for v, w in original_graph.edges[u]:

            # если остаточная capacity == 0 → ребро полностью заполнено
            if residual_capacity[u][v] == 0:
                bottlenecks.append((u, v))

    return bottlenecks