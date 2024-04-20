const User = require("../models/user");

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
      "secretsss",
      { expiresIn: "1h" }
    );
    return { token: token, userId: user._id.toString() };
  },
};
