// in miliseconds
const units = {
    year  : 24 * 60 * 60 * 1000 * 365,
    month : 24 * 60 * 60 * 1000 * 365/12,
    day   : 24 * 60 * 60 * 1000,
    hour  : 60 * 60 * 1000,
    minute: 60 * 1000,
    second: 1000
  }
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  
  const getRelativeTime = (d1, d2 = new Date()) => {
    d1 = parseInt(d1);
    var elapsed = d1 - d2
    if(!elapsed) elapsed = 0;
    // console.log("Inside getRelative", d1  , d2.getTime(), d1-2, elapsed);
    // "Math.abs" accounts for both "past" & "future" scenarios
    for (var u in units) 
      if (Math.abs(elapsed) > units[u] || u == 'second') 
        return rtf.format(Math.round(elapsed/units[u]), u)
  }

export default getRelativeTime;