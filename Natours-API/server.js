const mongoose = require("mongoose"); //require the mongoose library, a higher level of abstraction for MongoDB,
const dotenv = require("dotenv"); //for the config.env to work

process.on("uncaughtException", (err) => {
	console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

// const DB = process.env.DATABASE.replace(
// 	"PASSWORD",
// 	process.env.DATABASE_PASSWORD
// );

const DB = process.env.LOCAL_DB;

mongoose
	.connect(DB)
	.then((con) => {
		console.log("DB connection successful");
	})
	.catch((err) => {
		console.error("DB connection error:", err);
	});

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
	console.log("UNHANDLED REJECTION! 💥 Shutting down...");
	console.log(err.name, err.message);
	server.close(() => {
		process.exit(1);
	});
});
