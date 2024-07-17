exports.getLoginPage = (req, res) => {
  res.render("auth/Login", { title: "Login" });
};

exports.postLoginData = (req, res) => {
  res.setHeader("Set-Cookie", "isLogin=true");
  res.redirect("/");
};
