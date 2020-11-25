var express = require("express"); // Run express
var myParser = require("body-parser"); // Run body-parser
var data = require("./public/product_data.js"); // Import and run product_data.js from the public folder
var app = express(); // Initialize express
var fs = require("fs"); // Require the File System module

app.use(express.static("./public")); // Accessing data from public file
app.use(myParser.urlencoded({ extended: true }));

// Opening a server to listen to
var server = app.listen(8080, () => {
  console.log("STARTING SERVER");
});
