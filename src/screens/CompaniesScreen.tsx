import React, { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, Modal,
    TextInput, Alert, ActivityIndicator
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { companyService } from '../services/companyService';
import { Company } from '../types';

export const CompaniesScreen = () => {
    const { user: currentUser } = useAuth();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCompany, setEditingCompany] = useState<Company | null>(null);

    // Form State
    const [companyName, setCompanyName] = useState('');
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'super_admin';

    useEffect(() => {
        if (!isSuperAdmin) {
            Alert.alert('Acceso Denegado', 'Solo SUPER_ADMIN puede acceder a esta pantalla');
            return;
        }
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            console.log('Fetching companies...');
            const data = await companyService.listCompanies();
            console.log('Companies received:', JSON.stringify(data, null, 2));
            setCompanies(data);
        } catch (error) {
            console.error('Error fetching companies', error);
            Alert.alert('Error', 'No se pudieron cargar las empresas');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setCompanyName('');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setEditingCompany(null);
    };

    const openCreateModal = () => {
        resetForm();
        setModalVisible(true);
    };

    const openEditModal = (company: Company) => {
        setEditingCompany(company);
        setCompanyName(company.name);
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('');
        setModalVisible(true);
    };

    const handleSave = async () => {
        // Validation
        if (!companyName) {
            Alert.alert('Error', 'El nombre de la empresa es obligatorio');
            return;
        }

        if (editingCompany) {
            // UPDATE COMPANY
            try {
                await companyService.updateCompany(editingCompany.id, companyName);
                Alert.alert('Éxito', 'Empresa actualizada correctamente');
                setModalVisible(false);
                fetchCompanies();
            } catch (error: any) {
                console.error('Error updating company', error);
                Alert.alert('Error', error.message || 'No se pudo actualizar la empresa');
            }
        } else {
            // CREATE COMPANY
            if (!adminName || !adminEmail || !adminPassword) {
                Alert.alert('Error', 'Todos los campos del administrador son obligatorios');
                return;
            }

            handleCreate();
        }
    };

    const handleCreate = async () => {
        // Validation
        if (!companyName || !adminName || !adminEmail || !adminPassword) {
            Alert.alert('Error', 'Todos los campos son obligatorios');
            return;
        }

        try {
            const payload = {
                name: companyName,
                adminUser: {
                    name: adminName,
                    email: adminEmail,
                    password: adminPassword
                }
            };
            console.log('Creating company with payload:', JSON.stringify(payload, null, 2));

            const result = await companyService.createCompany(payload);
            console.log('Company created, response:', JSON.stringify(result, null, 2));

            Alert.alert('Éxito', 'Empresa y administrador creados correctamente');
            setModalVisible(false);
            fetchCompanies();
        } catch (error: any) {
            console.error('Error creating company', error);
            console.error('Error response:', error.response?.data);
            const message = error.response?.data?.message || 'No se pudo crear la empresa';
            Alert.alert('Error', message);
        }
    };

    const handleDelete = (company: Company) => {
        Alert.alert(
            'Confirmar',
            `¿Eliminar la empresa "${company.name}"? Esta acción no se puede deshacer.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await companyService.deleteCompany(company.id);
                            Alert.alert('Éxito', 'Empresa eliminada');
                            fetchCompanies();
                        } catch (error: any) {
                            Alert.alert('Error', error.message || 'No se pudo eliminar la empresa');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Company }) => (
        <View style={styles.companyCard}>
            <View style={{ flex: 1 }}>
                <Text style={styles.companyName}>{item.name}</Text>
                {item.createdAt && (
                    <Text style={styles.companyDate}>
                        Creada: {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                )}
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

    if (!isSuperAdmin) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Acceso Denegado</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Empresas</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
                <FlatList
                    data={companies}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No hay empresas registradas</Text>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalBg}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingCompany ? 'Editar Empresa' : 'Nueva Empresa'}
                        </Text>

                        <Text style={styles.sectionTitle}>Datos de la Empresa</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre de la Empresa"
                            value={companyName}
                            onChangeText={setCompanyName}
                        />

                        {!editingCompany && (
                            <>
                                <Text style={styles.sectionTitle}>Administrador de la Empresa</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nombre del Administrador"
                                    value={adminName}
                                    onChangeText={setAdminName}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email del Administrador"
                                    value={adminEmail}
                                    onChangeText={setAdminEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Contraseña del Administrador"
                                    value={adminPassword}
                                    onChangeText={setAdminPassword}
                                    secureTextEntry
                                />
                            </>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.buttonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                                <Text style={styles.buttonText}>
                                    {editingCompany ? 'Actualizar' : 'Crear'}
                                </Text>
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
    header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#ddd' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
    list: { padding: 20 },
    companyCard: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2
    },
    companyName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    companyDate: { color: '#666', marginTop: 4, fontSize: 12 },
    emptyText: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
    errorText: { textAlign: 'center', color: '#dc3545', marginTop: 40, fontSize: 18 },

    actions: { flexDirection: 'row' },
    editBtn: { backgroundColor: '#ffc107', padding: 8, borderRadius: 5, marginRight: 10 },
    deleteBtn: { backgroundColor: '#dc3545', padding: 8, borderRadius: 5 },
    btnText: { color: 'white', fontWeight: 'bold' },

    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        backgroundColor: '#007bff',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },
    fabText: { color: 'white', fontSize: 30, fontWeight: 'bold' },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 10, padding: 20 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#007bff', marginTop: 10, marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 10, borderRadius: 5, marginBottom: 10 },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    cancelButton: {
        backgroundColor: '#6c757d',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center'
    },
    saveButton: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center'
    },
    buttonText: { color: 'white', fontWeight: 'bold' }
});
