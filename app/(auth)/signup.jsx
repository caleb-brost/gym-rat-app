import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import supabase from '../../db/supabaseClient.js';
import { createAuthUser, createUserProfile } from '../../services/auth/authService.js';

// test connection to database
// console.log('Supabase connection:', supabase);

export default function SignupScreen() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {

    // Reset error state
    setError('');
    
    // Validate inputs
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);

    try {
      // Supabase will automatically check for duplicate emails during signup
      
      // Sign up the user with Supabase Auth
      const { data, error } = await createAuthUser({ 
        email, 
        password, 
        firstName, 
        lastName, 
        setError
      });
      
      if (error || !data) {
        return;
      }
      
      console.log("Auth data:", JSON.stringify(data));
      
      // Make sure we have a user object with an ID
      if (!data.user || !data.user.id) {
        setError('Failed to get user ID from authentication');
        console.error('No user ID in auth response:', data);
        return;
      }
      
      // After successful signup, create a profile in the database
      const success = await createUserProfile({
        user: data.user,
        email,
        firstName,
        lastName,
        setError
      });
      
      console.log("Profile creation result:", success);
      
      if (success) {
        // Successfully signed up!
        console.log('User signed up:', data.user.id);
        
        // Navigate to the main app
        router.replace('/(tabs)');
      }
    } catch (error) {
      // This is just a fallback in case something unexpected happens
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.centerContainer}>
          <View style={styles.formContainer}>
            <Text style={styles.title}>Create Account</Text>
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            
            <TextInput
              style={styles.input}
              placeholder="First Name"
              placeholderTextColor="#999"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Last Name"
              placeholderTextColor="#999"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            
            <TouchableOpacity 
              style={{...styles.button, ...(isLoading ? styles.buttonDisabled : {})}}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Login</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    paddingHorizontal: 30,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    width: '35%',
    alignSelf: 'center'
  },
  buttonDisabled: {
    backgroundColor: '#97c2fc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#dc3545',
    marginBottom: 15,
    textAlign: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#777',
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
