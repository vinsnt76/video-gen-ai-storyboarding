import React, { useState } from 'react';
import { LayoutGrid, Sparkles, RefreshCw, HelpCircle, AlertCircle, Edit, Link, Check } from 'lucide-react';

export default function StoryboardTab({ referenceSheet, storyboard, setStoryboard }) {
  const [globalPrompt, setGlobalPrompt] = useState('An action-packed chase sequence down neon-drenched alleyways, speeding hovering bikes, intense expressions, dynamic motion blur, high contrast cinematic lighting.');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  const initializeStoryboard = () => {
    // Generate empty 3 panels (Cinematic sequence)
    const emptyPanels = [
      { id: 1, image: null, prompt: "Establishing Shot: Wide view of the neon-drenched alleyway with hover bikes ready.", status: 'idle' },
      { id: 2, image: null, prompt: "Action Shot: Mid-angle shot of the bikes speeding down the alley, motion blur.", status: 'idle' },
      { id: 3, image: null, prompt: "Detail Shot: Close-up on the rider's intense visor reflection and engine sparks.", status: 'idle' }
    ];
    setStoryboard(emptyPanels);
  };

  const handleGenerateAll = async () => {
    let activeStoryboard = storyboard;
    if (!activeStoryboard) {
      activeStoryboard = [
        { id: 1, image: null, prompt: "Establishing Shot: Wide view of the neon-drenched alleyway with hover bikes ready.", status: 'idle' },
        { id: 2, image: null, prompt: "Action Shot: Mid-angle shot of the bikes speeding down the alley, motion blur.", status: 'idle' },
        { id: 3, image: null, prompt: "Detail Shot: Close-up on the rider's intense visor reflection and engine sparks.", status: 'idle' }
      ];
      setStoryboard(activeStoryboard);
    }
    setIsGeneratingAll(true);

    try {
      // 1. Generate panels sequentially or parallel with style reference context
      const generatedImages = await Promise.all(
        activeStoryboard.map(async (panel) => {
          const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: `${panel.prompt}. Match style: ${globalPrompt}`,
              model: referenceSheet?.model || 'GPT Image 2',
              referenceImage: referenceSheet?.images?.[0] || referenceSheet?.referenceImage || null
            })
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Failed generating panel');
          return data.images[0]; // Return the first predicted image variation
        })
      );

      setStoryboard(activeStoryboard.map((panel, idx) => ({
        ...panel,
        image: generatedImages[idx],
        status: 'ready'
      })));

    } catch (err) {
      console.error(err);
      alert(`Storyboard render failed: ${err.message}`);
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleRegeneratePanel = async (panelId) => {
    setStoryboard(prev => prev.map(p => p.id === panelId ? { ...p, status: 'generating' } : p));
    
    try {
      const panel = storyboard.find(p => p.id === panelId);
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${panel.prompt}. Style: ${globalPrompt}`,
          model: referenceSheet?.model || 'GPT Image 2',
          referenceImage: referenceSheet?.images?.[0] || referenceSheet?.referenceImage || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to re-roll panel');

      setStoryboard(prev => prev.map(p => p.id === panelId ? { ...p, image: data.images[0], status: 'ready' } : p));

    } catch (err) {
      console.error(err);
      alert(`Panel regeneration failed: ${err.message}`);
      setStoryboard(prev => prev.map(p => p.id === panelId ? { ...p, status: 'ready' } : p));
    }
  };

  const openEditModal = (panel) => {
    setEditingPanel(panel.id);
    setEditPrompt(panel.prompt);
  };

  const savePanelEdit = async () => {
    const targetPanelId = editingPanel;
    setStoryboard(prev => prev.map(p => p.id === targetPanelId ? { ...p, prompt: editPrompt, status: 'generating' } : p));
    setEditingPanel(null);
    
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `${editPrompt}. Style: ${globalPrompt}`,
          model: referenceSheet?.model || 'GPT Image 2',
          referenceImage: referenceSheet?.images?.[0] || referenceSheet?.referenceImage || null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed editing panel');

      setStoryboard(prev => prev.map(p => p.id === targetPanelId ? { ...p, image: data.images[0], status: 'ready' } : p));

    } catch (err) {
      console.error(err);
      alert(`Panel update failed: ${err.message}`);
      setStoryboard(prev => prev.map(p => p.id === targetPanelId ? { ...p, status: 'ready' } : p));
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="glass-panel p-6 rounded-2xl border border-violet-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
            <LayoutGrid className="w-5 h-5" /> 2. Generate Storyboard Sequence
          </h2>
          <p className="text-sm text-slate-400">
            Produce a structured 3-panel cinematic sequence (Establishing Shot, Action Shot, Close-Up Detail). Use your reference sheet to lock features and environment aesthetics.
          </p>
        </div>

        <div className="flex gap-3">
          {referenceSheet ? (
            <div className="flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-3 py-2 rounded-xl border border-emerald-500/20">
              <Check className="w-4 h-4" />
              <span>Reference Linked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs bg-amber-500/10 text-amber-400 px-3 py-2 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4" />
              <span>No Reference Active (Style may vary)</span>
            </div>
          )}

          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll}
            className="btn-glow-violet bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            {isGeneratingAll ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Rendering Grid...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate All Panels
              </>
            )}
          </button>
        </div>
      </div>

      {/* Global Control Prompt */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Global Storyboard Theme / Script Outline
        </label>
        <input
          type="text"
          className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition-colors"
          value={globalPrompt}
          onChange={(e) => setGlobalPrompt(e.target.value)}
        />
      </div>

      {/* Storyboard Grid View */}
      {storyboard ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {storyboard.map((panel) => (
            <div key={panel.id} className="glass-panel rounded-2xl border border-slate-800 overflow-hidden relative flex flex-col group">
              {/* Panel Status Overlay / Preview */}
              <div className="aspect-video bg-slate-900 border-b border-slate-800 relative overflow-hidden flex items-center justify-center">
                {panel.status === 'generating' ? (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
                    <span className="text-xs text-slate-400">Rendering panel...</span>
                  </div>
                ) : panel.image ? (
                  <>
                    <img src={panel.image} alt={`Panel ${panel.id}`} className="w-full h-full object-cover" />
                    {/* Panel controls on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                      <button
                        onClick={() => openEditModal(panel)}
                        className="p-2 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 border border-slate-800 transition-colors"
                      >
                        <Edit className="w-3.5 h-3.5" /> Modify
                      </button>
                      <button
                        onClick={() => handleRegeneratePanel(panel.id)}
                        className="p-2 bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg text-xs flex items-center gap-1 border border-slate-800 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-roll
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    onClick={() => handleRegeneratePanel(panel.id)}
                    className="flex flex-col items-center gap-2 text-slate-500 hover:text-violet-400 transition-colors text-xs"
                  >
                    <Sparkles className="w-8 h-8 opacity-60" />
                    Generate Panel {panel.id}
                  </button>
                )}
                
                {/* Index label */}
                <div className="absolute top-3 left-3 w-6 h-6 rounded-full bg-slate-900/90 text-slate-200 border border-slate-800 text-xs font-bold flex items-center justify-center">
                  {panel.id}
                </div>
              </div>

              {/* Panel Prompt details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-400 italic mb-3">
                  {panel.prompt || "No prompt details configured."}
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-800/60 pt-3">
                  <span>Aesthetics: {referenceSheet ? 'Locked' : 'Dynamic'}</span>
                  <span>Grid Pos: {Math.floor((panel.id - 1) / 3) + 1}x{(panel.id - 1) % 3 + 1}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-md mx-auto">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No Storyboard Initialized</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Click to initialize a 3-panel layout (Establishing, Action, Detail) which we can populate using the theme.
          </p>
          <button
            onClick={initializeStoryboard}
            className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
          >
            Create Blank Storyboard
          </button>
        </div>
      )}

      {/* Editing panel modal */}
      {editingPanel && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-violet-500/20 max-w-lg w-full space-y-4">
            <h3 className="text-md font-bold text-slate-200">Edit Panel {editingPanel} Prompt</h3>
            <textarea
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600 resize-none h-28 text-sm"
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingPanel(null)}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-200 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={savePanelEdit}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold btn-glow-violet transition-all"
              >
                Apply & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
