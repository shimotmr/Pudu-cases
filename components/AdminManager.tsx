import React, { useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { gasService } from '../services/gasService';
import { X, Trash2, UserPlus, Shield } from 'lucide-react';

interface AdminManagerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail: string;
}

export const AdminManager: React.FC<AdminManagerProps> = ({ isOpen, onClose, currentUserEmail }) => {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadAdmins();
    }
  }, [isOpen]);

  const loadAdmins = async () => {
    setLoading(true);
    const list = await gasService.getAdmins();
    setAdmins(list);
    setLoading(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.includes('@')) {
      setError('Invalid email address');
      return;
    }
    
    // Check local duplicate before sending
    if (admins.some(a => a.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setError('Admin already exists');
      return;
    }

    setLoading(true);
    await gasService.addAdmin(newEmail.trim(), currentUserEmail);
    setNewEmail('');
    setError('');
    await loadAdmins();
    setLoading(false);
  };

  const handleRemove = async (email: string) => {
    if (window.confirm(`Remove admin access for ${email}?`)) {
      setLoading(true);
      await gasService.removeAdmin(email);
      await loadAdmins();
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <Shield className="text-pudu-blue" size={20} />
            <h2 className="text-lg font-bold text-slate-800">Manage Admins</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {/* Add New */}
          <form onSubmit={handleAdd} className="mb-6">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Add new administrator</label>
            <div className="flex gap-2">
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="google_account@email.com"
                className="flex-1 px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-pudu-blue focus:border-pudu-blue outline-none"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-pudu-blue text-white p-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <UserPlus size={20} />
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </form>

          {/* List */}
          <div className="space-y-3">
             <label className="block text-xs font-semibold text-slate-500 uppercase">Current Admins ({admins.length})</label>
             <div className="max-h-60 overflow-y-auto pr-1 space-y-2">
               {loading && admins.length === 0 ? (
                 <p className="text-sm text-slate-400 text-center py-4">Loading...</p>
               ) : (
                 admins.map((admin) => (
                   <div key={admin.email} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium text-slate-800 truncate" title={admin.email}>{admin.email}</p>
                        <p className="text-[10px] text-slate-400">Added by {admin.addedBy}</p>
                      </div>
                      
                      {/* Prevent removing self or if list is length 1 (optional logic, kept simple here) */}
                      {admin.email.toLowerCase() !== currentUserEmail.toLowerCase() && (
                        <button 
                          onClick={() => handleRemove(admin.email)}
                          className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove Access"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                      {admin.email.toLowerCase() === currentUserEmail.toLowerCase() && (
                         <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">You</span>
                      )}
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};