import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import * as xlsx from 'xlsx'
import bcrypt from 'bcryptjs'
import { excelRowSchema } from '@/lib/validations/user'
import { z } from 'zod'

const prisma = new PrismaClient()

interface ExcelRow {
  name: string
  surname: string
  email: string
  age: number
  password: string
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Read Excel file
    const buffer = await file.arrayBuffer()
    const workbook = xlsx.read(buffer)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    
    // Convert to JSON and validate headers
    const jsonData = xlsx.utils.sheet_to_json(worksheet)
    
    // Validate headers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstRow = jsonData[0] as any
    const requiredColumns = ['name', 'surname', 'email', 'age', 'password']
    const missingColumns = requiredColumns.filter(col => !(col in firstRow))
    
    if (missingColumns.length > 0) {
      return NextResponse.json({
        error: 'Invalid Excel structure',
        message: `Missing columns: ${missingColumns.join(', ')}`,
        expectedStructure: 'name | surname | email | age | password'
      }, { status: 400 })
    }

    // Validate each row and collect errors
    const errors: { row: number; errors: string[] }[] = []
    const validRows: ExcelRow[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jsonData.forEach((row: any, index: number) => {
      try {
        // Convert age to number if it's a string
        const processedRow = {
          ...row,
          age: typeof row.age === 'string' ? parseInt(row.age, 10) : row.age
        }
        
        excelRowSchema.parse(processedRow)
        validRows.push(processedRow)
      } catch (error) {
        if (error instanceof z.ZodError) {
          errors.push({
            row: index + 2, // Add 2 to account for 1-based Excel rows and header row
            errors: error.errors.map(e => e.message)
          })
        }
      }
    })

    // If there are any validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json({
        error: 'Validation errors found',
        rowErrors: errors
      }, { status: 400 })
    }

    // Check for duplicate emails within the Excel file
    const emailCounts = validRows.reduce((acc, row) => {
      acc[row.email] = (acc[row.email] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const duplicateEmails = Object.entries(emailCounts)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .filter(([_, count]) => count > 1)
      .map(([email]) => email)

    if (duplicateEmails.length > 0) {
      return NextResponse.json({
        error: 'Duplicate emails found in Excel file',
        duplicateEmails
      }, { status: 400 })
    }

    // Check for existing emails in database
    const emails = validRows.map(row => row.email)
    const existingUsers = await prisma.user.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        email: true
      }
    })

    if (existingUsers.length > 0) {
      return NextResponse.json({
        error: 'Emails already exist in database',
        duplicateEmails: existingUsers.map(user => user.email)
      }, { status: 400 })
    }

    // Process all rows in a transaction
    const users = await prisma.$transaction(async (tx) => {
      const createdUsers = []
      
      for (const row of validRows) {
        const hashedPassword = await bcrypt.hash(row.password, 10)
        const user = await tx.user.create({
          data: {
            firstName: row.name,
            lastName: row.surname,
            email: row.email,
            age: row.age,
            password: hashedPassword
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            age: true,
            createdAt: true
          }
        })
        createdUsers.push(user)
      }
      
      return createdUsers
    })

    return NextResponse.json({
      message: 'Users created successfully',
      count: users.length,
      users
    })
  } catch (error) {
    console.error('Bulk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}
