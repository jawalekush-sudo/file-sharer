"use client";
import { useState, useRef, MouseEvent } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  // --- New Background State ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // --- Existing Supabase State ---
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- New Mouse Tracking Function ---
  const handleMouseMove = (e: MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  // --- Existing Functions (Unchanged) ---
  const handleBoxClick = () => {
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    fileInputRef.current?.click();
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uniqueFileName = `${Date.now()}-${file.name}`;
    
    const { error } = await supabase.storage.from('files').upload(`public/${uniqueFileName}`, file);

    if (error) {
      alert(`Error: ${error.message}`);
      setIsUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from('files').getPublicUrl(`public/${uniqueFileName}`);
    setUploadedFileUrl(publicUrlData.publicUrl);
    setUploadedFileName(file.name);
    setIsUploading(false);
  };

  const copyLink = () => {
    if (uploadedFileUrl) {
      navigator.clipboard.writeText(uploadedFileUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    // We added onMouseMove to the main wrapper
    <div 
      onMouseMove={handleMouseMove}
      className="relative flex flex-col items-center justify-center min-h-screen bg-black text-white p-4 overflow-hidden"
    >
      
      {/* THE MAGIC: Interactive Spotlight Layer */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
  background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(56, 189, 248, 0.8), transparent 80%)`
}}
      />

      {/* Main App Container (Added relative z-10 so it sits above the spotlight) */}
      <div className="relative z-10 bg-[#1a1a1a] p-10 rounded-2xl shadow-2xl shadow-black/50 w-full max-w-md flex flex-col items-center border border-gray-800">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">QuickShare</h1>
        
        {/* Upload Dropzone */}
        {!uploadedFileUrl && (
          <div 
            onClick={handleBoxClick}
            className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300"
          >
            <p className="text-gray-400 font-medium">
              {isUploading ? 'Uploading to cloud...' : 'Click to upload a file'}
            </p>
          </div>
        )}

        {/* Success UI */}
        {uploadedFileUrl && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            <div className="bg-green-500/10 text-green-400 px-4 py-2 rounded-lg mb-6 w-full text-center border border-green-500/20">
              Successfully uploaded <strong>{uploadedFileName}</strong>
            </div>

            {/* Shareable Link Box */}
            <div className="w-full flex gap-2 mb-6">
              <input 
                type="text" 
                readOnly 
                value={uploadedFileUrl} 
                className="flex-1 bg-black border border-gray-700 rounded-lg p-3 text-sm text-gray-300 outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                onClick={copyLink}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-lg transition-colors text-sm font-semibold shadow-lg shadow-blue-500/20"
              >
                Copy
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 w-full">
              <a 
                href={uploadedFileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex-1 bg-black hover:bg-gray-900 border border-gray-700 text-center py-2.5 rounded-lg transition-colors font-medium"
              >
                Preview
              </a>
              <a 
                href={`${uploadedFileUrl}?download=`} 
                className="flex-1 bg-white hover:bg-gray-200 text-black text-center py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-white/10"
              >
                Download
              </a>
            </div>

            <button 
              onClick={handleBoxClick}
              className="mt-6 text-sm text-gray-500 hover:text-white transition-colors"
            >
              Upload another file
            </button>
          </div>
        )}

        <input type="file" ref={fileInputRef} onChange={uploadFile} className="hidden" />
      </div>
    </div>
  );
}