import React, { useState } from 'react';
import { LayoutGrid, Sparkles, RefreshCw, HelpCircle, AlertCircle, Edit, Link, Check } from 'lucide-react';

export default function StoryboardTab({ referenceSheet, storyboard, setStoryboard }) {
  const [globalPrompt, setGlobalPrompt] = useState('An action-packed chase sequence down neon-drenched alleyways, speeding hovering bikes, intense expressions, dynamic motion blur, high contrast cinematic lighting.');
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [editingPanel, setEditingPanel] = useState(null);
  const [editPrompt, setEditPrompt] = useState('');

  const initializeStoryboard = () => {
    // Generate empty 9 panels
    const emptyPanels = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      image: null,
      prompt: `Panel ${i + 1} detailing a key moment of the chase.`,
      status: 'idle'
    }));
    setStoryboard(emptyPanels);
  };

  const handleGenerateAll = () => {
    if (!storyboard) {
      initializeStoryboard();
    }
    setIsGeneratingAll(true);

    const isIndustrial = globalPrompt.toLowerCase().includes('industrial') || 
                         globalPrompt.toLowerCase().includes('coolant') || 
                         globalPrompt.toLowerCase().includes('refinery') || 
                         globalPrompt.toLowerCase().includes('valve') || 
                         globalPrompt.toLowerCase().includes('pipe');

    // Make mock storyboard images reflect the reference style sheet and theme keywords
    const mockStoryboardImages = isIndustrial ? [
      'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80', // Pressure pipe system
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400&q=80', // Valves turning
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&q=80', // Flashing display panel
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', // Steam vent releasing
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80', // Machinery assembly
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80', // Steel pipeline perspective
      'https://images.unsplash.com/photo-1513828583688-c52646db42da?w=400&q=80', // Pressure gauge monitoring
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80', // Warning alerts glow
      'https://images.unsplash.com/photo-1542224566-6e85f2e6772f?w=400&q=80'  // Distillation columns at night
    ] : [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&q=80', // bike rider starting engine
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80', // speed readout zooming
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80', // neon alleyway perspective
      'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&q=80', // corner drift close-up
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80', // police drone emerging
      'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&q=80', // bike jumping over obstacle
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&q=80', // intense looking rider portrait
      'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400&q=80', // spark blast explosion background
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80'  // bike riding away into neon skyline
    ];

    setTimeout(() => {
      setStoryboard(prev => {
        const target = prev || Array.from({ length: 9 }, (_, i) => ({ id: i + 1, prompt: `Panel ${i + 1}`, status: 'idle' }));
        return target.map((panel, idx) => ({
          ...panel,
          image: mockStoryboardImages[idx],
          status: 'ready'
        }));
      });
      setIsGeneratingAll(false);
    }, 3000);
  };

  const handleRegeneratePanel = (panelId) => {
    setStoryboard(prev => prev.map(p => p.id === panelId ? { ...p, status: 'generating' } : p));
    
    // Simulate single panel generation
    setTimeout(() => {
      const randomNewImages = [
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80',
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=400&q=80',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80'
      ];
      const newImg = randomNewImages[Math.floor(Math.random() * randomNewImages.length)];
      setStoryboard(prev => prev.map(p => p.id === panelId ? { ...p, image: newImg, status: 'ready' } : p));
    }, 1500);
  };

  const openEditModal = (panel) => {
    setEditingPanel(panel.id);
    setEditPrompt(panel.prompt);
  };

  const savePanelEdit = () => {
    setStoryboard(prev => prev.map(p => p.id === editingPanel ? { ...p, prompt: editPrompt, status: 'generating' } : p));
    setEditingPanel(null);
    
    // Simulate updating with prompt
    setTimeout(() => {
      const mockEditedImg = 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400&q=80';
      setStoryboard(prev => prev.map(p => p.id === editingPanel ? { ...p, image: mockEditedImg, status: 'ready' } : p));
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="glass-panel p-6 rounded-2xl border border-violet-500/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-xl font-bold flex items-center gap-2 text-violet-400">
            <LayoutGrid className="w-5 h-5" /> 2. Generate Storyboard Grid
          </h2>
          <p className="text-sm text-slate-400">
            Produce a structured 3x3 story sequence. Use your reference sheet to lock features, expressions, and environmental aesthetics.
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
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <LayoutGrid className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-semibold text-slate-300">No Storyboard Initialized</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Click to initialize a 3x3 layout of empty panels which we can populate using the theme.
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
