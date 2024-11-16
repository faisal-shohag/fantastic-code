import { PrismaClient } from '@prisma/client'

// Singleton function to create a new PrismaClient instance
const prismaClientSingleton = (): PrismaClient => {
    return new PrismaClient()
}

// Declare a global type for the prisma instance
declare global {
    let prisma: PrismaClient | undefined
}

const globalForPrisma = global as typeof global & { prisma?: PrismaClient }

// Initialize Prisma client as a singleton
const prisma = globalForPrisma.prisma || prismaClientSingleton()

// Export prisma instance
export default prisma

// Attach prisma instance to global if not in production
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
}
