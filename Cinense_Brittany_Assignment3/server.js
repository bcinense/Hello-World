var express = require("express"); // Run express
var myParser = require("body-parser"); // Run body-parser
var data = require("./public/product_data.js"); // Import and run product_data.js from the public folder
var app = express(); // Initialize express
var fs = require("fs"); // Require the File System module
const { request } = require("express");
const userInfo = "./public/user_data.json"; // Re-name file path to use in one varibale to be called throughout the server
const shoppingCartFile = "./public/shopping_cart.json";

app.use(express.static("./public")); // Accessing data from public file
app.use(myParser.urlencoded({ extended: true }));

// Opening a server to listen to
var server = app.listen(8080, () => {
  console.log("STARTING SERVER");
});

// Copied code from Lab 14 Ex1.js to write in the user_data.json file info of new user registering
if (fs.existsSync(userInfo)) {
  var stats = fs.statSync(userInfo);

  var data = fs.readFileSync(userInfo, "utf-8"); // When the file is executed it will read the data in the filename
  var users_reg_data = JSON.parse(data); // Parse data, which hold the contents of the objects
}

app.post("/login_or_reg_user", function (request, response) {
  response.send("You did it!");
});
//Figure out how to click only on one button login or register (if statment.)
