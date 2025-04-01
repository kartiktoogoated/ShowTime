import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract email from Google profile
        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Look up existing user or create a new one using Prisma
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              name: profile.displayName,
              email,
              password: 'google_oauth_no_password',
            },
          });
        }

        console.log('Google strategy user:', user);
        return done(null, user);
      } catch (err) {
        console.error('GoogleStrategy error:', err);
        return done(err as Error);
      }
    }
  )
);

// Serialize the user by storing the Prisma-generated id
passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user);
  if (!user || !user.id) {
    return done(new Error('No user or missing id in serializeUser'));
  }
  done(null, user.id);
});

// Deserialize the user from the stored id using Prisma
passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializing user with id:', id);
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
