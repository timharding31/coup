import React from 'react'

const sizeStyles = {
  default: 'h-10 px-4',
  sm: 'h-9 px-3',
  lg: 'h-11 px-6'
}

const variantStyles = {
  primary: 'bg-nord-6 text-nord-0 border-2 border-nord-0 focus:border-nord-8 placeholder-nord-3',
  secondary: 'bg-nord-5 text-nord-0 border-2 border-nord-8 focus:border-nord-9 placeholder-nord-3',
  minimal: 'bg-nord-4 text-nord-0 border-2 border-transparent focus:border-nord-8 placeholder-nord-3'
}

export interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: keyof typeof variantStyles
  size?: keyof typeof sizeStyles
  errorMessage?: string
  label?: string
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      className = 'font-medium',
      variant = 'primary',
      size = 'default',
      errorMessage = null,
      label,
      type = 'text',
      required,
      ...props
    },
    ref
  ) => {
    const baseClasses = 'w-full transition-all duration-200 focus:outline-none rounded-xl'

    const errorClasses = errorMessage ? 'border-nord-11 focus:border-nord-11' : ''

    return (
      <div className='flex flex-col gap-2'>
        {label && (
          <label className='font-medium text-sm'>
            {label}
            {required && <span className='text-nord-11'> *</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            ${baseClasses} 
            ${variantStyles[variant]} 
            ${sizeStyles[size]} 
            ${errorClasses}
            ${className}
          `}
          type={type}
          required={required}
          {...props}
        />
        {errorMessage && (
          <span className='text-nord-11 text-base px-2' id={`${props.id || props.name}-error`}>
            {errorMessage}
          </span>
        )}
      </div>
    )
  }
)

TextInput.displayName = 'TextInput'
