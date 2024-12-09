import moment from 'moment';
// import AsyncStorageHelper from '../store/AsyncStorageHelper';
// import 'intl';
// import 'intl/locale-data/jsonp/en-IN';
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
  getInDayMonthYearFormat(dateString) {
    var dateString = moment(dateString).format('DD MMM YYYY');
    return dateString;
  }
  getCurrentMonthYear(date) {
    var currentDate = moment(date).format('DD MMM');
    return currentDate;
  }

  checkIsEmpty(obj) {
    return Object.keys(obj).length === 0;
  }

  getMonthAndYearToString(dateString) {

    let dateStringWithoutTime = dateString.replace(/\T.+/g,"")
    var monthStringnew = moment(dateStringWithoutTime).format('DD MMM');

    return monthStringnew;
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
  }
  getTimeToString(timeString) {
    var timeString = timeString.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    return timeString;
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
  isLocationWithinTheRadius = (newLocationObject,centerPoint) => {
    let lat = newLocationObject.latitude
    let long = newLocationObject.longitude
    let isInRadius = isPointWithinRadius(newLocationObject,centerPoint,200)
    return isInRadius
  };


  getCurrentTimeStamp = () => {
    let timeStamp = Math.round(new Date().getTime() / 1000);
    return timeStamp;
  };

}
export default new UtilityHelper();