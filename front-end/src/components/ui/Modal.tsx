import React from "react";
import { X } from "lucide-react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  children,
  onClose,
  title,
  icon,
  size = "lg",
}: ModalProps) {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div className={`relative z-10 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-black/5 transform transition-all`}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  {icon}
                </div>
              )}
              <h2 className="text-xl font-bold text-white">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
