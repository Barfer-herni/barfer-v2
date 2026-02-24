import 'server-only';

import { PrismaClient } from '@prisma/client';

// MongoDB connection and utilities
export * from './mongo-connection';
export { ObjectId } from './mongo-connection';

// Types (TipoSalida, TipoRegistro, PriceSection, PriceType)
export * from './types';

// Prisma client singleton
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const database = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = database;
