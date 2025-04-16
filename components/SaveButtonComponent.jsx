import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const SaveButtonComponent = ({ onSave, isLoading }) => {
  return (
    <TouchableOpacity 
      style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
      onPress={onSave}
      disabled={isLoading}
    >
      <Text style={styles.saveButtonText}>
        {isLoading ? 'Saving...' : 'Save Template'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = {
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 30,
  },
  saveButtonDisabled: {
    backgroundColor: '#888',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  }
};

export default SaveButtonComponent;
