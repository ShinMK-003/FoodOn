import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';

type RootStackParamList = {
  Favourites: undefined;
  FoodDetail: { item: FavoriteItem };
};

type FavouriteScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Favourites'>;

interface FavouriteScreenProps {
  navigation: FavouriteScreenNavigationProp;
}

interface FavoriteItem {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
  rating: number;
  cuisine: string;
}

const FavouriteScreen: React.FC<FavouriteScreenProps> = ({ navigation }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  const fetchFavorites = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const favoritesRef = collection(firestore, `users/${user.uid}/favorites`);
      const favoritesSnapshot = await getDocs(query(favoritesRef));
      const favoritesList = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FavoriteItem));
      setFavorites(favoritesList);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert("Error", "Failed to load favorites. Please try again.");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      fetchFavorites();
    }, [])
  );

  const removeFavorite = async (itemId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/favorites`, itemId));
      setFavorites(favorites.filter(item => item.id !== itemId));
      Alert.alert("Success", "Item removed from favorites");
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert("Error", "Failed to remove item. Please try again.");
    }
  };

  const renderItem = ({ item }: { item: FavoriteItem }) => (
    <TouchableOpacity 
      style={styles.itemContainer}
      onPress={() => navigation.navigate('FoodDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text style={styles.itemCuisine}>{item.cuisine}</Text>
          <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        </View>
      </LinearGradient>
      <TouchableOpacity 
        style={styles.removeButton} 
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="close-circle" size={24} color="#ffffff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Favorites</Text>
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={64} color="#e76e2e" />
          <Text style={styles.emptyText}>You don't have any favorites yet.</Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    justifyContent: 'flex-end',
  },
  itemDetails: {
    padding: 15,
  },
  itemTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 5,
  },
  itemCuisine: {
    color: '#e76e2e',
    fontSize: 14,
    marginBottom: 5,
  },
  itemPrice: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default FavouriteScreen;