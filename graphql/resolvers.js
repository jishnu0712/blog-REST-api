const User = require("../models/user");
const Post = require("../models/post");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async function ({ userInput }, req) {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "Invalid email." });
    }
    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 3 })
    ) {
      errors.push({ message: "Invalid password." });
    }

    if (errors.length > 0) {
      const err = new Error("Invalid input.");
      err.data = errors;
      err.code = 422;
      throw err;
    }

    const existingUser = await User.findOne({ email: userInput.email });
    if (existingUser) {
      const err = new Error("User aleready exsists");
      throw err;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      password: userInput.password,
      name: userInput.name,
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function ({ email, password }, req) {
    const user = await User.findOne({ email });
    if (!user) {
      const err = new Error("Invalid user id or password.");
      err.code = 401;
      throw err;
    }
    const isMatch = bcrypt.compare(user.password, password);
    if (!isMatch) {
      const err = new Error("Invalid user id or password.");
      err.code = 403;
      throw err;
    }
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      "somesupersecretkey",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
  createPost: async function ({ postInput }, req) {
    if (!req.isAuth) {
      const err = new Error("User not authenticated.");
      err.code = 401;
      throw err;
    }
    const errors = [];
    if (
      validator.isEmpty(postInput.title) ||
      !validator.isLength(postInput.title, { min: 5 })
    ) {
      errors.push({ message: "Title is invalid." });
    }
    if (
      validator.isEmpty(postInput.content) ||
      !validator.isLength(postInput.content, { min: 5 })
    ) {
      errors.push({ message: "Content is invalid." });
    }
    if (errors.length > 0) {
      const err = new Error("Invalid input.");
      err.data = errors;
      err.code = 422;
      throw err;
    }
    const user = await User.findById(req.userId);
    if (!user) {
      const err = new Error("Invalid user.");
      err.code = 401;
      throw err;
    }
    const post = new Post({
      title: postInput.title,
      content: postInput.content,
      imageUrl: postInput.imageUrl,
      creator: user,
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },
  posts: async function ({page}, req) {
    if (!req.isAuth) {
        const err = new Error('User not authenticated.');
        err.code = 401;
        throw err;
    }
    if (!page) {
        page = 1;
    }
    const perPage = 2;
    const posts = await Post.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage)
        .populate("creator");
    const totalPosts = await Post.find().countDocuments();

    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalPosts: totalPosts,
    };
  },
};
