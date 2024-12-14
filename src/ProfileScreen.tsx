import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore, auth, storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  lastUpdated?: number;
}

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialUser, setInitialUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    checkPermissions();
    fetchUserData();
  }, []);

  const checkPermissions = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "This app needs access to your photos to change profile picture. Please enable it in your settings."
      );
    }
  };

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      return;
    }

    try {
      const userRef = doc(firestore, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);
        setInitialUser(userData);
      } else {
        Alert.alert("Error", "User profile not found.");
        handleLogout();
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert(
        "Error",
        "Failed to load user data. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const validateUserData = (userData: Partial<User>): boolean => {
    if (userData.name && userData.name.trim().length < 2) {
      Alert.alert("Invalid Input", "Name must be at least 2 characters long.");
      return false;
    }

    if (userData.phone && !/^\+?[\d\s-]{8,}$/.test(userData.phone)) {
      Alert.alert("Invalid Input", "Please enter a valid phone number.");
      return false;
    }

    return true;
  };

  const handleUpdate = async () => {
    if (!user || !initialUser) return;

    try {
      setLoading(true);

      const updatedFields: Partial<User> = {};
      let hasChanges = false;

      // Check for changes in name
      if (user.name !== initialUser.name) {
        if (!validateUserData({ name: user.name })) {
          setLoading(false);
          return;
        }
        updatedFields.name = user.name;
        hasChanges = true;
      }

      // Check for changes in phone
      if (user.phone !== initialUser.phone) {
        if (!validateUserData({ phone: user.phone })) {
          setLoading(false);
          return;
        }
        updatedFields.phone = user.phone;
        hasChanges = true;
      }

      if (!hasChanges) {
        Alert.alert("No Changes", "No changes were made to your profile.");
        setIsEditing(false);
        setLoading(false);
        return;
      }

      // Update timestamp
      updatedFields.lastUpdated = Date.now();

      // Update Firestore
      await updateDoc(doc(firestore, 'users', user.id), updatedFields);
      
      // Update local state
      const updatedUser = { ...user, ...updatedFields };
      setUser(updatedUser);
      setInitialUser(updatedUser);
      
      Alert.alert("Success", "Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(
        "Error",
        "Failed to update profile. Please check your internet connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImagePick = async () => {
    if (uploadingImage) return;

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert(
        "Permission Required",
        "You need to allow access to your photos to change your profile picture."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Error",
        "Failed to select image. Please try again."
      );
    }
  };

  const uploadImage = async (uri: string) => {
    if (!user?.id || uploadingImage) return;

    setUploadingImage(true);
    try {
      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const filename = `profilePicture_${user.id}_${timestamp}.jpg`;
      const storageRef = ref(storage, `profilePictures/${filename}`);

      // Upload to Firebase Storage
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const userRef = doc(firestore, 'users', user.id);
      await updateDoc(userRef, {
        avatarUrl: downloadURL,
        lastUpdated: timestamp,
      });

      // Update local state
      const updatedUser = {
        ...user,
        avatarUrl: downloadURL,
        lastUpdated: timestamp,
      };
      setUser(updatedUser);
      setInitialUser(updatedUser);

      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert(
        "Error",
        "Failed to upload image. Please check your internet connection and try again."
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert(
        "Error",
        "Failed to log out. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e76e2e" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#e76e2e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <TouchableOpacity 
          onPress={handleImagePick}
          disabled={uploadingImage}
          style={styles.avatarContainer}
        >
          {uploadingImage ? (
            <View style={[styles.avatar, styles.avatarLoading]}>
              <ActivityIndicator size="large" color="#e76e2e" />
            </View>
          ) : (
            <Image
              source={{ 
                uri: user?.avatarUrl || 'https://via.placeholder.com/150'
              }}
              style={styles.avatar}
            />
          )}
          <Text style={styles.changePhotoText}>
            {uploadingImage ? 'Uploading...' : 'Change Photo'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            value={user?.name || ''}
            onChangeText={(text) => setUser(user ? { ...user, name: text } : null)}
            editable={isEditing}
            placeholder="Enter your name"
            placeholderTextColor="#666666"
          />

          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={user?.email || ''}
            editable={false}
            placeholder="Your email"
            placeholderTextColor="#666666"
          />

          <Text style={styles.label}>Phone:</Text>
          <TextInput
            style={[
              styles.input,
              !isEditing && styles.disabledInput
            ]}
            value={user?.phone || ''}
            onChangeText={(text) => setUser(user ? { ...user, phone: text } : null)}
            editable={isEditing}
            placeholder="Enter your phone number"
            placeholderTextColor="#666666"
            keyboardType="phone-pad"
          />
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            isEditing && styles.saveButton
          ]}
          onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
        >
          <Text style={styles.buttonText}>
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Text>
        </TouchableOpacity>

        {isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              setUser(initialUser);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },
  backButton: {
    padding: 5,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#1f1f1f',
  },
  avatarLoading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    color: '#e76e2e',
    marginTop: 10,
    fontSize: 16,
  },
  infoContainer: {
    width: '100%',
  },
  label: {
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#1f1f1f',
    color: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.7,
  },
  button: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
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
    fontSize: 16,
  },
});

export default ProfileScreen;