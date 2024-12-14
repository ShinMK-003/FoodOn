import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Image,
  BackHandler,
  Alert
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './types';
import { auth, firestore } from '../firebaseConfig';
import { signInWithEmailAndPassword, AuthError } from 'firebase/auth';
import { collection, doc, setDoc, getDoc, getFirestore } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  // State Management
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const db = getFirestore();

  // Navigation Setup
  React.useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.replace('Intro')} 
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#e76e2e" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  // Validate Email Format
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Error Message Handler
  const getErrorMessage = (error: AuthError): string => {
    switch (error.code) {
      case 'auth/invalid-credential':
        return 'Email hoặc mật khẩu không chính xác';
      case 'auth/user-disabled':
        return 'Tài khoản này đã bị vô hiệu hóa';
      case 'auth/user-not-found':
        return 'Không tìm thấy tài khoản với email này';
      case 'auth/wrong-password':
        return 'Mật khẩu không chính xác';
      case 'auth/invalid-email':
        return 'Email không đúng định dạng';
      case 'auth/too-many-requests':
        return 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau';
      case 'auth/network-request-failed':
        return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet';
      default:
        return 'Đã có lỗi xảy ra. Vui lòng thử lại sau';
    }
  };

  // Input Validation
  const validateInputs = (): boolean => {
    let isValid = true;
    
    // Reset errors
    setEmailError('');
    setPasswordError('');
    setLoginError('');

    // Email validation
    if (!email.trim()) {
      setEmailError('Vui lòng nhập email');
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError('Email không đúng định dạng');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Vui lòng nhập mật khẩu');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      isValid = false;
    }

    return isValid;
  };

  // Handle Login
  const handleLogin = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        // Prepare user data
        const userData = {
          email: user.email,
          avatarUrl: userDoc.exists() ? userDoc.data().avatarUrl || null : null,
          name: userDoc.exists() ? userDoc.data().name || '' : '',
          phone: userDoc.exists() ? userDoc.data().phone || '' : '',
          lastUpdated: Date.now(),
        };

        // Update or create user document
        await setDoc(userDocRef, userData, { merge: true });

        // Navigate to Home screen
        navigation.navigate('Home');
      }
    } catch (error: any) {
     
      setLoginError(getErrorMessage(error as AuthError));
      
      // Show alert for network errors
      if (error.code === 'auth/network-request-failed') {
        Alert.alert(
          'Lỗi kết nối',
          'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối internet của bạn.',
          [{ text: 'Đồng ý', style: 'default' }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Render
  return (
    <View style={styles.container}>
      <Image source={require('../assets/Logo1.jpg')} style={styles.logo} />
      <Text style={styles.title}>Chào mừng đến với FoodOn</Text>
      <Text style={styles.subtitle}>Vui lòng đăng nhập để tiếp tục</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Icon name="email" size={20} color="#e76e2e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError('');
            setLoginError('');
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Icon name="lock" size={20} color="#e76e2e" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            setPasswordError('');
            setLoginError('');
          }}
          secureTextEntry={!showPassword}
          returnKeyType="done"
          onSubmitEditing={handleLogin}
        />
        <TouchableOpacity 
          onPress={() => setShowPassword(!showPassword)} 
          style={styles.iconContainer}
        >
          <Icon 
            name={showPassword ? 'visibility' : 'visibility-off'} 
            size={24} 
            color="#e76e2e" 
          />
        </TouchableOpacity>
      </View>
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
      {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity 
        style={[styles.button, loading && styles.disabledButton]} 
        onPress={handleLogin} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Đăng nhập</Text>
        )}
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.link}>Quên mật khẩu?</Text>
      </TouchableOpacity>

      {/* Register Link */}
      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          Chưa có tài khoản? {' '}
          <Text style={styles.registerLink}>Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#e76e2e',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#e76e2e',
    borderRadius: 25,
    marginBottom: 12,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    height: 50,
  },
  icon: {
    marginRight: 10,
  },
  iconContainer: {
    padding: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#e76e2e',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    marginTop: 15,
    color: '#e76e2e',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: '#ff3333',
    fontSize: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 15,
  },
  backButton: {
    marginLeft: 10,
    padding: 5,
  },
  registerText: {
    marginTop: 15,
    fontSize: 14,
    color: '#666',
  },
  registerLink: {
    color: '#e76e2e',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;