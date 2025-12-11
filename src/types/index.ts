export interface User {
    id: number;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    password?: string; // Only for creation/update
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
