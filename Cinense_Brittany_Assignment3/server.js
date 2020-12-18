var express = require("express"); // Run express
var myParser = require("body-parser"); // Run body-parser
var products = require("./public/product_data.js"); // Import and run product_data.js from the public folder
var app = express(); // Initialize express
var fs = require("fs"); // Require the File System module
var cookieParser = require("cookie-parser");
var session = require("express-session");

app.use(cookieParser());
app.use(session({ secret: "ITM352" }));
const userInfo = "./public/user_data.json"; // Re-name file path to use in one varibale to be called throughout the server

app.use(express.static("public")); // Accessing data from public file
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
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

// If the name is available from the cookie, pass the name down as a variable with the render
app.get("/", function (req, res) {
  var name;
  var cart;
  var count;
  if (req.cookies) {
    if (req.cookies.name) {
      name = req.cookies.name;
    }
    if (req.cookies.cart) {
      cart = JSON.parse(req.cookies.cart);
      // Filter out values that equal zero
      // https://riptutorial.com/javascript/example/1260/filtering-object-arrays
      count = Object.values(cart).filter(function (number) {
        return number != 0;
      }).length;
    }
  }

  res.render("index", {
    // Pass down data via object to ejs template
    products: products,
    type: req.query.type,
    name: name,
    count: count,
  });
});

app.get("/login", function (req, res) {
  // Render ejs template for login page
  res.render("login");
});

app.get("/register", function (req, res) {
  // Render ejs template for register page
  res.render("register");
});

app.get("/shopping_cart", function (req, res) {
  var name;
  var cart;
  var shoppingCartProducts;
  var total = 0;
  var subtotal = 0;
  var tax;
  if (req.cookies) {
    if (req.cookies.name) {
      name = req.cookies.name;
    }
    if (req.cookies.cart) {
      // add quantity to each product
      cart = JSON.parse(req.cookies.cart);
      shoppingCartProducts = products.map(function (product) {
        product.quantity = parseInt(cart[product.id]);
        return product;
      });
      shoppingCartProducts.forEach(function (product) {
        if (product.quantity) {
          total += product.price * product.quantity;
        }
      });
      tax = total * 0.0575;
      subtotal = total + parseInt(tax);
    }
  }
  res.render("shopping_cart", {
    name: name,
    shoppingCartProducts: shoppingCartProducts,
    tax: tax,
    subtotal: total,
    total: subtotal,
  });
});

app.post("/modify", function (req, res) {
  var POST = req.body;
  res.cookie("cart", JSON.stringify(POST), {
    maxAge: 1000 * 60 * 60,
  });
  res.redirect("/shopping_cart");
});

app.get("/invoice", function (req, res) {
  var subtotal = 0;
  var cart;
  var shoppingCartProducts;
  var name;
  var email;
  if (req.cookies) {
    if (req.cookies.cart) {
      // if cart is available
      cart = JSON.parse(req.cookies.cart);
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      shoppingCartProducts = products.map(function (product) {
        var quantity = parseInt(cart[product.id]);
        if (Number.isInteger(quantity) && quantity > 0) {
          product.quantity = quantity;
          subtotal += quantity * product.price;
        }
        return product;
      });
      // Calculate sales tax
      var tax_rate = 0.0575;
      var tax = tax_rate * subtotal;
      // Calculate grand total
      var total = tax + subtotal;
    }
    if (req.cookies.email) {
      email = req.cookies.email;
    }
    if (req.cookies.name) {
      name = req.cookies.name;
    }
  }
  res.render("invoice", {
    tax: tax,
    total: total,
    subtotal: subtotal,
    shoppingCartProducts: shoppingCartProducts,
    name: name,
    email: email,
  });
});

// Code taken from Lab14 Ex1.js to retrieve username and password from user_data.json file
//  For existing user to log in and take shopping cart with them to final invoice
app.post("/login_user", function (request, response) {
  // response.send("You did it!");
  var username = request.body.username;
  if (typeof users_reg_data[username] != "undefined") {
    if (request.body.password == users_reg_data[username].password) {
      // When user is logged in, the cookie is set to expire in 3 minutes from log in
      response.cookie("name", users_reg_data[username].name, {
        maxAge: 1000 * 60 * 60,
      });
      response.cookie("email", users_reg_data[username].email, {
        maxAge: 1000 * 60 * 60,
      });
      response.redirect("/");
      // response.send(
      //   `Thank you for ${username} logging in<br>Please <a href="/invoice">click here</a> to complete your purchase`
      // );
    } else {
      response.send(
        `Sorry! ${request.body.password} does not match what we have for you`
      );
    }
  } else {
    response.send(`Sorry! ${username} does not exist`);
  }
});

app.get("/logout", function (req, res) {
  res.cookie("name", "", { expires: new Date(0) });
  res.cookie("cart", "", { expires: new Date(0) });
  req.session.destroy();
  res.redirect("/");
});

// Function from Lab12
function isNonNegInt(q, returnErrors = false) {
  errors = []; // assume no errors at first
  if (Number(q) != q) errors.push("Not a number!"); // Check if string is a number value
  if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(q) != q) errors.push("Not an integer!"); // Check that it is an integer
  if (q.length === 0) errors = [];
  return returnErrors ? errors : errors.length > 0 ? false : true;
}

app.post("/process_cart", function (request, response) {
  let POST = request.body;
  var isValid = true;
  products.forEach(function (product) {
    var quantityPurchased = POST[product.id];
    if (!isNonNegInt(quantityPurchased)) {
      isValid = false;
    }
  });
  if (isValid) {
    // https://stackoverflow.com/questions/19737415/express-creating-cookie-with-json
    response.cookie("cart", JSON.stringify(POST), {
      maxAge: 1000 * 60 * 60,
    });
    if (!request.cookies.name) {
      response.redirect("/login");
    } else {
      response.redirect("/shopping_cart");
    }
    // // Direct user to register page in order to complete purchase
    // response.sendFile(__dirname + "/public/login.html");
  } else {
    // If any input is invalid, send response of "Sorry, invalid input"
    response.send(`<p>Sorry, invalid input</p>`);
  }
});

// Use object methods to capture POST value and key of the product being added
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_objects/Object/values
app.post("/add_to_cart", function (req, res) {
  var POST = req.body;
  var cart = {};
  console.log(POST);
  if (req.cookies.cart) {
    // If cart exists
    cart = JSON.parse(req.cookies.cart);

    // Capture id of the product being added
    var id = Object.keys(POST)[0];
    if (cart.hasOwnProperty(id)) {
      // If existing item exists in cart, add on to existing value of that item
      var value = parseInt(Object.values(POST)[0]);
      POST[id] = parseInt(cart[id]) + value;
    } else {
      // Merge two objects
      // https://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
      POST = { ...POST, ...cart };
    }
  }
  // Add or replace the cart cookie
  res.cookie("cart", JSON.stringify(POST), {
    maxAge: 1000 * 60 * 60,
  });
  // Stay on the same page
  res.redirect("/");
});
