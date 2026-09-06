import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ComponentCatalogScreen } from '@/shared/screens/ComponentCatalogScreen';

// TODO(MOV-05): reemplazar por <RootNavigator /> cuando exista navegación real.
// Mientras tanto se monta directamente el catálogo temporal de componentes (MOV-03).
export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ComponentCatalogScreen />
      </SafeAreaView>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
