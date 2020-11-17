var express = require("express");
var app = express();
var myParser = require("body-parser");
const fs = require("fs"); // Allows us to work with the file system, use const so you cannot change the variable, var if you want to change it
const { request, response } = require("express");
const { createSecurePair } = require("tls");
const filename = "user_data.json";

// Check if file exists before reading
if (fs.existsSync(filename)) {
  var stats = fs.statSync(filename);
  console.log(`user_data.json has ${stats.size} characters`);

  var data = fs.readFileSync(filename, "utf-8"); // When the file is executed it will read the data in the filename
  var users_reg_data = JSON.parse(data); // Parse data, which hold the contents of the objects
  // if user exists, get their password
  if (typeof users_reg_data["dport"] != "undefined") {
    console.log(users_reg_data["dport"]["password"]) == "xxx";
  }
} else {
  console.log(`ERR: ${filename} does not exist!`);
}

// console.log(users_reg_data["dport"]["password"]); // users_reg_data.dport.password to retrieve a particular password

app.use(myParser.urlencoded({ extended: true }));

app.get("/login", function (request, response) {
  // Give a simple login form
  str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
  response.send(str);
});

app.post("/login", function (request, response) {
  // Process login form POST and redirect to logged in page if ok, back to login page if not
  console.log(request.body);
});

app.listen(8080, () => console.log(`listening on port 8080`));

// if user exists, get their password
if (typeof users_reg_data[request.body.username] != "undefined") {
  if (request.body.password == users_reg_data[request.body.username].password) {
    response.send(`Thank you for ${request.body.username} logging in`);
  } else {
    response.send(
      `Hey! ${request.body.password} does not match what we have for you`
    );
  }
} else {
  response.send(`Hey! ${request.body.username} does not exist`);
}
