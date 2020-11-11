const fs = require("fs"); // Allows us to work with the file system, use const so you cannot change the variable, var if you want to change it

const filename = "user_data.json";

var data = fs.readFileSync(filename, "utf-8"); // When the file is executed it will read the data in the filename

var users_reg_data = JSON.parse(data); // Parse data, which hold the contents of the objects

console.log(users_reg_data["dport"]["password"]); // users_reg_data.dport.password to retrieve a particular password
