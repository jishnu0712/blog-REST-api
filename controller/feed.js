const { validationResult } = require("express-validator");

exports.getPost = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "2",
        title: "A title",
        content: "the content",
        imageUrl: "images/img.png",
        creator: {
          name: "jishnu",
        },
        createdAt: new Date(),
      },
      {
        _id: "3",
        title: "The hero",
        content: "joker",
        imageUrl: "images/img.png",
        creator: {
          name: "jishnu",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({ message: "Validation Failed", errors: errors.array() });
  }
  const title = req.body.title;
  const content = req.body.content;

  // create post in db
  res.status(201).json({
    message: "Post created successfully",
    post: {
      _id: new Date().toISOString(),
      title: title,
      content: content,
      creator: { name: "Jishnu" },
      createdAt: new Date(),
    },
  });
};
