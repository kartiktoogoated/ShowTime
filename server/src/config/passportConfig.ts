import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

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

        // Look up existing user or create a new one (do not use .lean())
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName,
            email,
            password: 'google_oauth_no_password',
          });
        }

        // Log the user so we can check it has an _id
        console.log('Google strategy user:', user);
        return done(null, user);
      } catch (err) {
        console.error('GoogleStrategy error:', err);
        return done(err);
      }
    }
  )
);

// Serialize the user: convert the MongoDB ObjectId to a string
passport.serializeUser((user: any, done) => {
  console.log('Serializing user:', user);
  if (!user || !user._id) {
    return done(new Error('No user or missing _id in serializeUser'));
  }
  done(null, user._id.toString());
});

// Deserialize the user from the stored id
passport.deserializeUser(async (id: string, done) => {
  try {
    console.log('Deserializing user with id:', id);
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
