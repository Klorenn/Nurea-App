"use client"

import { useState, useCallback } from "react"

export interface ValidationRule {
  test: (value: string) => boolean
  message: string
}

export interface FieldValidation {
  value: string
  rules: ValidationRule[]
  touched?: boolean
}

export interface ValidationErrors {
  [key: string]: string | undefined
}

export interface ValidationState {
  errors: ValidationErrors
  isValid: boolean
  touched: { [key: string]: boolean }
}

// Common validation rules
export const validationRules = {
  required: (message: string = "This field is required"): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message,
  }),
  email: (message: string = "Please enter a valid email address"): ValidationRule => ({
    test: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(value)
    },
    message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value: string) => value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
  password: (message: string = "Password must be at least 8 characters with uppercase, lowercase, and number"): ValidationRule => ({
    test: (value: string) => {
      // At least 8 characters, contains uppercase, lowercase, and number
      return value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)
    },
    message,
  }),
  match: (otherValue: string, message: string = "Values do not match"): ValidationRule => ({
    test: (value: string) => value === otherValue,
    message,
  }),
}

export function useFormValidation<T extends Record<string, FieldValidation>>(
  initialFields: T
) {
  const [fields, setFields] = useState<T>(initialFields)
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [errors, setErrors] = useState<ValidationErrors>({})

  const validateField = useCallback((fieldName: string, value: string): string | undefined => {
    const field = fields[fieldName]
    if (!field) return undefined

    for (const rule of field.rules) {
      if (!rule.test(value)) {
        return rule.message
      }
    }
    return undefined
  }, [fields])

  const validateAll = useCallback((): ValidationErrors => {
    const newErrors: ValidationErrors = {}
    
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const error = validateField(fieldName, field.value)
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return newErrors
  }, [fields, validateField])

  const setFieldValue = useCallback((fieldName: keyof T, value: string) => {
    setFields((prev) => ({
      ...prev,
      [fieldName]: { ...prev[fieldName], value },
    }))

    // Validate on change if field has been touched
    if (touched[fieldName as string]) {
      const error = validateField(fieldName as string, value)
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }))
    }
  }, [touched, validateField])

  const setFieldTouched = useCallback((fieldName: keyof T) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))
    
    // Validate when touched
    const field = fields[fieldName]
    if (field) {
      const error = validateField(fieldName as string, field.value)
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }))
    }
  }, [fields, validateField])

  const isValid = Object.keys(errors).length === 0 && 
    Object.values(fields).every(field => field.value.trim().length > 0)

  return {
    fields,
    errors,
    touched,
    isValid,
    setFieldValue,
    setFieldTouched,
    validateAll,
    validateField,
  }
}

