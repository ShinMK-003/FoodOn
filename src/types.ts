// src/types.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  image: string;
  rating: number;
  category: string;
};

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ForgotPassword: undefined;
  Intro: undefined;
  Register: undefined;
  FoodDetail: { item: Product };
  TableBooking: { selectedItems: Array<any> };
  CartScreen: { selectedItem: any };
};
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  lastUpdated?: number;
  lastLogin?: number;
}
export type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
export type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;

