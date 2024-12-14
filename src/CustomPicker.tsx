// CustomPicker.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CustomPickerProps {
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  options: Array<{ label: string; value: string }>;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  selectedValue,
  onValueChange,
  options,
}) => {
  return (
    <View style={styles.pickerContainer}>
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            selectedValue === option.value && styles.selectedOption,
          ]}
          onPress={() => onValueChange(option.value)}
        >
          <Text
            style={[
              styles.optionText,
              selectedValue === option.value && styles.selectedOptionText,
            ]}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: 'row', // Set direction to row for horizontal layout
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1C1C1C',
    marginVertical: 5,
  },
  option: {
    padding: 10,
    flex: 1, // Allow options to equally share space
    alignItems: 'center', // Center the text horizontally
  },
  selectedOption: {
    backgroundColor: '#F47B25',
  },
  optionText: {
    color: '#fff',
  },
  selectedOptionText: {
    fontWeight: 'bold',
  },
});

export default CustomPicker;
