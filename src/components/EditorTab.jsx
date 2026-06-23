import React, { useState } from 'react';
import { Eye, Scissors, Video, Film, Play, Pause, ChevronRight, Check } from 'lucide-react';

export default function EditorTab({ videos }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [timeline, setTimeline] = useState([]);
  const [hoverCut, setHoverCut] = useState(null);

  if (!videos) {
    return (
      <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-4 max-w-xl mx-auto">
        <Film className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-semibold text-slate-300">No Rendered Sequences</h3>
        <p className="text-sm text-slate-500">
          Please run step 3 first to generate video variations.
        </p>
      </div>
    );
  }

  const activeVideo = selectedVideo || videos[0];

  const handleSelectVideo = (v) => {
    setSelectedVideo(v);
    setPlaying(false);
  };

  const addCutToTimeline = (name, timeRange, sourceVideo) => {
    setTimeline(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name,
        timeRange,
        source: sourceVideo
      }
    ]);
  };

  const removeTimelineClip = (id) => {
    setTimeline(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Variations & Preview player */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          {/* Main preview */}
          <div className="aspect-video bg-slate-950 relative group flex items-center justify-center">
            <video
              src={activeVideo.url}
              className="w-full h-full object-cover"
              controls
              muted
              autoPlay={playing}
            />
            <div className="absolute top-4 left-4 bg-slate-900/90 text-slate-200 border border-slate-800 px-3 py-1 text-xs font-semibold rounded-full">
              {activeVideo.name}
            </div>
          </div>

          <div className="p-4 flex justify-between items-center bg-slate-900/30 border-t border-slate-800">
            <span className="text-xs text-slate-400">Duration: {activeVideo.duration}s</span>
            <div className="flex gap-2">
              <button
                onClick={() => addCutToTimeline("Alley Chase Drift", "0:02 - 0:05", activeVideo.name)}
                className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Scissors className="w-3.5 h-3.5" />
                Cut & Save Moment
              </button>
            </div>
          </div>
        </div>

        {/* Timeline Compilation */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800">
          <h3 className="text-md font-bold mb-4 flex items-center gap-2 text-violet-400">
            <Scissors className="w-4 h-4" /> Timeline Cuts Compiler
          </h3>
          {timeline.length > 0 ? (
            <div className="space-y-3">
              {timeline.map((clip, i) => (
                <div key={clip.id} className="flex items-center justify-between bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">{clip.name}</p>
                      <p className="text-[10px] text-slate-500">Source: {clip.source} • Range: {clip.timeRange}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTimelineClip(clip.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-2 py-1 rounded hover:bg-rose-500/10 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
                <span className="text-xs text-slate-500">{timeline.length} clips compiled</span>
                <button
                  onClick={() => alert('Exporting compilation movie...')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Video className="w-3.5 h-3.5" /> Export Final Movie
                </button>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-800 p-8 rounded-xl text-center text-xs text-slate-500">
              Pick the best clips from your variations. Click "Cut & Save" to compile your sequence.
            </div>
          )}
        </div>
      </div>

      {/* Side variations selector */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Variation Run</h3>
        {videos.map((v) => {
          const isSelected = activeVideo.id === v.id;
          return (
            <div
              key={v.id}
              onClick={() => handleSelectVideo(v)}
              className={`glass-panel p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-3 ${
                isSelected ? 'border-violet-500 bg-violet-500/5' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-800 relative">
                <video src={v.url} className="w-full h-full object-cover pointer-events-none" muted />
                <div className="absolute inset-0 bg-slate-950/20" />
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{v.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 italic mt-1">"{v.prompt}"</p>
                </div>
                {isSelected && (
                  <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    Viewing
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
