
// src/components/ui/badge.tsx
// Componente básico de Badge, simulando shadcn/ui com Tailwind CSS.
import React, { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-blue-100 text-blue-800',
    destructive: 'bg-red-100 text-red-800',
    outline: 'text-gray-700 border border-gray-200',
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}>
      {children}
    </span>
  );
};