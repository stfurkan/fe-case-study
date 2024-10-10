'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  age: number
}

export default function DashboardMain() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')
  const ageFilter = searchParams.get('age') || ''
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    const fetchUsers = async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        ...(ageFilter && { age: ageFilter }),
      })

      const response = await fetch(`/api/users?${params}`)
      const data = await response.json()
      
      setUsers(data.users)
      setTotalPages(data.totalPages)
    }

    fetchUsers()
  }, [page, ageFilter])

  const updateFilters = (age: string) => {
    const params = new URLSearchParams(searchParams)
    if (age) {
      params.set('age', age)
    } else {
      params.delete('age')
    }
    params.set('page', '1')
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="space-x-4">
          <Link href="/dashboard/add">
            <Button>Add User</Button>
          </Link>
          <Link href="/dashboard/addMany">
            <Button>Bulk Upload</Button>
          </Link>
        </div>
      </div>

      <div className="mb-4">
        <Input
          type="number"
          placeholder="Filter by age"
          value={ageFilter}
          onChange={(e) => updateFilters(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>First Name</TableHead>
            <TableHead>Last Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Age</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.firstName}</TableCell>
              <TableCell>{user.lastName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.age}</TableCell>
              <TableCell>
                <Link href={`/dashboard/${user.id}`}>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="flex justify-center space-x-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === page ? 'default' : 'outline'}
            onClick={() => {
              const params = new URLSearchParams(searchParams)
              params.set('page', pageNum.toString())
              router.push(`/dashboard?${params.toString()}`)
            }}
          >
            {pageNum}
          </Button>
        ))}
      </div>
    </div>
  )
}
