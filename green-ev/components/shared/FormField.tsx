'use client'

import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface FormFieldProps {
  label: string
  name: string
  type?: 'text' | 'number' | 'select'
  required?: boolean
  placeholder?: string
  defaultValue?: string | number
  step?: string
  options?: { value: string; label: string }[]
}

export function FormField({ 
  label, 
  name, 
  type = 'text', 
  required = false, 
  placeholder, 
  defaultValue,
  step,
  options 
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label} {required && '*'}</Label>
      {type === 'select' && options ? (
        <Select name={name} defaultValue={defaultValue?.toString()} required={required}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          step={step}
          required={required}
          placeholder={placeholder}
          defaultValue={defaultValue}
        />
      )}
    </div>
  )
} 