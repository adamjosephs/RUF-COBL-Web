// Utility functions for the Risk Up Front calculator

import { config } from '../data/config.js';

// Format currency values
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat(config.currency.locale, {
    style: 'currency',
    currency: config.currency.currency,
    minimumFractionDigits: config.currency.minimumFractionDigits,
    maximumFractionDigits: config.currency.maximumFractionDigits,
  }).format(amount);
};

// Replace placeholders in text strings
export const replaceTextPlaceholders = (text, replacements = {}) => {
  let result = text;
  Object.keys(replacements).forEach(key => {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), replacements[key]);
  });
  return result;
};

// Get chart color based on delay months
export const getChartColor = (monthIndex) => {
  if (monthIndex === 0) return config.chart.colors.onTime;
  if (monthIndex <= config.chart.breakpoints.early) return config.chart.colors.early;
  if (monthIndex <= config.chart.breakpoints.mid) return config.chart.colors.mid;
  return config.chart.colors.late;
};

// Validate required form fields
export const validateForm = (formData, requiredFields = config.validation.required) => {
  return requiredFields.every(field => formData[field] && formData[field] !== '');
};
