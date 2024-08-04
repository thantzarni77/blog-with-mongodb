const Post = require("../models/post");
const { validationResult } = require("express-validator");
const { formatISO9075 } = require("date-fns");

const fileDelete = require("../utils/fileDelete");

const POST_PER_PAGE = 6;

exports.createPost = (req, res, next) => {
  const { title, description } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  if (image === undefined) {
    return res.status(422).render("AddPost", {
      title: "Add Post",
      error: "Image type must be jpg/jpeg and png only",
      oldFormData: { title, description },
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render("AddPost", {
      title: "Add Post",
      error: errors.array()[0].msg,
      oldFormData: { title, description },
    });
  }
  Post.create({ title, description, imgUrl: image.path, userId: req.user })
    .then((result) => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong while creating post");
      return next(error);
    });
};

exports.renderCreatePage = (req, res) => {
  res.render("AddPost", {
    title: "Add Post",
    oldFormData: { title: "", photo: "", description: "" },
    error: "",
  });
};

exports.renderHomePage = (req, res, next) => {
  const pageNumber = +req.query.page || 1;
  let totalPostsCount;

  Post.find()
    .countDocuments()
    .then((totalPosts) => {
      totalPostsCount = totalPosts;

      return Post.find()
        .select("title description imgUrl")
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .populate("userId", "email")
        .sort({ title: 1 });
    })
    .then((posts) => {
      if (posts.length > 0) {
        return res.render("Home", {
          title: "Home Page",
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

exports.getDetails = (req, res, next) => {
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
    .catch((err) => {
      console.log(err);
      const error = new Error("No post found with this id");
      return next(error);
    });
};

exports.getEditPost = (req, res, next) => {
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
    .catch((err) => {
      console.log(err);
      const error = new Error("Can't edit the post");
      return next(error);
    });
};

exports.updatePost = (req, res, next) => {
  const { title, description, postId } = req.body;
  const image = req.file;
  const errors = validationResult(req);

  // if (image === undefined) {
  //   return res.status(422).render("EditPost", {
  //     title,
  //     postId,
  //     isValidationFail: true,
  //     error: "Image type must be jpg/jpeg and png only",
  //     oldFormData: { title, description },
  //   });
  // }
  if (!errors.isEmpty()) {
    return res.status(422).render("EditPost", {
      title,
      postId,
      error: errors.array()[0].msg,
      isValidationFail: true,
      oldFormData: { title, description },
    });
  }
  Post.findById(postId)
    .then((post) => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      post.title = title;
      post.description = description;
      if (image) {
        fileDelete(post.imgUrl);
        post.imgUrl = image.path;
      }
      return post.save().then((result) => {
        res.redirect("/");
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong while editing the post");
      return next(error);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.redirect("/");
      }
      fileDelete(post.imgUrl);
      return Post.deleteOne({ _id: postId, userId: req.user._id });
    })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};
