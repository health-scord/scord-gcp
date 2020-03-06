const Promise = require("bluebird");
const rp = require("request-promise");
const FitbitApiClient = require("fitbit-node");
const express = require("express");
const moment = require("moment");
const DataServiceClient = require("./dataServiceClient.js");


const apiPath = {
  sleep: "/sleep/",
  activity: "/activities/tracker/minutesFairlyActive/",
  heart: "/activities/heart/"
};

class fitnessDeviceClient {
  constructor(options) {
    this.options = options;
    this.name = `fitnessDeviceClient`;
    console.log(`${this.name} is operational`);

    this.dataServiceClient = new DataServiceClient(options);

    this.fitbitClient = new FitbitApiClient({
      clientId: "22DPF6",
      clientSecret: "5f3538567d187a52768935217b220558",
      apiVersion: "1.2"
    });
  }

  async getData(account) {
    try {
      const { startDate, endDate } = calculateTimeFrame(100);

      let [sleepData, activityData, heartRateData] = await Promise.all([
        retrieveData(account, this.fitbitClient, startDate, endDate, "sleep"),
        retrieveData(
          account,
          this.fitbitClient,
          startDate,
          endDate,
          "activity"
        ),
        retrieveData(account, this.fitbitClient, startDate, endDate, "heart")
      ]);

      let averageDailySleep = calculateAverageDailySleep(sleepData.sleep);
      let averageWeeklyActivity = calculateAverageWeeklyActivity(
        activityData["activities-tracker-minutesFairlyActive"]
      );
      let restingHeartRate = calculateRestingHeartRate(
        heartRateData["activities-heart"]
      );

      return {
        averageDailySleep,
        averageWeeklyActivity,
        restingHeartRate
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async accessTokenCheck(account){
    try{

      let token = account.devices[0].accessToken;

      let tokenValidResults = await this.fitbitClient.get(
        `/profile.json`,
        token,
      );

      if (tokenValidResults[0].hasOwnProperty('errors') && tokenValidResults[0].errors[0].errorType == 'invalid_token'){
        console.log('Invalid token, refreshing...')
        let results = await this.fitbitClient.refreshAccessToken(account.devices[0].accessToken, account.devices[0].refreshToken, 28900) 
 
        await this.dataServiceClient.updateAccessToken(account, results.access_token, results.refresh_token)     
        return true
      } else {
        return false
      }
    } catch (err){
      return Promise.reject(err)
    }
  }

  
}

module.exports = fitnessDeviceClient;

let retrieveData = async (
  account,
  deviceClient,
  startDate,
  endDate,
  dataType
) => {
  let token = account.devices[0].accessToken;

  try {
    let response = await deviceClient.get(
      `${apiPath[dataType]}date/${startDate}/${endDate}.json`,
      token
    );

    return response[0];  

  } catch (error) {
    console.log(error);
    return Promise.reject(error);
  }
};

const calculateTimeFrame = delta => {
  let now = moment();
  let startDate = now.clone().subtract(delta, "days");

  let endDateFormatted = now.format().slice(0, 10);
  let startDateFormatted = startDate.format().slice(0, 10);

  return { startDate: startDateFormatted, endDate: endDateFormatted };
};

const calculateAverageDailySleep = sleepData => {
  let dates = sleepData.map(dataPoint => {
    return dataPoint.dateOfSleep;
  });

  let uniqueDates = [...new Set(dates)];

  let totalSleep = 0;

  for (let date of uniqueDates) {
    let dateSleepData = sleepData.filter(dataPoint => {
      return dataPoint.dateOfSleep == date;
    });

    let totalSleepOnDate = 0;
    for (let sleepData of dateSleepData) {
      totalSleepOnDate = totalSleepOnDate + sleepData.minutesAsleep;
    }
    totalSleep = totalSleep + totalSleepOnDate;
  }

  return parseFloat((totalSleep/60) / uniqueDates.length).toFixed(2);
};

const calculateAverageWeeklyActivity = activityData => {
  let totalActiveMinutes = 0;

  for (let date of activityData) {
    totalActiveMinutes = totalActiveMinutes + parseInt(date.value);
  }

  return (parseFloat(totalActiveMinutes / activityData.length).toFixed(2))*7;
};

const calculateRestingHeartRate = heartData => {
  let releventData = heartData.filter(dataPoint => {
    return dataPoint.value.restingHeartRate;
  });

  let heartRateSum = 0;
  for (let dataPoint of releventData) {
    heartRateSum = heartRateSum + parseInt(dataPoint.value.restingHeartRate);
  }

  return parseFloat(heartRateSum / releventData.length).toFixed(2);
};
