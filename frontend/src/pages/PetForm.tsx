import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Modal, Input, Select, Checkbox, Button, Alert } from 'antd';
import { Pet, PetPayload } from '../api/petsApi';
import { Heart, Plus, Edit3, ShieldCheck } from 'lucide-react';

interface PetFormProps {
  open: boolean;
  petToEdit: Pet | null;
  onClose: () => void;
  onSubmit: (data: PetPayload) => Promise<void>;
  submitting: boolean;
  error: string | null;
}

interface FormFields {
  name: string;
  species: string;
  breed: string;
  photoUrl: string;
  medicalNotes: string;
  publicFields: string[];
}

export const PetForm: React.FC<PetFormProps> = ({
  open,
  petToEdit,
  onClose,
  onSubmit,
  submitting,
  error,
}) => {
  const { control, handleSubmit, reset, setValue } = useForm<FormFields>({
    defaultValues: {
      name: '',
      species: 'Dog',
      breed: '',
      photoUrl: '',
      medicalNotes: '',
      publicFields: ['name', 'phone'],
    },
  });

  useEffect(() => {
    if (petToEdit) {
      setValue('name', petToEdit.name);
      setValue('species', petToEdit.species);
      setValue('breed', petToEdit.breed || '');
      setValue('photoUrl', petToEdit.photoUrl || '');
      setValue('medicalNotes', petToEdit.medicalNotes || '');
      if (petToEdit.fieldsVisibleToPublic) {
        setValue('publicFields', petToEdit.fieldsVisibleToPublic.split(',').map(f => f.trim()));
      }
    } else {
      reset({
        name: '',
        species: 'Dog',
        breed: '',
        photoUrl: '',
        medicalNotes: '',
        publicFields: ['name', 'phone'],
      });
    }
  }, [petToEdit, open, setValue, reset]);

  const handleFormSubmit = async (formData: FormFields) => {
    const payload: PetPayload = {
      name: formData.name,
      species: formData.species,
      breed: formData.breed,
      photoUrl: formData.photoUrl,
      medicalNotes: formData.medicalNotes,
      fieldsVisibleToPublic: formData.publicFields.join(','),
    };

    await onSubmit(payload);
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-white font-bold text-base">
          {petToEdit ? <Edit3 className="w-5 h-5 text-emerald-400" /> : <Plus className="w-5 h-5 text-emerald-400" />}
          {petToEdit ? `Edit Profile — ${petToEdit.name}` : 'Add New Pet Profile'}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      className="dark-modal"
    >
      <div className="py-4 space-y-4">
        {error && (
          <Alert
            message="Operation Error"
            description={error}
            type="error"
            showIcon
            className="bg-rose-500/10 border-rose-500/30 text-rose-200 text-xs rounded-xl"
          />
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Pet Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pet Name *</label>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Pet name is required' }}
              render={({ field, fieldState }) => (
                <>
                  <Input {...field} placeholder="e.g. Barnaby" size="large" className="bg-slate-900 border-slate-800 text-white rounded-xl" />
                  {fieldState.error && <p className="text-xs text-rose-400 mt-1">{fieldState.error.message}</p>}
                </>
              )}
            />
          </div>

          {/* Species & Breed Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Species *</label>
              <Controller
                name="species"
                control={control}
                rules={{ required: 'Species is required' }}
                render={({ field }) => (
                  <Select
                    {...field}
                    size="large"
                    className="w-full text-white"
                    options={[
                      { label: 'Dog 🐕', value: 'Dog' },
                      { label: 'Cat 🐈', value: 'Cat' },
                      { label: 'Bird 🦜', value: 'Bird' },
                      { label: 'Other 🐾', value: 'Other' },
                    ]}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Breed</label>
              <Controller
                name="breed"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="e.g. Golden Retriever" size="large" className="bg-slate-900 border-slate-800 text-white rounded-xl" />
                )}
              />
            </div>
          </div>

          {/* Photo URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Photo URL (Optional)</label>
            <Controller
              name="photoUrl"
              control={control}
              render={({ field }) => (
                <Input {...field} placeholder="https://images.unsplash.com/photo-..." size="large" className="bg-slate-900 border-slate-800 text-white rounded-xl" />
              )}
            />
          </div>

          {/* Medical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Medical Notes & Special Needs</label>
            <Controller
              name="medicalNotes"
              control={control}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  placeholder="e.g. Diabetic, requires insulin twice daily. Extremely friendly."
                  rows={3}
                  className="bg-slate-900 border-slate-800 text-white rounded-xl"
                />
              )}
            />
          </div>

          {/* Public Scan Visibility Checkboxes */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Public Scan Visibility Controls
            </div>
            <p className="text-[11px] text-slate-400">Select which fields finders can view when scanning your pet's QR collar tag:</p>

            <Controller
              name="publicFields"
              control={control}
              render={({ field }) => (
                <Checkbox.Group
                  {...field}
                  options={[
                    { label: 'Pet Name', value: 'name' },
                    { label: 'Owner Phone Number', value: 'phone' },
                    { label: 'Medical Notes', value: 'medicalNotes' },
                  ]}
                  className="text-slate-300 text-xs gap-4"
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button onClick={onClose} className="rounded-xl border-slate-800 text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="bg-emerald-600 hover:bg-emerald-500 border-none font-semibold rounded-xl px-6"
            >
              {petToEdit ? 'Save Changes' : 'Generate QR & Add Pet'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
