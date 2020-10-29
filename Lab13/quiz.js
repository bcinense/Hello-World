// var http = require("http");

// //create a server object:
// http
//   .createServer(function (req, res) {
//     console.log(req.headers); //output the request headers to the console
//     res.writeHead(200, { "Content-Type": "text/html" }); // set MIME type to HTML
//     res.write("<h1>Hello World!</h1>"); //write a response to the client
//     res.write(
//       <script>
//         document.getElementById("id_h1").innerHTML="Goodbye World!";
//       </script>
//     );
//     res.end(); //end the response
//   })
//   .listen(8080, "127.0.0.1");

var http = require("http");

//create a server object:
http
  .createServer(function (req, res) {
    console.log(req.headers); //output the request headers to the console
    res.writeHead(200, { "Content-Type": "text/html" }); // set MIME type to HTML
    res.write("<h1>Hello World!</h1>"); //write a response to the client
    res.write(
      '<script>document.getElementById("id_h1").innerHTML="Goodbye World!";</script>'
    );
    res.end(); //end the response
  })
  .listen(8080); //the server object listens on port 8080
