var express = require("express"); //run express
var myParser = require("body-parser");
var data = require("./public/product_data.js");
var app = express(); //initialize express
var fs = require("fs");
const { request } = require("express");
const filename = "./public/user_data.json";
const shoppingCartFile = "./public/shopping_cart.json";

var products = data.product_data;

app.use(express.static("./public")); // accessing data from public file
app.use(myParser.urlencoded({ extended: true }));

// Opening a server to listen to
var server = app.listen(8080, () => {
  console.log("STARTING SERVER");
});

// Copied code from Lab 14 Ex1.js to write in the user_data.json file info of new user registering
if (fs.existsSync(filename)) {
  var stats = fs.statSync(filename);

  var data = fs.readFileSync(filename, "utf-8"); // When the file is executed it will read the data in the filename
  var users_reg_data = JSON.parse(data); // Parse data, which hold the contents of the objects
}
// Code to write username to shopping cart, so in the invoice it can grab current username to thank them
if (fs.existsSync(shoppingCartFile)) {
  var shoppingCartData = fs.readFileSync(shoppingCartFile, "utf-8");
  var shoppingCart = JSON.parse(shoppingCartData);
}

app.post("/process_form", function (request, response) {
  let POST = request.body;
  console.log(POST);
  var isValid = true;
  // Go through each product and validate that it is a number higher than 0
  products.forEach(function (product) {
    var quantityPurchased = POST[product.veggie];
    if (!isNonNegInt(quantityPurchased)) {
      isValid = false;
    }
  });
  if (isValid) {
    var shoppingCartValues = JSON.stringify(POST);
    fs.writeFileSync(shoppingCartFile, shoppingCartValues);

    // Direct user to register page in order to complete purchase
    response.sendFile(__dirname + "/public/register.html");
  } else {
    // If any input is invalid, send response of "Sorry, invalid input"
    response.send(`<p>Sorry, invalid input</p>`);
  }
});
function validateName(name) {
  if (name.length >= 30) {
    return false;
  }
}
// Created a function to create criterea for the username, minimum 4 characters and max 10 characters
function validateUsername(username) {
  if (
    !users_reg_data[username] &&
    username.length >= 4 &&
    username.length <= 10
  ) {
    return true;
  } else {
    return false;
  }
}
// Created a function to check that password and confirm password will be the same in order to continue registering
function validatePassword(password, repeat_password) {
  if (password === repeat_password) {
    return true;
  } else {
    return false;
  }
}
// Created a function to create criterea for the email
function validateEmail(email) {
  var emailformat = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  // Format validation used from w3resource.com
  if (email.match(emailformat)) {
    return true;
  } else {
    return false;
  }
}

// Code taken from Lab14 Ex1.js to register new user in the user_data.json file
app.post("/register_new", function (request, response) {
  var username = request.body.username;
  if (validateUsername(username)) {
    users_reg_data[username] = {}; //leave blank
    if (validatePassword(request.body.password, request.body.repeat_password)) {
      users_reg_data[username].password = request.body.password;
      if (validateEmail(request.body.email)) {
        users_reg_data[username].email = request.body.email;
        // Grab both first and last name and put together for the object name
        users_reg_data[
          username
        ].name = `${request.body.firstname} ${request.body.lastname}`;
        // write updated object to user_reg_info
        reg_info_str = JSON.stringify(users_reg_data);
        // will read the new data, parse it and read the new user info
        fs.writeFileSync(filename, reg_info_str);
        // Code to write email and username to shopping cart, so in the final invoice it display username and email of current user
        var newShoppingCart = shoppingCart;
        newShoppingCart.email = request.body.email;
        newShoppingCart.username = username;
        fs.writeFileSync(shoppingCartFile, JSON.stringify(newShoppingCart));

        // Send a response after registering with a link to complete purchase and go to invoice
        response.send(
          `Thank you ${request.body.username} registering!<br>Please <a href="/invoice">click here</a> to complete your purchase`
        );
        return;
      }
    }
  }
  // Send to a page with a response to go back if passwords do not match
  response.send("Passwords do not match, please go back and try again");
});
// Code taken from Lab14 Ex1.js to retrieve username and password from user_data.json file
app.post("/login_user", function (request, response) {
  var username = request.body.username;
  if (typeof users_reg_data[username] != "undefined") {
    if (request.body.password == users_reg_data[username].password) {
      var newShoppingCart = shoppingCart;
      newShoppingCart.username = username;
      newShoppingCart.email = users_reg_data[username].email;
      fs.writeFileSync(shoppingCartFile, JSON.stringify(newShoppingCart)); // Write information into shopping_cart.json
      response.send(
        `Thank you for ${username} logging in<br>Please <a href="/invoice">click here</a> to complete your purchase`
      );
    } else {
      response.send(
        `Sorry! ${request.body.password} does not match what we have for you`
      );
    }
  } else {
    response.send(`Sorry! ${username} does not exist`);
  }
});
app.get("/invoice", function (request, response) {
  // FINAL INVOICE WITH SUCCESSFUL LOGIN
  // If the input values are valid (quantity > 0), respond back with invoice
  var subtotal = 0;
  var invoiceRows = ""; // Created an empty string to concacnate future rows
  var extendedPrice;
  products.forEach(function (product) {
    var quantity = 0;
    if (shoppingCart[product.veggie].length > 0) {
      // If input has a value, assign it to quantity
      quantity = shoppingCart[product.veggie];
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
  // Calculate grand total
  var total = tax + subtotal;
  var contents = fs.readFileSync("./public/invoice_template.view", "utf8");
  response.send(eval("`" + contents + "`")); // render template string with variables
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
