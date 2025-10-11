import React from 'react';
import { ExerciseSearchList } from '../../components/ExerciseSearchList';

export default function ExercisesScreen() {
  const handleSelect = (exercise: { name: string; category: string; muscles: string[] }) => {
    console.log('Selected exercise:', exercise.name);
    // TODO: Navigate to detail screen or add to workout
  };

  return <ExerciseSearchList onSelect={handleSelect} />;
}
