import React, { useState } from 'react';
import { View, Text, Button, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { useRevenueCat } from './RevenueCatProvider';

export const SubscribeScreen = () => {
  const { isPro, isLoading: isContextLoading } = useRevenueCat();
  const [isPurchasing, setIsPurchasing] = useState(false);

  const presentPaywall = async () => {
    setIsPurchasing(true);
    try {
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "premium_access",
      });

      switch (paywallResult) {
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          Alert.alert("¡Éxito!", "Ahora tienes acceso a Nurea Pro.");
          break;
        case PAYWALL_RESULT.CANCELLED:
        case PAYWALL_RESULT.ERROR:
          console.log("Paywall cerrado o error al procesar.");
          break;
      }
    } catch (e: any) {
      Alert.alert("Error mostrando el Paywall", e.message);
    } finally {
      setIsPurchasing(false);
    }
  };

  if (isContextLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isPro) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>¡Ya eres Nurea APP Pro!</Text>
        <Text>Disfruta de todos los beneficios exclusivos.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Suscríbete a Nurea APP Pro</Text>
      <Text style={styles.subtitle}>Obtén acceso a funciones premium suscribiéndote a uno de nuestros planes (mensual, anual o de por vida).</Text>
      <Button 
        title={isPurchasing ? "Cargando ofertas..." : "Ver Planes Pro"} 
        onPress={presentPaywall} 
        disabled={isPurchasing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { textAlign: 'center', marginBottom: 20 }
});
