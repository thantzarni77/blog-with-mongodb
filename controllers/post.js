const Post = require("../models/post");

exports.createPost = (req, res) => {
  const { title, photo, description } = req.body;
  Post.create({ title, description, imgUrl: photo, userId: req.user })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
  res.render("AddPost", { title: "Add Post" });
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
    .then((post) => {
      res.render("Details", {
        title: post.title,
        post,
        currentUserId: req.session.userData ? req.session.userData._id : "",
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
        post,
      });
    })
    .catch((err) => console.log(err));
};

exports.updatePost = (req, res) => {
  const { title, description, photo, postId } = req.body;
  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      post.imgUrl = photo;
      return post.save().then((result) => {
        console.log(result);
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
