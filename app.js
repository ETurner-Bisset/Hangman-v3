const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT;
const date = new Date().getFullYear();

// Mongoose database and schema/model
const DB = process.env.DATABASE_URL.replace('<PASSWORD>', process.env.PASSWORD);

mongoose.connect(DB).then(() => console.log('DB connection successful'));

const scoreSchema = new mongoose.Schema({
  user: {
    type: String,
    required: [true, 'You must enter a name to register your high score.'],
    trim: true,
    maxlength: [16, 'Name must be less than 16 characters.'],
  },
  score: {
    type: Number,
    required: [true, 'You must have a score to register your high score.'],
  },
});

scoreSchema.index({ score: -1 });

scoreSchema.pre(/^find/, function (next) {
  this.find().sort('-score').limit(20);
  next();
});

const Score = mongoose.model('Score', scoreSchema);

// Middleware
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', async (req, res) => {
  try {
    const scores = await Score.find();
    res.status(200).render('home', { date, scores });
  } catch (error) {
    console.log(error);
  }
});

app.get('/error', (req, res) => {
  res.status(200).render('error', { date });
});

app.post('/', async (req, res) => {
  try {
    await Score.create({
      user: req.body.user,
      score: req.body.totalScore,
    });
    res.status(201).redirect('/');
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
