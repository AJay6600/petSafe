import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LogOut, 
  ShieldAlert, 
  QrCode, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';
import { Button, Tag } from 'antd';

interface HeaderBarProps {
  pageType: 'home' | 'dashboard' | 'admin';
  user?: any;
  unreadAlertsCount?: number;
  totalAlertsCount?: number;
  onOpenInbox?: () => void;
  onLogout?: () => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  pageType,
  user,
  unreadAlertsCount = 0,
  totalAlertsCount = 0,
  onOpenInbox,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full max-w-7xl mx-auto flex items-center justify-between py-3.5 px-4 sm:px-6 bg-[#0b0f19]/90 backdrop-blur-md rounded-2xl border border-slate-800/80 mb-6 shadow-2xl sticky top-2 z-50">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <div className="w-9 h-9 rounded-xl bg-[#00E599]/10 border border-[#00E599]/30 flex items-center justify-center text-[#00E599] font-extrabold text-lg shadow-[0_0_12px_rgba(0,229,153,0.15)]">
          <QrCode className="w-5 h-5 text-[#00E599]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white leading-none font-heading">
              PetSafe
            </h1>
            <span className="text-[10px] font-extrabold bg-[#00E599]/15 border border-[#00E599]/40 text-[#00E599] px-2 py-0.5 rounded-md uppercase tracking-wider">
              PRO
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Pet Emergency & Protection Command Center</p>
        </div>
      </div>

      {/* Dynamic Right Actions for Home Page */}
      {pageType === 'home' && (
        <>
          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#lost-pets" className="hover:text-[#00E599] transition-colors">Lost pets</a>
            <a href="#features" className="hover:text-[#00E599] transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-[#00E599] transition-colors">How it works</a>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <Link to="/dashboard">
                <Button 
                  type="primary" 
                  size="middle" 
                  className="bg-[#00E599] hover:bg-[#00CC88] text-black font-extrabold border-none text-xs rounded-xl px-5 h-9 shadow-[0_0_15px_rgba(0,229,153,0.25)]"
                >
                  Go to dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                  Log In
                </Link>
                <Link to="/register">
                  <Button 
                    type="primary" 
                    size="middle" 
                    className="bg-[#00E599] hover:bg-[#00CC88] text-black font-extrabold border-none text-xs rounded-xl px-5 h-9 shadow-[0_0_15px_rgba(0,229,153,0.25)]"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Dynamic Right Actions for Dashboard Page */}
      {pageType === 'dashboard' && (
        <div className="hidden md:flex items-center gap-3">
          {user?.role === 'ADMIN' && (
            <Link to="/admin">
              <Button
                icon={<ShieldAlert className="w-4 h-4 inline mr-1 text-amber-400" />}
                className="bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60 rounded-xl text-xs font-semibold h-9 px-3"
              >
                Admin Panel
              </Button>
            </Link>
          )}

          {/* Alerts Badge Trigger (Matches reference UI badge '10 alerts') */}
          {unreadAlertsCount > 0 ? (
            <button
              type="button"
              onClick={onOpenInbox}
              className="bg-rose-950/80 border border-rose-500/60 hover:bg-rose-900/80 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all animate-pulse shadow-lg cursor-pointer"
            >
              <Bell className="w-4 h-4 text-rose-400" />
              <span>{unreadAlertsCount} alerts</span>
            </button>
          ) : totalAlertsCount > 0 ? (
            <button
              type="button"
              onClick={onOpenInbox}
              className="bg-amber-950/60 border border-amber-500/40 hover:bg-amber-900/60 text-amber-300 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-400" />
              <span>{totalAlertsCount} alerts</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenInbox}
              className="bg-slate-900 border border-slate-800 text-slate-400 hover:text-white px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all"
            >
              <Bell className="w-4 h-4 text-slate-500" />
              <span>0 alerts</span>
            </button>
          )}

          {/* Logout Icon Button (Exit Arrow in Square matching screenshot) */}
          <button
            type="button"
            onClick={onLogout}
            title="Log Out"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dynamic Right Actions for Admin Page */}
      {pageType === 'admin' && (
        <div className="hidden md:flex items-center gap-3">
          <Link to="/dashboard">
            <Button className="bg-slate-900 border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold h-9">
              Back to Dashboard
            </Button>
          </Link>
          <button
            type="button"
            onClick={onLogout}
            title="Log Out"
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 hover:border-rose-500/40 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Hamburger Button */}
      <button 
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 rounded-xl"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 mt-2 bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl z-50">
          {pageType === 'home' && (
            <div className="flex flex-col space-y-3">
              <a href="#lost-pets" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300">Lost pets</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-slate-300">How it works</a>
              <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                {user ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button block type="primary" className="bg-[#00E599] text-black font-extrabold border-none rounded-xl text-xs h-10">
                      Go to dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button block className="bg-slate-900 text-slate-200 border-slate-800 rounded-xl text-xs h-10">Log In</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button block type="primary" className="bg-[#00E599] text-black font-extrabold border-none rounded-xl text-xs h-10">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {pageType === 'dashboard' && (
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <span className="text-slate-300 font-semibold">{user?.name}</span>
                <Tag color="cyan" className="rounded-full text-[10px]">{user?.role || 'PET OWNER'}</Tag>
              </div>

              {unreadAlertsCount > 0 && (
                <Button
                  block
                  danger
                  icon={<Bell className="w-4 h-4 inline mr-1" />}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenInbox && onOpenInbox();
                  }}
                  className="rounded-xl text-xs font-bold h-10"
                >
                  {unreadAlertsCount} Unread Finder Alerts
                </Button>
              )}

              {user?.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button block className="bg-amber-950/60 border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold h-10">
                    Admin Panel
                  </Button>
                </Link>
              )}

              <Button
                block
                danger
                icon={<LogOut className="w-4 h-4 inline mr-1" />}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onLogout && onLogout();
                }}
                className="rounded-xl text-xs font-medium h-10"
              >
                Log Out
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
