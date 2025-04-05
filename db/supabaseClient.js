import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase URLs and keys
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://osyxryudrbbggwqrtpgr.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zeXhyeXVkcmJiZ2d3cXJ0cGdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3OTMxMzEsImV4cCI6MjA1OTM2OTEzMX0.QdgrK4aa1QymoUZusFOKpsWW_HcvAXSxGmnC1oT4qvk';

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
