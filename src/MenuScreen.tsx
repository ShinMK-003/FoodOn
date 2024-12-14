import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { NavigationProp } from '@react-navigation/native';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  cuisine: string;
}

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

const CATEGORIES: string[] = ['All', 'Italian', 'Japanese', 'Mexican', 'Indian', 'American', 'Chinese', 'Thai', 'French'];

const MenuScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchText, setSearchText] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('name');
  const [loading, setLoading] = useState<boolean>(true);
  const [profileImage, setProfileImage] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(firestore, 'products'));
      const productList: Product[] = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          if (!data.title) {
            console.warn(`Product ${doc.id} is missing a title`);
            return null;
          }
          return {
            id: doc.id,
            ...data,
            price: parseFloat(data.price),
            cuisine: data.cuisine || 'Other'
          };
        })
        .filter((product): product is Product => product !== null);
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserProfileImage = useCallback(async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(firestore, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImage(data.profileImage ?? '');
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchUserProfileImage();
  }, [fetchProducts, fetchUserProfileImage]);

  const addToCart = async (item: Product) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "Please log in to add items to your cart.");
      return;
    }

    try {
      const cartItemRef = doc(firestore, `users/${user.uid}/cart`, item.id);
      const cartItemSnap = await getDoc(cartItemRef);

      if (cartItemSnap.exists()) {
        await updateDoc(cartItemRef, {
          quantity: increment(1)
        });
      } else {
        await setDoc(cartItemRef, {
          productId: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: 1
        });
      }

      Alert.alert("Success", `${item.title} added to cart!`);
    } catch (error) {
      console.error("Error adding item to cart:", error);
      Alert.alert("Error", "Failed to add item to cart. Please try again.");
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile', { updateProfileImage: setProfileImage });
  };

  const filteredData = products.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.cuisine === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedData = [...filteredData].sort((a, b) => {
    switch (sortOption) {
      case 'name':
        return a.title.localeCompare(b.title);
      case 'price':
        return a.price - b.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('FoodDetail', { item })}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.ratingContainer}>
          <Text style={styles.itemRating}>{item.rating} ⭐</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e76e2e" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Our Restaurant</Text>
       
      </View>

      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Your Dish ..."
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.categoryOuterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.categoryScrollViewContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.sortContainer}>
        <Text style={styles.sortText}>Sort by:</Text>
        <Picker
          selectedValue={sortOption}
          style={styles.picker}
          onValueChange={(itemValue: string) => setSortOption(itemValue)}
        >
          <Picker.Item label="Name" value="name" />
          <Picker.Item label="Price" value="price" />
          <Picker.Item label="Rating" value="rating" />
        </Picker>
      </View>

      <FlatList
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
  },
  profileButton: {
    padding: 10,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
  },
  categoryOuterContainer: {
    height: 50,
    marginBottom: 20,
  },
  categoryScrollViewContent: {
    alignItems: 'center',
  },
  categoryButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    padding: 10,
    marginRight: 10,
    height: 40,
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#e76e2e',
  },
  categoryText: {
    color: '#ffffff',
  },
  selectedCategoryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortText: {
    color: '#ffffff',
    marginRight: 10,
  },
  picker: {
    height: 50,
    width: 150,
    color: '#ffffff',
    backgroundColor: '#1f1f1f',
    borderRadius: 5,
  },
  flatListContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flex: 1,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    margin: 5,
    padding: 10,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 10,
  },
  itemDetails: {
    marginTop: 5,
  },
  itemTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  itemDescription: {
    color: '#ffffff',
    marginVertical: 5,
  },
  itemPrice: {
    color: '#e76e2e',
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemRating: {
    color: '#ffffff',
  },
  addButton: {
    backgroundColor: '#e76e2e',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 30,
    width: 30,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 10,
  },
});

export default MenuScreen;