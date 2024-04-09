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
const user = {
  username: undefined
};

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/welcome', (req, res) => {
  res.json({status: 'success', message: 'Welcome!'});
});

app.get('/', function (req, res) {
    res.render('pages/home',{
      username: req.session.user.username
    });
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
  db.any('SELECT * FROM posts')
    .then(posts => {
      console.log(posts)
      res.render('pages/home', { posts });
    })
    
 .catch(err => {
  res.render('pages/home');
      res.render('pages/home', {
      error: true,
      message: 'Error getting posts'});
    });
});

app.get('/user', function(req,res) {
  const user_query = `SELECT *
  FROM users
  WHERE username = $1`;
  
  const post_query = `SELECT *
  FROM posts
  WHERE author = $1
  ORDER BY date_created DESC
  `;

  // const username = req.body.username;
  const username = 'user3';

  db.task('get-user', task => {
    return task.batch([
      task.any(user_query, [username]),
      task.any(post_query, [username]),
    ])
  })
  .then (userdata => {
    console.log(userdata)
    res.render('pages/user', {username: userdata[0][0].username, profile_picture: userdata[0][0].profile_pic});
    // add followers, posts when we figure out db issues
  })
  .catch (error => {
    console.log(error)
    res.render('pages/user');
  });
  
});

app.get('/recipe', function (req, res) {

  const recipe_query = `SELECT *
  FROM RECIPES
  WHERE recipe_id = $1`

  const recipe_id = 14;

  db.any(recipe_query, recipe_id)
  .then (recipedata => {
    console.log(recipedata)
    res.render('pages/recipe', {title: recipedata[0].title, author: recipedata[0].author, body: recipedata[0].body, date_created: recipedata[0].date_created});
  })
  .catch (error => {
    console.log(error)
    res.render('pages/recipe');
  })
 });

app.get('/post', function (req, res) {
  res.render('pages/post');
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

app.post('/follow-user', async (req, res) => { //follow
  try {
    const { username, followee } = req.body;
    const existingFollower = await db.oneOrNone('SELECT * FROM followers WHERE username = $1 AND followee = $2', [username, followee]);
    if (existingFollower) {
      await db.none('DELETE FROM followers WHERE followee = $1 AND follower = $2', [username, followee]);
      res.json({ success: true, message: 'Successfully Unfollowed' });
    } else {
      await db.none('INSERT INTO followers (follower, followee) VALUES ($2, $1)', [username, followee]);
      res.json({ success: true, message: 'User Followed Successfully' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Error following user' });
  }
});

app.post('/comment-post', function (req, res) {
  const query =
    'insert into comments (post_id, username, body, date_created) values ($1, $2, $3, $4)  returning * ;';
  db.any(query, [
    req.body.post_id,
    req.body.username,
    req.body.comment,
    req.body.date_created,
  ])
    .then(function (data) {
      res.status(201).json({
        status: 'success',
        data: data,
        message: 'data added successfully',
      });
    })
    .catch(function (err) {
      console.error('Error liking post:', error);
      res.status(500).json({ success: false, message: 'Error commenting on post' });
    });
});


app.post('/register', async (req, res) => {
    //hash the password using bcrypt library
    const hash = await bcrypt.hash(req.body.password, 10);
  
    // To-DO: Insert username and hashed password into the 'users' table
    const username = req.body.username;
    const query = 'INSERT INTO users (username, password) VALUES($1, $2) RETURNING *;';
    
    db.one(query, [username, hash])
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
    const login_user = await db.one('SELECT * FROM users WHERE username = $1;', [req.body.username]);
    const match = await bcrypt.compare(req.body.password, login_user.password);
    
    if (match) {
      user.username = login_user.username;
      req.session.user = user;
      req.session.save();
      res.redirect('/');
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

app.get('/home', function (req, res) {
  const username = req.session.username;
  db.any('SELECT p.author, p.caption, p.recipe_id, p.date_created, p.image_url, p.original_flag FROM posts p, users u, followers f WHERE u.username = f.follower AND f.followee = p.author AND u.username = $1 ORDER BY p.date_created DESC;', [username])
    .then(posts => {
      console.log(posts)
      res.render('pages/home', { posts , username: req.session.user.username});
    })
    .catch(err => {
      res.render('pages/home', {
      error: true,
      message: 'Error getting posts',
      username: req.session.user.username});
    });
});

app.get('/post', function (req, res) {
  res.render('pages/post', {
    username: req.session.user.username
  });
});

app.post('/follow-user', async (req, res) => { //follow
  try {
    const { username, followee } = req.body;
    const existingFollower = await db.oneOrNone('SELECT * FROM followers WHERE username = $1 AND followee = $2', [username, followee]);
    if (existingFollower) {
      await db.none('DELETE FROM followers WHERE followee = $1 AND follower = $2', [username, followee]);
      res.json({ success: true, message: 'Successfully Unfollowed' });
    } else {
      await db.none('INSERT INTO followers (follower, followee) VALUES ($2, $1)', [username, followee]);
      res.json({ success: true, message: 'User Followed Successfully' });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, message: 'Error following user' });
  }
});

app.post('/create-post', async (req, res) => { //post
  try {
    const author = req.session.user.username;
    const title = req.body.title;
    const body = req.body.body;
    const date_created = new Date();
    const caption = req.body.caption;
    const image_url = req.body.image_url;
    const original_flag = true;

    db.one('INSERT INTO recipes (title, author, body, date_created) VALUES ($1, $2, $3, $4) RETURNING recipe_id;', [title, author, body, date_created])
    .then(data => {
      db.none('INSERT INTO posts (author, caption, recipe_id, date_created, image_url, original_flag) VALUES ($1, $2, $3, $4, $5, $6)', [author, caption, data.recipe_id, date_created, image_url, original_flag]);
      res.redirect('/home');
    })
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

app.post('/comment-post', function (req, res) {
  const query =
    'insert into comments (post_id, username, body, date_created) values ($1, $2, $3, $4)  returning * ;';
  db.any(query, [
    req.body.post_id,
    req.body.username,
    req.body.comment,
    req.body.date_created,
  ])
    .then(function (data) {
      res.status(201).json({
        status: 'success',
        data: data,
        message: 'data added successfully',
      });
    })
    .catch(function (err) {
      console.error('Error liking post:', error);
      res.status(500).json({ success: false, message: 'Error commenting on post' });
    });
});



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
