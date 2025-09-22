import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, ZoomIn, ZoomOut, Download, Maximize2 } from "lucide-react";

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  children: string[];
}

interface MindMapViewerProps {
  content: string;
  title?: string;
}

export function MindMapViewer({ content, title = "Mind Map" }: MindMapViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Parse content into mind map structure
  const parseContentToMindMap = (text: string): MindMapNode[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: MindMapNode[] = [];
    let nodeId = 0;

    // Create central node
    const centralNode: MindMapNode = {
      id: `node-${nodeId++}`,
      text: title,
      x: 400,
      y: 300,
      level: 0,
      children: []
    };
    nodes.push(centralNode);

    // Parse content into branches
    const branches: string[] = [];
    let currentBranch = "";

    lines.forEach(line => {
      if (line.startsWith('##') || line.startsWith('**') || line.includes(':')) {
        if (currentBranch) branches.push(currentBranch);
        currentBranch = line.replace(/[#*:]/g, '').trim();
      } else if (line.trim() && currentBranch) {
        currentBranch += ` ${line.trim()}`;
      }
    });
    
    if (currentBranch) branches.push(currentBranch);

    // Create branch nodes in circular layout
    const angleStep = (2 * Math.PI) / Math.max(branches.length, 1);
    const radius = 200;

    branches.forEach((branch, index) => {
      const angle = index * angleStep;
      const x = 400 + Math.cos(angle) * radius;
      const y = 300 + Math.sin(angle) * radius;

      const branchNode: MindMapNode = {
        id: `node-${nodeId++}`,
        text: branch.substring(0, 50) + (branch.length > 50 ? '...' : ''),
        x,
        y,
        level: 1,
        children: []
      };

      nodes.push(branchNode);
      centralNode.children.push(branchNode.id);
    });

    return nodes;
  };

  const nodes = parseContentToMindMap(content);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  const exportMindMap = () => {
    const svg = document.querySelector('#mindmap-svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_mindmap.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className={`bg-background brutal-border brutal-shadow ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black uppercase flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Interactive Mind Map
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={exportMindMap}>
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted brutal-border overflow-hidden" style={{ height: isFullscreen ? '70vh' : '400px' }}>
          <svg
            id="mindmap-svg"
            width="100%"
            height="100%"
            viewBox="0 0 800 600"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
          >
            {/* Connections */}
            {nodes.map(node => 
              node.children.map(childId => {
                const child = nodes.find(n => n.id === childId);
                if (!child) return null;
                return (
                  <line
                    key={`${node.id}-${childId}`}
                    x1={node.x}
                    y1={node.y}
                    x2={child.x}
                    y2={child.y}
                    stroke="hsl(var(--primary))"
                    strokeWidth="3"
                    className="brutal-line"
                  />
                );
              })
            )}

            {/* Nodes */}
            {nodes.map(node => (
              <g key={node.id}>
                <rect
                  x={node.x - 60}
                  y={node.y - 20}
                  width="120"
                  height="40"
                  fill={node.level === 0 ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
                  stroke="hsl(var(--border))"
                  strokeWidth="2"
                  rx="4"
                  className="brutal-node"
                />
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={node.level === 0 ? "hsl(var(--primary-foreground))" : "hsl(var(--secondary-foreground))"}
                  className="select-none"
                >
                  {node.text.length > 15 ? node.text.substring(0, 15) + '...' : node.text}
                </text>
              </g>
            ))}
          </svg>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground">
          <p className="font-bold">💡 Interactive Mind Map Features:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Zoom in/out to explore details</li>
            <li>Export as SVG for presentations</li>
            <li>Fullscreen mode for better viewing</li>
            <li>Auto-generated from your content</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}