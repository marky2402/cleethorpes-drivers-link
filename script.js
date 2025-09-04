// ********************
// * Cookie Functions *
// ********************

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = 'expires=' + d.toUTCString();
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
  let name = cname + '=';
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return '';
}

// ****************************
// * declare global variables *
// ****************************

// remember, 06/07/2023, is actually 06/08/2023 because Jan starts
// at zero.
const linkWeekCommencing = new Date(2025, 5, 1);
let driv = getCookie('driver');
let driver = driv ? driv : 'CAMBRIDGE';
let currentWeekComm;
let rotatedDriversList;

// Create the initial array containing the starter positions of
// drivers in HTML
const nameEl = document.querySelectorAll('.name');
const unrotatedDriverNames = [];
nameEl.forEach(function (node) {
  unrotatedDriverNames.push(node.textContent);
});
console.log('Before rotation:', unrotatedDriverNames);

const fullDate = new Date(); // today's date
// truncate the time info
const currentDate = new Date(
  fullDate.getFullYear(),
  fullDate.getMonth(),
  fullDate.getDate()
);

// create optional arguments to be passed to
// 'toLocaleDateString(arg1 (optional), arg2 (optional))'
// to ensure the correct date output in the form of '14/08/23'.
const region = 'en-GB';
const options = {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
};

console.log(
  'Link Week Commencing',
  linkWeekCommencing.toLocaleDateString(region, options)
);
console.log(
  'Current Date',
  currentDate.toLocaleDateString(region, options)
);

// *******************
// * Helper function *
// *******************

const toDate = dateStr => {
  let [day, month, year] = dateStr.split('/');
  year = '20' + year;
  if (day.startsWith('0')) {
    day = day.slice(1);
  }
  if (month.startsWith('0')) {
    month = month.slice(1);
  }
  const y = Number(year);
  const m = Number(month) - 1;
  const d = Number(day);
  return new Date(y, m, d);
};

// **************************
// * Perform initial set up *
// **************************

// set date in button on HTML
const setDateOnButton = setDateTo => {
  const dateSelectedNavbar = document.querySelector(
    '.select-date-btn'
  );
  dateSelectedNavbar.textContent = setDateTo.toLocaleDateString(
    region,
    options
  );

  // add the downarrow div element

  const downArrow = document.createElement('div');
  downArrow.className = 'down--2';
  dateSelectedNavbar.appendChild(downArrow);
};

// Update to currentWeekComm (i.e starting Sunday) on navbar in HTML
const calcWeekCommencing = (dateSelect = currentDate) => {
  const WeekCommencing = new Date(dateSelect);
  WeekCommencing.setDate(dateSelect.getDate() - dateSelect.getDay());
  setDateOnButton(WeekCommencing);
  return WeekCommencing;
};

// global variable given initial value, returned WeekCommencing derived
// from the currentDate
currentWeekComm = calcWeekCommencing();

// set up a date list to go in dropdown menu based on currentWeekComm
const generateDatesDropDown = () => {
  // grab all date elements in the date dropdown menu
  const dateSelectEl = document.querySelectorAll('.date-select');
  const dateDropDownList = [];
  for (let i = 0; i < dateSelectEl.length; i++) {
    let futureDate = new Date(currentWeekComm);
    futureDate.setDate(currentWeekComm.getDate() + i * 7);
    dateDropDownList[i] = futureDate.toLocaleDateString(
      region,
      options
    );
  }
  dateSelectEl.forEach(function (element, index) {
    element.textContent = dateDropDownList[index];
  });
};

generateDatesDropDown();

// ***************** - REUSABLE MAIN FUNCTIONS - ********************
// * STEP 1 -- Find the correct running order for the drivers       *
// * in the driver's column of the HTML based on the                *
// * difference in days between the current date (or supplied date) *
// * and the link start date.                                       *
// *                                                                *
// * Note, that if a new date is supplied instead of using the      *
// * current date then both Steps 1 and 2 have to be carried        *
// * out again whereas if we select a different driver only         *
// * Step 2 has to be repeated i.e. in this case, we are in         *
// * effect using the same date only it has to line up with         *
// * the new driver.                                                *
// *                                                                *
// * Note, the following function, rotateElements (itself, called   *
// * from within the rotateDrivers function), rotates the           *
// * rotatedDriversNames array passed into the function in place    *
// * according the supplied rotationIndex (k).                      *
// ******************************************************************

const rotateElements = function (nums, k) {
  // reverse helper function
  function reverse(arr, start, end) {
    while (start < end) {
      [arr[start], arr[end]] = [arr[end], arr[start]];
      start++;
      end--;
    }
  }

  k %= nums.length;

  reverse(nums, 0, nums.length - 1);
  reverse(nums, 0, k - 1);
  reverse(nums, k, nums.length - 1);

  return nums;
};

