
// this will compare two javascript dates, such as those on the mongoose schemas
// for 'createdAt', 'lastUpdated'
function compareDates(date1, date2) {
  // I'm not sure why, but when they are grabbed off of mongoose schema, 
  // the dates are strings? new Date() should be object, as in the helperFunctions.test.js file
  // They are added to the schemas as 'new Date()', so I'm confused

  if (typeof (date1) === 'string') {
    console.log('yep')
    date1 = new Date(date1);
  }
  if (typeof (date2) === 'string') {
    date2 = new Date(date2);
  }

  console.log(date1)
  console.log(date2)
  console.log(date1.getTime() > date2.getTime())
  return date1.getTime() > date2.getTime();
}

module.exports = {
  compareDates
}

