import { PrismaClient } from "prisma/prisma-client"

const dbClient = new PrismaClient()

export { dbClient }
