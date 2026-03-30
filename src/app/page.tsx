"use client";
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBoxClick = () => {
    // Reset state if they click to upload a new file
    setUploadedFileUrl(null);
    setUploadedFileName(null);
    fileInputRef.current?.click();
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Create a unique filename
    const uniqueFileName = `${Date.now()}-${file.name}`;
    
    // 1. Upload to Supabase
    const { error } = await supabase.storage
      .from('files')
      .upload(`public/${uniqueFileName}`, file);

    if (error) {
      alert(`Error: ${error.message}`);
      setIsUploading(false);
      return;
    }

    // 2. Get the public URL for sharing/previewing
    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(`public/${uniqueFileName}`);

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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <div className="bg-[#1a1a1a] p-10 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">QuickShare</h1>
        
        {/* Upload Dropzone */}
        {!uploadedFileUrl && (
          <div 
            onClick={handleBoxClick}
            className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-white/5 transition-all"
          >
            <p className="text-gray-400 font-medium">
              {isUploading ? 'Uploading to cloud...' : 'Click to upload a file'}
            </p>
          </div>
        )}

        {/* Success UI - Shows only after a successful upload */}
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
                className="flex-1 bg-[#2a2a2a] border border-gray-600 rounded p-2 text-sm text-gray-300 outline-none"
              />
              <button 
                onClick={copyLink}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded transition-colors text-sm font-semibold"
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
                className="flex-1 bg-[#2a2a2a] hover:bg-[#3a3a3a] border border-gray-600 text-center py-2 rounded transition-colors font-medium"
              >
                Preview
              </a>
              <a 
                href={`${uploadedFileUrl}?download=`} 
                className="flex-1 bg-white hover:bg-gray-200 text-black text-center py-2 rounded transition-colors font-medium"
              >
                Download
              </a>
            </div>

            {/* Reset Button */}
            <button 
              onClick={handleBoxClick}
              className="mt-6 text-sm text-gray-500 hover:text-white underline"
            >
              Upload another file
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={uploadFile} 
          className="hidden" 
        />
      </div>
    </div>
  );
}