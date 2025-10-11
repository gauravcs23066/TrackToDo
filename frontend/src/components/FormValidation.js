import React, { useState, useEffect } from 'react';

// Character counter component
export const CharacterCounter = ({ current, max, field }) => {
  const isWarning = current > max * 0.8;
  const isError = current > max;
  
  return (
    <div className="character-counter">
      <span className={`character-count ${isError ? 'error' : isWarning ? 'warning' : ''}`}>
        {current}/{max}
      </span>
      {isError && (
        <span className="error-message" role="alert">
          {field} must be less than {max} characters
        </span>
      )}
    </div>
  );
};

// Real-time validation hook
export const useFormValidation = (initialValues, validationRules) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    const rule = validationRules[name];
    if (!rule) return null;

    if (rule.required && (!value || value.trim().length === 0)) {
      return rule.required;
    }

    if (rule.minLength && value.length < rule.minLength) {
      return rule.minLength;
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      return rule.maxLength;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.pattern;
    }

    return null;
  };

  const handleChange = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    // Real-time validation
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(Object.keys(validationRules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return isValid;
  };

  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    isValid: Object.keys(errors).length === 0
  };
};

// Enhanced input component with validation
export const ValidatedInput = ({ 
  name, 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  type = 'text',
  maxLength,
  placeholder,
  required = false
}) => {
  const hasError = touched && error;
  const showSuccess = touched && !error && value;

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        className={`form-input ${hasError ? 'error' : showSuccess ? 'success' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-describedby={hasError ? `${name}-error` : undefined}
        aria-invalid={hasError}
      />
      {maxLength && (
        <CharacterCounter 
          current={value.length} 
          max={maxLength} 
          field={label}
        />
      )}
      {hasError && (
        <div id={`${name}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Enhanced textarea component with validation
export const ValidatedTextarea = ({ 
  name, 
  label, 
  value, 
  onChange, 
  onBlur, 
  error, 
  touched, 
  maxLength,
  placeholder,
  required = false,
  rows = 3
}) => {
  const hasError = touched && error;
  const showSuccess = touched && !error && value;

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        className={`form-input ${hasError ? 'error' : showSuccess ? 'success' : ''}`}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-describedby={hasError ? `${name}-error` : undefined}
        aria-invalid={hasError}
      />
      {maxLength && (
        <CharacterCounter 
          current={value.length} 
          max={maxLength} 
          field={label}
        />
      )}
      {hasError && (
        <div id={`${name}-error`} className="error-message" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

// Loading state component
export const LoadingSpinner = ({ size = 'medium' }) => (
  <div className={`loading-spinner ${size}`} role="status" aria-label="Loading">
    <div className="spinner"></div>
  </div>
);

// Success/Error toast component
export const Toast = ({ message, type, onDismiss, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onDismiss]);

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span>{message}</span>
      <button onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </div>
  );
};

// Confirmation dialog component
export const ConfirmationDialog = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal">
        <h3 id="modal-title">{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button 
            className="btn btn-secondary" 
            onClick={onCancel}
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          <button 
            className={`btn ${type === 'danger' ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            aria-label={confirmText}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
