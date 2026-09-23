import { PrismaClient } from '@prisma/client';

// Photos are stored as data URLs, so they are omitted from every query by default.
// Only /api/photo selects them explicitly.
const createClient = () => new PrismaClient({ omit: { student: { photo: true }, teacher: { photo: true } } });

declare global { var prisma: ReturnType<typeof createClient> | undefined }

export const prisma = global.prisma || createClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
