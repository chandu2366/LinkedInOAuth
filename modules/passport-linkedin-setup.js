/**
 * Created by Chandu on 2/28/16.
 */

var express_session = require('express-session');
var passport = require('passport');
var LinkedinStrategy = require('passport-linkedin-oauth2').Strategy;

var link_cred = require('../config');

// API Access link for creating client ID and secret:
// https://www.linkedin.com/secure/developer

var LINKEDIN_CLIENT_ID = link_cred.linkedin.client_id;
var LINKEDIN_CLIENT_SECRET = link_cred.linkedin.client_secret;

// need to call this function
module.exports = function (app) {

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });


    passport.use(new LinkedinStrategy({
            clientID: LINKEDIN_CLIENT_ID,
            clientSecret: LINKEDIN_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/linkedin/callback",
            scope: ['r_basicprofile', 'r_emailaddress'],
            passReqToCallback: true
        },
        function (req, accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            req.session.accessToken = accessToken;
            process.nextTick(function () {
                // To keep the example simple, the user's Linkedin profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Linkedin account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));

    // set up the session for the app
    app.use(express_session({
        secret: 'checkship212',
        resave: true,
        saveUninitialized: true
    }));   // added resave:true and savUnitialized:true due to errors

    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/account', ensureAuthenticated, function (req, res) {  // to authenticate if we are logged in, if so, then response is with username property to the ajax call.
        res.status(200).json({user: req.user});
    })

    function ensureAuthenticated(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.status(401).json({
            message: 'You need to be authenticated to use this endpoint.'
        });
    }

    app.get('/auth/linkedin',
        passport.authenticate('linkedin', {state: 'SOME STATE'}),
        function (req, res) {
            // The request will be redirected to Linkedin for authentication, so this
            // function will not be called.
        });


    app.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', {failureRedirect: '/login'}),
        function (req, res) {
            res.redirect('/');
        });


    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

};