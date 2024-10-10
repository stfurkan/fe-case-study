import * as z from 'zod'

export const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(0, 'Age must be a positive number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type UserFormData = z.infer<typeof userSchema>

// Schema specifically for Excel upload validation
export const excelRowSchema = z.object({
  name: z.string().min(1, 'First name is required'),
  surname: z.string().min(1, 'Surname is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(0, 'Age must be a positive number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type ExcelRowData = z.infer<typeof excelRowSchema>
