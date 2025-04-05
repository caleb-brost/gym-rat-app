import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Get environment variables from Expo Constants
// These are loaded from app.config.js which gets them from .env
let supabaseUrl, supabaseAnonKey;

// Check if we're in a production environment
if (process.env.NODE_ENV === 'production') {
  // Use environment variables in production
  supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
} else {
  // In development, try to get from Constants first
  try {
    supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
    supabaseAnonKey = Constants.expoConfig?.extra?.supabaseAnonKey;
    
    // If not available in Constants, fall back to environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    }
  } catch (error) {
    console.error('Error loading Supabase credentials:', error);
  }
}

// Validate that we have the required credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Please check your environment variables.');
}

// Create the Supabase client
const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export default supabase;
