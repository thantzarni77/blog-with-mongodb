const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const dotenv = require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_ADD,
    pass: process.env.GMAIL_PWD,
  },
});

//handle create account
exports.createAccount = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/Register", {
      title: "Creat a new account",
      error: errors.array()[0].msg,
      oldFormData: { email, password },
    });
  }
  bcrypt
    .hash(password, 10)
    .then((hashedPwd) => {
      return User.create({
        email,
        password: hashedPwd,
      });
    })
    .then((_) => {
      res.redirect("/login");
      transporter.sendMail(
        {
          from: process.env.GMAIL_ADD,
          to: email,
          subject: "Account Register successful",
          html: "<h1>Account registered successfully</h1><p>Created an account in this blog.io using this email</p>",
        },
        (err) => {
          console.log(err);
          const error = new Error("Can't create an account");
          return next(error);
        }
      );
    });
};

//render register page
exports.getRegisterPage = (req, res) => {
  res.render("auth/Register", {
    title: "Create a new account",
    error: req.flash("error"),
    oldFormData: { email: "", password: "" },
  });
};

//render Login Page
exports.getLoginPage = (req, res) => {
  res.render("auth/Login", {
    title: "Login",
    error: req.flash("error"),
    oldFormData: { email: "", password: "" },
  });
};

//handle login
exports.postLoginData = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/Login", {
      title: "Login",
      error: errors.array()[0].msg,
      oldFormData: { email, password },
    });
  }
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/Login", {
          title: "Login",
          error: "Please enter valid mail and password",
          oldFormData: { email, password },
        });
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
          res.status(422).render("auth/Login", {
            title: "Login",
            error: "Please enter valid mail and password",
            oldFormData: { email, password },
          });
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong while login process");
      return next(error);
    });
};

//handle logout
exports.logout = (req, res) => {
  req.session.destroy((_) => {
    res.redirect("/");
  });
};

//renderResetPwd
exports.renderResetPwd = (req, res) => {
  res.render("auth/ResetPwd", {
    title: "Reset Password",
    error: req.flash("error"),
    oldFormData: { email: "" },
  });
};

//renderGetFeedBack
exports.renderFeedback = (req, res) => {
  res.render("auth/Feedback", {
    title: "Reset Password Succeed",
  });
};

//resestPwdLinkSent
exports.resetLinkSent = (req, res, next) => {
  const { email } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/ResetPwd", {
      title: "Reset Password",
      error: errors.array()[0].msg,
      oldFormData: { email },
    });
  }
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset-password");
    }
    const token = buffer.toString("hex");
    User.findOne({ email })
      .then((user) => {
        user.resultToken = token;
        user.tokenExpiration = Date.now() + 1800000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/feedback");
        transporter.sendMail(
          {
            from: process.env.GMAIL_ADD,
            to: email,
            subject: "Reset Password",
            html: `<h1>Reset Password now</h1><p>Change your account's password by clicking this link below</p><a href="http://localhost:8000/reset-password/${token}">Click to reset password</a>`,
          },
          (err) => console.log(err)
        );
      })
      .catch((err) => {
        console.log(err);
        const error = new Error("Something went wrong");
        return next(error);
      });
  });
};

//handle newPassword
exports.getNewPasswordPage = (req, res, next) => {
  const { token } = req.params;
  User.findOne({ resultToken: token, tokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      res.render("auth/NewPassword", {
        title: "Set New Password",
        error: req.flash("error"),
        resetToken: user.resultToken,
        userId: user._id,
        oldFormData: { password: "", confirmPassword: "" },
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

//setNewPassword
exports.setNewPassword = (req, res, next) => {
  const { resetToken, userId, password, confirmPassword } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/NewPassword", {
      title: "Set New Password",
      error: errors.array()[0].msg,
      resetToken,
      userId,
      oldFormData: { password, confirmPassword },
    });
  }
  let resetUser;
  User.findOne({
    resultToken: resetToken,
    tokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(password, 10);
    })
    .then((hashedPwd) => {
      resetUser.password = hashedPwd;
      resetUser.resetToken = undefined;
      resetUser.tokenExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      return res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};
