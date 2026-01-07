Visual Graph View Improvement Plan
The following are proposed improvements to the Visual Graph View to enhance its integration with the database and UI.

1. Interactive Control Panel
Create a floating or sidebar control panel for the graph view.

 Filters: Checkboxes to show/hide specific file types (e.g., Show Packages, Show Bibliographies, Show Images) alongside .tex files.
 Physics Controls: Sliders for Link Distance, Charge Strength (repulsion), and Gravity to allow users to untangle complex graphs manually.
 Layout Toggle: Switch between free-form force directed and structured layouts (e.g., DAG/Tree mode if applicable).
2. Enhanced Database Integration & Sync
 Bi-directional Sync: Currently, clicking a node selects the resource. We should add:
Selection Listener: If a resource is selected in the file list (Table View), the graph should automatically pan/zoom to center that node and highlight it.
 Live Metadata: Show "dirty" state or "compile status" indicators on the nodes if available in the database.
3. Visual Enhancements
 Link Styling: Differentiate link types with colors/styles.
\include / \input: Solid lines (Structural dependency).
\cite: Dotted lines (Bibliography).
\usepackage: Dashed lines (Package dependency).
 Node Sizing: dynamic node size based on "centrality" (number of connections) to highlight important files (like main.tex).
 Legend: A small visual legend explaining the node colors (Green=Preamble, Blue=Document, etc.).
4. Search & Navigation
 Search Bar: A specific search input for the graph to find a node by name and fly to it.
 Focus Mode: A "Focus" button on a selected node that fades out all non-connected nodes, helping to isolate dependencies for a single file.
5. Information & Actions
 Context Menu: Right-click on a node to:
Open File
Compile File
View Properties
 Hover Details: Enhanced tooltip showing path, full title, and connection counts.
Implementation Priorities
I suggest starting with Priority 1: Sync & Filters, as these offer the most immediate usability benefit.

