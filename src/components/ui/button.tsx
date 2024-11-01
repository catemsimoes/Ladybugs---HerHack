import * as React from "react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
}

export function Button({ 
  className = '',
  variant = 'default',
  ...props 
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded-md font-medium transition-colors"
  const variantStyles = variant === 'default' 
    ? "bg-blue-500 text-white hover:bg-blue-600" 
    : "border border-gray-300 hover:bg-gray-50"
  
  return (
    <button
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    />
  )
}