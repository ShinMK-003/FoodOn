import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, getDocs, writeBatch, DocumentData } from 'firebase/firestore';
import { firestore, auth } from '../firebaseConfig';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type TableReservationScreenProps = StackScreenProps<RootStackParamList, 'TableReservation'>;

const TableReservationScreen: React.FC<TableReservationScreenProps> = ({ route, navigation }) => {
  const { cartItems, totalAmount } = route.params;
  const [tableNumber, setTableNumber] = useState('');
  const [adults, setAdults] = useState('');
  const [children, setChildren] = useState('');
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Thêm useEffect để cập nhật header
  React.useEffect(() => {
    navigation.setOptions({
      headerShown: false, // Ẩn header mặc định
    });
  }, [navigation]);

  const generateReservationCode = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleReservation = async () => {
    if (!tableNumber || !adults || !date || !time || !customerName || !phoneNumber) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Error', 'You must be logged in to make a reservation');
      return;
    }

    try {
      const reservationDateTime = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

      const reservationCode = generateReservationCode();

      const reservationData = {
        userId: user.uid,
        tableNumber: parseInt(tableNumber),
        adults: parseInt(adults),
        children: children ? parseInt(children) : 0,
        reservationDateTime: reservationDateTime.toISOString(),
        items: cartItems,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString(),
        reservationCode,
        customerName,
        phoneNumber,
      };

      const docRef = await addDoc(collection(firestore, 'reservations'), reservationData);

      // Clear the user's cart
      const userCartRef = collection(firestore, `users/${user.uid}/cart`);
      const cartDocs = await getDocs(userCartRef);
      const batch = writeBatch(firestore);
      cartDocs.forEach((doc: DocumentData) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Navigate to the notification screen with reservation details
      navigation.navigate('Notification', {
        reservationId: docRef.id,
        reservationCode,
        reservationData,
      });
    } catch (error) {
      console.error('Error making reservation:', error);
      Alert.alert('Error', 'Failed to make reservation. Please try again.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header với nút Back */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Table Reservation</Text>
      </View>

      <ScrollView style={styles.container}>        
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          value={customerName}
          onChangeText={setCustomerName}
          placeholder="Enter your name"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Enter your phone number"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Table Number</Text>
        <TextInput
          style={styles.input}
          value={tableNumber}
          onChangeText={setTableNumber}
          keyboardType="numeric"
          placeholder="Enter table number"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Number of Adults</Text>
        <TextInput
          style={styles.input}
          value={adults}
          onChangeText={setAdults}
          keyboardType="numeric"
          placeholder="Enter number of adults"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Number of Children</Text>
        <TextInput
          style={styles.input}
          value={children}
          onChangeText={setChildren}
          keyboardType="numeric"
          placeholder="Enter number of children"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Reservation Date</Text>
        <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowDatePicker(true)}>
          <Text style={styles.dateTimeButtonText}>
            {date.toLocaleDateString()}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Reservation Time</Text>
        <TouchableOpacity style={styles.dateTimeButton} onPress={() => setShowTimePicker(true)}>
          <Text style={styles.dateTimeButtonText}>
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}

        <Text style={styles.totalText}>Total Amount: ${totalAmount.toFixed(2)}</Text>

        <TouchableOpacity style={styles.reserveButton} onPress={handleReservation}>
          <Text style={styles.reserveButtonText}>Confirm Reservation</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 32,
  },
  backButton: {
    padding: 8,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
    fontSize: 16,
  },
  dateTimeButton: {
    backgroundColor: '#1f1f1f',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  dateTimeButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e76e2e',
    marginTop: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  reserveButton: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  reserveButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TableReservationScreen;