import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: 'Teacher' | 'Student' | 'Parent' | 'Admin'
  }
  
  interface Session {
    user: User
  }
} 