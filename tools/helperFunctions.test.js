const {compareDates} = require('./helperFunctions');

describe('helperFunctions', () => {

  it('should compare two dates', async () => {
    let date1 = new Date('December 17, 1995 03:24:00');
    let date2 = new Date(); 

    console.log(date1)
    // date1 is before date2, so this should be false
    expect(compareDates(date1, date2)).toBe(false)

    // and this should be true
    expect(compareDates(date2, date1)).toBe(true)
  })



})