const { validationResult } = require("express-validator");
const stripe = require("stripe")(
  "sk_test_51PlErw2N1koI3KTDbn4B4fry1Zfs15euRFbnlDsunBXnitgoLRWm8FpH0FGQyHVKIeHpqMeSwolTSvqGVKoGrsO300qefyqqi0"
);
const Post = require("../models/post");
const User = require("../models/user");

let POST_PER_PAGE = 6;

exports.getProfilePage = (req, res, next) => {
  const pageNumber = +req.query.page || 1;
  let totalPostsCount;
  let userDataGet;

  User.findById(req.user._id)
    .then((user) => {
      userDataGet = user;
    })
    .catch((err) => {
      console.log(err);
    });

  Post.find({ userId: req.user._id })
    .countDocuments()
    .then((totalPosts) => {
      totalPostsCount = totalPosts;

      return Post.find({ userId: req.user._id })
        .skip((pageNumber - 1) * POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .populate("userId", "email username isPremium profile_imgUrl")
        .sort({ createdAt: -1 });
    })
    .then((posts) => {
      if (!posts.length && pageNumber > 1) {
        return res.status(500).render("error/500", {
          title: "Something went wrong",
          message: "No Post Avaliable in this page query",
        });
      } else {
        return res.render("user/Profile", {
          title: req.session.userData.email,
          posts,
          userData: userDataGet,
          userEmail: req.user ? req.user.email : "",
          currentPage: pageNumber,
          hasNextPage: POST_PER_PAGE * pageNumber < totalPostsCount,
          hasPreviousPage: pageNumber > 1,
          nextPage: pageNumber + 1,
          previousPage: pageNumber - 1,
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
        .populate("userId", "email isPremium username profile_imgUrl")
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

exports.renderPremiumPage = (req, res, next) => {
  stripe.checkout.sessions
    .create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "price_1PlF3Y2N1koI3KTDyA9hgBD4",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.protocol}://${req.get("host")}/admin/subscription_success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get("host")}/admin/subscription_cancel`,
    })
    .then((stripeSession) => {
      res.render("user/Premium", {
        title: "Buy Premium",
        session_id: stripeSession.id,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getSuccessPage = (req, res) => {
  const session_id = req.query.session_id;
  if (!session_id || !session_id.includes("cs_test_")) {
    return res.redirect("/admin/profile");
  }
  User.findById(req.user._id)
    .then((user) => {
      user.isPremium = true;
      user.payment_session_key = session_id;
      return user.save().then((_) => {
        res.render("user/SubSuccess", {
          title: "Subscription Success",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getPremiumDetails = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      return stripe.checkout.sessions.retrieve(user.payment_session_key);
    })
    .then((stripeSession) => {
      res.render("user/Premium-Details", {
        title: "Premium Status",
        customer_id: stripeSession.customer,
        country: stripeSession.customer_details.address.country,
        postal_code: stripeSession.customer_details.address.postal_code,
        email: stripeSession.customer_details.email,
        name: stripeSession.customer_details.name,
        invoice_id: stripeSession.invoice,
        status: stripeSession.payment_status,
      });
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};

exports.getProfileUploadPage = (req, res) => {
  res.render("user/Profile-upload", { title: "Profile Upload", error: "" });
};

exports.setProfileImage = (req, res, next) => {
  const photo = req.file;
  const errors = validationResult(req);

  if (photo === undefined) {
    return res.status(422).render("user/Profile-upload", {
      title: "Profile Upload",
      error: "Image type must be jpg/jpeg and png only",
    });
  }
  if (!errors.isEmpty()) {
    return res.status(422).render("user/Profile-upload", {
      title: "Profile Upload",
      error: errors.array()[0].msg,
    });
  }

  User.findById(req.user._id)
    .then((user) => {
      user.profile_imgUrl = photo.path;
      return user.save();
    })
    .then(() => {
      res.redirect("/admin/profile");
    })
    .catch((err) => {
      console.log(err);
      const error = new Error("Something went wrong");
      return next(error);
    });
};
