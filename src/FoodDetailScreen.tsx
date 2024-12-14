import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { Product } from './types';

type RootStackParamList = {
  FoodDetail: { item: Product };
};

type FoodDetailScreenRouteProp = RouteProp<RootStackParamList, 'FoodDetail'>;
type FoodDetailScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FoodDetail'>;

type Props = {
  route: FoodDetailScreenRouteProp;
  navigation: FoodDetailScreenNavigationProp;
};

const FoodDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { item } = route.params;
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    checkFavoriteStatus();
  }, []);

  const checkFavoriteStatus = async () => {
    const user = auth.currentUser;
    if (user) {
      const favoriteRef = doc(firestore, `users/${user.uid}/favorites`, item.id);
      const docSnap = await getDoc(favoriteRef);
      setIsFavorite(docSnap.exists());
    }
  };

  const toggleFavorite = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add favorites");
      return;
    }

    const favoriteRef = doc(firestore, `users/${user.uid}/favorites`, item.id);

    try {
      if (isFavorite) {
        await deleteDoc(favoriteRef);
        setIsFavorite(false);
        Alert.alert("Success", "Removed from favorites");
      } else {
        await setDoc(favoriteRef, item);
        setIsFavorite(true);
        Alert.alert("Success", "Added to favorites");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const addToCart = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to add items to cart");
      return;
    }

    try {
      const cartItemRef = doc(firestore, `users/${user.uid}/cart`, item.id);
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await setDoc(cartItemRef, {
          ...item,
          quantity: cartItemSnap.data().quantity + 1
        });
      } else {
        await setDoc(cartItemRef, {
          ...item,
          quantity: 1
        });
      }

      Alert.alert("Success", "Added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add item to cart");
    }
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Icon name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={20} color="#FFD700" />
          <Text style={styles.rating}>{item.rating}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.favoriteButton} onPress={toggleFavorite}>
        <Icon name={isFavorite ? "favorite" : "favorite-border"} size={30} color="#e76e2e" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
        <Text style={styles.addToCartText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
    marginTop:20
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  detailsContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 10,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e76e2e',
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 5,
    fontSize: 16,
    color: '#ffffff',
  },
  favoriteButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    padding: 10,
  },
  addToCartButton: {
    backgroundColor: '#e76e2e',
    padding: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FoodDetailScreen;