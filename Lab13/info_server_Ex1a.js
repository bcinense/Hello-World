var express = require("express");
var app = express();
var myParser = require("body-parser");
// app.all means respond to all http requests, "*" means call that path
app.all("*", function (request, response, next) {
  response.send(request.method + " to path " + request.path);
  next();
});
app.use(myParser.urlencoded({ extended: true }));
app.post("/process_form", function (request, response) {
  let POST = request.body;
  response.send(POST);
});

app.get("/hello.html", function (request, response, next) {
  response.send("Got a GET to /test path");
});

// Listed at the bottom so it is the last repsonse
app.use(express.static("./public"));

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here
