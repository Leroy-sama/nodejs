const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide your name"],
	},
	email: {
		type: String,
		required: [true, "Please provide your email"],
		unique: true,
		lowercase: true,
		validate: [validator.isEmail, "Please provide a valid email"],
	},
	photo: {
		type: String,
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 8,
		select: false,
	},
	confirmPassword: {
		type: String,
		required: [true, "Please confirm your password"],
		validate: {
			//! only works on create or save method
			validator: function (el) {
				return el === this.password; // abc = abc
			},
			message: "passwords are not the same",
		},
	},
});

userSchema.pre("save", async function (next) {
	// run this function if password was modified
	if (!this.isModified("password")) return next();
	// hash password with base 12
	this.password = await bcrypt.hash(this.password, 12);
	//delete confirm password
	this.confirmPassword = undefined;
	next();
});

//* An instance method

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
