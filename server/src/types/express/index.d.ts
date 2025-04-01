import { User as PrismaUser } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      prismaUser?: PrismaUser;
    }
  }
}

export {};
