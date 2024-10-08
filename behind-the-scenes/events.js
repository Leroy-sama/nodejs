const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter {
	constructor() {
		super();
	}
}

const myEmitter = new Sales();

myEmitter.on("newSale", () => {
	console.log("New sale event!");
});

myEmitter.on("newSale", () => {
	console.log("Customer name: Leroy ");
});

myEmitter.on("newSale", (stock) => {
	console.log(`Stock: ${stock}`);
});

myEmitter.emit("newSale", 9);

///////////////////

const server = http.createServer();

server.on("request", (req, res) => {
	console.log("Request Received");
	res.end("Request Received!");
});

server.on("request", (req, res) => {
	res.end("Another Request ");
});

server.on("close", () => {
	console.log("Server Clodes");
});

server.listen(8000, "127.0.0.1", () => {
	console.log("Waiting for requests....");
});
