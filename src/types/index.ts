export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'CONTADOR' | 'admin' | 'super_admin' | 'contador';

export interface User {
    id: number;
    email: string;
    name: string;
    role: UserRole;
    isActive?: boolean;
    companyId?: number;
    createdAt?: string;
    // Legacy fields for backward compatibility (can be removed later)
    firstName?: string;
    lastName?: string;
    password?: string; // Only for creation/update
}

export interface Company {
    id: number;
    name: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface InventoryItem {
    quantity: number;
    unitPrice: number;
    rawText: string;
    productIdentifier: string; // Initially same as rawText or derived
    subtotal: number;
}

export type VoiceCommandType = 'DELETE_LAST';

export type ParsedVoiceResult =
    | { type: 'RECORD'; data: InventoryItem }
    | { type: 'COMMAND'; command: VoiceCommandType; rawText: string };
