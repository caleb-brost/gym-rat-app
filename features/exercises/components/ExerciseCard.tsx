import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ExerciseCardProps {
  name: string;
  category: string | null;
  type: string;
  muscleGroups: string[];
  equipmentName: string | null;
  onPress?: () => void;
}

const formatType = (value: string) => {
  switch (value) {
    case 'time':
      return 'Time';
    case 'distance':
      return 'Distance';
    case 'weight':
      return 'Weight';
    default:
      return value;
  }
};

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  category,
  type,
  muscleGroups,
  equipmentName,
  onPress,
}) => {
  const subtext = useMemo(() => {
    const parts: string[] = [];

    if (category) {
      parts.push(category);
    }

    if (type) {
      parts.push(formatType(type));
    }

    return parts.join(' • ');
  }, [category, type]);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        {subtext ? <Text style={styles.subtext}>{subtext}</Text> : null}
        {muscleGroups.length > 0 ? (
          <Text style={styles.muscles}>{muscleGroups.join(', ')}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomColor: '#d5d5d5ff',
    borderBottomWidth: 1,
  },
  textContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  subtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  muscles: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
