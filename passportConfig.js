/*
https://www.passportjs.org/packages/
https://www.passportjs.org/packages/passport-jwt/
*/

const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
let jwt = require('jsonwebtoken');
let {Users} = require('./connect');
const secretKey = 'myKey851@)';
const refreshSecretKey = 'DJio*(*j49894';


exports.initializingPassport = (passport) => {
    passport.use(new JwtStrategy({jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: secretKey
    }, async (jwtPayload, done) => {
        try {
            const user = await Users.findById(jwtPayload.userId);
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        } catch (error) {
            return done(error, false);
        }
    }));
};

// Function to generate a new access token
exports.generateAccessToken = (user) => {
	console.log('generateAccessToken', user)
    return jwt.sign({ userId: user._id, username: user.username }, secretKey, { expiresIn: '5m' });
};