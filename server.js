const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const path = require('path');
const secretKey = 'secret'; 
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

// Sample hardcoded admin user
const adminUser = {
  username: 'admin',
  password: 'admin123',
  role: 'admin',
};

// Signup route
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  if (username === adminUser.username) {
    return res.status(400).json({ message: 'Admin user cannot sign up as a regular user' });
  }
  
  const newUser = {
    username,
    password,
    role: 'user',
  };
  res.json({ message: 'Signup successful', user: newUser });
});

// Login route
// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check if the user is the admin user
  if (username === adminUser.username) {
    // Check if the password is correct
    if (password === adminUser.password) {
      // Generate a JWT token with admin role
      const token = jwt.sign({ username, role: 'admin' }, secretKey);
      // Set the token as a cookie
      res.cookie('token', token, { httpOnly: true });
      res.redirect('/admin');
    } else {
      res.status(401).json({ message: 'Incorrect password :)' });
    }
  } else {
    // Generate a JWT token with user role
    const token = jwt.sign({ username, role: 'user' }, secretKey);
    // Set the token as a cookie
    res.cookie('token', token, { httpOnly: true });
    res.redirect('/dashboard');
  }
});


// Protected route for admin
app.get('/admin', authenticateToken, (req, res) => {
  // Check if the user has the admin role
  if (req.user.role === 'admin') {
    res.render('admin');
  } else {
    res.status(403).send('You do not have permission to access this page.');
  }
});

// Protected route for regular users
app.get('/dashboard', authenticateToken, (req, res) => {
  const username = req.user.username;

  if (username === adminUser.username && req.user.role === 'admin') {
    res.render('adminDashboard', { username });
  } else {
    res.render('dashboard', { username });
  }
});


// Middleware to authenticate the JWT token
function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = decoded;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
