const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'rahasia123',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use('/', authRoutes);
app.use('/booking', bookingRoutes);
app.use('/user', userRoutes);

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
