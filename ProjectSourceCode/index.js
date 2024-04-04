// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const handlebars = require('express-handlebars');
const Handlebars = require('handlebars');
const path = require('path');
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part C.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// create `ExpressHandlebars` instance and configure the layouts and partials dir.
const hbs = handlebars.create({
  extname: 'hbs',
  layoutsDir: __dirname + '/views/layouts',
  partialsDir: __dirname + '/views/partials',
});

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

// Register `hbs` as our view engine using its bound `engine()` function.
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', function (req, res) {
    res.redirect('/login');
  });

app.get('/test', function (req, res) {
    res.redirect('/login');
  });

app.get('/login', function (req, res) {
  res.render('pages/login');
});

app.get('/register', function (req, res) {
  res.render('pages/register');
});
app.get('/home', function (req, res) {
  res.render('pages/home');
});

app.post('/create-post', async (req, res) => { //post
  try {
    const { author, caption, recipe_id, date_created, image_url, original_flag } = req.body;
    await db.none('INSERT INTO posts (author, caption, recipe_id, date_created, image_url, original_flag) VALUES ($1, $2, $3, $4, $5, $6)', [author, caption, recipe_id, date_created, image_url, original_flag]);
    res.redirect('/home'); 
  } catch (error) {
    console.error('Error creating post:', error);
    res.redirect('/home'); 
  }
});

app.post('/like-post', async (req, res) => { //like
  try {
    const { post_id, username } = req.body;
    const existingLike = await db.oneOrNone('SELECT * FROM likes WHERE post_id = $1 AND username = $2', [post_id, username]);
    if (existingLike) {
      await db.none('DELETE FROM likes WHERE post_id = $1 AND username = $2', [post_id, username]);
      res.json({ success: true, message: 'Like removed successfully' });
    } else {
      await db.none('INSERT INTO likes (post_id, username) VALUES ($1, $2)', [post_id, username]);
      res.json({ success: true, message: 'Post liked successfully' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Error liking post' });
  }
});

app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
  
    // To-DO: Insert username and hashed password into the 'users' table
    const username = req.body.username;
    const profile_pic = req.body.profile_pic;
    const query = 'INSERT INTO users (username, password, profile_pic) VALUES($1, $2, $3) RETURNING *;';
    
    db.one(query, [username, hash, profile_pic])
        .then(data => {
          res.redirect('/login');
        
        })
        .catch(err => {
        console.log(err);
        res.redirect('/register');
        
        });
    });

app.post('/login', async (req, res) => {
  /*
find the user fromt he users table where the username is the same as the one entered by the user.
use bcrypt.compare to encrypt the password enetered from the user and compare if the entered password is the same as the registered one.
if the password is incorrect, render the login page and send a message to the user stating incorrect username or password
else, save the user in the session variable
*/

  try {
    const user = await db.one('SELECT * FROM users WHERE username = $1;', [req.body.username]);
    
    const match = await bcrypt.compare(req.body.password, user.password);
    
    if (match) {
      req.session.user = user;
      req.session.save();
      res.redirect('/home');
    } else {
      res.render('pages/login' ,{
        message: `Incorrect username or password.`
      });
    }
  } catch (error) {
    // Handle errors
    console.error(error);
    res.redirect('/register'); // Redirect to register page if there's an error
  }

});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.render('pages/logout');
});

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports=app.listen(3000)
console.log('Server is listening on port 3000');
