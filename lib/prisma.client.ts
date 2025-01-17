import { PrismaClient } from "@prisma/client/react-native"

const dbClient = new PrismaClient()

console.log("dbClient", dbClient)

export { dbClient }
