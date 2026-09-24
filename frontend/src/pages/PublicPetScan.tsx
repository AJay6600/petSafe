import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { 
  fetchPublicPetApi, 
  sendFinderMessageApi, 
  PublicPetDto, 
  FinderMessagePayload 
} from '../api/publicApi';
import { 
  ShieldCheck, 
  Heart, 
  Phone, 
  Send, 
  AlertTriangle, 
  CheckCircle2, 
  User,
  MapPin
} from 'lucide-react';
import { Input, Button, Tag, Alert, Spin } from 'antd';

export const PublicPetScan: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<PublicPetDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FinderMessagePayload>({
    defaultValues: {
      senderName: '',
      senderContact: '',
      messageText: '',
    },
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setFetchError(null);

    fetchPublicPetApi(token)
      .then((data) => {
        setPet(data);
      })
      .catch((err) => {
        setFetchError(err.response?.data?.error || 'Tag not found or invalid QR token.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

  const getCoordinates = (): Promise<{ latitude?: number; longitude?: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({});
        return;
      }

      const timer = setTimeout(() => {
        resolve({});
      }, 4000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timer);
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        () => {
          clearTimeout(timer);
          resolve({});
        },
        { enableHighAccuracy: true, timeout: 3500, maximumAge: 60000 }
      );
    });
  };

  const onSendAlert = async (data: FinderMessagePayload) => {
    if (!token) return;
    setSendError(null);
    setSending(true);

    try {
      const coords = await getCoordinates();
      const payload: FinderMessagePayload = {
        ...data,
        ...coords,
      };

      const res = await sendFinderMessageApi(token, payload);
      setSendSuccess(true);
      reset();
      // Redirect finder to public chat thread
      if (res.conversationId) {
        setTimeout(() => {
          navigate(`/pet/${token}/chat/${res.conversationId}`);
        }, 1200);
      }
    } catch (err: any) {
      setSendError(err.response?.data?.error || 'Failed to send alert.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 space-y-4">
        <Spin size="large" />
        <p className="text-sm font-medium text-slate-400">Loading Pet Profile...</p>
      </div>
    );
  }

  if (fetchError || !pet) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">QR Tag Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {fetchError || 'This QR token is not associated with an active pet profile.'}
          </p>
          <Link to="/">
            <Button type="primary" className="bg-emerald-600 hover:bg-emerald-500 border-none rounded-xl mt-2 text-xs font-semibold">
              Go to PetSafe Homepage
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6">
      {/* Top Banner */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-4 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg">
            🐾
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">PetSafe Tag Scan</h1>
            <p className="text-[11px] text-slate-400">Emergency Pet Identification Tag</p>
          </div>
        </div>

        <Tag color="success" className="rounded-full text-[10px] font-semibold px-2.5 py-0.5">
          TAG ACTIVE
        </Tag>
      </header>

      {/* Main Scan Profile Card */}
      <main className="w-full max-w-xl mx-auto flex-1 space-y-6">
        {/* Prominent Missing Alert Banner */}
        {pet.status === 'MISSING' && (
          <div className="bg-rose-950/80 border-2 border-rose-500/80 p-5 rounded-3xl text-rose-100 flex items-center gap-4 shadow-2xl animate-pulse">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0 text-2xl font-bold">
              🚨
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight uppercase">Emergency: This Pet Is Reported Missing!</h2>
              <p className="text-xs text-rose-200/90 leading-relaxed mt-0.5">
                The owner is actively searching for {pet.name}. Please contact the owner or send a finder alert below immediately.
              </p>
            </div>
          </div>
        )}

        {/* Pet Identification Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 border-b border-slate-800/80 pb-6">
            {pet.photoUrl ? (
              <img
                src={pet.photoUrl}
                alt={pet.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-700 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-3xl font-bold">
                🐾
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-white">{pet.name}</h2>
                <Tag color="cyan" className="rounded-full text-xs font-semibold">
                  {pet.species.toUpperCase()}
                </Tag>
                {pet.status === 'MISSING' ? (
                  <Tag color="error" className="rounded-full text-xs font-bold px-2.5 py-0.5 animate-pulse border-none">
                    🚨 MISSING PET
                  </Tag>
                ) : (
                  <Tag color="success" className="rounded-full text-xs font-semibold px-2.5 py-0.5">
                    SAFE
                  </Tag>
                )}
              </div>
              <p className="text-xs text-slate-400">{pet.breed || 'Mixed Breed'}</p>
            </div>
          </div>

          {/* Medical Notes & Care Alert */}
          {pet.medicalNotes && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 text-xs">
                <Heart className="w-4 h-4 text-amber-400" />
                Care & Medical Notes:
              </span>
              <p className="text-amber-200/90 leading-relaxed text-xs">{pet.medicalNotes}</p>
            </div>
          )}

          {/* Owner Emergency Contact */}
          {pet.ownerContact && (
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Owner Name</span>
                  <span className="text-sm font-bold text-white">{pet.ownerName || 'Pet Owner'}</span>
                </div>
              </div>

              <a href={`mailto:${pet.ownerContact}`}>
                <Button icon={<Phone className="w-3.5 h-3.5 inline mr-1" />} className="bg-emerald-600 hover:bg-emerald-500 border-none text-white text-xs font-semibold rounded-xl">
                  Contact Owner
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Finder Emergency Alert Form */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 shadow-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" />
              Send Emergency Alert to Owner
            </h3>
            <p className="text-xs text-slate-400">
              Your message will be delivered directly to the owner's dashboard inbox.
            </p>
          </div>

          {sendSuccess && (
            <Alert
              message="Emergency Alert Transmitted!"
              description="Your alert was sent directly to the owner's inbox. Thank you for helping return this pet!"
              type="success"
              showIcon
              icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              className="bg-emerald-500/10 border-emerald-500/30 text-emerald-200 text-xs rounded-2xl"
            />
          )}

          {sendError && (
            <Alert
              message="Transmission Issue / Cooldown"
              description={sendError}
              type="error"
              showIcon
              className="bg-rose-500/10 border-rose-500/30 text-rose-200 text-xs rounded-2xl"
            />
          )}

          <form onSubmit={handleSubmit(onSendAlert)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
              <Controller
                name="senderName"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} placeholder="e.g. Alex Johnson" size="large" className="bg-slate-900 border-slate-800 text-white rounded-xl" />
                    {fieldState.error && <p className="text-xs text-rose-400 mt-1">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Phone / Location *</label>
              <Controller
                name="senderContact"
                control={control}
                rules={{ required: 'Contact info is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <Input {...field} placeholder="e.g. 555-0199 or Near Central Park bench" size="large" className="bg-slate-900 border-slate-800 text-white rounded-xl" />
                    {fieldState.error && <p className="text-xs text-rose-400 mt-1">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Message for Owner *</label>
              <Controller
                name="messageText"
                control={control}
                rules={{ required: 'Message is required' }}
                render={({ field, fieldState }) => (
                  <>
                    <Input.TextArea
                      {...field}
                      placeholder="e.g. I found Barnaby wearing his collar tag! Safe at the park entrance."
                      rows={3}
                      className="bg-slate-900 border-slate-800 text-white rounded-xl"
                    />
                    {fieldState.error && <p className="text-xs text-rose-400 mt-1">{fieldState.error.message}</p>}
                  </>
                )}
              />
            </div>

            <div className="flex items-center gap-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>We'll ask to share your location so the owner knows where their pet was spotted (optional).</span>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              loading={sending}
              icon={<Send className="w-4 h-4 inline mr-1" />}
              block
              size="large"
              className="bg-emerald-600 hover:bg-emerald-500 border-none font-bold text-sm h-11 rounded-xl shadow-lg"
            >
              Send Emergency Alert to Owner
            </Button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-xl mx-auto text-center text-xs text-slate-500 py-6 border-t border-slate-900 mt-8">
        PetSafe Emergency Identification Tag System
      </footer>
    </div>
  );
};
