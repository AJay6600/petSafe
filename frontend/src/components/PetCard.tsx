import React, { useState } from 'react';
import { Pet } from '../api/petsApi';
import { QrCode, Edit3, Trash2, MessageSquare, AlertTriangle, Check } from 'lucide-react';
import { Popconfirm, Modal, Input, message as antMessage } from 'antd';

interface PetCardProps {
  pet: Pet;
  messageCount?: number;
  onViewQr: (pet: Pet) => void;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: number) => void;
  onStatusToggle?: (petId: number, newStatus: 'SAFE' | 'MISSING', lostMessage?: string) => void;
  onOpenInbox?: (petId?: number) => void;
  deleting: boolean;
}

export const PetCard: React.FC<PetCardProps> = ({
  pet,
  messageCount = 0,
  onViewQr,
  onEdit,
  onDelete,
  onStatusToggle,
  onOpenInbox,
  deleting,
}) => {
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [lostMessageText, setLostMessageText] = useState('');

  const visibleFields = pet.fieldsVisibleToPublic 
    ? pet.fieldsVisibleToPublic.split(',').map(f => f.trim()) 
    : ['Name', 'Phone'];

  const isMissing = pet.status === 'MISSING';

  const handleConfirmMissing = () => {
    if (!lostMessageText.trim()) {
      antMessage.error('Please enter a description for the lost pet bulletin.');
      return;
    }
    if (onStatusToggle) {
      onStatusToggle(pet.id, 'MISSING', lostMessageText.trim());
    }
    setIsLostModalOpen(false);
    setLostMessageText('');
  };

  return (
    <>
      <div className={`bg-[#0d1220] rounded-2xl p-5 border flex flex-col justify-between space-y-4 shadow-xl relative transition-all duration-300 ${
        isMissing ? 'border-rose-500/50 shadow-rose-950/20' : 'border-slate-800/90 hover:border-slate-700'
      }`}>
        {/* Top Header Row: Pet Image, Name, Badges & Actions */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3.5">
              {/* Pet Avatar with Corner Status Indicator Dot */}
              <div className="relative flex-shrink-0">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-700/80 shadow-md"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">
                    🐾
                  </div>
                )}
                {/* Status Dot at bottom right of image */}
                <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0d1220] ${
                  isMissing ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                }`} />
              </div>

              {/* Name, Species & Breed */}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-white tracking-tight font-heading">{pet.name}</h3>
                  {isMissing ? (
                    <span className="bg-rose-950/80 border border-rose-500/40 text-rose-400 font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      MISSING
                    </span>
                  ) : (
                    <span className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-extrabold text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      SAFE
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
                </p>
              </div>
            </div>

            {/* Top Right Action Icons (Edit & Delete) */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onEdit(pet)}
                title="Edit Pet Profile"
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <Popconfirm
                title="Delete Pet Profile"
                description={`Are you sure you want to delete ${pet.name}?`}
                onConfirm={() => onDelete(pet.id)}
                okText="Yes, Delete"
                cancelText="Cancel"
                okButtonProps={{ danger: true }}
              >
                <button
                  type="button"
                  title="Delete Pet"
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Popconfirm>
            </div>
          </div>

          {/* Callout Box: PUBLIC LOST BULLETIN (if missing) or MEDICAL & CARE NOTES (if safe) */}
          {isMissing ? (
            <div className="bg-[#1b0d14] border border-rose-500/40 p-3.5 rounded-xl mb-3 text-xs space-y-1">
              <span className="text-[10px] font-extrabold tracking-wider text-rose-400 uppercase block">
                PUBLIC LOST BULLETIN
              </span>
              <p className="text-slate-200 text-xs italic leading-relaxed">
                "{pet.lostMessage || 'Last seen nearby. Please contact owner if spotted.'}"
              </p>
            </div>
          ) : pet.medicalNotes ? (
            <div className="bg-[#181811] border border-amber-500/40 p-3.5 rounded-xl mb-3 text-xs space-y-1">
              <span className="text-[10px] font-extrabold tracking-wider text-amber-400 uppercase block">
                MEDICAL & CARE NOTES
              </span>
              <p className="text-slate-200 text-xs leading-relaxed">
                {pet.medicalNotes}
              </p>
            </div>
          ) : null}

          {/* Sub-Panels Row (2 Side-by-Side Equal Columns) */}
          <div className="grid grid-cols-2 gap-3 mb-2">
            {/* Sub-Panel 1: MEDICAL NOTES */}
            <div className="bg-[#090d17] border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                MEDICAL NOTES
              </span>
              <p className="text-slate-300 text-[11px] leading-tight">
                {pet.medicalNotes ? pet.medicalNotes : 'No medical warnings recorded.'}
              </p>
            </div>

            {/* Sub-Panel 2: PUBLIC SCAN DISPLAY */}
            <div className="bg-[#090d17] border border-slate-800/80 p-3 rounded-xl text-xs space-y-1">
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 block">
                PUBLIC SCAN DISPLAY
              </span>
              <div className="flex flex-wrap gap-1 pt-0.5">
                {visibleFields.map((field) => (
                  <span key={field} className="text-[9px] font-semibold bg-slate-800/90 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60">
                    {field}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Card Action Controls Row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          {/* Main Action Button (Mark as safe OR Report missing) */}
          {onStatusToggle && (
            <button
              type="button"
              onClick={() => {
                if (isMissing) {
                  onStatusToggle(pet.id, 'SAFE');
                } else {
                  setIsLostModalOpen(true);
                }
              }}
              className={`flex-1 rounded-xl text-xs font-bold h-10 flex items-center justify-center gap-2 transition-colors border ${
                isMissing
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/50'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-400 hover:bg-rose-900/50'
              }`}
            >
              {isMissing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Mark as safe</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Report missing</span>
                </>
              )}
            </button>
          )}

          {/* QR Matrix Code Square Button */}
          <button
            type="button"
            onClick={() => onViewQr(pet)}
            title="View QR Collar Tag"
            className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <QrCode className="w-5 h-5" />
          </button>

          {/* Inbox Alert Button (Navigates to /inbox Page) */}
          <button
            type="button"
            onClick={() => onOpenInbox && onOpenInbox(pet.id)}
            title={`${messageCount} Finder Alerts (Open Chat Page)`}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
              messageCount > 0 
                ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse' 
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Report Missing Modal Prompt */}
      <Modal
        title={
          <div className="flex items-center gap-2 text-rose-400 font-bold text-base font-heading">
            <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            Report {pet.name} as Missing
          </div>
        }
        open={isLostModalOpen}
        onCancel={() => setIsLostModalOpen(false)}
        onOk={handleConfirmMissing}
        okText="Publish Lost Bulletin"
        okButtonProps={{ danger: true }}
        centered
        className="dark-modal"
      >
        <div className="py-4 space-y-3">
          <p className="text-xs text-slate-300 leading-relaxed">
            Specify emergency details (e.g. last seen location, collar color, distinct markings, or reward note) for the public lost pet bulletin:
          </p>
          <Input.TextArea
            rows={4}
            value={lostMessageText}
            onChange={(e) => setLostMessageText(e.target.value)}
            placeholder="e.g. Last seen at KP. Shy around strangers—please approach slowly."
            className="bg-slate-950 border-slate-800 text-white rounded-xl text-xs"
          />
        </div>
      </Modal>
    </>
  );
};
