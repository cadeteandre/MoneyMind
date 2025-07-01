# 📱 MoneyMind Mobile: Plano de Migração para React Native

## 🎯 Visão Geral

Este documento apresenta um plano estruturado para criar a versão mobile nativa do **MoneyMind** utilizando React Native com Expo. O plano foi desenvolvido considerando o máximo reaproveitamento do código existente e uma curva de aprendizado gradual.

---

## 📚 Conceitos Fundamentais do React Native

### O que é React Native?

React Native é um framework que permite desenvolver aplicativos móveis nativos usando React e JavaScript/TypeScript. Diferente de uma aplicação web, o React Native compila para código nativo real (Swift/Objective-C no iOS, Java/Kotlin no Android).

### React Native vs Web React

| Aspecto           | React Web                     | React Native                             |
| ----------------- | ----------------------------- | ---------------------------------------- |
| **Elementos**     | `<div>`, `<span>`, `<button>` | `<View>`, `<Text>`, `<TouchableOpacity>` |
| **Estilização**   | CSS, Tailwind                 | StyleSheet (similar ao CSS)              |
| **Navegação**     | Next.js Router                | React Navigation                         |
| **Armazenamento** | localStorage                  | AsyncStorage                             |
| **Requisições**   | fetch/axios                   | fetch/axios (igual)                      |

### Por que Expo?

Expo é uma plataforma que simplifica drasticamente o desenvolvimento React Native:

- **Sem configuração nativa** (Xcode, Android Studio) inicialmente
- **Hot reload** instantâneo
- **Bibliotecas prontas** para câmera, push notifications, etc.
- **Build e deploy** simplificados

---

## 🛠️ Fase 1: Preparação do Ambiente (Semana 1)

### 1.1 Instalação do Ambiente de Desenvolvimento

```bash
# Instalar Node.js (já possui)
# Instalar Expo CLI globalmente
npm install -g @expo/cli

# Verificar instalação
expo --version
```

### 1.2 Instalação do Expo Go (Teste em Dispositivo Real)

- **iOS**: Baixar "Expo Go" na App Store
- **Android**: Baixar "Expo Go" na Google Play Store

> **Conceito**: Expo Go permite testar sua aplicação em desenvolvimento diretamente no celular, sem precisar fazer build ou configurar emuladores.

### 1.3 Configuração de Emuladores (Opcional mas Recomendado)

#### Android Studio:

```bash
# Baixar Android Studio
# Configurar AVD (Android Virtual Device)
# Adicionar ao PATH as ferramentas do Android
```

#### iOS Simulator (apenas Mac):

```bash
# Baixar Xcode da App Store
# Simulator já vem incluído
```

### 1.4 Criação do Projeto Base

```bash
# Navegar para o diretório pai do projeto atual
cd ..

# Criar novo projeto React Native com Expo
npx create-expo-app moneymind-mobile --template blank-typescript

# Navegar para o projeto
cd moneymind-mobile

# Iniciar o projeto
npx expo start
```

> **Conceito**: O template `blank-typescript` cria um projeto limpo com TypeScript configurado, similar ao seu projeto web atual.

---

## 🏗️ Fase 2: Estrutura e Configuração Base (Semana 1-2)

### 2.1 Estrutura de Pastas Recomendada

```
moneymind-mobile/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes base (Button, Input, etc.)
│   │   ├── forms/          # Formulários
│   │   ├── charts/         # Gráficos
│   │   └── shared/         # Componentes compartilhados
│   ├── screens/            # Telas da aplicação
│   │   ├── Dashboard/
│   │   ├── Transactions/
│   │   ├── Profile/
│   │   └── Auth/
│   ├── navigation/         # Configuração de navegação
│   ├── services/           # Serviços de API
│   ├── hooks/              # Hooks customizados (reutilizar do web)
│   ├── types/              # Interfaces TypeScript (reutilizar do web)
│   ├── utils/              # Utilitários (reutilizar do web)
│   ├── constants/          # Constantes da aplicação
│   └── store/              # Estado global (se necessário)
├── assets/                 # Imagens, fontes, etc.
├── app.json               # Configuração do Expo
└── package.json
```

