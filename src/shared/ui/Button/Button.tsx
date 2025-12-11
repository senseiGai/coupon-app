import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, StyleSheet } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export const Button = ({ title, variant = 'primary', style, ...props }: ButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        style,
      ]}
      activeOpacity={0.8}
      {...props}>
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' ? styles.primaryText : styles.secondaryText,
        ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#0EA5E9',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0EA5E9',
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#0EA5E9',
  },
});
