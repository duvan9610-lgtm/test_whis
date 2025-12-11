import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import apiClient from '../api/client';
import { User } from '../types';

export const UsersScreen = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [role, setRole] = useState('user');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.get<User[]>('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users', error);
            Alert.alert('Error', 'No se pudieron cargar los usuarios');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
        setRole('user');
        setEditingUser(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEmail(user.email);
        setPassword(''); // Password usually not returned, keep empty or require strictly if changing
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setRole(user.role);
        setModalVisible(true);
    };

    const handleSave = async () => {
        // Validation
        if (!email || !role) {
            Alert.alert('Error', 'Email y Rol son obligatorios');
            return;
        }

        try {
            if (editingUser) {
                // UPDATE
                await apiClient.put(`/users/${editingUser.id}`, {
                    firstName,
                    lastName,
                    role,
                    // Only send password if provided
                    ...(password ? { password } : {})
                });
                Alert.alert('Éxito', 'Usuario actualizado');
            } else {
                // CREATE (Register)
                if (!password) {
                    Alert.alert('Error', 'La contraseña es obligatoria para nuevos usuarios');
                    return;
                }
                await apiClient.post('/auth/register', {
                    email,
                    password,
                    firstName,
                    lastName,
                    role
                });
                Alert.alert('Éxito', 'Usuario creado');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user', error);
            Alert.alert('Error', 'No se pudo guardar el usuario');
        }
    };

    const handleDelete = (user: User) => {
        Alert.alert(
            'Confirmar',
            `¿Eliminar a ${user.email}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/users/${user.id}`);
                            fetchUsers();
                        } catch (error) {
                            Alert.alert('Error', 'No se pudo eliminar');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: User }) => (
        <View style={styles.userCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
                    <Text style={styles.btnText}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                    <Text style={styles.btnText}>X</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
                <FlatList
                    data={users}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</Text>

                        {!editingUser && (
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        )}

                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            value={firstName}
                            onChangeText={setFirstName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Apellido"
                            value={lastName}
                            onChangeText={setLastName}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder={editingUser ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Rol (admin | user)"
                            value={role}
                            onChangeText={setRole}
                            autoCapitalize="none"
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                                <Text style={styles.buttonText}>Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    list: { padding: 20 },
    userCard: {
        backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10,
        flexDirection: 'row', alignItems: 'center', elevation: 2
    },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    userEmail: { color: '#666' },
    userRole: { fontSize: 12, color: '#007bff', fontWeight: 'bold', marginTop: 2 },
    actions: { flexDirection: 'row' },
    editBtn: { backgroundColor: '#ffc107', padding: 8, borderRadius: 5, marginRight: 10 },
    deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
    btnText: { color: 'white', fontWeight: 'bold' },

    fab: {
        position: 'absolute', right: 20, bottom: 20,
        backgroundColor: '#007bff', width: 56, height: 56, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', elevation: 5
    },
    fabText: { color: 'white', fontSize: 30, fontWeight: 'bold' },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },
    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
    saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold' }
});
