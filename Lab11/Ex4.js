//Original from Lab11 ex1.
// function isNonNegInt(q, returnErrors=false){}
// errors = []; // assume no errors at first
// if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
// if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
// if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
// return returnErrors ? errors : ((errors.length>0)?false:true);}
//This function will return true if a numString is a non-negative integer
function isNonNegIntString(numString, returnErrors = false) {
  errors = []; // assume no errors at first
  if (numString < 0) errors.push("Not a number!"); // Check if string is a number value
  if (q < 0) errors.push("Negative value!"); // Check if it is non-negative
  if (parseInt(numString) != numString) errors.push("Not an integer!"); // Check that it is an integer
  return returnErrors ? errors : errors.length == 0;
}
var attributes = "Brit;25;25.5;" + (0.5 - 25);
pieces = attributes.split(";");

function callback(part, i) {
  console.log(`${i} is non neg Int ${isNonNegIntString(part, true)}`);
}
pieces.forEach(function (item, i) {
  console.log(typeof item == "string" && item.length > 0 ? true : false);
});