### 2.2 Instalação de Dependências Principais

```bash
# Navegação
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context

# Formulários (mesma lib do web)
npm install react-hook-form @hookform/resolvers zod

# HTTP Client (mesma lib do web)
npm install axios

# Data/Date utilities (mesma lib do web)
npm install date-fns

# UI Components base
npm install react-native-elements react-native-vector-icons
npx expo install react-native-svg

# Gráficos
npm install victory-native

# Autenticação (Clerk para React Native)
npm install @clerk/clerk-expo
npx expo install expo-secure-store
```

> **Conceito**: Muitas bibliotecas que você já usa (react-hook-form, zod, date-fns) funcionam identicamente no React Native, facilitando a migração.

### 2.3 Configuração do app.json

```json
{
  "expo": {
    "name": "MoneyMind",
    "slug": "moneymind-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.moneymind"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourdomain.moneymind"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": ["expo-secure-store"]
  }
}
```

---

## 🧩 Fase 3: Componentes Base e UI Kit (Semana 2-3)

### 3.1 Migração dos Componentes UI Base

#### Equivalências principais:

```typescript
// WEB (Radix UI)                    // REACT NATIVE
<div>                           →    <View>
<span>, <p>, <h1>              →    <Text>
<button>                       →    <TouchableOpacity> + <Text>
<input>                        →    <TextInput>
<img>                          →    <Image>
<ScrollView> (implícito)       →    <ScrollView> (explícito)
```

#### Exemplo: Migração do Button Component

```typescript
// src/components/ui/Button.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, styles[`${variant}Text`]]}>{children}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#3B82F6',
  },
});
```

> **Conceito**: No React Native, estilos são definidos usando `StyleSheet.create()`, que é similar ao CSS mas usa camelCase e valores específicos. Não há classes CSS.

### 3.2 Sistema de Design Tokens

```typescript
// src/constants/design-tokens.ts
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#6B7280',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    inverse: '#FFFFFF',
  },
  border: '#E5E7EB',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  weights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};
```

---

## 🗺️ Fase 4: Configuração de Navegação (Semana 3)

### 4.1 Estrutura de Navegação

```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';

// Screens
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import TransactionFormScreen from '../screens/Transactions/TransactionFormScreen';

// Types
export type RootStackParamList = {
  Main: undefined;
  TransactionForm: { transactionId?: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Transactions: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TransactionForm"
          component={TransactionFormScreen}
          options={{ title: 'Nova Transação' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

> **Conceito**: React Navigation é o padrão para navegação em React Native. Tab Navigator cria abas na parte inferior (padrão iOS/Android), Stack Navigator permite navegar entre telas com animações nativas.

---

## 🔄 Fase 5: Migração dos Hooks e Serviços (Semana 3-4)

### 5.1 Serviços de API (Reutilização Total)

```typescript
// src/services/api.ts
import axios from 'axios';

// Usar a mesma URL base da aplicação web
const API_BASE_URL = 'https://your-web-app-domain.com/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(async (config) => {
  // Integração com Clerk será adicionada aqui
  return config;
});

// Reutilizar exatamente os mesmos serviços da web
export const transactionService = {
  async getTransactions(params?: { startDate?: string; endDate?: string }) {
    const response = await api.get('/transactions', { params });
    return response.data;
  },

  async createTransaction(transaction: CreateTransactionData) {
    const response = await api.post('/transactions', transaction);
    return response.data;
  },

  async updateTransaction(id: string, transaction: UpdateTransactionData) {
    const response = await api.put(`/transactions/${id}`, transaction);
    return response.data;
  },

  async deleteTransaction(id: string) {
    await api.delete(`/transactions/${id}`);
  },
};
```

### 5.2 Hooks Customizados (Migração com Adaptações)

```typescript
// src/hooks/useTransactions.ts
import { useState, useEffect } from 'react';
import { transactionService } from '../services/api';
import type { ITransaction } from '../types/ITransaction';

