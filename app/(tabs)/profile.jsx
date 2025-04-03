import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Link } from 'react-native';

export default function ProfileScreen() {
  const userStats = {
    name: 'John Doe',
    workoutsCompleted: 48,
    totalWeight: 24600,
    memberSince: '2025-01-01',
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <View style={styles.profileImage} />
        </View>
        <Text style={styles.name}>{userStats.name}</Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.workoutsCompleted}</Text>
          <Text style={styles.statLabel}>Workouts</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.totalWeight}lbs</Text>
          <Text style={styles.statLabel}>Total Weight</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Text>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text>Settings</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9ecef',
    marginBottom: 15,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#adb5bd',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    minWidth: 120,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#777',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  menuItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    marginTop: 20,
    alignSelf: 'center',
  },
  logoutText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginRight: 20,
    marginLeft: 20,
  },
});
