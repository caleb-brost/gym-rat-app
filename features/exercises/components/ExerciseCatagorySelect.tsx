import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

const localeEquals = (a: string, b: string) =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

type ChoiceOption =
  | string
  | {
      label: string;
      value: string;
    };

type SharedProps = {
  options: ChoiceOption[];
  label?: string;
  allowClear?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  onClear?: () => void;
};

type SingleSelectProps = SharedProps & {
  multiSelect?: false;
  value?: string | null;
  onSelect: (value: string) => void;
};

type MultiSelectProps = SharedProps & {
  multiSelect: true;
  value?: string[];
  onSelect: (values: string[]) => void;
};

export type ExerciseCatagorySelectProps = SingleSelectProps | MultiSelectProps;

export const ExerciseCatagorySelect: React.FC<ExerciseCatagorySelectProps> = (props) => {
  const {
    options,
    label = 'Options',
    allowClear = true,
    containerStyle,
    disabled = false,
    onClear,
  } = props;

  const multiSelect = props.multiSelect === true;

  const choices = useMemo(() => {
    const unique = new Map<string, { label: string; value: string }>();

    options.forEach((option) => {
      const resolved =
        typeof option === 'string'
          ? {
              label: option.trim(),
              value: option.trim(),
            }
          : {
              label: option.label.trim(),
              value: option.value.trim(),
            };

      if (!resolved.label || !resolved.value) {
        return;
      }

      const normalizedValue = resolved.value.toLowerCase();
      if (!unique.has(normalizedValue)) {
        unique.set(normalizedValue, {
          label: resolved.label.replace(/\s+/g, ' ').trim(),
          value: resolved.value,
        });
      }
    });

    return Array.from(unique.values());
  }, [options]);

  if (choices.length === 0) {
    return null;
  }

  const hasSelection = multiSelect
    ? (props.value ?? []).length > 0
    : props.value !== undefined && props.value !== null && props.value !== '';

  const handleClear = () => {
    if (onClear) {
      onClear();
      return;
    }

    if (multiSelect) {
      props.onSelect([]);
    } else {
      props.onSelect('');
    }
  };

  const handleSelect = (choice: { label: string; value: string }) => {
    if (multiSelect) {
      const current = props.value ?? [];

      const exists = current.some((item) => localeEquals(item, choice.value));
      const updated = exists
        ? current.filter((item) => !localeEquals(item, choice.value))
        : [...current, choice.value];

      props.onSelect(updated);
    } else {
      props.onSelect(choice.value);
    }
  };

  const isSelected = (choice: { label: string; value: string }) => {
    if (multiSelect) {
      const current = props.value ?? [];
      return current.some((item) => localeEquals(item, choice.value));
    }

    const current = props.value;
    if (current === undefined || current === null) {
      return false;
    }

    return localeEquals(current, choice.value);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {(label || (allowClear && hasSelection)) && (
        <View style={styles.headerRow}>
          {label ? <Text style={styles.label}>{label}</Text> : <View />}
          {allowClear && hasSelection ? (
            <TouchableOpacity
              onPress={handleClear}
              disabled={disabled}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.clearText, disabled && styles.clearTextDisabled]}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.optionGrid}>
        {choices.map((choice) => (
          <TouchableOpacity
            key={choice.value}
            style={[
              styles.option,
              isSelected(choice) && styles.optionSelected,
              disabled && styles.optionDisabled,
            ]}
            onPress={() => handleSelect(choice)}
            disabled={disabled}
          >
            <Text
              style={[
                styles.optionText,
                isSelected(choice) && styles.optionTextSelected,
              ]}
            >
              {choice.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#e7e7e7',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#f2f2f2',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  clearTextDisabled: {
    color: '#9bbdff',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#d9d9d9',
    marginRight: 8,
    marginBottom: 8,
  },
  optionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  optionTextSelected: {
    color: '#fff',
  },
});
