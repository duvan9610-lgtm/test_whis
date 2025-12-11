import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
// Note: In a real app we would fetch this from API

const MOCK_POS = [
    { id: 1, name: 'Tienda Central', address: 'Av. Principal 123' },
    { id: 2, name: 'Sede Norte', address: 'Calle 45 # 10-20' },
];

export const PointOfSaleListScreen = ({ navigation }: any) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreatePointOfSale')}
            >
                <Text style={styles.fabIcon}>+</Text>
            </TouchableOpacity>

            <FlatList
                data={MOCK_POS}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.address}>{item.address}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('AssociateUser', { posId: item.id })}
                            style={styles.actionBtn}
                        >
                            <Text style={styles.actionText}>Asignar</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export const CreatePointOfSaleScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');

    const handleSave = () => {
        Alert.alert('Guardado', `Punto de venta ${name} creado`);
        navigation.goBack();
    };

    return (
        <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre del Punto</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Dirección</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Crear</Text>
            </TouchableOpacity>
        </View>
    );
};

export const AssociateUserScreen = ({ route, navigation }: any) => {
    const { posId } = route.params || {};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Asignar Usuario a POS #{posId}</Text>
            <Text style={styles.subtext}>Selecciona un usuario de la lista...</Text>
            {/* Mock List */}
            <View style={styles.item}>
                <Text>Juan Perez (juan@example.com)</Text>
                <TouchableOpacity onPress={() => { Alert.alert('Asignado'); navigation.goBack(); }}>
                    <Text style={{ color: 'blue' }}>Seleccionar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f6fa' },
    formContainer: { flex: 1, padding: 20, backgroundColor: 'white' },
    item: {
        padding: 15, backgroundColor: 'white', borderRadius: 10, marginBottom: 10,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
    },
    name: { fontWeight: 'bold', fontSize: 16 },
    address: { color: '#666' },
    fab: {
        position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30,
        backgroundColor: '#007bff', justifyContent: 'center', alignItems: 'center', zIndex: 100
    },
    fabIcon: { color: 'white', fontSize: 30, fontWeight: 'bold' },
    actionBtn: { backgroundColor: '#e2e6ea', padding: 8, borderRadius: 5 },
    actionText: { color: '#007bff' },
    label: { fontWeight: 'bold', marginBottom: 5, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
    saveBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 5, alignItems: 'center', marginTop: 20 },
    saveText: { color: 'white', fontWeight: 'bold' },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    subtext: { marginBottom: 20 }
});
