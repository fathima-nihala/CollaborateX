// src/components/Form.tsx
import React from 'react';
import type { UseFormRegisterReturn, FieldError } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  register?: UseFormRegisterReturn;
}

export const Input: React.FC<InputProps> = ({ label, error, register, className = '', ...props }) => {
  return (
    <div className="mb-6">
      {label && <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{label}</label>}
      <input
        {...register}
        {...props}
        className={`w-full glass-input ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' : ''
          } ${className}`}
      />
      {error && <p className="text-red-400 text-xs mt-2 ml-1">{error.message}</p>}
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
  register?: UseFormRegisterReturn;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  register,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-6">
      {label && <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{label}</label>}
      <textarea
        {...register}
        {...props}
        className={`w-full glass-input min-h-[120px] resize-none ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' : ''
          } ${className}`}
      />
      {error && <p className="text-red-400 text-xs mt-2 ml-1">{error.message}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  register?: UseFormRegisterReturn;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  register,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="mb-6">
      {label && <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">{label}</label>}
      <select
        {...register}
        {...props}
        className={`w-full glass-input appearance-none ${error ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' : ''
          } ${className}`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-red-400 text-xs mt-2 ml-1">{error.message}</p>}
    </div>
  );
};

interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  register?: UseFormRegisterReturn;
}

export const FileInput: React.FC<FileInputProps> = ({ label, error, register, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="file"
        {...register}
        {...props}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
          } ${className}`}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};
