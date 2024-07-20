exports.getLoginPage = (req, res) => {
  res.render("auth/Login", { title: "Login" });
};

exports.postLoginData = (req, res) => {
  req.session.isLogin = true;
  res.redirect("/");
};

exports.logout = (req, res) => {
  req.session.destroy((_) => {
    res.redirect("/");
  });
};