function rotateDrivers(newDate = currentDate) {
  const difference = newDate - linkWeekCommencing;

  console.log(`the difference variable used in the rotateDrivers reusable function:
    ${newDate} - ${linkWeekCommencing} = ${difference}`);

  const differenceInDays = Math.round(
    Math.abs(difference) / (1000 * 3600 * 24)
  );
  let rotateIndex = Math.floor(differenceInDays / 7);
  // correct for where index exceeds the total number of drivers in the link
  rotateIndex %= nameEl.length;

  console.log(
    'Difference in days between link start date and current date',
    differenceInDays
  );
  console.log('Amount by which to rotate drivers list', rotateIndex);

  // create a shallow copy of unrotatedDriverNames
  const rotatedDriverNames = [...unrotatedDriverNames];
  console.log(
    'After rotation:',
    rotateElements(rotatedDriverNames, rotateIndex) //rotatedDriverNames mutated
  );

  nameEl.forEach(function (node, index) {
    node.textContent = rotatedDriverNames[index];
  });
  return rotatedDriverNames;
}

// global variable given initial value, a returned array based on currentDate
rotatedDriversList = rotateDrivers(); // use currentDate as default argument

// **************************************************************************
// * STEP 2 -- Now, work out the correct dates in the Wk column of the HTML *
// * using the driver's name to which we want the dates to apply.           *
// * The first time this fuction is run the default driver (CAMBRIDGE), and *
// * date (currentWeekComm based on currentDate) along with the             *
// * rotatedDriverList (again, based on the currentDate) are used.          *
// * Thereafter, both rotateDrivers and calculateDates functions are called *
// * in response to an EventListener event being triggered i.e. new driver  *
// * or date being selected in the HTML dropdown lists.                     *
// **************************************************************************

function calculateDates(
  driverSelect = driver,
  rotatedDrivers = rotatedDriversList,
  WeekComm = currentWeekComm
) {
  let driversStartingPos = rotatedDrivers.indexOf(driverSelect);
  console.log(
    "Driver's position:",
    driverSelect,
    '-->',
    driversStartingPos + 1
  );

  const dateArr = [];
  const dateArrStr = [];
  let tempDate;
  for (let i = 0; i < nameEl.length; i++) {
    tempDate = new Date(WeekComm); //create a copy
    let pos = (driversStartingPos + i) % nameEl.length;
    dateArr[pos] = new Date(
      tempDate.setDate(WeekComm.getDate() + i * 7)
    );
    dateArrStr[pos] = dateArr[pos].toLocaleDateString(
      region,
      options
    );
  }

  console.log(dateArrStr);

  // Update dates on HTML corressponding to new driver

  const dateEl = document.querySelectorAll('.week-com');

  dateEl.forEach(function (node, index) {
    node.textContent = dateArrStr[index];
  });

  // Update Driver's name on navbar in HTML

  if (driver !== driverSelect) driver = driverSelect;
  const driverSelectedNavbar = document.querySelector(
    '.select-driver-btn'
  );
  driverSelectedNavbar.textContent = driver;

  // add the downarrow div element
  const downArrow = document.createElement('div');
  downArrow.className = 'down--1';
  driverSelectedNavbar.appendChild(downArrow);
}

console.log(
  'Current Week Commencing:',
  currentWeekComm.toLocaleDateString(region, options)
);
console.log('Current Driver', driver);
// console.log("Current Driver Names", driverNames);

calculateDates(); // use default arguments for function i.e. current date and driver

document.addEventListener('click', event => {
  const dropdownEl1 = document.querySelector('.dropdown--1');
  const dropdownEl2 = document.querySelector('.dropdown--2');
  if (event.target.matches('.select-driver-btn, .down--1')) {
    // if clicked on drivers dropdown menu button, toggle it
    // open/close while closing the date menu if that is open -
    // we don't want both dropdown menu's open at the same time
    dropdownEl1.classList.toggle('active');
    dropdownEl2.classList.remove('active');
  } else if (event.target.matches('.select-date-btn, .down--2')) {
    // if clicked on date dropdown menu, toggle it open/close
    // while closing the drivers dropdown menu if that is open
    dropdownEl2.classList.toggle('active');
    dropdownEl1.classList.remove('active');
  } else if (event.target.matches('.driver-select')) {
    const driverSelected = event.target.textContent;
    console.log('Driver Selected:', driverSelected);
    // set cookie to newly selected driver
    setCookie('driver', driverSelected, 28);
    calculateDates(
      driverSelected,
      rotatedDriversList,
      currentWeekComm
    );
    // clear drivers dropdown menu so we can see the changes
    dropdownEl1.classList.toggle('active');
  } else if (event.target.matches('.date-select')) {
    let targetDateStr = event.target.textContent;
    console.log('Date selected (in str format):', targetDateStr);

    // parse date
    currentWeekComm = toDate(targetDateStr);
    console.log(
      'Date selected (in Date format):',
      currentWeekComm.toLocaleDateString(region, options)
    );
    rotatedDriversList = rotateDrivers(currentWeekComm);
    calculateDates(undefined, rotatedDriversList, currentWeekComm);
    setDateOnButton(currentWeekComm);
    // clear date dropdown menu
    dropdownEl2.classList.toggle('active');
  } else {
    // if click anywhere else make sure both menus are cleared
    dropdownEl1.classList.remove('active');
    dropdownEl2.classList.remove('active');
  }
});

