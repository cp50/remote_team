const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();  // Skip hashing if password is not modified
    try {
        this.password = await bcrypt.hash(this.password, 10);  // Hash password with bcrypt
        next();
    } catch (err) {
        next(err);
    }
});

// Method to compare input password with hashed password in DB
userSchema.methods.comparePassword = function (password) {
    return bcrypt.compare(password, this.password);  // Return true/false based on password match
};

const User = mongoose.model('User', userSchema);
module.exports = User;
