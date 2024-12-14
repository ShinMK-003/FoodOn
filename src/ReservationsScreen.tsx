import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type ReservationsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Reservations'>;

interface Reservation {
  id: string;
  userId: string;
  reservationCode: string;
  customerName: string;
  phoneNumber: string;
  tableNumber: number;
  adults: number;
  children: number;
  reservationDateTime: string;
  items: any[];
  totalAmount: number;
  status: string;
  createdAt: string;
}

const ReservationsScreen: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const navigation = useNavigation<ReservationsScreenNavigationProp>();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to view reservations');
      return;
    }

    try {
      const reservationsRef = collection(firestore, 'reservations');
      const q = query(reservationsRef, where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const fetchedReservations: Reservation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedReservations.push({
          id: doc.id,
          userId: data.userId,
          reservationCode: data.reservationCode,
          customerName: data.customerName,
          phoneNumber: data.phoneNumber,
          tableNumber: data.tableNumber,
          adults: data.adults,
          children: data.children,
          reservationDateTime: data.reservationDateTime,
          items: data.items || [],
          totalAmount: data.totalAmount,
          status: data.status,
          createdAt: data.createdAt,
        } as Reservation);
      });

      setReservations(fetchedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      Alert.alert('Error', 'Failed to load reservations. Please try again.');
    }
  };

  const handleReservationPress = (reservation: Reservation) => {
    navigation.navigate('Notification', {
      reservationId: reservation.id,
      reservationCode: reservation.reservationCode,
      reservationData: reservation,
    });
  };

  const renderReservation = ({ item }: { item: Reservation }) => (
    <TouchableOpacity 
      style={styles.reservationItem} 
      onPress={() => handleReservationPress(item)}
    >
      <Text style={styles.reservationCode}>Code: {item.reservationCode}</Text>
      <Text style={styles.reservationDate}>
        {new Date(item.reservationDateTime).toLocaleString()}
      </Text>
      <Text style={styles.reservationDetails}>Table: {item.tableNumber}, Guests: {item.adults + item.children}</Text>
      <Text style={styles.reservationAmount}>Total: ${item.totalAmount.toFixed(2)}</Text>
      <Text style={styles.reservationStatus}>Status: {item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Reservations</Text>
      {reservations.length > 0 ? (
        <FlatList
          data={reservations}
          renderItem={renderReservation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <Text style={styles.emptyText}>You have no reservations</Text>
      )}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchReservations}>
        <Text style={styles.refreshButtonText}>Refresh Reservations</Text>
      </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  listContainer: {
    flexGrow: 1,
  },
  reservationItem: {
    backgroundColor: '#1f1f1f',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  reservationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e76e2e',
    marginBottom: 5,
  },
  reservationDate: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
  },
  reservationDetails: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 5,
  },
  reservationAmount: {
    fontSize: 16,
    color: '#e76e2e',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reservationStatus: {
    fontSize: 16,
    color: '#cccccc',
  },
  emptyText: {
    fontSize: 18,
    color: '#cccccc',
    textAlign: 'center',
    marginTop: 50,
  },
  refreshButton: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20
  },
  refreshButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationsScreen;