import React from 'react';
import { VideoCase } from '../types';
import { PlayCircle, Star, Edit, Trash2, ExternalLink } from 'lucide-react';

interface VideoCardProps {
  data: VideoCase;
  isAdmin: boolean;
  onEdit: (data: VideoCase) => void;
  onDelete: (id: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ data, isAdmin, onEdit, onDelete }) => {
  // Helper to generate stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={`${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  // Helper to guess a thumbnail or use a placeholder
  const getThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1];
      
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    // Fallback for Drive/Facebook/etc using a deterministic random image based on ID
    return `https://picsum.photos/seed/${data.id}/400/225`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-slate-100 flex flex-col h-full group">
      {/* Thumbnail Area */}
      <div className="relative aspect-video bg-slate-200 overflow-hidden">
        <img 
          src={getThumbnail(data.videoUrl)} 
          alt={data.clientName}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a 
            href={data.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/40 transition-colors"
          >
            <PlayCircle className="text-white" size={32} />
          </a>
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
           <span className="px-2 py-1 bg-pudu-blue/90 text-white text-xs font-semibold rounded-md backdrop-blur-sm">
             {data.robotType}
           </span>
           <span className="px-2 py-1 bg-slate-900/70 text-white text-xs rounded-md backdrop-blur-sm">
             {data.region}
           </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-slate-800 line-clamp-2 leading-tight min-h-[2.5rem]">
             {data.clientName}
           </h3>
           {isAdmin && (
             <div className="flex gap-1 ml-2">
               <button onClick={() => onEdit(data)} className="p-1 text-slate-400 hover:text-pudu-blue transition-colors">
                 <Edit size={16} />
               </button>
               <button onClick={() => onDelete(data.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                 <Trash2 size={16} />
               </button>
             </div>
           )}
        </div>

        <div className="flex items-center gap-1 mb-3">
          {renderStars(data.rating)}
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {data.keywords.slice(0, 3).map((kw, idx) => (
            <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              {kw}
            </span>
          ))}
          {data.keywords.length > 3 && (
             <span className="text-[10px] px-2 py-0.5 text-slate-400">+{data.keywords.length - 3}</span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
           <span>{data.category} {data.subcategory ? `• ${data.subcategory}` : ''}</span>
           <a 
            href={data.videoUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-pudu-blue hover:underline font-medium"
           >
             Watch <ExternalLink size={12} />
           </a>
        </div>
      </div>
    </div>
  );
};