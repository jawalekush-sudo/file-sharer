"use client";
import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using your secure environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This function triggers the hidden HTML input when the styled box is clicked
  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  // This handles the actual upload to the Supabase 'files' bucket
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    // Creates a unique filename so users don't overwrite each other's files
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('files')
      .upload(`public/${fileName}`, file);

    setIsUploading(false);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      alert('File uploaded successfully! Check your Supabase dashboard.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="bg-[#1a1a1a] p-10 rounded-2xl shadow-xl w-96 flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">QuickShare</h1>
        
        {/* Your custom styled dropzone/click zone */}
        <div 
          onClick={handleBoxClick}
          className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-white/5 transition-all"
        >
          <p className="text-gray-400 font-medium">
            {isUploading ? 'Uploading to cloud...' : 'Click to upload a file'}
          </p>
        </div>

        {/* The hidden actual file input */}
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