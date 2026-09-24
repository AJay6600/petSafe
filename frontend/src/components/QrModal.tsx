import React from 'react';
import { Modal, Button, Spin, Tag } from 'antd';
import { Download, QrCode, ExternalLink, ShieldCheck } from 'lucide-react';
import { usePetQrQuery } from '../hooks/usePets';
import { Pet } from '../api/petsApi';

interface QrModalProps {
  pet: Pet | null;
  open: boolean;
  onClose: () => void;
}

export const QrModal: React.FC<QrModalProps> = ({ pet, open, onClose }) => {
  const { data, isLoading, isError } = usePetQrQuery(pet ? pet.id : null);

  const handleDownload = () => {
    if (!data?.qrCodeBase64 || !pet) return;

    const link = document.createElement('a');
    link.href = data.qrCodeBase64;
    link.download = `PetSafe-QR-${pet.name.replace(/\s+/g, '_')}-${pet.qrToken.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const publicUrl = pet ? `${window.location.origin}/pet/${pet.qrToken}` : '';

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-white font-bold text-base">
          <QrCode className="w-5 h-5 text-emerald-400" />
          Collar Tag QR Code — {pet?.name}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="dark-modal"
    >
      <div className="py-4 space-y-6 text-center">
        {isLoading ? (
          <div className="py-12 space-y-3">
            <Spin size="large" />
            <p className="text-xs text-slate-400">Rendering ZXing QR Code PNG...</p>
          </div>
        ) : isError || !data?.qrCodeBase64 ? (
          <div className="py-8 text-rose-400 text-xs">
            Failed to generate QR Code. Please check backend connections.
          </div>
        ) : (
          <>
            {/* QR Code Container */}
            <div className="bg-white p-4 rounded-2xl w-56 h-56 mx-auto shadow-2xl flex items-center justify-center border-4 border-emerald-500/30">
              <img
                src={data.qrCodeBase64}
                alt={`QR Code for ${pet?.name}`}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Token Info & Public Link */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>QR Token (UUID):</span>
                <code className="text-emerald-400 font-mono font-bold">{pet?.qrToken.substring(0, 18)}...</code>
              </div>

              <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-800/80">
                <span>Public Scan URL:</span>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 font-mono flex items-center gap-1 hover:underline text-[11px]"
                >
                  {publicUrl.replace('http://', '')}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-center gap-2.5 text-left text-xs text-emerald-200">
              <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Print or save this QR code tag. Anyone scanning this code will see your exposible contact details to return {pet?.name}.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="primary"
                icon={<Download className="w-4 h-4 inline mr-1" />}
                onClick={handleDownload}
                block
                size="large"
                className="bg-emerald-600 hover:bg-emerald-500 border-none font-semibold rounded-xl"
              >
                Download Tag (PNG)
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
