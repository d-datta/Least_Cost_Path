onload = function () {
  let cur_data, V, src, dst;

  const container1 = document.getElementById("container1");
  const mynetwork = this.document.getElementById("mynetwork");
  const btnGen = document.getElementById("generate-graph");
  const solve = this.document.getElementById("solve");
  const temptext = document.getElementById("temptext");
  const temptext2 = document.getElementById("temptext2");

  const cities = [
    "Kolkata",
    "Bengaluru",
    "Mumbai",
    "Delhi",
    "Varanasi",
    "Madurai",
    "Patna",
    "Ahmedabad",
    "Chandigarh",
    "Kanpur",
    "Ranchi",
  ];

  //using vis.js library initialising options
  const options = {
    nodes: {
      //fixed: false,
      font: "12px arial red",
      scaling: {
        label: true,
      },
      shadow: true,
      shape: "icon",
      icon: {
        face: "FontAwesome",
        code: "\uf64f",
        size: 40,
      },
    },

    edges: {
      //arrows: "to, from",
      color: "red",
      font: { size: 20 },
      scaling: {
        label: true,
      },
      shadow: true,
      smooth: true,
    },
  };

  // initializing the network!

  //for the new graph
  const network = new vis.Network(container1);
  network.setOptions(options);

  //result for the graph
  const network2 = new vis.Network(mynetwork);
  network2.setOptions(options);

  function createData() {
    V = Math.floor(Math.random() * 8) + 3; // range of V-->[0,7]+3==[3,10]
    let nodes = [];
    for (let i = 1; i <= V; i++) {
      //each node is a object  having props--> id,label
      nodes.push({ id: i, label: cities[i - 1] });
    }
    // Prepares vis.js style nodes for our data
    nodes = new vis.DataSet(nodes);

    // Creating a tree like underlying graph structure
    let edges = [];
    for (let i = 2; i <= V; i++) {
      let nbr = i - Math.floor(Math.random() * Math.min(i - 1, 3) + 1); // *** Picks a neighbour from i-3 to i-1
      edges.push({
        type: 0,
        from: i,
        to: nbr,
        color: "orange",
        label: String(Math.floor(Math.random() * 70) + 31),
      });
    }

    // Randomly adding new edges to graph
    // Type of bus is 0
    // Type of plane is 1
    for (let i = 1; i <= V / 2; ) {
      let n1 = Math.floor(Math.random() * V) + 1;
      let n2 = Math.floor(Math.random() * V) + 1;
      if (n1 !== n2) {
        if (n1 < n2) {
          let tmp = n1;
          n1 = n2;
          n2 = tmp;
        }
        // Seeing if an edge between these two vertices already exists
        // And if it does then of which kind
        let works = 0;
        for (let j = 0; j < edges.length; j++) {
          if (edges[j]["from"] === n1 && edges[j]["to"] === n2) {
            if (edges[j]["type"] === 0) works = 1;
            else works = 2;
          }
        }

        // Adding edges to the graph
        // If works == 0, you can add bus as well as plane between vertices
        // If works == 1, you can only add plane between them
        if (works <= 1) {
          if (works === 0 && i < V / 4) {
            // Adding a bus
            edges.push({
              type: 0,
              from: n1,
              to: n2,
              color: "orange",
              label: String(Math.floor(Math.random() * 70) + 31),
            });
          } else {
            // Adding a plane
            edges.push({
              type: 1,
              from: n1,
              to: n2,
              color: "green",
              label: String(Math.floor(Math.random() * 50) + 1),
            });
          }
          i++;
        }
      }
    }

    // Setting the new values of global variables
    src = 1;
    dst = V;
    cur_data = {
      nodes: nodes,
      edges: edges,
    };
  }

  btnGen.onclick = function () {
    //create new dataset and display the same
    createData();
    network.setData(cur_data);
    temptext2.innerText =
      "Find least cost path from " + cities[src - 1] + " to " + cities[dst - 1];
    temptext.style.display = "inline";
    temptext2.style.display = "inline";
    mynetwork.style.display = "none";
  };

  solve.onclick = function () {
    //create result graph from the given one and display it
    temptext.style.display = "none";
    temptext2.style.display = "none";
    mynetwork.style.display = "inline";
    network2.setData(solveData());
  };

  function createGraph(data) {
    let graph = [];
    for (let i = 1; i <= V; i++) {
      graph.push([]);
    }

    for (let i = 0; i < data["edges"].length; i++) {
      let edge = data["edges"][i];
      if (edge["type"] === 1) continue;
      graph[edge["to"] - 1].push([edge["from"] - 1, parseInt(edge["label"])]);
      graph[edge["from"] - 1].push([edge["to"] - 1, parseInt(edge["label"])]);
    }
    return graph;
  }

  function dijkstra(graph, V, src) {
    let vis = Array(V).fill(0);
    let dis = [];

    for (let i = 0; i < V; i++) {
      dis.push([40000, -1]);
    }

    dis[src][0] = 0;

    for (let i = 0; i < V - 1; i++) {
      let min_dis_node = -1;

      for (let j = 0; j < V; j++) {
        if (vis[j] == 0) {
          if (min_dis_node == -1 || dis[j][0] < dis[min_dis_node][0]) {
            min_dis_node = j;
          }
        }
      }

      vis[min_dis_node] = 1;

      for (let nbr = 0; nbr < graph[min_dis_node].length; nbr++) {
        let nbr_node = graph[min_dis_node][nbr];

        if (
          vis[nbr_node[0]] == 0 &&
          dis[nbr_node[0]][0] > dis[min_dis_node][0] + nbr_node[1]
        ) {
          dis[nbr_node[0]][0] = dis[min_dis_node][0] + nbr_node[1];

          dis[nbr_node[0]][1] = min_dis_node;
        }
      }
    }

    return dis;
  }

  function shouldTakePlane(edges, dist1, dist2, mn_dist) {
    let plane = 0;
    let p1 = -1,
      p2 = -1;
    for (let pos in edges) {
      let edge = edges[pos];
      if (edge["type"] === 1) {
        let to = edge["to"] - 1;
        let from = edge["from"] - 1;
        let wght = parseInt(edge["label"]);
        if (dist1[to][0] + wght + dist2[from][0] < mn_dist) {
          plane = wght;
          p1 = to;
          p2 = from;
          mn_dist = dist1[to][0] + wght + dist2[from][0];
        }
        if (dist2[to][0] + wght + dist1[from][0] < mn_dist) {
          plane = wght;
          p2 = to;
          p1 = from;
          mn_dist = dist2[to][0] + wght + dist1[from][0];
        }
      }
    }
    return { plane, p1, p2 };
  }

  function solveData() {
    const data = cur_data;

    // Creating adjacency list matrix graph from question data
    const graph = createGraph(data);

    // Applying djikstra from src and dst
    let dist1 = dijkstra(graph, V, src - 1);
    let dist2 = dijkstra(graph, V, dst - 1);

    // Initialise min_dist to min distance via bus from src to dst
    let mn_dist = dist1[dst - 1][0];

    // See if plane should be used
    let { plane, p1, p2 } = shouldTakePlane(
      data["edges"],
      dist1,
      dist2,
      mn_dist
    );

    let new_edges = [];
    if (plane !== 0) {
      new_edges.push({
        arrows: { to: { enabled: true } },
        from: p1 + 1,
        to: p2 + 1,
        color: "green",
        label: String(plane),
      });
      // Using spread operator to push elements of result of pushEdges to new_edges
      new_edges.push(...pushEdges(dist1, p1, false));
      new_edges.push(...pushEdges(dist2, p2, true));
    } else {
      new_edges.push(...pushEdges(dist1, dst - 1, false));
    }
    const ans_data = {
      nodes: data["nodes"],
      edges: new_edges,
    };
    return ans_data;
  }

  function pushEdges(dist, curr, reverse) {
    let tmp_edges = [];
    while (dist[curr][0] !== 0) {
      let fm = dist[curr][1];
      if (reverse)
        tmp_edges.push({
          arrows: { to: { enabled: true } },
          from: curr + 1,
          to: fm + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      else
        tmp_edges.push({
          arrows: { to: { enabled: true } },
          from: fm + 1,
          to: curr + 1,
          color: "orange",
          label: String(dist[curr][0] - dist[fm][0]),
        });
      curr = fm;
    }
    return tmp_edges;
  }

  btnGen.click();
};
