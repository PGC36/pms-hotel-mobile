import { createBottomTabNavigator, type BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { AmenityDetailScreen } from '@/modules/amenities/screens/AmenityDetailScreen';
import { AmenitiesListScreen } from '@/modules/amenities/screens/AmenitiesListScreen';
import { CartProvider } from '@/modules/cart/context/CartContext';
import { CartScreen } from '@/modules/cart/screens/CartScreen';
import { NotificationListScreen } from '@/modules/notifications/screens/NotificationListScreen';
import { fetchUnreadCount } from '@/modules/notifications/services/notification.service';
import { MyOrdersScreen } from '@/modules/room-service/guest/screens/MyOrdersScreen';
import { OrderTrackingScreen } from '@/modules/room-service/guest/screens/OrderTrackingScreen';
import { ProductDetailScreen } from '@/modules/room-service/guest/screens/ProductDetailScreen';
import { MenuScreen } from '@/modules/room-service/guest/screens/MenuScreen';
import { GuestRequestDetailScreen } from '@/modules/requests/guest/screens/GuestRequestDetailScreen';
import { GuestServicesHomeScreen } from '@/modules/requests/guest/screens/GuestServicesHomeScreen';
import { MyRequestsScreen } from '@/modules/requests/guest/screens/MyRequestsScreen';
import { RequestServiceScreen } from '@/modules/requests/guest/screens/RequestServiceScreen';
import { StayScreen } from '@/modules/stay/screens/StayScreen';

import type {
  GuestNotificationsStackParamList,
  GuestRoomServiceStackParamList,
  GuestServicesStackParamList,
  GuestStayStackParamList,
  GuestTabParamList,
} from './routes';

const Tab = createBottomTabNavigator<GuestTabParamList>();
const StayStack = createNativeStackNavigator<GuestStayStackParamList>();
const ServicesStack = createNativeStackNavigator<GuestServicesStackParamList>();
const RoomServiceStack = createNativeStackNavigator<GuestRoomServiceStackParamList>();
const NotificationsStack = createNativeStackNavigator<GuestNotificationsStackParamList>();

function GuestStayNavigator() {
  const navigation = useNavigation<BottomTabNavigationProp<GuestTabParamList>>();
  return (
    <StayStack.Navigator screenOptions={{ headerShown: false }}>
      <StayStack.Screen name="StayHome">
        {() => (
          <StayScreen
            onNavigateToServices={() => navigation.navigate('ServicesTab')}
            onNavigateToRoomService={() => navigation.navigate('RoomServiceTab')}
            onNavigateToNotifications={() => navigation.navigate('NotificationsTab')}
          />
        )}
      </StayStack.Screen>
    </StayStack.Navigator>
  );
}

function GuestServicesNavigator() {
  return (
    <ServicesStack.Navigator>
      <ServicesStack.Screen name="ServicesHome" component={GuestServicesHomeScreen} options={{ title: 'Servicios' }} />
      <ServicesStack.Screen name="AmenitiesList" component={AmenitiesListScreen} options={{ title: 'Amenidades' }} />
      <ServicesStack.Screen name="AmenityDetail" component={AmenityDetailScreen} options={{ title: 'Amenidad' }} />
      <ServicesStack.Screen name="RequestList" component={MyRequestsScreen} options={{ title: 'Mis solicitudes' }} />
      <ServicesStack.Screen name="RequestDetail" component={GuestRequestDetailScreen} options={{ title: 'Detalle' }} />
      <ServicesStack.Screen name="CreateRequest" component={RequestServiceScreen} options={{ title: 'Nueva solicitud' }} />
    </ServicesStack.Navigator>
  );
}

function GuestRoomServiceNavigator() {
  return (
    <CartProvider>
      <RoomServiceStack.Navigator>
        <RoomServiceStack.Screen name="Menu" component={MenuScreen} options={{ title: 'Room Service' }} />
        <RoomServiceStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Producto' }} />
        <RoomServiceStack.Screen name="Cart" component={CartScreen} options={{ title: 'Carrito' }} />
        <RoomServiceStack.Screen name="Orders" component={MyOrdersScreen} options={{ title: 'Mis pedidos' }} />
        <RoomServiceStack.Screen name="OrderDetail" component={OrderTrackingScreen} options={{ title: 'Seguimiento' }} />
      </RoomServiceStack.Navigator>
    </CartProvider>
  );
}

function GuestNotificationsNavigator({ onUnreadCountChange }: { onUnreadCountChange: (count: number) => void }) {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen name="Inbox" options={{ title: 'Notificaciones' }}>
        {() => <NotificationListScreen onUnreadCountChange={onUnreadCountChange} />}
      </NotificationsStack.Screen>
    </NotificationsStack.Navigator>
  );
}

/** Navegación compacta del huésped: estadía, servicios, Room Service y avisos. */
export function GuestNavigator() {
  const [unreadCount, setUnreadCount] = useState(0);
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="StayTab" component={GuestStayNavigator} options={{ title: 'Estadía' }} />
      <Tab.Screen name="ServicesTab" component={GuestServicesNavigator} options={{ title: 'Servicios' }} />
      <Tab.Screen name="RoomServiceTab" component={GuestRoomServiceNavigator} options={{ title: 'Room Service' }} />
      <Tab.Screen
        name="NotificationsTab"
        options={{ title: 'Avisos', tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
        listeners={{ focus: () => { void fetchUnreadCount().then(setUnreadCount).catch(() => undefined); } }}
      >
        {() => <GuestNotificationsNavigator onUnreadCountChange={setUnreadCount} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
