const Promise = require("bluebird");
const rp = require("request-promise");

class dataServiceClient {
  constructor(options) {
    this.options = options;
    this.name = `dataServiceClient`;
    this.endpoint = this.options.scordUsersApiUrl
    console.log(`${this.name} is operational`);
  }

  async getAccounts() {
    try {
      let requestOptions = {
        uri: `${this.endpoint}/accounts`,
        qs: {},
        headers: {
          "User-Agent": "Request-Promise"
        },
        json: true
      };

      let accounts = "default";

      try {
        accounts = await rp(requestOptions);
      } catch (error) {
        console.log(error);
      }

      return Promise.resolve(accounts);
    } catch (error) {
      console.log(error);
      return Promise.reject(error);
    }
  }

  async updateHealthScore(account, healthScore) {
    try {
      let options = {
        uri: `${this.endpoint}/accounts/${account.id}`,
        method: "PATCH",
        body: {
          healthScore
        },
        json: true
      };

      return await rp(options);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async updateAccessToken(account, accessToken, refreshToken) {
    try {
      console.log("updating accessToken");
      let options = {
        uri: `${this.endpoint}/accounts/${account.id}`,
        method: "PATCH",
        body: {
          devices: [
            {
              accessToken,
              refreshToken
            }
          ]
        },
        json: true
      };

      return await rp(options);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

module.exports = dataServiceClient;
