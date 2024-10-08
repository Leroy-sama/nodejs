const fs = require("fs");
const superAgent = require("superagent");

const readFilePro = (file) => {
	return new Promise((resolve, reject) => {
		fs.readFile(file, (err, data) => {
			if (err) reject("i could not find that file");
			resolve(data);
		});
	});
};

const writeFilePro = (file, data) => {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, (err) => {
			if (err) reject("Could not write file");
			resolve("Success");
		});
	});
};

const getDogPic = async () => {
	try {
		const data = await readFilePro(`${__dirname}/dog.txt`);
		console.log(`Breed: ${data}`);

		const res1Pro = superAgent.get(
			`https://dog.ceo/api/breed/${data}/images/random`
		);

		const res2Pro = superAgent.get(
			`https://dog.ceo/api/breed/${data}/images/random`
		);

		const res3Pro = superAgent.get(
			`https://dog.ceo/api/breed/${data}/images/random`
		);
		const all = await Promise.all([res1Pro, res2Pro, res3Pro]);
		const imgs = all.map((el) => el.body.message);
		console.log(imgs);

		await writeFilePro("dog-img.txt", imgs.join("\n"));
		console.log("Random dog image saved to file");
	} catch (err) {
		console.log(err);

		throw err;
	}
	return "2: READY!!";
};

(async () => {
	try {
		console.log("1: Will get Dog pics!");
		const x = await getDogPic();
		console.log(x);
		console.log("3: Done getting dog pics!");
	} catch (err) {
		console.log("ERROR!!");
	}
})();

// console.log("1: Will get Dog pics!");
// getDogPic()
// 	.then((x) => {
// 		console.log(x);
// 		console.log("3: Done getting dog pics!");
// 	})
// 	.catch((err) => {
// 		console.log("ERROR!!");
// 	});

// readFilePro(`${__dirname}/doggg.txt`)
// 	.then((data) => {
// 		console.log(`Breed: ${data}`);

// 		return superAgent.get(
// 			`https://dog.ceo/api/breed/${data}/images/random`
// 		);
// 	})
// 	.then((res) => {
// 		console.log(res.body.message);
// 		return writeFilePro("dog-img.txt", res.body.message);

// 		// fs.writeFile("dog-img.txt", res.body.message, (err) => {
// 		// 	console.log("Random dog image saved to file");
// 		// });
// 	})
// 	.then(() => {
// 		console.log("Random dog image saved to file");
// 	})
// 	.catch((err) => {
// 		console.log(err.message);
// 	});
