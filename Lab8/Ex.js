var amount = 74;
var quarter = 25;
var dime = 10;
var nickel = 5;
var penny = 1;

var quartersBack = 0;
var dimesBack = 0;
var nickelsBack = 0;
var penniesBack = 0;

while (amount >= quarter) {
  amount = amount - quarter;
  quartersBack++;
}
while (amount >= dime) {
  amount = amount - dime;
  dimesBack++;
}
while (amount >= nickel) {
  amount = amount - nickel;
  nickelsBack++;
}
while (amount >= penny) {
  amount = amount - penny;
  penniesBack++;
}

console.log(quartersBack + " Quarters");
console.log(dimesBack);
console.log(nickelsBack);
console.log(penniesBack);
