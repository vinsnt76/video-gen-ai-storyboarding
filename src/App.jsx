import React, { useState } from 'react';
import ReferenceSheetTab from './components/ReferenceSheetTab';
import StoryboardTab from './components/StoryboardTab';
import VideoTab from './components/VideoTab';
import EditorTab from './components/EditorTab';
import { Layers, LayoutGrid, Film, Scissors, Video } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('reference');
  const [referenceSheet, setReferenceSheet] = useState(null);
  const [storyboard, setStoryboard] = useState(null);
  const [videos, setVideos] = useState(null);

  const tabs = [
    { id: 'reference', name: '1. Reference Sheet', icon: Layers },
    { id: 'storyboard', name: '2. Storyboard Grid', icon: LayoutGrid },
    { id: 'animate', name: '3. Animate Video', icon: Film },
    { id: 'editor', name: '4. Variations Editor', icon: Scissors }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden pb-16">
      {/* Decorative Blur Blobs */}
      <div className="absolute top-[-10%] left-[-15%] w-[50%] h-[50%] bg-blob-1 rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-15%] w-[50%] h-[50%] bg-blob-2 rounded-full pointer-events-none" />

      {/* Main Header */}
      <header className="glass-panel border-x-0 border-t-0 border-b border-slate-900 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center btn-glow-violet shadow-lg">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Antigravity Video-Gen Studio
              </h1>
              <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">
                Storyboard-to-Video Workflow
              </p>
            </div>
          </div>
          
          <div className="flex gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-900">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-violet-600 text-white shadow-md shadow-violet-600/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content wrapper */}
      <main className="max-w-7xl mx-auto px-6 mt-8 relative z-10">
        {activeTab === 'reference' && (
          <ReferenceSheetTab
            referenceSheet={referenceSheet}
            setReferenceSheet={setReferenceSheet}
          />
        )}
        {activeTab === 'storyboard' && (
          <StoryboardTab
            referenceSheet={referenceSheet}
            storyboard={storyboard}
            setStoryboard={setStoryboard}
          />
        )}
        {activeTab === 'animate' && (
          <VideoTab
            referenceSheet={referenceSheet}
            storyboard={storyboard}
            videos={videos}
            setVideos={setVideos}
          />
        )}
        {activeTab === 'editor' && (
          <EditorTab
            videos={videos}
          />
        )}
      </main>
    </div>
  );
}