// Mesmo hook da web, com pequenas adaptações
export function useTransactions() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async (params?: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiParams = params
        ? {
            startDate: params.startDate?.toISOString(),
            endDate: params.endDate?.toISOString(),
          }
        : undefined;

      const data = await transactionService.getTransactions(apiParams);
      setTransactions(data);
    } catch (err) {
      setError('Erro ao carregar transações');
      console.error('Error fetching transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    isLoading,
    error,
    refetch: fetchTransactions,
  };
}
```

---

## 📱 Fase 6: Telas Principais (Semana 4-6)

### 6.1 Dashboard Screen

```typescript
// src/screens/Dashboard/DashboardScreen.tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { Header } from '../../components/Header';
import { FinancialSummary } from '../../components/FinancialSummary';
import { ExpensePieChart } from '../../components/charts/ExpensePieChart';
import { RecentTransactions } from '../../components/RecentTransactions';

// Hooks
import { useTransactions } from '../../hooks/useTransactions';
import { useTransactionStats } from '../../hooks/useTransactionStats';

export default function DashboardScreen() {
  const { transactions, isLoading } = useTransactions();
  const { stats } = useTransactionStats();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header title="Dashboard" />

        <View style={styles.content}>
          <FinancialSummary stats={stats} isLoading={isLoading} />

          <View style={styles.chartsContainer}>
            <ExpensePieChart data={stats.byCategory} />
          </View>

          <RecentTransactions
            transactions={transactions.slice(0, 5)}
            isLoading={isLoading}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
  },
  chartsContainer: {
    marginVertical: SPACING.lg,
  },
});
```

> **Conceito**: `SafeAreaView` é crucial no React Native para evitar que o conteúdo sobreponha areas do sistema (notch, status bar, etc.). `ScrollView` substitui o scroll automático do navegador.

### 6.2 Transaction Form Screen (Funcionalidade Nativa)

```typescript
// src/screens/Transactions/TransactionFormScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as ImagePicker from 'expo-image-picker';

// Components
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { ImageUpload } from '../../components/ImageUpload';

// Schema (reutilizar do web)
import { transactionSchema } from '../../types/schemas';

export default function TransactionFormScreen({ navigation }: any) {
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transactionSchema),
  });

  const pickImage = async () => {
    // Solicitar permissão para acessar a câmera/galeria
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à galeria de fotos.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      // Upload da imagem se existir
      let receiptUrl = null;
      if (receiptImage) {
        receiptUrl = await uploadReceiptImage(receiptImage);
      }

      // Criar transação
      await transactionService.createTransaction({
        ...data,
        receiptUrl,
      });

      Alert.alert('Sucesso', 'Transação criada com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao criar transação');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control}
          name="amount"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Valor"
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
              error={errors.amount?.message}
            />
          )}
        />

        <ImageUpload
          image={receiptImage}
          onPickImage={pickImage}
          onTakePhoto={takePhoto}
          onRemoveImage={() => setReceiptImage(null)}
        />

        <Button onPress={handleSubmit(onSubmit)}>Salvar Transação</Button>
      </View>
    </ScrollView>
  );
}
```

> **Conceito**: Este exemplo mostra como integrar funcionalidades nativas (câmera, galeria) que são impossíveis na web. A biblioteca `expo-image-picker` facilita enormemente essa integração.

---

## 🔐 Fase 7: Autenticação com Clerk (Semana 5)

### 7.1 Configuração do Clerk para React Native

```typescript
// App.tsx
import { ClerkProvider } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function App() {
  return (
    <ClerkProvider
      publishableKey="pk_test_..." // Sua chave do Clerk
      tokenCache={tokenCache}
    >
      <AppNavigator />
    </ClerkProvider>
  );
}
```

### 7.2 Auth Guard e Login Screen

```typescript
// src/components/AuthGuard.tsx
import React from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { SignInScreen } from '../screens/Auth/SignInScreen';
import AppNavigator from '../navigation/AppNavigator';

