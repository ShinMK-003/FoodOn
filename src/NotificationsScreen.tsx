import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../App';

type NotificationScreenProps = StackScreenProps<RootStackParamList, 'Notification'>;

interface OrderedItem {
  id: string;
  name: string;
  title: string;
  quantity: number;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({ route, navigation }) => {
  const { reservationId, reservationCode, reservationData } = route.params;

  const handleViewReservations = () => {
    navigation.navigate('Home');
  };

  const renderOrderedItem = ({ item }: { item: OrderedItem }) => (
    <View style={styles.orderedItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemTitle}>{item.title}</Text>
      </View>
      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
    </View>
  );

  const renderHeader = () => (
    <>
      <Text style={styles.title}>Reservation Details</Text>
      <Text style={styles.code}>Reservation Code: {reservationCode}</Text>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.label}>Reservation ID:</Text>
        <Text style={styles.value}>{reservationId}</Text>

        <Text style={styles.label}>Customer Name:</Text>
        <Text style={styles.value}>{reservationData.customerName}</Text>

        <Text style={styles.label}>Phone Number:</Text>
        <Text style={styles.value}>{reservationData.phoneNumber}</Text>

        <Text style={styles.label}>Table Number:</Text>
        <Text style={styles.value}>{reservationData.tableNumber}</Text>

        <Text style={styles.label}>Number of Adults:</Text>
        <Text style={styles.value}>{reservationData.adults}</Text>

        <Text style={styles.label}>Number of Children:</Text>
        <Text style={styles.value}>{reservationData.children}</Text>

        <Text style={styles.label}>Date and Time:</Text>
        <Text style={styles.value}>
          {new Date(reservationData.reservationDateTime).toLocaleString()}
        </Text>

        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{reservationData.status}</Text>
      </View>

      <View style={styles.orderedItemsContainer}>
        <Text style={styles.orderedItemsTitle}>Ordered Items:</Text>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total Amount:</Text>
        <Text style={styles.totalValue}>${reservationData.totalAmount.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.backButton} onPress={handleViewReservations}>
        <Text style={styles.backButtonText}>Back to All Reservations</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={reservationData.items}
        renderItem={renderOrderedItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={<Text style={styles.emptyOrderText}>No items in this order</Text>}
        contentContainerStyle={styles.container}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  code: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e76e2e',
    marginBottom: 30,
    textAlign: 'center',
  },
  detailsContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#999',
  },
  value: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 15,
  },
  orderedItemsContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 20,
    marginBottom: 10,
  },
  orderedItemsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  orderedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1f1f1f',
    padding: 15,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  itemTitle: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
    alignItems:'center'
  },
  itemQuantity: {
    fontSize: 16,
    color: '#e76e2e',
    fontWeight: 'bold',
  },
  emptyOrderText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 8,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e76e2e',
  },
  backButton: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 50
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;