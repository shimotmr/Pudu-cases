import React, { useEffect, useState, useMemo } from 'react';
import { VideoCase, FilterState, UserProfile } from './types';
import { VideoCard } from './components/VideoCard';
import { AdminModal } from './components/AdminModal';
import { AdminManager } from './components/AdminManager';
import { gasService } from './services/gasService';
import { Search, Filter, Plus, RefreshCw, LogOut, Settings } from 'lucide-react';

// Extend Window interface for Google Sign-In object
declare global {
  interface Window {
    google?: any;
  }
}

// NOTE: Replace this with your actual Google Cloud Client ID for production use.
// If empty, the app will offer a "Demo Login" button for testing purposes.
const GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"; 

const App: React.FC = () => {
  const [data, setData] = useState<VideoCase[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthorizedAdmin, setIsAuthorizedAdmin] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminManager, setShowAdminManager] = useState(false);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState<VideoCase | undefined>(undefined);
  
  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: '',
    region: '',
    robotType: ''
  });

  // Unique values for dropdowns
  const categories = useMemo(() => Array.from(new Set(data.map(d => d.category))).sort(), [data]);
  const regions = useMemo(() => Array.from(new Set(data.map(d => d.region))).sort(), [data]);
  const robots = useMemo(() => Array.from(new Set(data.map(d => d.robotType))).sort(), [data]);

  useEffect(() => {
    fetchData();
    // Initialize Google Button if not signed in
    if (!user && window.google) {
      initGoogleSignIn();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    const result = await gasService.getAll();
    setData(result);
    setLoading(false);
  };

  const initGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
      // console.warn("No Google Client ID provided. Using demo mode.");
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
      });
      window.google.accounts.id.renderButton(
        document.getElementById("googleButton"),
        { theme: "outline", size: "large", type: "standard" }
      );
    } catch (e) {
      console.error("Google Sign-In Error", e);
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Decode JWT (Basic implementation)
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      const userProfile: UserProfile = {
        email: payload.email,
        name: payload.name,
        picture: payload.picture
      };
      
      setUser(userProfile);
      checkAdminStatus(userProfile.email);
    } catch (e) {
      console.error("Error decoding token", e);
    }
  };

  const demoLogin = () => {
    const demoUser = {
      email: 'williamhsiao@aurotek.com',
      name: 'William Hsiao (Demo)',
      picture: 'https://ui-avatars.com/api/?name=William+Hsiao&background=0D8ABC&color=fff'
    };
    setUser(demoUser);
    checkAdminStatus(demoUser.email);
  };

  const checkAdminStatus = async (email: string) => {
    const admins = await gasService.getAdmins();
    const isAuth = admins.some(admin => admin.email.toLowerCase() === email.toLowerCase());
    setIsAuthorizedAdmin(isAuth);
    if (isAuth) {
      setIsAdminMode(true);
    } else {
      setIsAdminMode(false);
      alert("Access Denied: Your email is not on the admin list.");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthorizedAdmin(false);
    setIsAdminMode(false);
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  // --- Filtering Logic ---
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = 
        item.clientName.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.keywords.some(k => k.toLowerCase().includes(filters.search.toLowerCase())) ||
        item.subcategory?.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchCategory = filters.category ? item.category === filters.category : true;
      const matchRegion = filters.region ? item.region === filters.region : true;
      const matchRobot = filters.robotType ? item.robotType === filters.robotType : true;

      return matchSearch && matchCategory && matchRegion && matchRobot;
    });
  }, [data, filters]);

  // --- CRUD Handlers ---
  const handleCreate = () => {
    setEditingCase(undefined);
    setModalOpen(true);
  };

  const handleEdit = (item: VideoCase) => {
    setEditingCase(item);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this case?')) {
      const success = await gasService.delete(id);
      if (success) fetchData();
    }
  };

  const handleSave = async (item: Partial<VideoCase>) => {
    if (editingCase) {
      await gasService.update({ ...editingCase, ...item } as VideoCase);
    } else {
      await gasService.create(item as VideoCase);
    }
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <img 
               src="https://aurotek.com/wp-content/uploads/2025/07/logo.svg" 
               alt="Aurotek" 
               className="h-10 w-auto object-contain"
               onError={(e) => {
                 // Fallback to text if image fails
                 e.currentTarget.style.display = 'none';
                 e.currentTarget.nextElementSibling?.classList.remove('hidden');
               }}
             />
             <div className="hidden text-xl font-bold tracking-tight text-red-600 border-2 border-red-600 rounded-full w-10 h-10 flex items-center justify-center">
               A
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-900">PUDU Robotics</h1>
               <p className="text-xs text-slate-500 font-medium">Video Case Library</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             {!user ? (
               <div className="flex items-center gap-2">
                 {/* This div is target for Google Button */}
                 <div id="googleButton"></div>
                 {/* Fallback demo button if no client ID */}
                 {(!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") && (
                    <button 
                      onClick={demoLogin}
                      className="text-xs text-slate-500 underline hover:text-pudu-blue"
                    >
                      Login
                    </button>
                 )}
               </div>
             ) : (
               <div className="flex items-center gap-3">
                 {isAuthorizedAdmin ? (
                   <>
                     <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full">
                        <span className="text-xs font-semibold text-slate-600">Admin Mode</span>
                        <button 
                          onClick={() => setIsAdminMode(!isAdminMode)}
                          className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${isAdminMode ? 'bg-pudu-blue' : 'bg-slate-300'}`}
                        >
                          <div className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform duration-200 ${isAdminMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
                        </button>
                     </div>

                     {isAdminMode && (
                        <button 
                          onClick={() => setShowAdminManager(true)}
                          className="p-2 text-slate-500 hover:text-pudu-blue hover:bg-slate-100 rounded-full transition-colors"
                          title="Manage Admins"
                        >
                          <Settings size={20} />
                        </button>
                     )}
                   </>
                 ) : (
                   <span className="text-xs text-red-500 font-medium bg-red-50 px-2 py-1 rounded">Read Only</span>
                 )}

                 <div className="flex items-center gap-2 border-l pl-3 border-slate-200">
                   <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full border border-slate-200" />
                   <button onClick={handleLogout} className="text-slate-400 hover:text-red-500" title="Logout">
                     <LogOut size={18} />
                   </button>
                 </div>
               </div>
             )}

             {isAdminMode && (
               <button 
                onClick={handleCreate}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-md shadow-slate-200"
               >
                 <Plus size={16} /> <span className="hidden sm:inline">New Case</span>
               </button>
             )}
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-white border-b border-slate-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            {/* Search */}
            <div className="relative w-full lg:w-1/3 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pudu-blue transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by client, keyword, or subcategory..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-pudu-blue/20 focus:border-pudu-blue outline-none transition-all"
              />
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap lg:flex-nowrap gap-3 w-full lg:w-2/3 justify-start lg:justify-end">
               <select 
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-pudu-blue outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({...prev, category: e.target.value}))}
               >
                 <option value="">All Categories</option>
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>

               <select 
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-pudu-blue outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={filters.region}
                  onChange={(e) => setFilters(prev => ({...prev, region: e.target.value}))}
               >
                 <option value="">All Regions</option>
                 {regions.map(r => <option key={r} value={r}>{r}</option>)}
               </select>

               <select 
                  className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:border-pudu-blue outline-none cursor-pointer hover:bg-slate-100 transition-colors"
                  value={filters.robotType}
                  onChange={(e) => setFilters(prev => ({...prev, robotType: e.target.value}))}
               >
                 <option value="">All Robots</option>
                 {robots.map(r => <option key={r} value={r}>{r}</option>)}
               </select>

               <button 
                  onClick={() => setFilters({ search: '', category: '', region: '', robotType: '' })}
                  className="p-2.5 text-slate-400 hover:text-pudu-blue hover:bg-blue-50 rounded-xl transition-colors"
                  title="Reset Filters"
               >
                 <RefreshCw size={20} />
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pudu-blue"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-slate-500 font-medium">
              Showing {filteredData.length} result{filteredData.length !== 1 && 's'}
            </div>
            
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredData.map(item => (
                  <VideoCard
                    key={item.id}
                    data={item}
                    isAdmin={isAdminMode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <div className="inline-block p-4 bg-slate-50 rounded-full mb-4">
                  <Filter size={32} className="text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No cases found</h3>
                <p className="text-slate-500">Try adjusting your filters or search query.</p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Case Management Modal */}
      <AdminModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleSave} 
        initialData={editingCase}
      />

      {/* Admin Users Management Modal */}
      {user && (
        <AdminManager 
          isOpen={showAdminManager}
          onClose={() => setShowAdminManager(false)}
          currentUserEmail={user.email}
        />
      )}
    </div>
  );
};

export default App;