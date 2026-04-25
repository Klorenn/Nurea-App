const globalForPrisma = globalThis as unknown as {
  prisma?: any
}

let prismaInstance: any = null

export const prisma = new Proxy({}, {
  get(target, prop) {
    if (prismaInstance !== null) {
      return Reflect.get(prismaInstance, prop)
    }
    // Lazy load Prisma only when actually used
    if (!prismaInstance && typeof window === 'undefined') {
      const { PrismaClient } = require("@prisma/client")
      const { PrismaPg } = require("@prisma/adapter-pg")

      const hasDatabaseUrl = !!process.env.DATABASE_URL
      const adapter = hasDatabaseUrl && process.env.DATABASE_URL
        ? new PrismaPg({ connectionString: process.env.DATABASE_URL })
        : null

      prismaInstance = globalForPrisma.prisma ??
        (adapter
          ? new PrismaClient({
              adapter,
              log: ["error", "warn"],
            })
          : new PrismaClient({
              log: ["error", "warn"],
            }))

      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance
      }
    }
    return prismaInstance ? Reflect.get(prismaInstance, prop) : target
  },
})