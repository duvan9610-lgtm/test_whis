import apiClient from '../api/client';
import { InventoryItem } from '../types';

export interface InventoryCut {
    id: number;
    posId: number;
    status: 'OPEN' | 'CLOSED';
    createdAt: string;
    pos: {
        id: number;
        name: string;
    };
}

export interface SyncPayload {
    cutId: number;
    deviceId: string;
    section?: string;
    records: {
        rawText: string;
        quantity: number;
        unitPrice: number;
        productIdentifier: string;
    }[];
}

export const inventoryService = {
    // List open cuts for the user
    getOpenCuts: async (): Promise<InventoryCut[]> => {
        const response = await apiClient.get<InventoryCut[]>('/inventory/cut/open');
        return response.data;
    },

    // Sync records (offline/online)
    syncRecords: async (payload: SyncPayload) => {
        const response = await apiClient.post('/inventory/sync', payload);
        return response.data;
    },

    // Get details of a specific cut
    getCutDetails: async (cutId: number) => {
        const response = await apiClient.get(`/inventory/cut/${cutId}`);
        return response.data;
    }
};
