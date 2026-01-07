declare module 'react-force-graph-2d' {
    import * as React from 'react';

    export interface GraphData {
        nodes: any[];
        links: any[];
    }

    export interface ForceGraph2DProps {
        width?: number;
        height?: number;
        graphData?: GraphData;
        backgroundColor?: string;
        nodeLabel?: string | ((node: any) => string);
        nodeColor?: string | ((node: any) => string);
        nodeAutoColorBy?: string | ((node: any) => string);
        linkColor?: string | ((link: any) => string);
        onNodeClick?: (node: any, event: any) => void;
        [key: string]: any;
    }

    const ForceGraph2D: React.FC<ForceGraph2DProps>;

    export default ForceGraph2D;
}
