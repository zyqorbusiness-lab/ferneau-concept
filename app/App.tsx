import React from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFonts, Fraunces_400Regular_Italic, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { AppProvider, useApp } from './src/store';
import { C, F, MAXW } from './src/theme';
import { Toast, Spinner } from './src/ui';
import Onboarding from './src/screens/Onboarding';
import Auth from './src/screens/Auth';
import Home from './src/screens/Home';
import Shop from './src/screens/Shop';
import ProductScreen from './src/screens/Product';
import Wishlist from './src/screens/Wishlist';
import Bag from './src/screens/Bag';
import Checkout from './src/screens/Checkout';
import Success from './src/screens/Success';
import Orders from './src/screens/Orders';
import Tracking from './src/screens/Tracking';
import Profile from './src/screens/Profile';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const theme = { ...DefaultTheme, colors: { ...DefaultTheme.colors, background: C.paper, card: C.card, primary: C.fern, text: C.ink, border: C.line, notification: C.terra } };
const TAB_ICON: Record<string, React.ComponentProps<typeof Feather>['name']> = { Home: 'home', Shop: 'search', Wishlist: 'heart', Bag: 'shopping-bag', Profile: 'user' };

function Tabs() {
  const app = useApp(); const ins = useSafeAreaInsets();
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: C.fern, tabBarInactiveTintColor: '#93A39A',
      tabBarStyle: { backgroundColor: C.card, borderTopWidth: 0, height: 64 + ins.bottom, paddingTop: 8, paddingBottom: ins.bottom + 8, boxShadow: '0px -4px 20px rgba(35,74,58,0.08)' } as any,
      tabBarLabelStyle: { fontFamily: F.semi, fontSize: 11.5 },
      tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
        <View style={{ width: 44, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? C.mist : 'transparent' }}>
          <Feather name={TAB_ICON[route.name]} size={20} color={color} />
        </View>
      ),
      tabBarBadgeStyle: { backgroundColor: C.terra, color: C.paper, fontFamily: F.bold, fontSize: 10.5 },
      tabBarButtonTestID: 'tab-' + route.name,
    } as any)}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Shop" component={Shop} />
      <Tab.Screen name="Wishlist" component={Wishlist} />
      <Tab.Screen name="Bag" component={Bag} options={{ tabBarBadge: app.cart.count || undefined }} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

function Root() {
  const app = useApp();
  if (!app.ready) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: C.paper }}><Spinner size={30} /></View>;
  const initial = !app.onboarded ? 'Onboarding' : app.user || app.guest ? 'Main' : 'Auth';
  return (
    <NavigationContainer theme={theme} documentTitle={{ enabled: false }}>
      <Stack.Navigator initialRouteName={initial} screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.paper }, animation: 'slide_from_right' }}>
        <Stack.Screen name="Onboarding" component={Onboarding} />
        <Stack.Screen name="Auth" component={Auth} options={{ animation: 'fade' }} />
        <Stack.Screen name="Main" component={Tabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Checkout" component={Checkout} />
        <Stack.Screen name="Success" component={Success} options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="Orders" component={Orders} />
        <Stack.Screen name="Tracking" component={Tracking} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  const [loaded] = useFonts({ Fraunces_400Regular_Italic, Fraunces_600SemiBold, Fraunces_700Bold, DMSans_400Regular, DMSans_500Medium, DMSans_600SemiBold, DMSans_700Bold, ...Feather.font });
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: Platform.OS === 'web' ? '#E9E5D9' : C.paper }}>
        <View style={{ flex: 1, width: '100%', maxWidth: MAXW, alignSelf: 'center', backgroundColor: C.paper, overflow: 'hidden' }}>
          <StatusBar style="dark" />
          {loaded ? <AppProvider><Root /></AppProvider> : <View style={{ flex: 1, backgroundColor: C.paper }} />}
        </View>
      </View>
    </SafeAreaProvider>
  );
}
