import axios from 'axios';

export interface PublicPetDto {
  id: number;
  name: string;
  species: string;
  breed?: string;
  photoUrl?: string;
  medicalNotes?: string;
  ownerName?: string;
  ownerContact?: string;
  fieldsVisibleToPublic?: string;
  qrToken: string;
  status?: 'SAFE' | 'MISSING';
  lostMessage?: string;
}

export interface FinderMessagePayload {
  senderName: string;
  senderContact: string;
  messageText: string;
  conversationId?: string;
  latitude?: number;
  longitude?: number;
}

export interface Message {
  id: number;
  petId: number;
  conversationId: string;
  senderName: string;
  senderContact: string;
  senderType?: 'FINDER' | 'OWNER';
  messageText: string;
  sentAt: string;
  read?: boolean;
  respondedAt?: string;
  latitude?: number;
  longitude?: number;
}

export const fetchPublicPetApi = async (token: string): Promise<PublicPetDto> => {
  const response = await axios.get<PublicPetDto>(`/api/public/pet/${token}`);
  return response.data;
};

export const fetchPublicLostPetsApi = async (): Promise<PublicPetDto[]> => {
  const response = await axios.get<PublicPetDto[]>('/api/public/lost-pets');
  return response.data;
};

export const sendFinderMessageApi = async (token: string, payload: FinderMessagePayload): Promise<{ message: string; conversationId: string }> => {
  const response = await axios.post<{ message: string; conversationId: string }>(`/api/public/pet/${token}/message`, payload);
  return response.data;
};

export const fetchConversationMessagesApi = async (conversationId: string): Promise<Message[]> => {
  const response = await axios.get<Message[]>(`/api/public/conversations/${conversationId}/messages`);
  return response.data;
};

export const sendConversationMessageApi = async (conversationId: string, payload: FinderMessagePayload): Promise<void> => {
  await axios.post(`/api/public/conversations/${conversationId}/message`, payload);
};

export const ownerReplyConversationApi = async (conversationId: string, messageText: string, petId: number): Promise<void> => {
  await axios.post(`/api/conversations/${conversationId}/reply`, { messageText, petId });
};

export const fetchPetMessagesApi = async (petId: number): Promise<Message[]> => {
  const response = await axios.get<Message[]>(`/api/messages/pet/${petId}`);
  return response.data;
};

export const fetchOwnerMessagesApi = async (): Promise<Message[]> => {
  const response = await axios.get<Message[]>('/api/messages/owner');
  return response.data;
};

export const markMessageAsReadApi = async (messageId: number): Promise<void> => {
  await axios.put(`/api/messages/${messageId}/read`);
};

export const deleteConversationApi = async (conversationId: string): Promise<void> => {
  await axios.delete(`/api/conversations/${conversationId}`);
};

export const deletePetMessagesApi = async (petId: number): Promise<void> => {
  await axios.delete(`/api/messages/pet/${petId}`);
};

export const deleteAllOwnerMessagesApi = async (): Promise<void> => {
  await axios.delete('/api/messages/owner/all');
};
