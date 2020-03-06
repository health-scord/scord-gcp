const Promise = require("bluebird");

class healthScoreServiceClient {
  constructor(options) {
    this.options = options;
    this.name = `dataServiceClient`;
    console.log(`${this.name} is operational`);
  }

  async calculateHealthScore(data) {
    try {

      const heartScore = calculateHeartScore(data.restingHeartRate);
      const sleepScore = calculateSleepScore(data.averageDailySleep);
      const activityScore = calculateActivityScore(data.averageWeeklyActivity);

      const totalScore = (heartScore + sleepScore + activityScore)/3

      const healthScore = {
        calculated: Math.round(totalScore),
        components: {
            sleep: {
                averageDailySleepHours: data.averageDailySleep
            },
            fitness: {
                averageDailyRigorousActivityMinutes: data.averageWeeklyActivity/7,
            },
            heartRate: {
                averageRestingHeartRate: data.restingHeartRate
            }
        }
    };

      return Promise.resolve(healthScore);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }
}

const calculateHeartScore = restingHeartRate => {
  if (restingHeartRate > 140) {
    restingHeartRate = 140;
  }

  if (restingHeartRate < 40) {
    restingHeartRate = 40;
  }


  let heartScore

  if (restingHeartRate < 51) {
    heartScore = 100 
  } else {
    heartScore = 100 - (Math.abs(restingHeartRate - 50) / 50)*100
  }

  return heartScore;
};

const calculateActivityScore = averageWeeklyActivity => {
  if (averageWeeklyActivity > 300) {
    averageWeeklyActivity = 300;
  }

  if (averageWeeklyActivity < 150) {
    averageWeeklyActivity = 150;
  }

  const activityScore =
    100 - (Math.abs(averageWeeklyActivity - 300) / 300) * 100;
  return activityScore;
};

const calculateSleepScore = averageDailySleep => {
  let sleepScore;

  if (averageDailySleep > 7 && averageDailySleep < 9) {
    sleepScore = 300;
  } else if (averageDailySleep < 7) {
    sleepScore = Math.floor(
      100 - (Math.abs(7 - averageDailySleep) / 7) * 100
    );
  } else if (averageDailySleep > 9) {
    sleepScore = Math.floor(
      100 - (Math.abs(9 - averageDailySleep) / 7) * 100
    );
  }

  return sleepScore;
};

module.exports = healthScoreServiceClient;
