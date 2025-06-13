const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
	{
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
		role: {
			type: String,
			enum: ["user", "guide", "lead-guide", "admin"],
			default: "user",
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
		passwordResetToken: String,
		passwordResetExpires: Date,
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
	},
	{
		timestamps: true,
	}
);

userSchema.pre("save", async function (next) {
	// run this function if password was modified
	if (!this.isModified("password")) return next();
	// hash password with base 12
	this.password = await bcrypt.hash(this.password, 12);
	//delete confirm password
	this.confirmPassword = undefined;
	next();
});

// Query middleware
userSchema.pre(/^find/, function (next) {
	// this keyword points to the current query
	this.find({ active: { $ne: false } });
	next();
});

//* An instance method

userSchema.methods.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.updatedAt) {
		const changedTimeStamp = parseInt(this.updatedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimeStamp;
	}

	// not changed !!
	return false;
};

userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex");

	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	console.log({ resetToken }, this.passwordResetToken);

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
