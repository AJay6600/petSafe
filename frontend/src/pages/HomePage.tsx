import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { fetchPublicLostPetsApi } from '../api/publicApi';
import { HeaderBar } from '../components/HeaderBar';
import { 
  ShieldCheck, 
  Heart, 
  ArrowRight,
  ExternalLink,
  Smartphone,
  Shield,
  Bell,
  Radio
} from 'lucide-react';
import { Button, Spin } from 'antd';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: lostPets, isLoading: isLostPetsLoading } = useQuery({
    queryKey: ['public-lost-pets'],
    queryFn: fetchPublicLostPetsApi,
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#00E599] selection:text-black p-4 sm:p-6">
      {/* Shared Header Navigation Bar */}
      <HeaderBar pageType="home" user={user} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 px-6 text-center overflow-hidden">
        {/* Subtle grid background overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0A1617] border border-[#00E599]/30 text-[11px] text-[#00E599] font-semibold tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping"></span>
            SMART QR NETWORK IS LIVE
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-3xl mx-auto font-heading">
            The safety net for pets who <br />
            <span className="text-[#00E599]">never stop exploring.</span>
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-slate-400 text-sm sm:text-base leading-relaxed">
            Smart QR collar tags connect finders directly to you, trigger instant alerts, and share only the emergency details you approve.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to={user ? "/dashboard" : "/register"} className="w-full sm:w-auto">
              <Button
                type="primary"
                size="large"
                className="w-full sm:w-auto bg-[#00E599] hover:bg-[#00CC88] text-black font-extrabold border-none h-12 px-7 rounded-xl text-sm shadow-[0_0_25px_rgba(0,229,153,0.35)] flex items-center justify-center gap-2"
              >
                Protect your pet <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                size="large"
                className="w-full sm:w-auto bg-[#0A101D] border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 h-12 px-7 rounded-xl text-sm font-semibold"
              >
                See how it works
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Lost Pets Board (Community Watch) */}
      <section id="lost-pets" className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-bold tracking-widest text-[#00E599] uppercase block mb-1">COMMUNITY WATCH</span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">Lost pets board</h2>
              <p className="text-xs text-slate-400 mt-1">Help reunite local pets with their families.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E599] animate-ping"></span>
              <span className="text-[11px] font-semibold text-slate-400 bg-[#0b0f19] px-3 py-1.5 rounded-full border border-slate-800">
                Live Feed • Updates automatically
              </span>
            </div>
          </div>

          {isLostPetsLoading ? (
            <div className="py-16 text-center space-y-3">
              <Spin size="large" />
              <p className="text-xs text-slate-400">Loading missing pets bulletin...</p>
            </div>
          ) : lostPets && lostPets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {lostPets.map((pet) => {
                const isMissing = pet.status === 'MISSING';
                return (
                  <div 
                    key={pet.id} 
                    className="bg-[#0b0f19] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all duration-300 group"
                  >
                    <div className="relative">
                      <img 
                        src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'} 
                        alt={pet.name} 
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3">
                        {isMissing ? (
                          <span className="bg-rose-600 text-white font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg animate-pulse">
                            MISSING
                          </span>
                        ) : (
                          <span className="bg-emerald-600 text-white font-black text-[9px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow-lg">
                            SAFE
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-bold text-white font-heading">{pet.name}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">{pet.species} {pet.breed ? `• ${pet.breed}` : ''}</p>
                        
                        {pet.lostMessage && (
                          <p className="text-xs text-rose-200/90 italic bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/30 mt-3 leading-relaxed">
                            "{pet.lostMessage}"
                          </p>
                        )}
                      </div>

                      <Link to={`/pet/${pet.qrToken}`} className="mt-2 block">
                        <Button
                          type="primary"
                          danger={isMissing}
                          block
                          icon={<ExternalLink className="w-3.5 h-3.5 inline mr-1" />}
                          className={`font-bold text-xs h-10 rounded-xl ${isMissing ? 'bg-rose-600 hover:bg-rose-500 border-none' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-white'}`}
                        >
                          {isMissing ? `Found ${pet.name}? Contact Owner` : 'View Public Tag'}
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#0b0f19] border border-slate-800/80 p-10 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00E599]/10 text-[#00E599] flex items-center justify-center text-2xl mx-auto border border-[#00E599]/20">
                💚
              </div>
              <h3 className="text-base font-bold text-white font-heading">All Registered Pets are Currently Safe!</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                There are currently no missing pets reported on the network. If a pet is reported missing by an owner, it will instantly appear here on the community watch board.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Main Interactive Preview Hub (2 Columns) */}
      <section className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Active Recovery Hub */}
          <div className="lg:col-span-7 bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">RECOVERY CONTROL</span>
                <span className="text-[10px] font-bold text-[#00E599] bg-[#00E599]/10 px-2.5 py-1 rounded-full border border-[#00E599]/20 flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#00E599] animate-pulse" />
                  Live feed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">Active recovery hub</h2>
              <p className="text-xs text-slate-400 mt-1">Live status from every protected pet profile</p>
            </div>

            <div className="space-y-4">
              {/* Pet Status Item 1 */}
              <div className="bg-[#070a12] border border-slate-800/90 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80"
                    alt="Barnaby"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white font-heading">Barnaby</h4>
                      <span className="text-[9px] font-bold bg-[#00E599]/15 text-[#00E599] px-2 py-0.5 rounded-full border border-[#00E599]/30 uppercase">
                        PROTECTED
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Golden Retriever • Tag active</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">STATUS</span>
                  <span className="text-xs font-bold text-[#00E599]">Safe at home</span>
                </div>
              </div>

              {/* Alert Item 2 (Urgent Alert) */}
              <div className="bg-[#1A0B12] border border-rose-500/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=150&q=80"
                    alt="Finder Alert"
                    className="w-12 h-12 rounded-xl object-cover border border-rose-500/50"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white font-heading">Live finder alert received</h4>
                      <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full uppercase">
                        URGENT
                      </span>
                    </div>
                    <p className="text-xs text-rose-200/90 italic mt-1">"Found near Central Park bench. Barnaby is safe with me."</p>
                  </div>
                </div>

                <Button
                  type="primary"
                  danger
                  className="bg-rose-600 hover:bg-rose-500 border-none font-bold text-xs rounded-xl px-4 py-2 h-auto"
                >
                  Contact finder
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Smart QR collar tag */}
          <div className="lg:col-span-5 bg-[#0b0f19] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-2xl relative overflow-hidden">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">SCAN TO CONNECT</span>
                <span className="text-[#00E599] font-bold text-xs">🐾</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">Smart QR collar tag</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Durable identification that opens a secure emergency contact page on any phone.
              </p>
            </div>

            {/* Graphic Tag Display Container */}
            <div className="bg-[#070a12] border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
              <img
                src="/smart_qr_tag.jpg"
                alt="Smart QR Collar Tag"
                className="w-48 h-48 object-cover rounded-xl shadow-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="mt-3 w-full bg-[#0b0f19] border border-slate-800/80 px-3 py-2 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium text-[11px]">Public pet profile</span>
                <span className="text-[#00E599] font-bold text-[11px] flex items-center gap-1">
                  ✓ Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Grid Features Highlight Section */}
      <section id="features" className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#0b0f19] border border-slate-800/80 p-7 rounded-2xl space-y-4 hover:border-[#00E599]/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599]">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight font-heading">No app required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Finders simply scan. No download or sign-up stands between your pet and a safe return.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800/80 p-7 rounded-2xl space-y-4 hover:border-[#00E599]/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight font-heading">Privacy first</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose exactly which contact details and medical notes appear on the public scan page.
            </p>
          </div>

          <div className="bg-[#0b0f19] border border-slate-800/80 p-7 rounded-2xl space-y-4 hover:border-[#00E599]/30 transition-all duration-300">
            <div className="w-10 h-10 rounded-xl bg-[#00E599]/10 border border-[#00E599]/20 flex items-center justify-center text-[#00E599]">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight font-heading">Instant live alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Know the moment your pet's tag is scanned and respond while the finder is still nearby.
            </p>
          </div>
        </div>
      </section>

      {/* How it works 4-Step Section */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="space-y-8">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-[#00E599] uppercase block mb-1">PROTECTION IN MINUTES</span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">Four simple steps. One faster way home.</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#0b0f19] border border-slate-800/80 p-6 rounded-2xl space-y-4 relative">
              <span className="text-2xl font-black text-[#00E599] block font-heading">01</span>
              <h4 className="text-base font-bold text-white font-heading">Create your account</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Set up your secure owner profile in seconds.</p>
            </div>

            <div className="bg-[#0b0f19] border border-slate-800/80 p-6 rounded-2xl space-y-4 relative">
              <span className="text-2xl font-black text-[#00E599] block font-heading">02</span>
              <h4 className="text-base font-bold text-white font-heading">Add your pet profile</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Add a photo, care notes, and emergency contacts.</p>
            </div>

            <div className="bg-[#0b0f19] border border-slate-800/80 p-6 rounded-2xl space-y-4 relative">
              <span className="text-2xl font-black text-[#00E599] block font-heading">03</span>
              <h4 className="text-base font-bold text-white font-heading">Attach the QR tag</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Print or attach your unique code to the collar.</p>
            </div>

            <div className="bg-[#0b0f19] border border-slate-800/80 p-6 rounded-2xl space-y-4 relative">
              <span className="text-2xl font-black text-[#00E599] block font-heading">04</span>
              <h4 className="text-base font-bold text-white font-heading">Receive live alerts</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Know immediately when a finder scans the tag.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Callout Action Banner */}
      <section className="max-w-6xl mx-auto px-6 pb-20 w-full">
        <div className="bg-[#081519] border border-[#0F2F32] rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-4 max-w-xl relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <span className="w-8 h-8 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599]">
                <Heart className="w-5 h-5" />
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-heading">
              Make every scan a way home.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Give finders the right information and give yourself immediate peace of mind.
            </p>
          </div>

          <div className="relative z-10 flex-shrink-0">
            <Link to={user ? "/dashboard" : "/register"}>
              <Button
                type="primary"
                size="large"
                className="bg-[#00E599] hover:bg-[#00CC88] text-black font-extrabold border-none h-12 px-8 rounded-xl text-sm shadow-[0_0_25px_rgba(0,229,153,0.35)] flex items-center gap-2"
              >
                Protect your pet <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#04060C] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00E599]/15 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] font-bold text-sm font-heading">
              🐾
            </div>
            <div>
              <span className="font-bold text-white text-sm block font-heading">PetSafe PRO</span>
              <span className="text-[10px] text-slate-500">Pet Emergency & Protection Command Center</span>
            </div>
          </div>

          <p className="text-slate-400 text-xs">Smart pet safety. Built for faster reunions.</p>

          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-400 hover:text-white transition-colors">Owner login</Link>
            <Link to="/register" className="text-slate-400 hover:text-white transition-colors">Create account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
