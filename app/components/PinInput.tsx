import React, { useState, useRef, useEffect } from 'react'
import { TextInput } from './TextInput'

interface PinInputProps {
  value: string
  onChange: (value: string) => void
  name?: string
  required?: boolean
  errorMessage?: string
  label?: string
}

export const PinInput: React.FC<PinInputProps> = ({ value, onChange, errorMessage, label, ...inputProps }) => {
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4)

    onChange(newValue)
  }

  const displayValue = value.padEnd(4, '•')

  return (
    <div className='relative'>
      <TextInput
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className='text-center tracking-[1em] font-bold'
        maxLength={4}
        pattern='[A-Z0-9]*'
        autoComplete='off'
        spellCheck={false}
        errorMessage={errorMessage}
        label={label}
        size='lg'
        {...inputProps}
      />

      {!focused && value.length < 4 && (
        <div
          className='absolute inset-0 flex items-center justify-center pointer-events-none'
          style={{ marginTop: label ? '34px' : '0' }}
        >
          <div className='flex gap-4'>
            {Array.from({ length: 4 }).map((_, index) => (
              <span
                key={index}
                className={`
                  w-4 h-4 rounded-full 
                  ${index < value.length ? 'bg-nord-8' : 'bg-nord-3'}
                `}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