// const navBarElement = document.querySelector(".navbar");
// navBarElement.addEventListener("click", (event) => {
//   if (event.target.classList.contains("driver-select")) {
//     const driverSelected = event.target.textContent;
//     console.log("Driver Selected:", driverSelected);
//     calculateDates(driverSelected, rotatedDriversList, currentWeekComm);
//     // document.querySelector(".dropdown-content--1").style.display = "none";
//   }
//   if (event.target.classList.contains("date-select")) {
//     let targetDateStr = event.target.textContent;
//     console.log("Date selected (in str format):", targetDateStr);

//     // parse date
//     currentWeekComm = toDate(targetDateStr);
//     console.log(
//       "Date selected (in Date format):",
//       currentWeekComm.toLocaleDateString(region, options)
//     );
//     rotatedDriversList = rotateDrivers(currentWeekComm);
//     calculateDates(undefined, rotatedDriversList, currentWeekComm);
//     setDateOnButton(currentWeekComm);
//   }
// });

// const myName = "Mark Cambridge";
// const h1 = document.querySelector(".heading-primary");
// console.log(myName);
// console.log(h1);

// // h1.addEventListener("click", function () {
// //   h1.textContent = myName;
// //   h1.style.backgroundColor = "red";
// //   h1.style.padding = "5rem";
// // });

// ///////////////////////////////////////////////////////////
// // Set current year
// const yearEl = document.querySelector(".year");
// const currentYear = new Date().getFullYear();
// yearEl.textContent = currentYear;

// ///////////////////////////////////////////////////////////
// // Make mobile navigation work

// const btnNavEl = document.querySelector(".btn-mobile-nav");
// const headerEl = document.querySelector(".header");

// btnNavEl.addEventListener("click", function () {
//   headerEl.classList.toggle("nav-open");
// });

// ///////////////////////////////////////////////////////////
// // Smooth scrolling animation

// const alllinks = document.querySelectorAll("a:link");
// // console.log(alllinks);

// alllinks.forEach(function (link) {
//   link.addEventListener("click", function (e) {
//     e.preventDefault();
//     const href = link.getAttribute("href");

//     // Scroll back to top
//     if (href === "#")
//       window.scrollTo({
//         top: 0,
//         behavior: "smooth",
//       });

//     // Scroll to other links
//     if (href !== "#" && href.startsWith("#")) {
//       const sectionEl = document.querySelector(href);
//       sectionEl.scrollIntoView({ behavior: "smooth" });
//     }

//     // Close mobile navigation
//     if (link.classList.contains("main-nav-link"))
//       headerEl.classList.toggle("nav-open");
//   });
// });

///////////////////////////////////////////////////////////
// Sticky navigation

// const sectionHeroEl = document.querySelector(".section-hero");

// const obs = new IntersectionObserver(
//   function (entries) {
//     const ent = entries[0];
//     console.log(ent);
//     if (ent.isIntersecting === false) {
//       document.body.classList.add("sticky");
//     }

//     if (ent.isIntersecting === true) {
//       document.body.classList.remove("sticky");
//     }
//   },
//   {
// In the viewport
//     root: null,
//     threshold: 0,
//     rootMargin: "-80px",
//   }
// );
// obs.observe(sectionHeroEl);

///////////////////////////////////////////////////////////
// Fixing flexbox gap property missing in some Safari versions
// function checkFlexGap() {
//   var flex = document.createElement("div");
//   flex.style.display = "flex";
//   flex.style.flexDirection = "column";
//   flex.style.rowGap = "1px";

//   flex.appendChild(document.createElement("div"));
//   flex.appendChild(document.createElement("div"));

//   document.body.appendChild(flex);
//   var isSupported = flex.scrollHeight === 1;
//   flex.parentNode.removeChild(flex);
//   console.log(isSupported);

//   if (!isSupported) document.body.classList.add("no-flexbox-gap");
// }
// checkFlexGap();
