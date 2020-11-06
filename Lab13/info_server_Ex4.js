var express = require("express");
var app = express();
var myParser = require("body-parser");
var fs = require("fs");

// Require to grab the product data in the public folder
var data = require("./public/product_data.js");
var products = data.products;

// app.all means respond to all http requests, "*" means call that path
app.all("*", function (request, response, next) {
  response.send(request.method + " to path " + request.path);
  next();
});

app.use(myParser.urlencoded({ extended: true }));

app.post("/process_form", function (request, response) {
  //grab from the server, declaring here
  let model = products[0]["model"];
  let model_price = products[0]["price"];

  if (typeof POST["quantity_textbox"] != "undefined") {
    let q = POST["quantity_textbox"];
    if (isNonNegInt(q)) {
      var contents = fs.readFileSync(
        "./views/display_quantity_template.view",
        "utf8"
      );
      response.send(eval("`" + contents + "`")); // render template string
    } else {
      response.send(`${q} is not a quantity!`);
    }
  }
});

app.get("/hello.html", function (request, response, next) {
  response.send("Got a GET to /test path");
});

// Listed at the bottom so it is the last repsonse
app.use(express.static("./public"));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here

function isNonNegInt(q, returnErrors = false) {
  errors = []; // assume no errors at first
  if (Number(q) != q) {
    errors.push("Not a number!");
  } // Check if string is a number value
  else {
    if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
    if (parseInt(q) != q) errors.push("Not an integer!");
  } // Check that it is an integer
}
