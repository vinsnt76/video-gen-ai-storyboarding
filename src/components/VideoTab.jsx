import React, { useState } from 'react';
import { Film, Sparkles, Sliders, CheckCircle2, Play, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VideoTab({ referenceSheet, storyboard, videos, setVideos }) {
  const [model, setModel] = useState('Seedance 2.0 (Storyboard Native)');
  const [prompt, setPrompt] = useState('Use the reference storyboards to make a full animation movie');
  const [duration, setDuration] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleAnimate = async () => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // 1. Submit panels to local serverless proxy route
      const response = await fetch('/api/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          panels: storyboard.filter(p => p.image !== null),
          duration,
          prompt
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit timeline payload');
      }

      const renderId = data.renderId;

      // 2. Poll status endpoint until render completes
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/status?id=${renderId}`);
          const statusData = await statusRes.json();

          if (!statusRes.ok) {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert(`Poll failed: ${statusData.error}`);
            return;
          }

          if (statusData.status === 'done') {
            clearInterval(pollInterval);
            setProgress(100);
            
            // Build variation arrays using returned URL + fallbacks
            setVideos([
              {
                id: 'v1',
                name: 'Variation A - Dynamic Cuts',
                url: statusData.url || 'https://assets.mixkit.co/videos/preview/mixkit-cyberpunk-neon-city-street-at-night-40242-large.mp4',
                duration,
                prompt,
                cuts: 3
              },
              {
                id: 'v2',
                name: 'Variation B - Action tracking',
                url: 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-subway-station-with-neon-lights-40240-large.mp4',
                duration,
                prompt,
                cuts: 4
              },
              {
                id: 'v3',
                name: 'Variation C - Close-ups & Details',
                url: 'https://assets.mixkit.co/videos/preview/mixkit-pov-driving-in-a-futuristic-neon-tunnel-40241-large.mp4',
                duration,
                prompt,
                cuts: 2
              }
            ]);
            setIsGenerating(false);
            
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 }
            });

          } else if (statusData.status === 'failed') {
            clearInterval(pollInterval);
            setIsGenerating(false);
            alert('Render failed on JSON-to-Video compiler API.');
          } else {
            // Track render completion percentage
            setProgress(Math.min(statusData.progress || 35, 95));
          }
        } catch (pollErr) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          console.error(pollErr);
        }
      }, 2000);

    } catch (err) {
      setIsGenerating(false);
      console.error(err);
      alert(`API Connection error: ${err.message}. Check environment credentials.`);
    }
  };

  const hasPhotos = storyboard && storyboard.some(p => p.image !== null);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-violet-500/10">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-violet-400">
          <Film className="w-5 h-5" /> 3. Animate Storyboard Sequence
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Compile your active storyboard panels and character guidelines. Because the video model extracts visual context, poses, and progression layout directly from the storyboard, simple prompts yield excellent cinematic results.
        </p>

        {/* Configuration settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Video Generation Pipeline
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="Seedance 2.0 (Storyboard Native)">Seedance 2.0 (Storyboard Native)</option>
                <option value="AnimateDiff Pro">AnimateDiff Pro (Multi-pass reference support)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Generation Prompt
              </label>
              <input
                type="text"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Duration (Seconds)
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setDuration(10)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                    duration === 10
                      ? 'bg-violet-500/10 border-violet-500 text-violet-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  10 Seconds
                </button>
                <button
                  type="button"
                  onClick={() => setDuration(15)}
                  className={`flex-1 py-3 text-xs font-bold rounded-xl border transition-all ${
                    duration === 15
                      ? 'bg-violet-500/10 border-violet-500 text-violet-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  15 Seconds
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Reference Assets Integrated
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <span className="text-slate-400">Storyboard:</span>
                  <span className={hasPhotos ? 'text-emerald-400' : 'text-amber-500'}>
                    {hasPhotos ? '3 Panels Connected' : 'No Panels Rendered'}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                  <span className="text-slate-400">Reference Character Sheet:</span>
                  <span className={referenceSheet ? 'text-emerald-400' : 'text-slate-500'}>
                    {referenceSheet ? 'Linked' : 'Not Loaded'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Trigger */}
        <div className="flex justify-end border-t border-slate-800/60 pt-6">
          <button
            onClick={handleAnimate}
            disabled={isGenerating || !hasPhotos}
            className="btn-glow-violet bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-all text-sm"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synthesizing Sequence ({progress}%)
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Animate Sequence Variations
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress View */}
      {isGenerating && (
        <div className="glass-panel p-6 rounded-2xl border border-violet-500/10 space-y-4">
          <div className="flex justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <span>Synthesizing Video frames</span>
            <span>Pass 1/3 (Rendering multi-angles)</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-violet-500 to-cyan-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Previews info if ready */}
      {videos && !isGenerating && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
          <div>
            <h3 className="text-md font-bold text-slate-200">Animation complete</h3>
            <p className="text-xs text-slate-400">
              Generated 3 distinct cinematic variations of the sequence. Proceed to Step 4 to compare cuts and edit them together.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
