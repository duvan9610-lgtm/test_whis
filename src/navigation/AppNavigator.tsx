import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Screens
import { LoginScreen } from '../screens/LoginScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VoiceSessionScreen } from '../screens/VoiceSessionScreen';
import { UsersScreen } from '../screens/UsersScreen';
import { ReportsScreen } from '../screens/ReportsScreen';
import { PointOfSaleListScreen, CreatePointOfSaleScreen, AssociateUserScreen } from '../screens/PointsOfSale';

const Stack = createStackNavigator();

export const AppNavigator = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // Authenticated Stack
                    <>
                        <Stack.Screen name="Dashboard" component={DashboardScreen} />
                        <Stack.Screen
                            name="VoiceInventory"
                            component={VoiceSessionScreen}
                            options={{ headerShown: true, title: 'Inventario' }}
                        />
                        <Stack.Screen
                            name="Users"
                            component={UsersScreen}
                            options={{ headerShown: true, title: 'Usuarios' }}
                        />
                        <Stack.Screen
                            name="Reports"
                            component={ReportsScreen}
                            options={{ headerShown: true, title: 'Reportes' }}
                        />
                        {/* POS Module */}
                        <Stack.Screen
                            name="PointsOfSale"
                            component={PointOfSaleListScreen}
                            options={{ headerShown: true, title: 'Puntos de Venta' }}
                        />
                        <Stack.Screen
                            name="CreatePointOfSale"
                            component={CreatePointOfSaleScreen}
                            options={{ headerShown: true, title: 'Crear Punto de Venta' }}
                        />
                        <Stack.Screen
                            name="AssociateUser"
                            component={AssociateUserScreen}
                            options={{ headerShown: true, title: 'Asignar Usuario' }}
                        />
                    </>
                ) : (
                    // Auth Stack
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};
