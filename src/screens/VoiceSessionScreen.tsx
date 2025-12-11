import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, FlatList, Alert, Modal, TextInput } from 'react-native';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { parseVoiceInput } from '../utils/voiceParser';
import { formatCurrency } from '../utils/formatters';
import { InventoryItem } from '../types';

export const VoiceSessionScreen = () => {
    const { isListening, text, error, start, stop, setText } = useVoiceRecognition();

    // Local State replicating the Angular component logic
    const [records, setRecords] = useState<InventoryItem[]>([]);
    const [lastAdded, setLastAdded] = useState<InventoryItem | null>(null);

    // Computed values
    const total = useMemo(() => records.reduce((acc, item) => acc + item.subtotal, 0), [records]);
    const totalItems = records.length;

    // Effect to process text input (Debounced)
    useEffect(() => {
        if (!text) return;

        const result = parseVoiceInput(text);
        if (result) {
            // Debounce logic to avoid rapid-fire processing
            const timer = setTimeout(() => {
                if (result.type === 'RECORD') {
                    addRecord(result.data);
                } else if (result.type === 'COMMAND' && result.command === 'DELETE_LAST') {
                    deleteLastRecord();
                }
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [text]);

    const deleteLastRecord = () => {
        if (records.length === 0) return;

        setRecords(prev => {
            const newRecords = [...prev];
            newRecords.pop(); // Remove last
            return newRecords;
        });
        setLastAdded(null);
        setText(''); // Clear text

        // Optional: Feedback?
        // Alert.alert('Eliminado', 'Se eliminó el último registro');
    };

    const addRecord = (item: InventoryItem) => {
        setRecords(prev => [...prev, item]);
        setLastAdded(item);

        // Reset last added highlight after 3 seconds
        setTimeout(() => setLastAdded(null), 3000);

        // Clear text to be ready for next input
        setText('');
    };

    const toggleListening = () => {
        if (isListening) {
            stop();
        } else {
            start();
        }
    };

    // Edit State
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editQty, setEditQty] = useState('');
    const [editPrice, setEditPrice] = useState('');

    const startEditing = (index: number, item: InventoryItem) => {
        setEditingIndex(index);
        setEditQty(item.quantity.toString());
        setEditPrice(item.unitPrice.toString());
    };

    const saveEdit = () => {
        if (editingIndex === null) return;

        const qty = parseFloat(editQty);
        const price = parseFloat(editPrice);

        if (isNaN(qty) || isNaN(price)) {
            Alert.alert('Error', 'Por favor ingresa números válidos');
            return;
        }

        setRecords(prev => {
            const newRecords = [...prev];
            // We need to map the visual index back to the real index if we passed the visual index.
            // But wait, renderItem calculates the realIndex for us. 
            // So if we pass realIndex to startEditing, we can use it directly here.

            // Let's ensure startEditing receives the REAL index.
            const item = newRecords[editingIndex];

            newRecords[editingIndex] = {
                ...item,
                quantity: qty,
                unitPrice: price,
                subtotal: qty * price
            };
            return newRecords;
        });

        cancelEdit();
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditQty('');
        setEditPrice('');
    };

    // Manual Input State
    const [manualInput, setManualInput] = useState('');

    const handleManualSubmit = () => {
        if (!manualInput.trim()) return;

        const result = parseVoiceInput(manualInput);
        if (result) {
            if (result.type === 'RECORD') {
                addRecord(result.data);
            } else if (result.type === 'COMMAND' && result.command === 'DELETE_LAST') {
                deleteLastRecord();
            }
        } else {
            Alert.alert('No entendido', 'No se pudo interpretar el comando.');
        }
        setManualInput('');
    };

    const deleteRecordAtIndex = (index: number) => {
        setRecords(prev => {
            const newRecords = [...prev];
            newRecords.splice(index, 1);
            return newRecords;
        });
    };

    const renderItem = ({ item, index }: { item: InventoryItem, index: number }) => {
        const realIndex = records.length - 1 - index;

        return (
            <View style={styles.recordItem}>
                <View style={{ flex: 1 }}>
                    <View>
                        <Text style={styles.itemQty}>{item.quantity} x</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(item.unitPrice)}</Text>
                    </View>
                    <Text style={styles.itemRaw}>"{item.rawText}"</Text>
                    <Text style={styles.subtotalItem}>{formatCurrency(item.subtotal)}</Text>
                </View>

                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => startEditing(realIndex, item)}
                        style={[styles.deleteBtn, { backgroundColor: '#e3f2fd', marginRight: 5 }]}
                    >
                        <Text style={[styles.deleteBtnText, { color: '#2196f3' }]}>✎</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => deleteRecordAtIndex(realIndex)}
                        style={styles.deleteBtn}
                    >
                        <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sesión de Inventario</Text>

            {/* Mic Section */}
            <View style={styles.micWrapper}>
                <TouchableOpacity
                    style={[styles.micBtn, isListening && styles.micBtnListening]}
                    onPress={toggleListening}
                >
                    <Text style={styles.micIcon}>{isListening ? '●' : '🎤'}</Text>
                </TouchableOpacity>

                <Text style={styles.transcript}>
                    {text || (isListening ? 'Escuchando...' : 'Toca el micro para empezar')}
                </Text>

                {error && <Text style={styles.errorText}>{error}</Text>}

                {/* Manual Input */}
                <View style={styles.manualInputContainer}>
                    <TextInput
                        style={styles.manualInput}
                        placeholder="Escribe un comando..."
                        value={manualInput}
                        onChangeText={setManualInput}
                        onSubmitEditing={handleManualSubmit}
                    />
                    <TouchableOpacity style={styles.sendBtn} onPress={handleManualSubmit}>
                        <Text style={styles.sendBtnText}>Enviar</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Summary Section */}
            <View style={styles.totalSummary}>
                <Text style={styles.totalLabel}>Total General</Text>
                <Text style={styles.totalAmount}>{formatCurrency(total)}</Text>
            </View>

            {/* Feedback Card */}
            {lastAdded && (
                <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackTitle}>Agregado Correctamente</Text>
                    <Text>
                        <Text style={styles.itemQty}>{lastAdded.quantity}</Text> unidades a
                        <Text style={styles.itemPrice}> {formatCurrency(lastAdded.unitPrice)}</Text>
                    </Text>
                    <Text style={styles.subtotal}>Subtotal: {formatCurrency(lastAdded.subtotal)}</Text>
                </View>
            )}

            {/* List Header */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>Registros Recientes</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Items: {totalItems}</Text>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={[...records].reverse()} // Show newest first
                keyExtractor={(_, index) => index.toString()}
                renderItem={renderItem}
                style={styles.list}
            />

            {/* Edit Modal */}
            <Modal
                transparent={true}
                visible={editingIndex !== null}
                animationType="slide"
                onRequestClose={cancelEdit}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Registro</Text>

                        <Text style={styles.inputLabel}>Cantidad:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={editQty}
                            onChangeText={setEditQty}
                        />

                        <Text style={styles.inputLabel}>Precio Unitario:</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={editPrice}
                            onChangeText={setEditPrice}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={cancelEdit}>
                                <Text style={styles.cancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalBtn, styles.saveBtn]} onPress={saveEdit}>
                                <Text style={styles.saveBtnText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    micWrapper: { alignItems: 'center', marginBottom: 20 },
    micBtn: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#eee',
        justifyContent: 'center', alignItems: 'center', marginBottom: 10
    },
    micBtnListening: { backgroundColor: '#ff4757' },
    micIcon: { fontSize: 30 },
    transcript: { fontSize: 16, color: '#666', minHeight: 24, textAlign: 'center' },
    errorText: { color: '#ff6b6b', marginTop: 10, fontWeight: '500' },
    totalSummary: {
        backgroundColor: '#4a4a4a', padding: 20, borderRadius: 15, marginBottom: 20, alignItems: 'center'
    },
    totalLabel: { color: 'white', opacity: 0.8 },
    totalAmount: { color: 'white', fontSize: 32, fontWeight: 'bold' },
    feedbackCard: {
        backgroundColor: '#d4edda', padding: 15, borderRadius: 10, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: '#28a745'
    },
    feedbackTitle: { color: '#155724', fontWeight: 'bold', marginBottom: 5 },
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    listTitle: { fontSize: 18, fontWeight: 'bold' },
    badge: { backgroundColor: '#eee', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
    badgeText: { fontSize: 12 },
    list: { flex: 1 },
    recordItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee'
    },
    itemQty: { fontWeight: 'bold', color: '#007bff' },
    itemPrice: { color: '#28a745' },
    itemRaw: { fontStyle: 'italic', color: '#999', fontSize: 12 },
    subtotalItem: { fontWeight: 'bold' },
    subtotal: { fontWeight: 'bold', marginTop: 5 },
    deleteBtn: {
        padding: 10,
        marginLeft: 10,
        backgroundColor: '#ffebee',
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteBtnText: {
        color: '#ff4757',
        fontWeight: 'bold',
        fontSize: 16
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        padding: 20,
        borderRadius: 15,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center'
    },
    inputLabel: {
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 10,
        fontSize: 16
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    modalBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 5
    },
    cancelBtn: { backgroundColor: '#eee' },
    saveBtn: { backgroundColor: '#28a745' },
    cancelBtnText: { color: '#333', fontWeight: 'bold' },
    saveBtnText: { color: 'white', fontWeight: 'bold' },
    manualInputContainer: {
        flexDirection: 'row',
        marginTop: 15,
        width: '100%'
    },
    manualInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginRight: 10,
        backgroundColor: '#f9f9f9'
    },
    sendBtn: {
        backgroundColor: '#007bff',
        justifyContent: 'center',
        paddingHorizontal: 15,
        borderRadius: 20
    },
    sendBtnText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
