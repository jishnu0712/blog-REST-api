const User = require('../models/user');

const validator = require('validator');

const bcrypt = require('bcryptjs');

module.exports = {
    createUser: async function({ userInput }, req) {
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({message: 'Invalid email.'});
        }
        if (validator.isEmpty(userInput.password) || !validator.isLength(userInput.password, {min: 3})) {
            errors.push({message: 'Invalid password.'});
        }

        if (errors.length > 0) {
            throw new Error('Invalid input.');
        }

        const existingUser = await User.findOne({email: userInput.email});
        if (existingUser) {
            const err = new Error('User aleready exsists');
            throw err;
        }
        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            password: userInput.password,
            name: userInput.name
        });
        const createdUser = await user.save();
        return { ...createdUser._doc, _id: createdUser._id.toString() };

    }
}