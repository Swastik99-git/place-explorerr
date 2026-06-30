import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, id, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className={`input-field ${className || ''}`}>
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
        <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
          {icon && <span className="input-icon-left" aria-hidden="true">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            className={`input ${icon ? 'input-has-icon' : ''} ${isPassword ? 'input-has-action' : ''}`}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              className="input-action-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="input-error-text" role="alert">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="input-hint">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={`input-field ${className || ''}`}>
        <label htmlFor={inputId} className="input-label">{label}</label>
        <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
          <textarea
            ref={ref}
            id={inputId}
            className="input textarea"
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            rows={4}
            {...props}
          />
        </div>
        {error && (
          <p id={`${inputId}-error`} className="input-error-text" role="alert">
            <AlertCircle size={13} />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="input-hint">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
