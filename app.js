if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
// all the imports
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo")(session);

const User = require('./models/user');

const campsRoutes = require("./routes/campsRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");
const userRoutes = require('./routes/userRoutes');


main().catch((err) => console.log(err));
/**
 * This function connects to the MongoDB database and returns a promise that resolves when the
 * connection is established.
 */
 

async function main() {
  const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/campGo";
  await mongoose.connect(dbUrl);
}

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connected to database");
});
const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/campGo";
const app = express();
const PORT = process.env.PORT || 3000;

/* This is setting the view engine to ejs and setting the views directory to the views folder. */
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize({
  replaceWith: '_'
}))

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})
  
const sessionConfig = {
  store,
  name: 'session',
  secret: secret, resave: false, saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week in miliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});


app.use('/', userRoutes);
app.use("/campgrounds", campsRoutes);
app.use("/campgrounds/:id/reviews", reviewsRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

/* This is a catch all route that will catch any route that is not defined. */
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

// error handler
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "something went wrong" } = err;
  if (!err.message) err.message = "Something Went horribly wrong";
  return res.status(statusCode).render("error", {  // here return needs to be put to ignore [ERR_HTTP_HEADERS_SENT] error
    err,
  });
  res.send("Something went wrong");
});

app.listen(PORT, () => {
  console.log(`connected to ${ PORT }`);
});
