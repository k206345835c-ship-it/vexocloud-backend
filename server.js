require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;

const app = express();

// ===== TRUST PROXY (Render / hosting HTTPS) =====
app.set('trust proxy', 1);

// ===== SESJA =====
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersekretnyklucz',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,      // wymagane na Render (HTTPS)
        sameSite: 'none'
    }
}));

// ===== PASSPORT =====
app.use(passport.initialize());
app.use(passport.session());

// ===== DISCORD STRATEGY =====
passport.use(new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
    scope: ['identify', 'guilds']
}, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// ===== ROUTES =====

// HOME
app.get('/', (req, res) => {
    if (!req.user) {
        return res.send(`
            <h2>🔐 Nie jesteś zalogowany</h2>
            <a href="/login">Zaloguj przez Discord</a>
        `);
    }

    res.send(`
        <h1>👋 Witaj ${req.user.username}</h1>
        <img src="https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.png" width="120"/>
        <br><br>
        <a href="/logout">🚪 Wyloguj</a>
    `);
});

// LOGIN
app.get('/login', passport.authenticate('discord'));

// CALLBACK
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/');
    }
);

// LOGOUT
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

// ===== START SERWERA =====
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Backend działa poprawnie!');
    console.log(`🌍 Port: ${PORT}`);
    console.log('🔐 Discord OAuth aktywny');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
