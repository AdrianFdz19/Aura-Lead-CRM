import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function Button({ children, isLoading, ...props }: ButtonProps) {
  return (
    <button
      disabled={isLoading || props.disabled}
      className={`w-full px-4 py-2 text-white font-medium rounded-md transition-colors
        ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
      `}
      {...props}
    >
      {isLoading ? 'Procesando...' : children}
    </button>
  );
}