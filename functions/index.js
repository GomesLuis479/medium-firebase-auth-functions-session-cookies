const functions = require('firebase-functions');
const express   = require('express')
var hbs = require('express-handlebars')
const admin = require('firebase-admin');
const cookieParser = require('cookie-parser');

// intialise the express app
const app = express();

app.set('views', './views');
app.engine('hbs', hbs());
app.set('view engine', 'hbs');
admin.initializeApp(functions.config().firebase);

app.use(cookieParser());

// root route
app.get('/', (req, res) => {
    res.render('home');
});

// route to signin
app.get('/signin', (req, res) => {
    res.render('signin');
});

// route to signout
app.get('/signout', (req, res) => {
    res.clearCookie('__session');
	res.redirect('/');
});


// this will only load when you are signed in 
app.get('/newPage', checkCookieMiddleware, (req, res) => {
    let uid =  req.decodedClaims.uid;
    res.render('newPage', {uid: uid});
});


// route that sets a session cookie
app.get('/sessionLogin', (req, res) => {
    // Get the ID token passed.

	const idToken = req.query.idToken;
	setCookie(idToken, res);
});


function setCookie(idToken, res) {
	// Set session expiration to 5 days.
	// Create the session cookie. This will also verify the ID token in the process.
	// The session cookie will have the same claims as the ID token.
	
	const expiresIn = 60 * 60 * 24 * 5 * 1000;
	admin.auth().createSessionCookie(idToken, {expiresIn}).then((sessionCookie) => {
		
		// Set cookie policy for session cookie and set in response.
		const options = {maxAge: expiresIn, httpOnly: true, secure: true};
		res.cookie('__session', sessionCookie, options);
		
		admin.auth().verifyIdToken(idToken).then(function(decodedClaims) {
			res.redirect('/newPage');
		});
			
	}, error => {
		res.status(401).send('UNAUTHORIZED REQUEST!');
	});
}


// middleware to check cookie
function checkCookieMiddleware(req, res, next) {

	const sessionCookie = req.cookies.__session || '';

	admin.auth().verifySessionCookie(
		sessionCookie, true).then((decodedClaims) => {
			req.decodedClaims = decodedClaims;
			next();
		})
		.catch(error => {
			// Session cookie is unavailable or invalid. Force user to login.
			res.redirect('/signin');
		});
}

// app is the name of the Firebase function
// we use this in the firebase.json file to redirect requests
// to this function that, in turn, sends it to the express app
exports.app = functions.https.onRequest(app);