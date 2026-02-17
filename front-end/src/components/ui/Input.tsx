import React from "react";

interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: React.HTMLInputTypeAttribute;
  placeholder?: string;
  required?: boolean;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  icon,
  disabled,
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 text-sm placeholder-gray-400 transition-all duration-200 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed ${icon ? 'pl-10' : ''}`}
        />
      </div>
    </div>
  );
}
