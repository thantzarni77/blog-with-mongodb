const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");

let POST_PER_PAGE = 6;

exports.getProfilePage = (req, res, next) => {
  const pageNumber = +req.query.page || 1;
  let totalPostsCount;

  Post.find({ userId: req.user._id })
    .countDocuments()
    .then((totalPosts) => {
      totalPostsCount = totalPosts;

      return Post.find({ userId: req.user._id })
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .populate("userId", "email username")
        .sort({ createdAt: -1 });
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/Profile", {
          title: req.session.userData.email,
          posts,
          userEmail: req.user ? req.user.email : "",
          currentPage: pageNumber,
          hasNextPage: POST_PER_PAGE * pageNumber < totalPostsCount,
          hasPreviousPage: pageNumber > 1,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
        });
      } else {
        return res.status(500).render("error/500", {
          title: "Something went wrong",
          message: "No Post Avaliable in this page query",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getPublicProfilePage = (req, res, next) => {
  const { userId } = req.params;
  const pageNumber = +req.query.page || 1;
  let totalPostsCount;

  Post.find({ userId: userId })
    .countDocuments()
    .then((totalPosts) => {
      totalPostsCount = totalPosts;

      return Post.find({ userId: userId })
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .populate("userId", "email")
        .sort({ createdAt: -1 });
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("user/Public-Profile", {
          title: posts[0].userId.email,
          posts,
          userEmail: posts[0].userId.email,
          currentPage: pageNumber,
          hasNextPage: POST_PER_PAGE * pageNumber < totalPostsCount,
          hasPreviousPage: pageNumber > 1,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
        });
      } else {
        return res.status(500).render("error/500", {
          title: "Something went wrong",
          message: "No Post Avaliable in this page query",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.renderUserNamePage = (req, res) => {
  res.render("user/UserName", {
    title: "Set Username",
    error: req.flash("error"),
    oldFormData: { username: "" },
  });
};

exports.setUserName = (req, res, next) => {
  const { username } = req.body;
  const updatedUsername = username.replace("@", "");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("user/UserName", {
      title: "Set Username",
      error: errors.array()[0].msg,
      oldFormData: { username },
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.username = `@${updatedUsername}`;
      return user.save().then(() => {
        res.redirect("/admin/profile");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("User Not Found with this id");
      return next(error);
    });
};

exports.renderPremiumPage = (req, res) => {
  res.render("user/Premium", { title: "Buy Premium" });
};
