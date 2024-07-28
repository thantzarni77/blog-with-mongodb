const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO9075 } = require("date-fns");

exports.createPost = (req, res) => {
  const { title, photo, description } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("AddPost", {
      title: "Add Post",
      error: errors.array()[0].msg,
      oldFormData: { title, photo, description },
    });
  }
  Post.create({ title, description, imgUrl: photo, userId: req.user })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
  res.render("AddPost", {
    title: "Add Post",
    oldFormData: { title: "", photo: "", description: "" },
    error: "",
  });
};

exports.renderHomePage = (req, res) => {
  Post.find()
    .select("title description imgUrl")
    .populate("userId", "email")
    .sort({ title: 1 })
    .then((posts) => {
      res.render("Home", {
        title: "Home Page",
        posts,
        userEmail: req.user ? req.user.email : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.getDetails = (req, res) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .populate("userId", "email")
    .then((post) => {
      res.render("Details", {
        title: post.title,
        post,
        date: post.createdAt
          ? formatISO9075(post.createdAt, { representation: "date" })
          : "",
        currentUserId: req.session.userData
          ? req.session.userData._id
          : undefined,
      });
    })
    .catch((err) => console.log(err));
};

exports.getEditPost = (req, res) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        return res.redirect("/");
      }
      res.render("EditPost", {
        title: post.title,
        postId: undefined,
        oldFormData: {
          title: undefined,
          photo: undefined,
          description: undefined,
        },
        isValidationFail: false,
        post,
        error: "",
      });
    })
    .catch((err) => console.log(err));
};

exports.updatePost = (req, res) => {
  const { title, description, photo, postId } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("EditPost", {
      title,
      postId,
      error: errors.array()[0].msg,
      isValidationFail: true,
      oldFormData: { title, photo, description },
    });
  }
  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      post.imgUrl = photo;
      return post.save().then((result) => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.deletePost = (req, res) => {
  const postId = req.params.postId;
  Post.findByIdAndDelete(postId)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};
