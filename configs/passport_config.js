const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/users");

//-------------------------------------------------END OF
//IMPORTS---------------------------------------------//

//----------------------------------------------GOOGLE OAUTH
//STRATEGY-----------------------------------------//
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://main-cu-coders.herokuapp.com/auth/google/redirect",
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({ email: profile.emails[0].value }).then((oldUser) => {
        if (oldUser) {
          done(null, oldUser._id);
        } else {
          new User({
            firstname: profile.name.givenName,
            lastname: profile.name.familyName,
            email: profile.emails[0].value,
            third_partyID: profile.id,
            auth_type: "google",
            password: null,
            mailtoken: null,
            isactive: true,
          })
            .save()
            .then((newUser) => {
              done(null, newUser._id);
            });
        }
      });
    }
  )
);
//-------------------------------------END OF GOOGLE OAUTH
//STRATEGY-----------------------------------//

//----------------------------------------- GITHUB
//STRATEGY------------------------------------------//

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "https://main-cu-coders.herokuapp.com/auth/github/redirect",
      scope: ["user:email"],
    },
    (accessToken, refreshToken, profile, done) => {
      //console.log(profile);
      User.findOne({ email: profile.emails[0].value }).then((oldUser) => {
        if (oldUser) {
          // User with the same email already exists
          done(null, oldUser._id);
        } else {
          // New User
          new User({
            firstname: profile.displayName,
            lastname: null,
            email: profile.emails[0].value,
            third_partyID: profile.id,
            auth_type: "github",
            password: null,
            mailtoken: null,
            isactive: true,
          })
            .save()
            .then((newUser) => {
              done(null, newUser._id);
            });
        }
      });
    }
  )
);

//--------------------------------------END OF GITHUB
//STRATEGY----------------------------------------//

//-------------------------------------------LOCAL
//STRATEGY-------------------------------------------//
passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password", session: true },
    (email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) {
          return done(err);
        }
        // If the user is invalid
        if (!user) {
          return done(null, false, {
            success: false,
            message: "unregistered email",
          });
        }
        // Password is null i.e registered using google or github
        if (!user.password) {
          return done(null, false, {
            message: "Invalid login mode",
            success: false,
          });
        }
        bcrypt.compare(password, user.password).then((isValid) => {
          if (isValid) {
            // Checking if email is verified by the user
            if (user.isactive) {
              return done(null, user._id);
            }
            return done(null, false, {
              message: "Please verify your email first",
            });
          }
          // incorrect password
          return done(null, false, {
            message: "Invalid Credentials",
            success: false,
          });
        });
      });
    }
  )
);
//--------------------------------------------------END  OF LOCAL
//STRATEGY----------------------------------------//
//------------------------------------------------SERIALIZERS AND
//DESERIALIZERS-----------------------------------//
passport.serializeUser((id, done) => {
  done(null, id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    if (user) {
      done(null, user);
    }
  });
});
//------------------------------------------END OF SERIALIZERS AND
//DESERIALIZERS----------------------------------//
