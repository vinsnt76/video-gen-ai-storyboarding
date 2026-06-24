import React, { useState } from 'react';
import { Sparkles, Eye, RefreshCw, Layers, Wand2 } from 'lucide-react';

export default function ReferenceSheetTab({ referenceSheet, setReferenceSheet }) {
  const [prompt, setPrompt] = useState('Cyberpunk street racer, female, neon teal leather jacket, silver visor, athletic build, gritty urban background');
  const [model, setModel] = useState('GPT Image 2');
  const [generating, setGenerating] = useState(false);
  const [gridImages, setGridImages] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setGenerating(true);
    try {
      // 1. Request Signed Upload URL from our Vercel API
      const res = await fetch('/api/upload-url');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to generate upload URL');

      // 2. Perform direct binary PUT upload to Google Cloud Storage
      const uploadRes = await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'image/png'
        },
        body: file
      });

      if (!uploadRes.ok) throw new Error('GCS upload rejection');

      // 3. Keep track of GCS location paths in the react state
      setUploadedImage(data.publicUrl);
    } catch (err) {
      console.error(err);
      alert(`GCS Upload Failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          model,
          referenceImage: uploadedImage
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit generation task');
      }

      setGridImages(data.images);
      setReferenceSheet({
        id: Date.now().toString(),
        prompt,
        model,
        images: data.images,
        referenceImage: uploadedImage,
        createdAt: new Date().toLocaleTimeString()
      });
      setGenerating(false);

    } catch (err) {
      setGenerating(false);
      console.error(err);
      alert(`API Connection error: ${err.message}. Check environment credentials.`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="glass-panel p-6 rounded-2xl border border-violet-500/10">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2 text-violet-400">
          <Layers className="w-5 h-5" /> 1. Establish Visual Guidelines
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Create a character or product reference sheet first. You can provide a text prompt, upload an existing seed image to lock key features, or combine both for consistency.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Character / Subject Description
              </label>
              <textarea
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors placeholder:text-slate-600 resize-none h-24 text-sm"
                placeholder="Describe your subject in detail (hair, clothes, style, colors)..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Reference Seed Image (Optional)
              </label>
              <div className="relative group border border-dashed border-slate-800 rounded-xl h-24 flex flex-col items-center justify-center bg-slate-900/50 hover:border-violet-500/50 transition-colors overflow-hidden">
                {uploadedImage ? (
                  <>
                    <img src={uploadedImage} alt="Reference seed" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setUploadedImage(null)}
                      className="absolute inset-0 bg-slate-950/80 text-rose-400 text-xs font-semibold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove Image
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-2 text-center">
                    <span className="text-xs font-semibold text-slate-400 hover:text-slate-300">Upload Image</span>
                    <span className="text-[10px] text-slate-500 mt-1">PNG, JPG to reference face/style</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Image Generator Model
              </label>
              <select
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:border-violet-500 transition-colors text-sm"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                <option value="GPT Image 2">GPT Image 2 (Best for cinematic composition)</option>
                <option value="Nano Banana Pro">Nano Banana Pro (Best for stylized art & characters)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleGenerate}
                disabled={generating || !prompt}
                className="btn-glow-violet px-6 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-xl text-sm flex items-center gap-2 transition-all"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Synthesizing Sheet...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Reference Sheet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sheet Preview */}
      {referenceSheet && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-md font-bold text-emerald-400 flex items-center gap-2">
                <Eye className="w-4 h-4" /> Active Reference Sheet
              </h3>
              <p className="text-xs text-slate-500">Generated using {referenceSheet.model} at {referenceSheet.createdAt}</p>
            </div>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              Linked to Storyboard Grid
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {referenceSheet.images.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-800 relative group">
                <img src={img} alt={`Pose ${i + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                  <span className="text-[10px] text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded">
                    {i === 0 ? 'Front Portrait' : i === 1 ? 'Expression' : i === 2 ? 'Side Profile' : 'Action Pose'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/50 rounded-xl p-3 border border-slate-800 text-xs text-slate-400">
            {referenceSheet.referenceImage && (
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                <img src={referenceSheet.referenceImage} alt="Input source seed" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <span className="font-semibold text-slate-300 block mb-1">Visual Anchors:</span>
              "{referenceSheet.prompt}"
              {referenceSheet.referenceImage && <span className="block text-[10px] text-violet-400 mt-1">Image composition guidance active</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
