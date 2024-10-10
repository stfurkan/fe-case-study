'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

const userSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  age: z.number().min(0, 'Age must be a positive number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type UserForm = z.infer<typeof userSchema>

export default function AddUserPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<UserForm>({
    resolver: zodResolver(userSchema)
  })

  const onSubmit = async (data: UserForm) => {
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to create user')
      }

      router.push('/dashboard')
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  {...register('firstName')}
                  placeholder="First Name"
                />
                {errors.firstName && (
                  <span className="text-sm text-red-500">{errors.firstName.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  {...register('lastName')}
                  placeholder="Last Name"
                />
                {errors.lastName && (
                  <span className="text-sm text-red-500">{errors.lastName.message}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Input
                {...register('email')}
                type="email"
                placeholder="Email"
              />
              {errors.email && (
                <span className="text-sm text-red-500">{errors.email.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Input
                {...register('age', { valueAsNumber: true })}
                type="number"
                placeholder="Age"
              />
              {errors.age && (
                <span className="text-sm text-red-500">{errors.age.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Input
                {...register('password')}
                type="password"
                placeholder="Password"
              />
              {errors.password && (
                <span className="text-sm text-red-500">{errors.password.message}</span>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
