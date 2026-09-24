import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchPetsApi, 
  createPetApi, 
  updatePetApi, 
  deletePetApi, 
  fetchPetQrApi, 
  PetPayload 
} from '../api/petsApi';

export const PETS_QUERY_KEY = ['pets'];

export const usePetsQuery = () => {
  return useQuery({
    queryKey: PETS_QUERY_KEY,
    queryFn: fetchPetsApi,
  });
};

export const useCreatePetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PetPayload) => createPetApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
};

export const useUpdatePetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PetPayload }) => updatePetApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
};

export const useDeletePetMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deletePetApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PETS_QUERY_KEY });
    },
  });
};

export const usePetQrQuery = (petId: number | null) => {
  return useQuery({
    queryKey: ['pet-qr', petId],
    queryFn: () => fetchPetQrApi(petId!),
    enabled: !!petId,
  });
};
