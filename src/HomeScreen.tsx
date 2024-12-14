import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { NavigationProp } from '@react-navigation/native';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

interface HomeScreenProps {
  navigation: NavigationProp<any>;
}

interface MenuItem {
  id: string;
  title: string;
  price: number;
  image: string;
  description: string;
}

const { width } = Dimensions.get('window');

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchFeaturedItems = async () => {
      try {
        const q = query(collection(firestore, 'products'), limit(4));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as MenuItem[];
        setFeaturedItems(items);
      } catch (error) {
        console.error('Error fetching featured items:', error);
      }
    };

    fetchFeaturedItems();
  }, []);

  const navigateToMenu = () => {
    navigation.navigate('Menu');
  };

  const navigateToProfile = () => {
    navigation.navigate('Profile');
  };

  const navigateToReservation = () => {
    navigation.navigate('TableReservation', { cartItems: [], totalAmount: 0 });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Restaurant Image Header */}
      <View style={styles.headerContainer}>
        <ImageBackground
          source={require('../assets/restaurant-header.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        >
          <View style={styles.headerOverlay}>
            <Text style={styles.restaurantName}>Fine Dining Restaurant</Text>
            <Text style={styles.restaurantTagline}>Experience the finest cuisine</Text>
          </View>
        </ImageBackground>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={navigateToProfile}
        >
          <Icon name="account-circle" size={30} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Restaurant History Section */}
      <View style={styles.historySection}>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <View style={styles.historyCard}>
          <Image
            source={require('../assets/restaurant-vintage.jpg')}
            style={styles.historyImage}
            resizeMode="cover"
          />
          <Text style={styles.historyTitle}>A Legacy of Excellence</Text>
          <Text style={styles.historyText}>
            Founded in 1990, our restaurant has been serving exceptional cuisine for over
            three decades. What started as a small family business has grown into one
            of the city's most celebrated dining destinations, combining traditional
            recipes with modern culinary innovation.
          </Text>
        </View>
      </View>

      {/* Featured Menu Section */}
      <View style={styles.menuSection}>
        <View style={styles.menuHeader}>
          <Text style={styles.sectionTitle}>Featured Menu</Text>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={navigateToMenu}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Icon name="arrow-forward" size={20} color="#e76e2e" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuGrid}>
          {featuredItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => navigation.navigate('FoodDetail', { item })}
            >
              <Image
                source={{ uri: item.image }}
                style={styles.menuItemImage}
                resizeMode="cover"
              />
              <View style={styles.menuItemInfo}>
                <Text style={styles.menuItemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.menuItemPrice}>${item.price}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.exploreMenuButton}
          onPress={navigateToMenu}
        >
          <Text style={styles.exploreMenuText}>Explore Full Menu</Text>
          <Icon name="restaurant-menu" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Table Reservation Button */}
      <View style={styles.reservationSection}>
        <TouchableOpacity
          style={styles.reservationButton}
          onPress={navigateToReservation}
        >
          <Icon name="event-seat" size={24} color="#fff" style={styles.reservationIcon} />
          <Text style={styles.reservationButtonText}>Reserve a Table</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  headerContainer: {
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  restaurantTagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  profileButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  historySection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: '#1f1f1f',
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  historyImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  historyText: {
    fontSize: 16,
    color: '#ccc',
    lineHeight: 24,
    marginBottom: 15,
  },
  menuSection: {
    padding: 20,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#e76e2e',
    fontSize: 16,
    marginRight: 5,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 50) / 2,
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  menuItemImage: {
    width: '100%',
    height: 120,
  },
  menuItemInfo: {
    padding: 10,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#e76e2e',
    fontWeight: 'bold',
  },
  exploreMenuButton: {
    backgroundColor: '#e76e2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  exploreMenuText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  reservationSection: {
    padding: 20,
    paddingTop: 0,
  },
  reservationButton: {
    backgroundColor: '#e76e2e',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 0,
  },
  reservationIcon: {
    marginRight: 10,
  },
  reservationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;