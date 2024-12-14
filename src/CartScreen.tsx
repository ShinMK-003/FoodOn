import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  increment, 
  writeBatch 
} from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';

interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

const CartScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCartItems = useCallback(async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        console.error("User not authenticated");
        return;
      }

      const cartRef = collection(firestore, `users/${user.uid}/cart`);
      const querySnapshot = await getDocs(cartRef);
      const items: CartItem[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as CartItem));
      setCartItems(items);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      Alert.alert("Error", "Failed to load cart items. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCartItems();

    const unsubscribe = navigation.addListener('focus', () => {
      fetchCartItems();
    });

    return unsubscribe;
  }, [navigation, fetchCartItems]);

  const updateCartItem = async (item: CartItem, newQuantity: number) => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    try {
      const cartItemRef = doc(firestore, `users/${user.uid}/cart`, item.id);
      if (newQuantity <= 0) {
        await deleteDoc(cartItemRef);
      } else {
        await updateDoc(cartItemRef, { quantity: newQuantity });
      }
      await fetchCartItems();
    } catch (error) {
      console.error("Error updating cart item:", error);
      Alert.alert("Error", "Failed to update cart item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleProceedToReservation = () => {
    navigation.navigate('TableReservation', { 
      cartItems: cartItems,
      totalAmount: calculateTotal()
    });
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => updateCartItem(item, item.quantity - 1)}>
            <Icon name="remove-circle-outline" size={24} color="#e76e2e" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateCartItem(item, item.quantity + 1)}>
            <Icon name="add-circle-outline" size={24} color="#e76e2e" />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity onPress={() => updateCartItem(item, 0)} style={styles.removeButton}>
        <Icon name="delete-outline" size={24} color="#e76e2e" />
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e76e2e" />
        <Text style={styles.loadingText}>Loading your order...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.title}>Your Order</Text>
        {cartItems.length > 0 ? (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.cartList}
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchCartItems();
              }}
            />
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalText}>Total:</Text>
                <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
              </View>
              <TouchableOpacity 
                style={styles.reservationButton} 
                onPress={handleProceedToReservation}
              >
                <Text style={styles.buttonText}>Proceed to Reservation</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.emptyCartContainer}>
            <Icon name="restaurant-menu" size={64} color="#e76e2e" />
            <Text style={styles.emptyCartText}>Your order is empty</Text>
            <TouchableOpacity 
              style={styles.continueOrderingButton}
              onPress={() => navigation.navigate('Menu')}
            >
              <Text style={styles.buttonText}>View Menu</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  cartList: {
    flexGrow: 1,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#1f1f1f',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
  },
  itemTitle: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  },
  itemPrice: {
    color: '#e76e2e',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    color: '#ffffff',
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
  },
  removeButton: {
    padding: 5,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 20,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    color: '#e76e2e',
    fontSize: 24,
    fontWeight: 'bold',
  },
  reservationButton: {
    backgroundColor: '#e76e2e',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 15,
    fontSize: 16,
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    color: '#ffffff',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  continueOrderingButton: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
});

export default CartScreen;