export function AuthGuard() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    // Loading screen
    return <LoadingScreen />;
  }

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  return <AppNavigator />;
}
```

---

## 📊 Fase 8: Gráficos e Visualizações (Semana 6)

### 8.1 Migração dos Gráficos com Victory Native

```typescript
// src/components/charts/ExpensePieChart.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VictoryPie, VictoryContainer } from 'victory-native';

interface ExpensePieChartProps {
  data: Array<{
    category: string;
    amount: number;
    color?: string;
  }>;
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const chartData = data.map((item, index) => ({
    x: item.category,
    y: item.amount,
    fill: item.color || CHART_COLORS[index % CHART_COLORS.length],
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gastos por Categoria</Text>

      <VictoryPie
        data={chartData}
        width={300}
        height={300}
        innerRadius={50}
        containerComponent={<VictoryContainer responsive={false} />}
        labelComponent={<></>} // Remove labels do gráfico
      />

      <View style={styles.legend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.fill }]}
            />
            <Text style={styles.legendText}>{item.x}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginBottom: SPACING.md,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: SPACING.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});
```

> **Conceito**: Victory Native é uma versão otimizada do Victory (que você já pode conhecer da web) para React Native. Oferece gráficos performáticos e nativos.

---

## 🚀 Fase 9: Funcionalidades Nativas Avançadas (Semana 7-8)

### 9.1 Push Notifications

```bash
# Instalar dependências
npx expo install expo-notifications expo-device expo-constants
```

```typescript
// src/services/notificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }

    token = (await Notifications.getExpoPushTokenAsync()).data;
  }

  return token;
}

// Configurar como as notificações são exibidas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
```

### 9.2 Armazenamento Local (Offline Support)

```bash
npx expo install @react-native-async-storage/async-storage
```

```typescript
// src/services/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  async setItem(key: string, value: any) {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  async getItem(key: string) {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error reading data:', error);
      return null;
    }
  },

  async removeItem(key: string) {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
    }
  },
};

