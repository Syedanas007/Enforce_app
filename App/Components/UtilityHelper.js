import moment from 'moment';
import {getSpeed, convertSpeed,getDistance,rad, convertDistance,isPointWithinRadius} from 'geolib';


var currentDate = new Date();
class UtilityHelper {
  getTimestampToDateString(timestamp) {
    var dateString = moment.unix(timestamp).format('DD MMM, YYYY');
    return dateString;
  }
  getDateToString(dateString) {
    var dateString = moment(dateString).format('DD MMM, YYYY');
    return dateString;
  }
  getDateAndTimeToString(dateString) {
    var dateString = moment(dateString).format('DD MMM, YYYY hh:mm a');
    return dateString;
  }
  checkIsEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  getMonthAndYearToString(dateString) {
    let appendDateString = dateString.split(/[\s-:]/);
    appendDateString[1] = (parseInt(appendDateString[1], 10) - 1).toString();
    var monthString = moment(appendDateString).format('DD MMM');
    return monthString;
  }
  timeDifference(previousDate) {
    let current = new Date().getTime();
    let previous = new Date(previousDate).getTime();
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;
    if (elapsed < msPerMinute) {
      return Math.round(elapsed / 1000) + ' seconds ago';
    } else if (elapsed < msPerHour) {
      return Math.round(elapsed / msPerMinute) + ' minutes ago';
    } else if (elapsed < msPerDay) {
      return Math.round(elapsed / msPerHour) + ' hours ago';
    } else {
      var dateString = moment(previous).format('DD MMM, YYYY');
      return dateString;
    }
    // else if (elapsed < msPerMonth) {
    //     return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
    // }

    // else if (elapsed < msPerYear) {
    //     return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
    // }

    // else {
    //     return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
    // }
  }
  getTimeToString(timeString) {
    var timeString = timeString.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return timeString;
  }

  getCurrentTimeStamp = () => {
    let timeStamp = Math.round(new Date().getTime() / 1000);
    return timeStamp;
  };

  formatDateToTime(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  checkDateIsTodayOrNot(date) {
    if (
      moment(currentDate).format('DD MMM YYYY') ===
      moment
        .unix(date)
        .utc(false)
        .format('DD MMM YYYY')
    ) {
      return 'Today';
    } else {
      return moment
        .unix(date)
        .utc(false)
        .format('DD MMM YYYY')
        .toString();
    }
  }
  /* istanbul ignore next */
  calcSpeed = (previousLocationObject, newLocationObject) => {
    let speed = getSpeed(previousLocationObject, newLocationObject);
    let speedValue = speed ? speed : 0;
    let convertedSpeed = convertSpeed(speedValue, 'kmh');
    return convertedSpeed ? convertedSpeed : 0;
  };
  calcDistance = (previousLocationObject, newLocationObject) => {
    let distnace = getDistance(previousLocationObject, newLocationObject);
    let distnaceValue = distnace ? distnace : 0;
    let convertedDistance = convertDistance(distnaceValue,'m');
    return convertedDistance ? convertedDistance : 0;
  };
  isLocationWithinTheRadius = (newLocationObject,centerPoint, radius) => {
    let lat = newLocationObject.latitude
    let long = newLocationObject.longitude
    let isInRadius = isPointWithinRadius(newLocationObject,centerPoint,radius)
    return isInRadius
  };
}
export default new UtilityHelper();
