const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "A product must have a name"],
	},
	price: {
		type: Number,
		required: [true, "A product must have a price"],
	},
	priceDiscount: {
		type: Number,
		required: [true, "A product must have a discount"],
	},
	quantity: {
		type: Number,
		required: [true, "A product must have a quantity"],
	},
});

const ProductModel = mongoose.model("Product", ProductSchema);
module.exports = Product;
