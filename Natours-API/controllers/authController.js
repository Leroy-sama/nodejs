const crypto = require("crypto");
const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

exports.signup = catchAsync(async (req, res, next) => {
	const { name, email, photo, password, confirmPassword } = req.body;
	const newUser = await User.create({
		name,
		email,
		photo,
		password,
		confirmPassword,
	});

	const token = signToken(newUser._id);
	res.status(201).json({
		status: "success",
		token,
		data: {
			newUser,
		},
	});
});

exports.login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return next(new AppError("Please provide email and password!", 400));
	}

	const user = await User.findOne({ email }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect email or password", 401));
	}

	const token = signToken(user._id);
	res.status(200).json({
		status: "success",
		token,
	});
});

exports.protect = catchAsync(async (req, res, next) => {
	//get token
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}

	if (!token) {
		return next(
			new AppError(
				"You are not logged in! Please log in to access tours",
				401
			)
		);
	}
	//verify token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	//check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) return next(new AppError("User no longer exists", 401));

	//check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError(
				"User recently changed password. Please login again",
				401
			)
		);
	}

	// grant access to tour route protected route
	req.user = currentUser;
	next();
});

exports.restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles ["admin", "lead-guide"]

		if (!roles.includes(req.user.role)) {
			return next(
				new AppError(
					"You do not have permission to perform this action",
					403
				)
			);
		}

		next();
	};
};

exports.resetPassword = catchAsync(async (req, res, next) => {
	// 1. Get user based on token
	const hashedToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: {
			$gt: Date.now(),
		},
	});

	// 2. if token has not expired and there is a user set the new password
	if (!user) {
		return next(new AppError("Token is invalid or has expired", 400));
	}

	user.password = req.body.password;
	user.confirmPassword = req.body.confirmPassword;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();

	// 3. Update changedPasswordAt Property for the user
	// 4. Log the user in, send JWT

	const token = signToken(user._id);
	res.status(200).json({
		status: "success",
		token,
	});
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
	// 1. get user based on posted email
	const user = await User.findOne({ email: req.body.email });

	console.log(user);

	if (!user) {
		return next(
			new AppError("There is no user with the provided email", 404)
		);
	}

	// 2. generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	console.log("generated reset token", resetToken);

	// 3. send it to the user's email
	const resetURL = `${req.protocol}://${req.get(
		"host"
	)}/api/v1/users/resetPassword/${resetToken}`;
	const message = `forgot your password? Submit a patch request with your new password and passwordConfirm  to: ${resetURL}. \nIf you did not forget your password ignore this message.`;

	console.log(resetURL);
	console.log(message);

	try {
		await sendEmail({
			email: user.email,
			subject: "Your password reset token (valid for 10min)",
			message,
		});

		res.status(200).json({
			status: "Success",
			message: "Token sent to email!",
		});
	} catch (e) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(new AppError("There was an error sending the email", 500));
	}
});
