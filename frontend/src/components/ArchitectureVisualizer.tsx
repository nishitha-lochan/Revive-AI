'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Cpu, Server, FileCode, CheckCircle2, ChevronRight } from 'lucide-react';

interface NodeItem {
  id: string;
  label: string;
  type: string;
  category: string;
  details: string;
}

interface LinkItem {
  source: string;
  target: string;
  label: string;
}

interface GraphData {
  nodes: NodeItem[];
  links: LinkItem[];
}

export const ArchitectureVisualizer: React.FC<{ graph: GraphData }> = ({ graph }) => {
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(graph.nodes[0] || null);

  const getIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4 text-emerald-400" />;
      case 'service': return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'api': return <Server className="w-4 h-4 text-cyan-400" />;
      default: return <FileCode className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-400" />
            Interactive System Architecture DAG
          </h3>
          <p className="text-xs text-slate-400">
            Automated dependency graph extracted by the LangGraph Architecture Agent. Click any node to view inspection details.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Graph Grid View */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden min-h-[420px] flex flex-col justify-between">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />

          {/* Node Grid Layout */}
          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {graph.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <motion.div
                  key={node.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setSelectedNode(node)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-950/60 border-purple-500 shadow-lg shadow-purple-500/20'
                      : 'bg-slate-900/60 border-white/10 hover:border-purple-500/40 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {getIcon(node.type)}
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300">
                      {node.category}
                    </span>
                  </div>
                  <div className="font-bold text-sm text-white truncate">{node.label}</div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{node.details}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Link Connection Legend */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Connections:</span>
            {graph.links.slice(0, 4).map((link, idx) => (
              <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-slate-200">{link.source}</span>
                <ChevronRight className="w-3 h-3 text-purple-400" />
                <span className="text-cyan-400">{link.target}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Node Inspection Drawer */}
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
            Node Inspection Drawer
          </h4>
          {selectedNode ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                <div className="flex items-center gap-2">
                  {getIcon(selectedNode.type)}
                  <span className="font-bold text-white text-base">{selectedNode.label}</span>
                </div>
                <div className="text-xs text-purple-300 font-mono">Node ID: {selectedNode.id}</div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Category Type</label>
                <div className="text-sm text-slate-200 bg-white/5 p-2.5 rounded-lg border border-white/10">
                  {selectedNode.category} ({selectedNode.type})
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Description & Role</label>
                <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-lg border border-white/10 leading-relaxed">
                  {selectedNode.details}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Incoming & Outgoing Dependencies</label>
                <div className="space-y-1.5">
                  {graph.links
                    .filter((l) => l.source === selectedNode.id || l.target === selectedNode.id)
                    .map((l, i) => (
                      <div key={i} className="text-xs font-mono p-2 rounded bg-slate-900/80 border border-white/5 flex items-center justify-between">
                        <span className="text-slate-300">{l.source} → {l.target}</span>
                        <span className="text-[10px] text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/10">
                          {l.label}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic">Select a node from the graph to inspect properties.</div>
          )}
        </div>
      </div>
    </div>
  );
};
