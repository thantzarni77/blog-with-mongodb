const posts = [];

exports.createPost = (req, res) => {
    const {title, photo, description} = req.body;
    posts.push({
        id : Math.random(),
        title,
        description,
        photo,
    })
    res.redirect("/")
}

exports.renderCreatePage = (req, res) => {
    res.render("AddPost", {title : "Add Post"})
}

exports.renderHomePage = (req, res) => {
    res.render("Home", {title : "Home Page", posts})
}

exports.getDetails = (req, res) => {
    const postId = req.params.postId;
    const post = posts.find((post) => {
        post.id === postId;
        return post;
    });
    res.render("Details", {title : "Post Details", post})
}