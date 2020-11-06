products = [
  {
    model: "Apple iPhone XS",
    price: 990.0,
  },
  {
    model: "Samsung Galaxy",
    price: 240.0,
  },
];
// saving the information on the server side
if (typeof module != "undefined") {
  module.exports.products = products;
}
