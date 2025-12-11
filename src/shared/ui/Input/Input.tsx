import React from 'react';
import { TextInput, View, Text, TextInputProps, StyleSheet } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = ({ label, error, style, ...props }: InputProps) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : styles.inputNormal, style]}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: '#334155',
    marginBottom: 6,
    fontWeight: '500',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  inputNormal: {
    borderColor: '#E0F2FE',
  },
  inputError: {
    borderColor: '#F87171',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 4,
  },
});
