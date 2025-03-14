import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';  // your Mongoose User model
import jwt from 'jsonwebtoken';

// Passport requires a "verify" callback, which is invoked
// after Google sends back user info. Here, you either create
// a new user or find an existing one in the DB.
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: process.env.GOOGLE_CALLBACK_URL as string,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // profile contains Google user info
        // e.g. profile.emails, profile.displayName, etc.
        const email = profile.emails?.[0].value;
        if (!email) {
          return done(new Error('No email found in Google profile'));
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (!user) {
          // Create a new user
          user = await User.create({
            name: profile.displayName,
            email,
            // You can store a random placeholder or hashed password
            // because we won't use local password for Google logins
            password: 'google_oauth_no_password',
            // role: 'USER' by default
          });
        }

        // Pass user to the next step
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// (Optional) If you use session-based auth, you need serialize/deserialize:
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});
passport.deserializeUser((id: string, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});

export default passport;
