import React from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';
import Purchases from 'react-native-purchases';
import { useRevenueCat } from './RevenueCatProvider';

export const SettingsScreen = () => {
  const { isPro, customerInfo } = useRevenueCat();

  const openCustomerCenter = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e: any) {
      Alert.alert("Error", e.message || "No se pudo abrir el centro de clientes");
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      if (typeof info.entitlements.active["premium_access"] !== "undefined") {
        Alert.alert("Éxito", "Tus compras han sido restauradas exitosamente. Eres Pro.");
      } else {
        Alert.alert("Aviso", "No se encontraron suscripciones activas para esta cuenta.");
      }
    } catch (e: any) {
      Alert.alert("Error restaurando compras", e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ajustes de Cuenta</Text>
      
      <View style={styles.statusBox}>
        <Text style={styles.statusText}>
          Estado Actual: {isPro ? "🌟 Nurea Pro" : "⚪️ Cuenta Gratuita"}
        </Text>
        {isPro && customerInfo && (
          <Text style={styles.detailText}>
            Entitlement Activo: premium_access
          </Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Gestionar Suscripción (Customer Center)" onPress={openCustomerCenter} />
        <View style={styles.spacing} />
        <Button title="Restaurar Compras" onPress={restorePurchases} /> 
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  statusBox: { padding: 15, backgroundColor: '#f0f0f0', borderRadius: 8, marginBottom: 30 },
  statusText: { fontSize: 18, fontWeight: '500' },
  detailText: { fontSize: 14, color: '#666', marginTop: 5 },
  buttonContainer: { gap: 15 },
  spacing: { height: 15 }
});
