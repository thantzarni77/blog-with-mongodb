const User = require("../models/user");
const bcrypt = require("bcrypt");

//handle create account
exports.createAccount = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.redirect("/register");
      }
      return bcrypt
        .hash(password, 10)
        .then((hashedPwd) => {
          return User.create({
            email,
            password: hashedPwd,
          });
        })
        .then((_) => {
          res.redirect("/login");
        });
    })
    .catch((err) => console.log(err));
};

//render register page
exports.getRegisterPage = (req, res) => {
  res.render("auth/Register", { title: "Create a new account" });
};

//render Login Page
exports.getLoginPage = (req, res) => {
  res.render("auth/Login", { title: "Login" });
};

//handle login
exports.postLoginData = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLogin = true;
            req.session.userData = user;
            return req.session.save((err) => {
              res.redirect("/");
              console.log(err);
            });
          }
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

//handle logout
exports.logout = (req, res) => {
  req.session.destroy((_) => {
    res.redirect("/");
  });
};
