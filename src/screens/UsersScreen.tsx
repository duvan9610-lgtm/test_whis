import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { User, UserRole } from '../types';

export const UsersScreen = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('contador');

    // Check if current user is admin
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' ||
        currentUser?.role === 'admin' || currentUser?.role === 'super_admin';

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await userService.listUsers();
            setUsers(data);
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
        setName('');
        setRole('contador');
        setEditingUser(null);
    };

    const openCreateModal = () => {
        if (!isAdmin) {
            Alert.alert('Acceso Denegado', 'Solo los administradores pueden crear usuarios');
            return;
        }
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (user: User) => {
        if (!isAdmin) {
            Alert.alert('Acceso Denegado', 'Solo los administradores pueden editar usuarios');
            return;
        }
        setEditingUser(user);
        setEmail(user.email);
        setPassword('');
        setName(user.name || '');
        setRole(user.role);
        setModalVisible(true);
    };

    const handleSave = async () => {
        // Validation
        if (!email || !role || !name) {
            Alert.alert('Error', 'Email, Nombre y Rol son obligatorios');
            return;
        }

        try {
            if (editingUser) {
                // UPDATE
                await userService.updateUser(editingUser.id, {
                    name,
                    role,
                    ...(password ? { password } : {})
                });
                Alert.alert('Éxito', 'Usuario actualizado');
            } else {
                // CREATE
                if (!password) {
                    Alert.alert('Error', 'La contraseña es obligatoria para nuevos usuarios');
                    return;
                }
                await userService.createUser({
                    email,
                    password,
                    name,
                    role
                });
                Alert.alert('Éxito', 'Usuario creado');
            }
            setModalVisible(false);
            fetchUsers();
        } catch (error: any) {
            console.error('Error saving user', error);
            const message = error.response?.data?.message || 'No se pudo guardar el usuario';
            Alert.alert('Error', message);
        }
    };

    const handleDelete = (user: User) => {
        if (!isAdmin) {
            Alert.alert('Acceso Denegado', 'Solo los administradores pueden eliminar usuarios');
            return;
        }

        Alert.alert(
            'Confirmar',
            `¿Eliminar a ${user.name || user.email}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await userService.deleteUser(user.id);
                            Alert.alert('Éxito', 'Usuario eliminado');
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
                <Text style={styles.userName}>{item.name || `${item.firstName} ${item.lastName}`}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>{item.role}</Text>
            </View>
            {isAdmin && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(item)} style={styles.editBtn}>
                        <Text style={styles.btnText}>✎</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                        <Text style={styles.btnText}>X</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const RolePicker = () => {
        // SUPER_ADMIN can create any role
        // ADMIN can only create CONTADOR and ADMIN
        const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'super_admin';

        const allRoles: UserRole[] = ['contador', 'admin', 'super_admin'];
        const adminRoles: UserRole[] = ['contador', 'admin'];

        const availableRoles = isSuperAdmin ? allRoles : adminRoles;

        return (
            <View style={styles.rolePickerContainer}>
                <Text style={styles.roleLabel}>Rol:</Text>
                <View style={styles.rolePicker}>
                    {availableRoles.map((r) => (
                        <TouchableOpacity
                            key={r}
                            style={[
                                styles.roleOption,
                                role === r && styles.roleOptionSelected
                            ]}
                            onPress={() => setRole(r)}
                        >
                            <Text style={[
                                styles.roleOptionText,
                                role === r && styles.roleOptionTextSelected
                            ]}>
                                {r.toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        );
    };

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

            {isAdmin && (
                <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </Text>

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
                            placeholder="Nombre Completo"
                            value={name}
                            onChangeText={setName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder={editingUser ? "Nueva Contraseña (Opcional)" : "Contraseña"}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        <RolePicker />

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
    userEmail: { color: '#666', marginTop: 2 },
    userRole: { fontSize: 12, color: '#007bff', fontWeight: 'bold', marginTop: 4 },
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

    rolePickerContainer: { marginBottom: 15 },
    roleLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#333' },
    rolePicker: { flexDirection: 'row', justifyContent: 'space-between' },
    roleOption: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginHorizontal: 2,
        alignItems: 'center'
    },
    roleOptionSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff'
    },
    roleOptionText: {
        fontSize: 10,
        color: '#666'
    },
    roleOptionTextSelected: {
        color: 'white',
        fontWeight: 'bold'
    },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    cancelButton: { backgroundColor: '#6c757d', padding: 10, borderRadius: 5, flex: 1, marginRight: 5, alignItems: 'center' },
    saveButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 5, flex: 1, marginLeft: 5, alignItems: 'center' },
    buttonText: { color: 'white', fontWeight: 'bold' }
});
