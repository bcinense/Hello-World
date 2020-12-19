var express = require("express"); // Run express
var myParser = require("body-parser"); // Run body-parser
var products = require("./public/product_data.js"); // Import and run product_data.js from the public folder
var app = express(); // Initialize express
var fs = require("fs"); // Require the File System module
var ejs = require("ejs"); // Require ejs
var nodemailer = require("nodemailer");
var cookieParser = require("cookie-parser");
var session = require("express-session");

app.use(cookieParser());
app.use(session({ secret: "ITM352" }));
var userInfo = "./public/user_data.json"; // Re-name file path to use in one varibale to be called throughout the server

app.use(express.static("public")); // Accessing data from public file
app.set("view engine", "ejs"); // Enable ejs templating engine
app.set("views", __dirname + "/views"); // Give access to ejs views
app.use(myParser.urlencoded({ extended: true }));

// Opening a server to listen to
var server = app.listen(8080, () => {
  console.log("STARTING SERVER");
});

// Copied code from Lab 14 Ex1.js to write in the user_data.json file info of new user registering
if (fs.existsSync(userInfo)) {
  var stats = fs.statSync(userInfo);

  var data = fs.readFileSync(userInfo, "utf-8"); // When the file is executed it will read the data in the filename
  var users_reg_data = JSON.parse(data); // Parse data, which hold the contents of the objects. Reference: https://stackoverflow.com/questions/5047346/converting-strings-like-document-cookie-to-objects
}

// Access homepage
app.get("/", function (req, res) {
  var name;
  var cart;
  var count;
  if (req.cookies) {
    if (req.cookies.name) {
      // If the name is available from the cookie, pass the name down as a variable with the render
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

// Access shopping cart
app.get("/shopping_cart", function (req, res) {
  var name;
  var cart;
  var shoppingCartProducts;
  var total;
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
        // Add quantity to products from cart cookie
        product.quantity = parseInt(cart[product.id]);
        return product;
      });
      shoppingCartProducts.forEach(function (product) {
        if (product.quantity) {
          // Add the total cost
          subtotal += product.price * product.quantity;
        }
      });
      tax = subtotal * 0.0575;
      total = subtotal + tax;
    }
  }
  // If not logged in, redirect user to login page
  if (!name) {
    res.redirect("/login");
  } else {
    console.log(total);
    console.log(subtotal);
    res.render("shopping_cart", {
      // Pass down data via object to shopping cart template
      name: name,
      shoppingCartProducts: shoppingCartProducts,
      tax: tax,
      subtotal: subtotal,
      total: total,
    });
  }
});

// Modify quantity of shopping cart item
app.post("/modify", function (req, res) {
  var POST = req.body;
  // Creating a cookie with a JSON file
  // https://stackoverflow.com/questions/19737415/express-creating-cookie-with-json
  res.cookie("cart", JSON.stringify(POST), {
    maxAge: 1000 * 60 * 60,
  });
  res.redirect("/shopping_cart");
});

