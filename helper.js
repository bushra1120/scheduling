var moment = require('moment');
function dbDate(onlyDate){
    var d = new Date(onlyDate);
    var date = d.getDate();
    var month = d.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
    var year = d.getFullYear();
    var finalDate = month+"/"+date+"/"+year;
    return finalDate;

}

function getTotalHours(startpst,endpst){
    var startpst = moment(startpst);//now
    var endpst = moment(endpst);
    var diff_in_min = endpst.diff(startpst, 'minutes'); // 44700
    var hours = Math.trunc(diff_in_min/60);
    var minutes = diff_in_min % 60;
    var starthours = startpst.get('hours');
    var endhours = endpst.get('hours');
    if(endpst < startpst){
        var newhour = 24 - starthours;
        hours = newhour + endhours;
    }
    var diff = hours +":"+ minutes;

    return diff;
}

function getDates(date1,date2){
    // To calculate the time difference of two dates
    var Difference_In_Time = date2.getTime() - date1.getTime();
        
    // To calculate the no. of days between two dates
    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    var dates = [date1.toString()];
    var newDate = new Date(date1);
    for (let count = 1; count <= Difference_In_Days; count++) {
    
        newDate.setDate(newDate.getDate()+1);
        dates.push(newDate.toString());
        
    }
    return dates;
}



function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function tConvert (time) {
    // Check correct time format and split into components
    time = time.toString ().match (/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time.length > 1) { // If time format correct
        time = time.slice (1);  // Remove full string match value
        time[5] = +time[0] < 12 ? 'AM' : 'PM'; // Set AM/PM
        time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join (''); // return adjusted time or original string
}

function calcTime(city, offset, datetime) {
    // create Date object for current location
    var d = new Date(datetime);

    // convert to msec
    // subtract local time zone offset
    // get UTC time in msec
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);

    // create new Date object for different city
    // using supplied offset
    var nd = new Date(utc + (3600000*offset));

    // return time as a string
    return nd.toLocaleString();
}


module.exports = {
    dbDate,
    getRandomInt,
    tConvert,
    calcTime,
    getDates,
    getTotalHours
}