// Hook para cache/offline
export function useOfflineTransactions() {
  const [offlineTransactions, setOfflineTransactions] = useState([]);

  const saveOfflineTransaction = async (transaction: ITransaction) => {
    const existing =
      (await storageService.getItem('offline_transactions')) || [];
    const updated = [...existing, { ...transaction, isOffline: true }];
    await storageService.setItem('offline_transactions', updated);
    setOfflineTransactions(updated);
  };

  const syncOfflineTransactions = async () => {
    const offline =
      (await storageService.getItem('offline_transactions')) || [];

    for (const transaction of offline) {
      try {
        await transactionService.createTransaction(transaction);
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }

    await storageService.removeItem('offline_transactions');
    setOfflineTransactions([]);
  };

  return {
    offlineTransactions,
    saveOfflineTransaction,
    syncOfflineTransactions,
  };
}
```

---

## 📦 Fase 10: Build e Deploy (Semana 8-9)

### 10.1 Configuração para Build de Produção

```json
// app.json - Configurações adicionais para produção
{
  "expo": {
    "name": "MoneyMind",
    "slug": "moneymind-mobile",
    "version": "1.0.0",
    "scheme": "moneymind",
    "platforms": ["ios", "android"],
    "extra": {
      "apiUrl": "https://your-production-api.com",
      "clerkPublishableKey": "pk_live_..."
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourdomain.moneymind",
      "buildNumber": "1",
      "config": {
        "usesNonExemptEncryption": false
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.yourdomain.moneymind",
      "versionCode": 1,
      "permissions": ["CAMERA", "WRITE_EXTERNAL_STORAGE", "NOTIFICATIONS"]
    }
  }
}
```

### 10.2 Build Commands

```bash
# Build para desenvolvimento (Expo Go)
npx expo start

# Build preview (TestFlight/Internal Testing)
eas build --platform all --profile preview

# Build para produção
eas build --platform all --profile production

# Submit para as lojas
eas submit --platform ios
eas submit --platform android
```

### 10.3 EAS (Expo Application Services) Setup

```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Login no Expo
eas login

# Configurar projeto
eas build:configure
```

```json
// eas.json
{
  "cli": {
    "version": ">= 0.52.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {}
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🎯 Cronograma Detalhado

| Semana | Fase              | Atividades Principais                                  | Entregáveis                |
| ------ | ----------------- | ------------------------------------------------------ | -------------------------- |
| **1**  | Setup + Estrutura | Instalação ambiente, criação projeto, estrutura pastas | Projeto base funcionando   |
| **2**  | UI Components     | Migração componentes base, design system               | Biblioteca de componentes  |
| **3**  | Navegação + Hooks | Configuração navegação, migração hooks/serviços        | Navegação funcional        |
| **4**  | Telas Core        | Dashboard, lista transações, formulários               | Funcionalidades principais |
| **5**  | Autenticação      | Integração Clerk, guards, login/logout                 | Sistema de auth completo   |
| **6**  | Gráficos + Charts | Migração gráficos, visualizações                       | Charts funcionais          |
| **7**  | Features Nativas  | Câmera, notificações, offline                          | Funcionalidades mobile     |
| **8**  | Polish + Testing  | Refinamentos, testes, otimizações                      | App pronto para build      |
| **9**  | Deploy            | Build produção, submissão lojas                        | App publicado              |

---

## 📚 Recursos de Aprendizado

### Documentação Oficial

- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **Clerk React Native**: https://clerk.com/docs/quickstarts/expo

### Tutoriais Recomendados

1. **React Native Crash Course** (YouTube - Traversy Media)
2. **Expo in 100 Seconds** (YouTube - Fireship)
3. **React Navigation Tutorial** (React Navigation docs)

### Ferramentas de Debug

- **Flipper** - Debug avançado
- **React Native Debugger** - Debug específico RN
- **Expo Dev Tools** - Debug integrado

---

## 🔧 Scripts Úteis

```json
// package.json - Scripts adicionais
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "build:android": "eas build --platform android",
    "build:ios": "eas build --platform ios",
    "preview": "eas build --platform all --profile preview",
    "submit": "eas submit --platform all"
  }
}
```

---

## ⚡ Dicas de Performance

### 1. Imagens Otimizadas

```typescript
// Usar dimensões específicas
<Image
  source={{ uri: imageUrl }}
  style={{ width: 100, height: 100 }}
  resizeMode="cover"
/>
```

### 2. Lista Performática

```typescript
import { FlatList } from 'react-native';

// Para listas grandes, usar FlatList em vez de ScrollView
<FlatList
  data={transactions}
  renderItem={({ item }) => <TransactionItem transaction={item} />}
  keyExtractor={(item) => item.id}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
/>;
```

### 3. Memoização

```typescript
import React, { memo } from 'react';

// Memorizar componentes que não mudam frequentemente
export const TransactionItem = memo(({ transaction }) => {
  // componente
});
```

---

## 🎯 Próximos Passos

1. **Começar com a Fase 1** - Setup do ambiente
2. **Criar um projeto de teste** simples para se familiarizar
3. **Seguir o cronograma** semana a semana
4. **Testar em dispositivo real** desde o início
5. **Documentar problemas** e soluções encontradas

Este plano te dará uma base sólida para migrar o MoneyMind para React Native, aproveitando ao máximo o código existente e criando uma experiência mobile nativa excepcional! 🚀

---

**💡 Lembre-se**: O React Native tem uma curva de aprendizado, mas como você já domina React, a transição será muito mais suave. Foque primeiro em entender os conceitos de navegação e componentes nativos, depois as funcionalidades avançadas virão naturalmente.
