let express = require('express');
let passport = require('passport');
let {mongoConnect, Users} = require('./connect');
let ejs = require('ejs');
let jwt = require('jsonwebtoken');
let app = express()
let {initializingPassport, generateAccessToken} = require('./passportConfig');
let expressSession = require('express-session');

let PORT = 3000;

initializingPassport(passport);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(expressSession({  secret: 'secret', resave: false, saveUninitialized: false, cookie: { secure: false } }));
app.use(passport.initialize());
app.use(passport.session());

const secretKey = 'myKey851@)';
const refreshSecretKey = 'DJio*(*j49894';

app.set('view engine', 'ejs');

// ======== Home Section for test API
app.get('/', (req, res) => {
	res.render('index')
})

app.get('/register', (req, res) => {
	res.render('register')
})

app.get('/login', (req, res) => {
	res.render('login')
})

app.get('/protected-route', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
}); // http://localhost:3000/protected-route and use Beared Token and past your token here


app.get('/logout', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        await Users.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: null } });

        res.json({ message: 'Successfully logged out' });
    } catch (error) {
        res.status(500).send('Error during logout. ' + error);
    }
}) // http://localhost:3000/logout and use Beared Token and paste your token here

// ======== Registration API
app.post('/register', async (req, res) => {
    try {
	    const userData = req.body;
    	const user = await Users.find({'username': userData.username});
    	if(user.length > 0) {
	    	res.status(400).send('user already exists');
	    } else {
	    	const register = new Users(userData);
	    	console.log('register', register)
            // If authentication is successful, generate and send both access and refresh tokens
            const accessToken = generateAccessToken(register);
            const refreshToken = jwt.sign({ userId: register._id }, refreshSecretKey, { expiresIn: '7d' }); 
            // Save the refresh token in the user document
            register.refreshToken = refreshToken;
            await register.save();

            res.status(201).json({ message: 'User created successfully', accessToken, refreshToken });
	    }
    }
    catch (err) {
        res.status(500).send('User not created, try again. ' + err);
    }
});

// ======== Login API
app.post('/login', async (req, res) => {
    try {
	    const userData = req.body;
    	const user = await Users.findOne({'username': userData.username, 'password': userData.password});
    	if(!user) {
	    	res.status(400).send('User not exists or invalid credentials');
	    } else {
	    	console.log('login', user)
            // If authentication is successful, generate and send both access and refresh tokens
            const accessToken = generateAccessToken(user);
            const refreshToken = jwt.sign({ userId: user._id }, refreshSecretKey, { expiresIn: '7d' }); 
            // Save the refresh token in the user document
            await Users.findByIdAndUpdate(user._id, { $set: { refreshToken } });

            res.json({ message: 'Successfully logged in', accessToken, refreshToken });
	    }
    }
    catch (err) {
        res.status(500).send('Error during login. ' + err);
    }
});

// Your token refresh route
app.get('/refresh-token', async (req, res) => {
    try {
        // Assume you have the refresh token in the request body
        const refreshToken = req.body.refreshToken;

        // Verify the refresh token
        const decoded = jwt.verify(refreshToken, refreshSecretKey);

        // Fetch the user from the database using the decoded user ID
        const user = await Users.findById(decoded.userId);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Unauthorized - Invalid refresh token' });
        }

        // If the refresh token is valid, generate a new access token
        const accessToken = generateAccessToken(user);

        res.json({ accessToken });
    } catch (error) {
        res.status(500).send('Error during token refresh. ' + error);
    }
}); // http://localhost:3000/refresh-token and pass your refresh token in body like:
/*
{
    "refreshToken": "eyJhbGc.eyJ1c2VySW.ZmCE4kfx"
}
*/

app.listen(PORT, () => {
	console.log(`server are running on ${PORT}`);
})