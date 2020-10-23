age = 25;
name = "Brittany";
var attributes = name + ";" + age + ";" + (age + 0.5) + ";" + (0.5 - age);
var parts = attributes.split(";");
for (i of parts) {
  parts[i] = `${typeof parts[i]} ${parts[i]}`;
}
console.log(parts.join(","));
