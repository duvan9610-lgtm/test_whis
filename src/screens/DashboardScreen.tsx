import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Users: undefined;
    Reports: undefined;
    VoiceInventory: undefined;
    PointsOfSale: undefined;
    Companies: undefined;
};

type DashboardNavProp = StackNavigationProp<RootStackParamList>;

export const DashboardScreen = () => {
    const navigation = useNavigation<DashboardNavProp>();
    const { logout, user } = useAuth();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcome}>Hola, {user?.email}</Text>
                <TouchableOpacity onPress={() => logout()} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Salir</Text>
                </TouchableOpacity>
            </View>

            {/* Debug info */}
            <Text style={styles.sectionTitle}>Menú Principal</Text>
            <Text style={{ fontSize: 12, color: '#999', marginBottom: 10 }}>
                Rol actual: {user?.role || 'No definido'}
            </Text>

            <View style={styles.grid}>
                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#4834d4' }]}
                    onPress={() => navigation.navigate('VoiceInventory')}
                >
                    <Text style={styles.cardEmoji}>🎤</Text>
                    <Text style={styles.cardText}>Inventario por Voz</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#686de0' }]}
                    onPress={() => navigation.navigate('Users')}
                >
                    <Text style={styles.cardEmoji}>👥</Text>
                    <Text style={styles.cardText}>Usuarios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#22a6b3' }]}
                    onPress={() => navigation.navigate('Reports')}
                >
                    <Text style={styles.cardEmoji}>📊</Text>
                    <Text style={styles.cardText}>Reportes</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.card, { backgroundColor: '#f0932b' }]}
                    onPress={() => navigation.navigate('PointsOfSale')}
                >
                    <Text style={styles.cardEmoji}>🏪</Text>
                    <Text style={styles.cardText}>Puntos de Venta</Text>
                </TouchableOpacity>

                {(user?.role === 'SUPER_ADMIN' || user?.role === 'super_admin') && (
                    <TouchableOpacity
                        style={[styles.card, { backgroundColor: '#6c5ce7' }]}
                        onPress={() => navigation.navigate('Companies')}
                    >
                        <Text style={styles.cardEmoji}>🏢</Text>
                        <Text style={styles.cardText}>Empresas</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f6fa', padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 10 },
    welcome: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    logoutBtn: { padding: 8, backgroundColor: '#eb4d4b', borderRadius: 5 },
    logoutText: { color: 'white', fontWeight: 'bold' },
    sectionTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    card: {
        width: '48%', aspectRatio: 1, borderRadius: 20, padding: 20,
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84
    },
    cardEmoji: { fontSize: 40, marginBottom: 10 },
    cardText: { color: 'white', fontWeight: 'bold', fontSize: 16, textAlign: 'center' }
});
