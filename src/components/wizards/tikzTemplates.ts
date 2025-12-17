export const TIKZ_TEMPLATES = [
  {
    label: "Basic Axis",
    description: "2D Cartesian coordinate system",
    code: `\\begin{tikzpicture}
  \\draw[->] (-1,0) -- (4,0) node[right] {$x$};
  \\draw[->] (0,-1) -- (0,4) node[above] {$y$};
  \\draw[scale=0.5,domain=-3:3,smooth,variable=\\x,blue] plot ({\\x},{\\x*\\x});
\\end{tikzpicture}`
  },
  {
    label: "Mindmap",
    description: "Concept map with children",
    code: `\\begin{tikzpicture}
  \\path[mindmap,concept color=blue!80!white,text=white]
    node[concept] {Main Concept}
    [clockwise from=0]
    child { node[concept] {Child 1} }
    child { node[concept] {Child 2} }
    child { node[concept] {Child 3} };
\\end{tikzpicture}`
  },
  {
    label: "Flowchart Block",
    description: "Simple nodes and arrows",
    code: `\\begin{tikzpicture}[node distance=2cm]
  \\node (start) [startstop] {Start};
  \\node (pro1) [process, below of=start] {Process 1};
  \\node (dec1) [decision, below of=pro1] {Decision?};
  \\draw [arrow] (start) -- (pro1);
  \\draw [arrow] (pro1) -- (dec1);
\\end{tikzpicture}`
  },
  {
    label: "Tree Diagram",
    description: "Simple hierarchy tree",
    code: `\\begin{tikzpicture}[sibling distance=10em,
  every node/.style = {shape=rectangle, rounded corners,
    draw, align=center,
    top color=white, bottom color=blue!20}]]
  \\node {Root}
    child { node {Left Child} }
    child { node {Right Child}
      child { node {Leaf} }
      child { node {Leaf} } };
\\end{tikzpicture}`
  },
  {
    label: "3D Plot",
    description: "PGFPlots 3D Surface",
    code: `\\begin{tikzpicture}
  \\begin{axis}[colormap/viridis]
    \\addplot3[
      surf,
      domain=-2:2,
      domain y=-2:2,
    ] 
    {exp(-x^2-y^2)*x};
  \\end{axis}
\\end{tikzpicture}`
  }
];