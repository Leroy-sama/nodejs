const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");

const DB = process.env.DATABASE_URL.replace(
	"DATABASE_PSWD",
	process.env.DATABASE_PSWD
);

mongoose
	.connect(DB)
	.then((con) => {
		console.log("DB connection successfull");
	})
	.catch((err) => {
		console.log("DB connection error: ", err);
	});

const port = 3000;
app.listen(port, () => {
	console.log(`server is running at ${port}`);
});
