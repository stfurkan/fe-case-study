'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  age: number
  createdAt: string
}

export default function UserDetailsPage({
  params: { userId }
}: {
  params: { userId: string }
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/users/${userId}`)
        if (!response.ok) {
          throw new Error('User not found')
        }
        const data = await response.json()
        setUser(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load user')
      }
    }

    fetchUser()
  }, [userId])

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => router.back()}
        >
          Go Back
        </Button>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>User Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">First Name</dt>
              <dd className="mt-1 text-lg">{user.firstName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Name</dt>
              <dd className="mt-1 text-lg">{user.lastName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-lg">{user.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Age</dt>
              <dd className="mt-1 text-lg">{user.age}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-lg">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>

          <div className="mt-6 flex justify-end">
            <Button
              variant="outline"
              onClick={() => router.back()}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
