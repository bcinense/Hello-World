// This is a dynamic web page becasue the Date is being uploaded in real-time on the client and server-side. The time on the client side is higher than the server side because the client side is executed after the browser is loaded. The server side time is generated on the server before the client.
// The request does not matter, the route for the HTTP request is handled the same everytime because the program is made that way.
// The Javascript for the server side is executed on the server thats why it is not in the <script> tag.
var http = require("http");

//create a server object:
http
  .createServer(function (req, res) {
    console.log(req.headers); //output the request headers to the console
    res.writeHead(200, { "Content-Type": "text/html" }); // set MIME type to HTML
    res.write(`<h1>The server date is: ${Date.now()}</h1>`); //send a response to the client
    res.write(
      "<h1>The client date is: <script>document.write( Date.now() );</script></h1>"
    ); // send another response
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080

console.log("Hello world HTTP server listening on localhost port 8080");
