import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { StayScreen } from '@/modules/stay/screens/StayScreen';
import { ComingSoonScreen } from '@/shared/screens/ComingSoonScreen';
import { NotificationListScreen } from '@/modules/notifications/screens/NotificationListScreen';
import { GuestServicesHomeScreen } from '@/modules/requests/guest/screens/GuestServicesHomeScreen';
import { AmenitiesListScreen } from '@/modules/amenities/screens/AmenitiesListScreen';

import type {
  GuestTabParamList,
  GuestStayStackParamList,
  GuestServicesStackParamList,
  GuestRoomServiceStackParamList,
  GuestNotificationsStackParamList,
} from './routes';

const Tab = createBottomTabNavigator<GuestTabParamList>();

const StayStack = createNativeStackNavigator<GuestStayStackParamList>();
function GuestStayNavigator() {
  return (
    <StayStack.Navigator screenOptions={{ headerShown: false }}>
      <StayStack.Screen name="StayHome" component={StayScreen} />
    </StayStack.Navigator>
  );
}

const ServicesStack = createNativeStackNavigator<GuestServicesStackParamList>();
function GuestServicesNavigator() {
  return (
    <ServicesStack.Navigator>
      <ServicesStack.Screen
        name="ServicesHome"
        component={GuestServicesHomeScreen}
        options={{ title: 'Servicios' }}
      />
      <ServicesStack.Screen name="AmenitiesList" component={AmenitiesListScreen} options={{ title: 'Amenidades' }} />
      <ServicesStack.Screen name="AmenityDetail" options={{ title: 'Detalle de Amenidad' }}>
        {() => <ComingSoonScreen title="Detalle" ticket="MOV-23" />}
      </ServicesStack.Screen>
      <ServicesStack.Screen name="RequestList" options={{ title: 'Mis Solicitudes' }}>
        {() => <ComingSoonScreen title="Mis Solicitudes" ticket="MOV-23" />}
      </ServicesStack.Screen>
      <ServicesStack.Screen name="RequestDetail" options={{ title: 'Detalle de Solicitud' }}>
        {() => <ComingSoonScreen title="Detalle" ticket="MOV-23" />}
      </ServicesStack.Screen>
      <ServicesStack.Screen name="CreateRequest" options={{ title: 'Nueva Solicitud' }}>
        {() => <ComingSoonScreen title="Nueva Solicitud" ticket="MOV-23" />}
      </ServicesStack.Screen>
    </ServicesStack.Navigator>
  );
}

const RoomServiceStack = createNativeStackNavigator<GuestRoomServiceStackParamList>();
function GuestRoomServiceNavigator() {
  return (
    <RoomServiceStack.Navigator>
      <RoomServiceStack.Screen
        name="Menu"
        options={{ title: 'Room Service' }}
      >
        {() => <ComingSoonScreen title="Room Service" ticket="MOV-23" />}
      </RoomServiceStack.Screen>
    </RoomServiceStack.Navigator>
  );
}

const NotificationsStack = createNativeStackNavigator<GuestNotificationsStackParamList>();
function GuestNotificationsNavigator() {
  return (
    <NotificationsStack.Navigator>
      <NotificationsStack.Screen
        name="Inbox"
        component={NotificationListScreen}
        options={{ title: 'Notificaciones' }}
      />
    </NotificationsStack.Navigator>
  );
}

/** Navegador de Huespedes conectado al backend real. */
export function GuestNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="StayTab" 
        component={GuestStayNavigator} 
        options={{ title: 'Estadía' }}
      />
      <Tab.Screen 
        name="ServicesTab" 
        component={GuestServicesNavigator} 
        options={{ title: 'Servicios' }}
      />
      <Tab.Screen 
        name="RoomServiceTab" 
        component={GuestRoomServiceNavigator} 
        options={{ title: 'Room Service' }}
      />
      <Tab.Screen 
        name="NotificationsTab" 
        component={GuestNotificationsNavigator} 
        options={{ title: 'Avisos' }}
      />
    </Tab.Navigator>
  );
}
