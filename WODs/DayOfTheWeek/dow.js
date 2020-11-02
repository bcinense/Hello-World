day = 26;
month = "November";
year = 1993;

// Take the last two didgits of the year
step1 = year % 100;

// Divide step1 by 4
step2 = parseInt(step1 / 4);
step3 = step2 + step1;

// Determine birth month
if (month == "January") {
  step5 = day + step3;
} else if (month == "February") {
  step4 = 3;
} else if (month == "March") {
  step4 = 3;
} else if (month == "April") {
  step4 = 6;
} else if (month == "May") {
  step4 = 1;
} else if (month == "June") {
  step4 = 4;
} else if (month == "July") {
  step4 = 6;
} else if (month == "August") {
  step4 = 2;
} else if (month == "September") {
  step4 = 5;
} else if (month == "October") {
  step4 = 0;
} else if (month == "November") {
  step4 = 3;
} else if (month == "December") {
  step4 = 5;
}

step6 = step4 + step3;
step7 = day + step6;
step8 = typeof step5 !== "undefined" ? step5 : step7;
// Check if year is in leap year
isLeapYear = year % 4 && year % 100 && year % 400 == 0;

// Determine if year is in the 2000's or 1900's
if (parseInt(year / 100) == 19) {
  if (isLeapYear) {
    //In the 1900's path
    if (month == "January" || month == "February") {
      step9 = step8 - 1;
    }
  }
}
// In the 2000's path
else {
  if (isLeapYear) {
    if (month == "January" || month == "February") {
      step9 = step8 - 2;
    } else {
      step9 = step8 - 1;
    }
  } else {
    step9 = step8 - 1;
  }
}

// For step10 I will use step8 and skip step9 because LeapYear does not apply to my birth month
step10 = step8 % 7;
if (step10 == 0) {
  dow = "Sunday";
} else if (step10 == 1) {
  dow = "Monday";
} else if (step10 == 2) {
  dow = "Tuesday";
} else if (step10 == 3) {
  dow = "Wednesday";
} else if (step10 == 4) {
  dow = "Thurday";
} else if (step10 == 5) {
  dow = "Friday";
} else if (step10 == 6) {
  dow = "Saturday";
}

console.log(`${month}/${day}/${year} was on a ${dow}`);
