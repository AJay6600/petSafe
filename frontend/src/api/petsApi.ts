import axios from 'axios';

export interface Pet {
  id: number;
  ownerId: number;
  name: string;
  species: string;
  breed?: string;
  photoUrl?: string;
  medicalNotes?: string;
  qrToken: string;
  fieldsVisibleToPublic?: string;
  status: 'SAFE' | 'MISSING';
  lostMessage?: string;
  createdAt: string;
}

export interface PetPayload {
  name: string;
  species: string;
  breed?: string;
  photoUrl?: string;
  medicalNotes?: string;
  fieldsVisibleToPublic?: string;
  status?: 'SAFE' | 'MISSING';
  lostMessage?: string;
}

export interface QrCodeResponse {
  qrCodeBase64: string;
}

export const fetchPetsApi = async (): Promise<Pet[]> => {
  const response = await axios.get<Pet[]>('/api/pets');
  return response.data;
};

export const fetchPetByIdApi = async (id: number): Promise<Pet> => {
  const response = await axios.get<Pet>(`/api/pets/${id}`);
  return response.data;
};

export const createPetApi = async (data: PetPayload): Promise<Pet> => {
  const response = await axios.post<Pet>('/api/pets', data);
  return response.data;
};

export const updatePetApi = async (id: number, data: PetPayload): Promise<Pet> => {
  const response = await axios.put<Pet>(`/api/pets/${id}`, data);
  return response.data;
};

export const updatePetStatusApi = async (id: number, status: 'SAFE' | 'MISSING', lostMessage?: string): Promise<Pet> => {
  const response = await axios.put<Pet>(`/api/pets/${id}/status`, { status, lostMessage });
  return response.data;
};

export const deletePetApi = async (id: number): Promise<void> => {
  await axios.delete(`/api/pets/${id}`);
};

export const fetchPetQrApi = async (id: number): Promise<QrCodeResponse> => {
  const response = await axios.get<QrCodeResponse>(`/api/pets/${id}/qr`);
  return response.data;
};

export const downloadQrSheetApi = async (): Promise<Blob> => {
  const response = await axios.get('/api/pets/qr-sheet', { responseType: 'blob' });
  return response.data;
};
