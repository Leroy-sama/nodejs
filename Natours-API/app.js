const fs = require("fs");
const express = require("express");
const morgan = require("morgan"); //middleware for logging http status
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(helmet()); // set security http

// development logging
if (process.env.NODE_ENV === "development") {
	app.use(morgan("dev"));
}

// limit api requests from same ip
const limiter = rateLimit({
	max: 100,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests from this IP, please try again after one hour",
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" })); //middleware - stands btween req and res

app.use(express.static(`${__dirname}/public`)); // serve static files

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

app.all("*", (req, res, next) => {
	next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
