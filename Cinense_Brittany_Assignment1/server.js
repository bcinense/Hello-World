var express = require("express"); //run express
var myParser = require("body-parser");
var data = require("./public/product_data.js");
var app = express(); //initialize express
var fs = require("fs");

var products = data.product_data;

app.use(express.static("./public")); // accessing data from public file
app.use(myParser.urlencoded({ extended: true }));

// Opening a server to listen to
var server = app.listen(8080, () => {
  console.log(products);
});

app.post("/process_form", function (request, response) {
  let POST = request.body;
  var isValid = true;
  // Go through each product and validate that it is a number higher than 0
  products.forEach(function (product) {
    var quantityPurchased = POST[product.veggie];
    if (!isNonNegInt(quantityPurchased)) {
      isValid = false;
    }
  });
  if (isValid) {
    // If the input values are valid (quantity > 0), respond back with invoice
    var subtotal = 0;
    var invoiceRows = ""; // Created an empty string to concacnate future rows
    var extendedPrice;
    products.forEach(function (product) {
      var quantity = 0;
      if (POST[product.veggie].length > 0) {
        // If input has a value, assign it to quantity
        quantity = POST[product.veggie];
      }
      if (quantity > 0) {
        // If quantity > 0, calculate extended price, and add to subtotal
        extendedPrice = quantity * product.price;
        subtotal += extendedPrice;
        // Generate invoice rows

        invoiceRows += `
          <tr>
            <th style="text-align: center" width="43%">${product.veggie}</td>
            <th style="text-align: center" width="11%">
              ${quantity}
            </td>
            <th style="text-align: center" width="13%">$${product.price.toFixed(
              2
            )}</td>
            <th style="text-align: center" width="54%">$${extendedPrice.toFixed(
              2
            )}</td>
          </tr>
        `;
      }
    });
    // Calculate sales tax
    var tax_rate = 0.0575;
    var tax = tax_rate * subtotal;

    // Calculate shipping amounts
    var shipping;
    if (subtotal <= 50) {
      shipping = 2;
    } else if (subtotal >= 50 && subtotal <= 100) {
      shipping = 5;
    } else {
      shipping = subtotal * 0.05; // 5% of sub_total
    }
    // Calculate grand total
    var total = tax + subtotal + shipping;
    var contents = fs.readFileSync("./public/invoice_template.view", "utf8");
    response.send(eval("`" + contents + "`")); // render template string with variables
  } else {
    // If any input is invalid, send response of "Sorry, invalid input"
    response.send(`<p>Sorry, invalid input</p>`);
  }
});

function isNonNegInt(q, returnErrors = false) {
  // Function from Lab12
  errors = []; // assume no errors at first
  if (Number(q) != q) errors.push("Not a number!"); // Check if string is a number value
  if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(q) != q) errors.push("Not an integer!"); // Check that it is an integer
  if (q.length === 0) errors = [];
  return returnErrors ? errors : errors.length > 0 ? false : true;
}
