import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const ReportsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Reportes</Text>
            <Text style={styles.subtext}>Funcionalidad en construcción...</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    text: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
    subtext: { fontSize: 16, color: '#666' }
});
