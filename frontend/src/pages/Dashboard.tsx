import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  usePetsQuery, 
  useCreatePetMutation, 
  useUpdatePetMutation, 
  useDeletePetMutation 
} from '../hooks/usePets';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchOwnerMessagesApi } from '../api/publicApi';
import { Pet, PetPayload, updatePetStatusApi, downloadQrSheetApi } from '../api/petsApi';
import { PetCard } from '../components/PetCard';
import { QrModal } from '../components/QrModal';
import { PetForm } from './PetForm';
import { HeaderBar } from '../components/HeaderBar';
import { 
  User, 
  Plus, 
  Heart, 
  AlertCircle,
  Mail,
  Download,
  ShieldCheck,
  AlertTriangle,
  Search,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Spin, notification, message as antMessage } from 'antd';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // TanStack Query hooks for pets
  const { data: pets, isLoading, isError, error } = usePetsQuery();
  const createPetMutation = useCreatePetMutation();
  const updatePetMutation = useUpdatePetMutation();
  const deletePetMutation = useDeletePetMutation();
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SAFE' | 'MISSING'>('ALL');

  // Real-Time Notification Polling for Owner Alerts
  const { data: ownerMessages } = useQuery({
    queryKey: ['owner-messages'],
    queryFn: fetchOwnerMessagesApi,
    refetchInterval: 3000,
  });

  const prevCountRef = useRef<number | null>(null);

  const playAlertSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio notification sound unavailable.');
    }
  };

  useEffect(() => {
    if (ownerMessages) {
      if (prevCountRef.current !== null && ownerMessages.length > prevCountRef.current) {
        const latestMsg = ownerMessages[0];
        playAlertSound();

        notification.warning({
          message: '🚨 EMERGENCY FINDER ALERT RECEIVED!',
          description: (
            <div className="space-y-1 text-xs">
              <p><strong>Finder:</strong> {latestMsg.senderName} ({latestMsg.senderContact})</p>
              <p className="italic text-slate-300">"{latestMsg.messageText}"</p>
            </div>
          ),
          duration: 10,
          placement: 'topRight',
          className: 'bg-[#0b0f19] border border-amber-500/50 text-white rounded-2xl shadow-2xl cursor-pointer',
          onClick: () => navigate('/inbox'),
        });
      }
      prevCountRef.current = ownerMessages.length;
    }
  }, [ownerMessages, navigate]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [qrModalPet, setQrModalPet] = useState<Pet | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenAddForm = () => {
    setEditingPet(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (pet: Pet) => {
    setEditingPet(pet);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenQrModal = (pet: Pet) => {
    setQrModalPet(pet);
    setIsQrModalOpen(true);
  };

  const handleOpenInboxPage = (petId?: number) => {
    if (petId) {
      navigate(`/inbox?petId=${petId}`);
    } else {
      navigate('/inbox');
    }
  };

  const handleStatusToggle = async (petId: number, newStatus: 'SAFE' | 'MISSING', lostMessage?: string) => {
    try {
      await updatePetStatusApi(petId, newStatus, lostMessage);
      queryClient.invalidateQueries({ queryKey: ['pets'] });
      antMessage.success(`Pet status updated to ${newStatus}`);
    } catch (err: any) {
      antMessage.error(err.response?.data?.error || 'Failed to update status');
    }
  };

  const handleDownloadQrSheet = async () => {
    setDownloadingPdf(true);
    try {
      const blob = await downloadQrSheetApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'petsafe-qr-sheet.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      antMessage.success('PDF Sheet Downloaded!');
    } catch (err: any) {
      antMessage.error('Failed to download PDF sheet.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleFormSubmit = async (payload: PetPayload) => {
    setFormError(null);
    try {
      if (editingPet) {
        await updatePetMutation.mutateAsync({ id: editingPet.id, data: payload });
      } else {
        await createPetMutation.mutateAsync(payload);
      }
      setIsFormOpen(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error || err.message || 'Operation failed.');
    }
  };

  const handleDeletePet = async (petId: number) => {
    try {
      await deletePetMutation.mutateAsync(petId);
    } catch (err: any) {
      console.error('Delete failed:', err);
    }
  };

  // Metrics computation
  const unreadAlertsCount = ownerMessages ? ownerMessages.filter(m => !m.read).length : 0;
  const totalAlertsCount = ownerMessages ? ownerMessages.length : 0;
  const totalPets = pets ? pets.length : 0;
  const safePetsCount = pets ? pets.filter(p => p.status !== 'MISSING').length : 0;
  const missingPetsCount = pets ? pets.filter(p => p.status === 'MISSING').length : 0;

  // Filtered Pet List
  const filteredPets = pets ? pets.filter(pet => {
    const matchesSearch = searchQuery.trim() === '' || 
      pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pet.breed && pet.breed.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pet.species.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;
    if (statusFilter === 'SAFE') return pet.status !== 'MISSING';
    if (statusFilter === 'MISSING') return pet.status === 'MISSING';
    return true;
  }) : [];

  const latestAlertMsg = ownerMessages && ownerMessages.length > 0 ? ownerMessages[0] : null;

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
      {/* Dynamic Header Bar */}
      <HeaderBar
        pageType="dashboard"
        user={user}
        unreadAlertsCount={unreadAlertsCount}
        totalAlertsCount={totalAlertsCount}
        onOpenInbox={() => handleOpenInboxPage()}
        onLogout={handleLogout}
      />

      {/* Main Dashboard Body */}
      <main className="w-full max-w-7xl mx-auto flex-1 space-y-6">
        {/* Top 4 Metrics Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Metric 1: Total Pets */}
          <div className="bg-[#0b0f19] border border-slate-800/80 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 text-lg flex-shrink-0">
              <Heart className="w-5 h-5 text-slate-300" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Total pets</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-heading">{totalPets}</span>
            </div>
          </div>

          {/* Metric 2: Safe & protected */}
          <div className="bg-[#0b0f19] border border-slate-800/80 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Safe & protected</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-[#00E599] font-heading">{safePetsCount}</span>
            </div>
          </div>

          {/* Metric 3: Missing alerts */}
          <div className="bg-[#0b0f19] border border-slate-800/80 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="w-11 h-11 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-center text-rose-400 text-lg flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Missing alerts</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-heading">{missingPetsCount}</span>
            </div>
          </div>

          {/* Metric 4: Finder Inbox (Navigates to /inbox Page) */}
          <div 
            onClick={() => handleOpenInboxPage()}
            className="bg-[#0b0f19] border border-slate-800/80 p-4 sm:p-5 rounded-2xl flex items-center gap-4 shadow-lg cursor-pointer hover:border-amber-500/40 transition-colors group"
          >
            <div className="w-11 h-11 rounded-xl bg-amber-950/60 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Finder Inbox</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                {totalAlertsCount}
              </span>
            </div>
          </div>
        </div>

        {/* Live Emergency Finder Alert Banner */}
        {totalAlertsCount > 0 && (
          <div className="bg-[#121008] border border-amber-500/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                <MapPin className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-amber-300 font-heading">
                  Live emergency finder alert
                </h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  {latestAlertMsg 
                    ? `A finder (${latestAlertMsg.senderName}) sent an alert. You have ${unreadAlertsCount} unread messages.` 
                    : `You have ${unreadAlertsCount} unread messages in your finder inbox.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenInboxPage()}
              className="bg-[#eab308] hover:bg-[#d97706] text-black font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 flex-shrink-0 transition-colors"
            >
              <Mail className="w-4 h-4 text-black" />
              <span>Open inbox</span>
              <ChevronRight className="w-4 h-4 text-black" />
            </button>
          </div>
        )}

        {/* User Profile & Action Row Banner */}
        <div className="bg-[#0b0f19] p-5 sm:p-6 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
              <User className="w-6 h-6 text-[#00E599]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-heading">{user?.name}</h2>
                <span className="text-[10px] font-extrabold bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599] px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {user?.role || 'PET OWNER'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleDownloadQrSheet}
              disabled={downloadingPdf}
              title="Download Printable PDF QR Sheet"
              className="w-11 h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className="bg-[#00E599] hover:bg-[#00CC88] text-black font-extrabold text-xs h-11 px-6 rounded-xl shadow-[0_0_20px_rgba(0,229,153,0.25)] flex items-center justify-center gap-2 flex-1 sm:flex-none transition-colors"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Add new pet</span>
            </button>
          </div>
        </div>

        {/* Registered Collar Tags Header & Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight font-heading flex items-center gap-2">
                Registered collar tags <span className="text-xs text-slate-400 font-mono">({filteredPets.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Review public details and update each pet's safety state.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search pets"
                  className="w-full bg-[#0b0f19] border border-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-[#00E599]"
                />
              </div>

              <div className="flex items-center gap-1 bg-[#0b0f19] p-1 rounded-xl border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'ALL' ? 'bg-[#00E599] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('SAFE')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'SAFE' ? 'bg-[#00E599] text-black font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Safe
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('MISSING')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    statusFilter === 'MISSING' ? 'bg-rose-600 text-white font-extrabold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Missing
                </button>
              </div>
            </div>
          </div>

          {/* Pet Cards Grid */}
          {isLoading ? (
            <div className="py-20 text-center space-y-4">
              <Spin size="large" />
              <p className="text-xs text-slate-400">Loading pet collar profiles...</p>
            </div>
          ) : isError ? (
            <div className="p-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl flex items-center gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 text-rose-400" />
              <div>
                <p className="font-semibold text-sm">Failed to load pet profiles</p>
                <p className="text-xs text-rose-400">{error?.message || 'Unable to connect to service.'}</p>
              </div>
            </div>
          ) : filteredPets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredPets.map((pet) => {
                const petMessageCount = ownerMessages 
                  ? ownerMessages.filter(m => m.petId === pet.id && !m.read).length 
                  : 0;

                return (
                  <PetCard
                    key={pet.id}
                    pet={pet}
                    messageCount={petMessageCount}
                    onViewQr={handleOpenQrModal}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeletePet}
                    onStatusToggle={handleStatusToggle}
                    onOpenInbox={handleOpenInboxPage}
                    deleting={deletePetMutation.isPending}
                  />
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0b0f19] p-12 rounded-2xl text-center space-y-4 border border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center text-3xl mx-auto">
                🐾
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-heading">No pet profiles match your filter</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  {searchQuery || statusFilter !== 'ALL' 
                    ? "Try adjusting your search or filter pills." 
                    : "Click '+ Add new pet' to register your first pet and generate a smart collar QR tag."}
                </p>
              </div>
              {(!searchQuery && statusFilter === 'ALL') && (
                <button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="bg-[#00E599] text-black font-extrabold text-xs h-10 px-5 rounded-xl"
                >
                  Add Your First Pet
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto text-center text-xs text-slate-500 py-6 border-t border-slate-900 mt-12">
        PetSafe PRO • Pet Emergency & Protection Command Center
      </footer>

      {/* Pet Form Modal */}
      <PetForm
        open={isFormOpen}
        petToEdit={editingPet}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        submitting={createPetMutation.isPending || updatePetMutation.isPending}
        error={formError}
      />

      {/* QR Code Modal */}
      <QrModal
        pet={qrModalPet}
        open={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
};
