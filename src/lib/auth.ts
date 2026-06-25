import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { nextCookies } from "better-auth/next-js";


export const auth = betterAuth({
    trustedOrigins: [
        "https://studilab.vercel.app",
        "http://localhost:3000",
    ],
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    emailAndPassword: {
        enabled: true,
        autoSignIn: true,
    },
    plugins: [
        nextCookies()
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 60 * 15 // 15 minutes
        }
    },
    databaseHooks: {
        user: {
            create: {
                after: async (user) => {
                    await prisma.profile.create({
                        data: {
                            userId: user.id,
                            username: user.email.split("@")[0],
                            isPublic: true,
                        }
                    });
                }
            }
        }
    }

});