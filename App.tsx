import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import all screens
import HomeScreen from './src/HomeScreen';
import LoginScreen from './src/LoginScreen';
import FoodDetailScreen from './src/FoodDetailScreen';
import RegisterScreen from './src/RegisterScreen';
import ForgotPasswordScreen from './src/ForgotPasswordScreen';
import IntroScreen from './src/IntroScreen';
import CartScreen from './src/CartScreen';
import FavoritesScreen from './src/FavoritesScreen';
import UserProfileScreen from './src/ProfileScreen';
import TableReservationScreen from './src/TableReservationScreen';
import NotificationScreen from './src/NotificationsScreen';
import ReservationsScreen from './src/ReservationsScreen';
import MenuScreen from './src/MenuScreen';
// Import types
import { Product } from './src/types';

// Define the RootStackParamList
export type RootStackParamList = {
  Intro: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Profile: undefined;
  FoodDetail: { item: Product };
  Home: undefined;
  Menu: undefined;
  TableReservation: { cartItems: any[]; totalAmount: number };
  Notification: {
    reservationId: string;
    reservationCode: string;
    reservationData: {
      userId: string;
      tableNumber: number;
      adults: number;
      children: number;
      reservationDateTime: string;
      items: any[];
      totalAmount: number;
      status: string;
      createdAt: string;
      reservationCode: string;
      customerName: string;
      phoneNumber: string;
    }
  };
  MainTabs: undefined;
  Reservations: undefined;
};

// Define the TabParamList
export type TabParamList = {
  Homes: undefined;
  Menu: undefined;
  Cart: undefined;
  Favorites: undefined;
  Reservations: undefined;
 
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Create Bottom Tab Navigator
const BottomTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Homes') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Favorites') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'TableReservation') {
            iconName = focused ? 'book' : 'book-outline';
          } else {
            iconName = 'alert-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#e76e2e',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Homes" component={HomeScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Menu" component={MenuScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} options={{ headerShown: false }} />
     
    </Tab.Navigator>
  );
};

// Main App component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Profile" component={UserProfileScreen} />
        <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
        <Stack.Screen name="Home" component={BottomTabs} />
        <Stack.Screen 
          name="Notification" 
          component={NotificationScreen} 
          options={{ 
            headerShown: false,
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen 
          name="TableReservation" 
          component={TableReservationScreen} 
          options={{ 
            headerShown: false,
            headerStyle: {
              backgroundColor: '#121212',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;