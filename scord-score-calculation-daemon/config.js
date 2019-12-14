const defaults = {
  SCORD_USERS_API_URL: `https://us-central1-scord-260818.cloudfunctions.net/scord-user-api-test`
};

let config = {
  scordUsersApiUrl: process.env.SCORD_USERS_API_URL
    ? process.env.SCORD_USERS_API_URL
    : defaults.SCORD_USERS_API_URL,
};

module.exports = config;
