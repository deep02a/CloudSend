import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import { findOrCreateUserFromGoogle } from '../../controllers/user.controller.js';



passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await findOrCreateUserFromGoogle(profile); // <- You must return a user object here
          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  
  ////passport.use(
    //new TwitterStrategy(
    //  {
    //    consumerKey: process.env.TWITTER_CLIENT_ID,
    //    consumerSecret: process.env.TWITTER_CLIENT_SECRET,
    //    callbackURL: `${process.env.EXPRESS_API_URL}/auth/twitter/callback`,
    //    includeEmail: true,
    //  },
    //  async (token, tokenSecret, profile, done) => {
    //    const email = profile.emails?.[0]?.value;
    //    const username = profile.username;
  //
    //    try {
    //      const [user] = await User.findOrCreate({
    //        where: { email },
    //        defaults: { username, isVerified: true },
    //      });
    //      return done(null, user);
    //    } catch (err) {
    //      return done(err, null);
    //    }
    //  }
    //)
  ////);

  export default passport;