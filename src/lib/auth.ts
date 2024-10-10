import { type NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'secret-key-123')

export interface TokenPayload {
  userId: string
  email: string
}

export const signToken = async (payload: TokenPayload): Promise<string> => {
  const jwt = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
  return jwt
}

export const verifyToken = async (token: string): Promise<TokenPayload | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as unknown as TokenPayload
  } catch (error) {
    console.error('Failed to verify token', error)
    return null
  }
}

export const getSession = async (request: NextRequest) => {
  const token = request.cookies.get('token')?.value
  
  if (!token) return null
  
  return verifyToken(token)
}

export const setSession = async (token: string) => {
  cookies().set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 // 24 hours
  })
}
