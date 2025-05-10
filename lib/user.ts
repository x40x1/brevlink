import { hash, compare } from 'bcrypt'
import { db } from "@/lib/db"

export async function createUser({ username, password }: { username: string; password: string }) {
  try {
    const hashedPassword = await hash(password, 10)
    return await db.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    })
  } catch (error) {
    throw new Error('Failed to create user')
  }
}

export async function verifyUser({ username, password }: { username: string; password: string }) {
  const user = await db.user.findUnique({
    where: { username },
  })

  if (!user) {
    throw new Error('User not found')
  }

  const passwordMatch = await compare(password, user.password)
  if (!passwordMatch) {
    throw new Error('Invalid password')
  }

  return user
}
