const express = require("express");
const app = express();
const morgan = require("morgan");
const session = require("express-session");
const handlebars = require('express-handlebars');
const parser = require("body-parser");
const validator = require("express-validator");
const fs = require("fs");
const words = fs.readFileSync("/usr/share/dict/words", "utf-8").toLowerCase().split("\n");


app.engine("handlebars", handlebars());
app.set("veiws", "./views");
app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(parser.json());
app.use(parser.urlencoded({
  extended: false
}));

app.use(session({
  secret: 'superdog',
  resave: false,
  saveUninitialized: true,
}))
console.log(session);

app.use(function(req, res, next) {
  if (!req.session.theChosenOne) {
    req.session.random = Math.floor(Math.random() * words.length)
    console.log(words[req.session.random]);
    req.session.theChosenOne = words[req.session.random];
    req.session.letters = words[req.session.random].split("").map(function() {
      return null
    });
    console.log(req.session.letters);
    req.session.guessesLeft = 8;
    req.session.wrongGuesses = [];
  }
  next();
})


app.get("/", function(req, res) {
  if (req.session.letters.join("") === req.session.theChosenOne) {
    res.redirect("/win");
  }else {
    res.render("home", {
      letters: req.session.letters,
      wrongGuesses: req.session.wrongGuesses,
      guesses: req.session.guessesLeft
    });
  }
})

app.post("/", function(req, res) {
  let input = req.body.guess;
  console.log(input);
  if (req.session.theChosenOne.search(input) === -1) {
    req.session.guessesLeft -= 1;
    req.session.wrongGuesses.push(input);
    console.log(req.session.guessesLeft)
    if (req.session.guessesLeft === 0) {
      res.redirect("/lose")
    } else {
      res.redirect("/")
    }
  } else {
    console.log("please?");
    console.log(req.session.theChosenOne.length);
    for (var x = 0; x < req.session.theChosenOne.length; x++) {
      console.log("pretty please");
      if (req.session.theChosenOne[x] === input) {
        req.session.letters[x] = input;
      }
    }
       res.redirect("/");
  }
})

app.get("/lose", function(req, res) {
  res.render("lose")
})

app.get("/win", function(req, res) {
  res.render("win")
})

app.post("/newGame", function(req, res) {
  req.session.destroy(function(err) {});
  res.redirect("/")
})


app.listen(3000);
