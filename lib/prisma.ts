import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

const hasDatabaseUrl = !!process.env.DATABASE_URL

function createAdapter(): PrismaPg | null {
  if (!process.env.DATABASE_URL) {
    return null
  }
  return new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  })
}

const adapter = hasDatabaseUrl ? createAdapter() : null

export const prisma =
  globalForPrisma.prisma ??
  (adapter
    ? new PrismaClient({
        adapter,
        log: ["error", "warn"],
      })
    : new PrismaClient({
        log: ["error", "warn"],
      }))

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}