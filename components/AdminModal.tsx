import React, { useState, useEffect } from 'react';
import { VideoCase } from '../types';
import { X } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<VideoCase>) => void;
  initialData?: VideoCase;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<VideoCase>>({
    clientName: '',
    category: 'Catering',
    subcategory: '',
    region: '',
    robotType: 'BellaBot',
    videoUrl: '',
    rating: 3,
    keywords: []
  });

  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        clientName: '',
        category: 'Catering',
        subcategory: '',
        region: '',
        robotType: 'BellaBot',
        videoUrl: '',
        rating: 3,
        keywords: []
      });
    }
    setKeywordInput('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }));
  };

  const addKeyword = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && keywordInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter((_, i) => i !== idx)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Case' : 'Add New Case'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client / Title</label>
              <input
                required
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue focus:border-pudu-blue outline-none transition-all"
                placeholder="e.g. McDonald's"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Region</label>
              <input
                required
                name="region"
                value={formData.region}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue focus:border-pudu-blue outline-none"
                placeholder="e.g. USA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue outline-none"
              >
                <option value="Promo">Product Promo</option>
                <option value="Catering">Catering</option>
                <option value="Retail">Retail</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subcategory</label>
              <input
                name="subcategory"
                value={formData.subcategory}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue outline-none"
                placeholder="e.g. Hotpot"
              />
            </div>
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Robot</label>
              <select
                name="robotType"
                value={formData.robotType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue outline-none"
              >
                <option value="BellaBot">BellaBot</option>
                <option value="KettyBot">KettyBot</option>
                <option value="PuduBot">PuduBot</option>
                <option value="HolaBot">HolaBot</option>
                <option value="FlashBot">FlashBot</option>
                <option value="CC1">CC1</option>
                <option value="SH1">SH1</option>
              </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Video URL</label>
             <input
                required
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue focus:border-pudu-blue outline-none"
                placeholder="YouTube or Drive Link"
              />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Rating (1-5)</label>
            <input 
              type="range" 
              min="1" 
              max="5" 
              value={formData.rating} 
              onChange={handleRatingChange}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pudu-blue"
            />
            <div className="flex justify-between text-xs text-slate-500 px-1 mt-1">
              <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Keywords (Press Enter to add)</label>
             <input
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pudu-blue focus:border-pudu-blue outline-none mb-2"
                placeholder="e.g. Delivery Mode"
              />
              <div className="flex flex-wrap gap-2">
                {formData.keywords?.map((k, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-sm flex items-center gap-1 border border-slate-200">
                    {k}
                    <button type="button" onClick={() => removeKeyword(idx)} className="hover:text-red-500"><X size={14}/></button>
                  </span>
                ))}
              </div>
          </div>

          <div className="flex justify-end pt-4 gap-3">
             <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
               Cancel
             </button>
             <button type="submit" className="px-6 py-2 bg-pudu-blue text-white font-medium rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200">
               Save Case
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};