// Display invoice
app.get("/invoice", function (req, res) {
  var subtotal = 0;
  var cart;
  var shoppingCartProducts;
  var name;
  var email;
  var templateString;
  if (req.cookies) {
    if (req.cookies.cart) {
      // if cart is available
      cart = JSON.parse(req.cookies.cart);
      // Use map to create new array from products with quantity property
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map
      shoppingCartProducts = products.map(function (product) {
        // Get
        var quantity = parseInt(cart[product.id]);
        if (Number.isInteger(quantity) && quantity > 0) {
          // Capture quantity for each item (if available)
          product.quantity = quantity;
          // Add to subtotal if quantity is available
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
  // If not logged in, redirect user to login page
  if (!name) {
    res.redirect("/login");
  } else {
    // Create data variable to pass down to renderFile for email, and res.render
    var data = {
      tax: tax,
      total: total,
      subtotal: subtotal,
      shoppingCartProducts: shoppingCartProducts,
      name: name,
      email: email,
    };
    // Convert ejs template into string
    // https://stackoverflow.com/a/35305584
    ejs.renderFile("./views/invoice.ejs", data, {}, function (err, html) {
      templateString = html;
    });
    // Email invoice to user when complete
    // Reference : https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
    var transporter = nodemailer.createTransport({
      host: "mail.hawaii.edu",
      port: 25,
      secure: false, // use TLS
      tls: {
        // do not fail on invalid certs
        rejectUnauthorized: false,
      },
    });
    var mailOptions = {
      from: "farmfresh.com",
      to: email,
      subject: "Your Farm Fresh invoice",
      html: templateString,
    };
    transporter.sendMail(mailOptions, function (error, info) {});
    res.render("invoice", data);
  }
});

// Code taken from Lab14 Ex1.js to retrieve username and password from user_data.json file
//  For existing user to log in and take shopping cart with them to final invoice
app.post("/login_user", function (request, response) {
  // response.send("You did it!");
  var username = request.body.username;
  if (typeof users_reg_data[username] != "undefined") {
    if (request.body.password == users_reg_data[username].password) {
      // When user is logged in, the cookie is set to expire in 60 minutes from log in
      response.cookie("name", users_reg_data[username].name, {
        maxAge: 1000 * 60 * 60,
      });
      response.cookie("email", users_reg_data[username].email, {
        maxAge: 1000 * 60 * 60,
      });
      response.redirect("/");
    } else {
      // If user enters wrong password or password not on file send error message
      response.send(
        `Sorry! ${request.body.password} does not match what we have for you`
      );
    }
  } else {
    // If user enters username not on file or wrong username send error message
    response.send(`Sorry! ${username} does not exist`);
  }
});

// Destroy session and expire cookies when user logs out
app.get("/logout", function (req, res) {
  res.cookie("name", "", { expires: new Date(0) });
  res.cookie("email", "", { expires: new Date(0) });
  res.cookie("cart", "", { expires: new Date(0) });
  req.session.destroy();
  res.redirect("/");
});

// Function taken from Lab12
function isNonNegInt(q, returnErrors = false) {
  errors = []; // assume no errors at first
  if (Number(q) != q) errors.push("Not a number!"); // Check if string is a number value
  if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(q) != q) errors.push("Not an integer!"); // Check that it is an integer
  if (q.length === 0) errors = [];
  return returnErrors ? errors : errors.length > 0 ? false : true;
}

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
    // Capture value of the product being added
    var value = parseInt(Object.values(POST)[0]);
    if (!isNonNegInt(value)) {
      // If value is invalid, send invalid response
      response.send(`<p>Sorry, invalid input</p>`);
    }
    if (cart.hasOwnProperty(id)) {
      // If existing item exists in cart, add on to existing value of that item
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

// Created a function to create criterea for the username, minimum 4 characters and max 10 characters
function validateUsername(username) {
  console.log(username);
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
  console.log(password);
  console.log(repeat_password);
  console.log(password == repeat_password);
  if (password == repeat_password) {
    console.log("TRUE");
    return true;
  } else {
    console.log("FALSE");
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
app.post("/register_user", function (request, response) {
  var username = request.body.username;
  if (validateUsername(username)) {
    console.log("FIRING 1");
    users_reg_data[username] = {}; //leave blank
    if (validatePassword(request.body.password, request.body.repeat_password)) {
      console.log("FIRING 2");
      users_reg_data[username].password = request.body.password;
      if (validateEmail(request.body.email)) {
        console.log("FIRING 3");
        users_reg_data[username].email = request.body.email;
        // Grab both first and last name and put together for the object name
        users_reg_data[
          username
        ].name = `${request.body.firstname} ${request.body.lastname}`;
        // write updated object to user_reg_info
        reg_info_str = JSON.stringify(users_reg_data);
        // will read the new data, parse it and read the new user info
        fs.writeFileSync(userInfo, reg_info_str);
        // Save cookies to remember new user
        response.cookie(
          "name",
          `${request.body.firstname} ${request.body.lastname}`,
          {
            maxAge: 1000 * 60 * 60,
          }
        );
        response.cookie("email", request.body.email, {
          maxAge: 1000 * 60 * 60,
        });
        // Redirect back to homepage when user is created
        response.redirect("/");
      }
    } else {
      // Send to a page with a response to go back if passwords do not match
      response.send("Passwords do not match, please go back and try again");
    }
  } else {
    // Send to a page with a response to go back if username is invalid
    response.send("Invalid username, please try again");
  }
});
