import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import EditNameModal from './EditNameModal';

const TemplateHeaderComponent = ({ 
  templateName, 
  templateNotes, 
  onNameChange, 
  onNotesChange,
  modalVisible,
  setModalVisible
}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.templateName}>{templateName}</Text>
      </TouchableOpacity>
      
      <TextInput
        style={styles.notesInput}
        value={templateNotes}
        onChangeText={onNotesChange}
        placeholder="Add notes..."
        multiline
      />

      <EditNameModal
        visible={modalVisible}
        title="Edit Template Name"
        value={templateName}
        onChangeText={onNameChange}
        onSave={() => setModalVisible(false)}
        onCancel={() => setModalVisible(false)}
        placeholder="Template name"
      />
    </View>
  );
};

const styles = {
  headerContainer: {
    padding: 15,
  },
  templateName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 80,
  }
};

export default TemplateHeaderComponent;
