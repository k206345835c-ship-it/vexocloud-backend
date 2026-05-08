const router = require('express').Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mongoose = require('mongoose');

const User = mongoose.model('User');

// Register
router.post('/register', async (req,res)=>{
  const hash = await bcrypt.hash(req.body.password,10);
  await User.create({
    email: req.body.email,
    password: hash
  });
  res.sendStatus(200);
});

// Login
router.post('/login', async (req,res)=>{
  const user = await User.findOne({ email: req.body.email });
  if(!user) return res.sendStatus(401);
  const ok = await bcrypt.compare(req.body.password, user.password);
  if(!ok) return res.sendStatus(401);
  req.login(user, ()=> res.sendStatus(200));
});

// Discord
router.get('/discord', passport.authenticate('discord'));
router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/' }),
  (req,res)=> res.redirect('/panel.html')
);

module.exports = router;
