const config = require("./config.js");
const DataServiceClient = require("./lib/dataServiceClient.js");

const FitnessDeviceClient = require("./lib/fitnessDeviceClient");
const HealthScoreServiceClient = require("./lib/healthScoreServiceClient");

const dataServiceClient = new DataServiceClient(config);
const fitnessDeviceClient = new FitnessDeviceClient(config);
const healthScoreServiceClient = new HealthScoreServiceClient(config);

const app = async (req, res) => {
  try {

    res.status(200).send({status: 'Success'})
    console.log("generating health score for all accounts");
    let accounts = await dataServiceClient.getAccounts();

    console.log(`Fetched ${accounts.length} accounts from Scord User API:`);

    for (let account of accounts) {
      let tokenRefreshed = await fitnessDeviceClient.accessTokenCheck(account)
      console.log(tokenRefreshed)
    }

    accounts = await dataServiceClient.getAccounts();

    for (let account of accounts) {
      console.log("processing account: ");
      console.log(account);

      let data = await fitnessDeviceClient.getData(account);

      console.log(
        `calculating health score for ${account.firstName} ${
          account.lastName
        } from device data`
      );

      let healthScore = await healthScoreServiceClient.calculateHealthScore(
        data
      );

      await dataServiceClient.updateHealthScore(account, healthScore);

      console.log(
        `user ${account.firstName} ${
          account.lastName
        }'s health score of ${JSON.stringify(healthScore)} was succcessfully updated`
      );
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  app
};
