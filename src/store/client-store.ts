'use client';

import { create } from 'zustand';
import { Client } from '@/app/admin/clients/page';

interface ClientState {
  client: Client | null;
  setClient: (client: Client | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useClientStore = create<ClientState>((set) => ({
  client: null,
  isLoading: true,
  setClient: (client) => set({ client, isLoading: false }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));
