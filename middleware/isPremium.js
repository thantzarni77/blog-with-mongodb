exports.isPremium = (req, res, next) => {
  if (!req.session.userData.isPremium) {
    return res.redirect("/admin/profile");
  }
  next();
};
