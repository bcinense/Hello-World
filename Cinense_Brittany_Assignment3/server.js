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
  if (req.cookies) {
    if (req.cookies.name) {
      name = req.cookies.name;
    }
    if (req.cookies.cart) {
      cart = req.cookies.cart;
    }
  }
  products = products.map(function (product) {
    if (Number.isInteger(parseInt(cart[product.id]))) {
      product.quantity = parseInt(cart[product.id]);
    } else {
      product.quantity = 0;
    }
    return product;
  });
  res.render("index", {
    products: products,
    type: req.query.type,
    name: name,
  });
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
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
    subtotal: subtotal,
    total: total,
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
  res.render("invoice");
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
