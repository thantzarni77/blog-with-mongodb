const Post = require("../models/post");

exports.createPost = (req, res) => {
  const { title, photo, description } = req.body;
  const post = new Post(title, description, photo);
  post
    .addPost()
    .then((result) => {
      console.log(result);
      res.redirect("/");
    })
    .catch((err) => console.log(err));
};

exports.renderCreatePage = (req, res) => {
  res.render("AddPost", { title: "Add Post" });
};

exports.renderHomePage = (req, res) => {
  Post.getPosts()
    .then((posts) => {
      res.render("Home", { title: "Home Page", posts });
    })
    .catch((err) => console.log(err));
};

exports.getDetails = (req, res) => {
  const postId = req.params.postId;
  Post.getPost(postId)
    .then((post) => {
      res.render("Details", { title: post.title, post });
    })
    .catch((err) => console.log(err));
};
