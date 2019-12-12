const FitbitApiClient = require("fitbit-node");
const express = require("express");
const rp = require("request-promise");


const app = express();

const client = new FitbitApiClient({
  clientId: "22DPF6",
  clientSecret: "5f3538567d187a52768935217b220558",
  apiVersion: "1.2" // 1.2 is the default
});


const scordUsersApiUrl = `https://us-central1-scord-260818.cloudfunctions.net/scord-user-api-test`;
const scordFitbitAuthApiUrl = `https://us-central1-scord-260818.cloudfunctions.net/scord-fitbit-auth-api`


// redirect the user to the Fitbit authorization page
app.get("/accounts/:id/authorize", async (req, res) => {
  try {
    console.log("in authorize route");


    let isAccountAuthorized = false;
    //get account details from dataService using id
    //if access token and refresh token are available for account then send user to "this device is already authorized" page or modal.

    if (isAccountAuthorized) {
      return;
    } else {
      let redirectUrl = await client.getAuthorizeUrl(
        "activity heartrate location nutrition profile settings sleep social weight",
        `${scordFitbitAuthApiUrl}/authorizeCallback`,
        undefined,
        req.params.id
      );
      console.log('RIGHT HERE')
      console.log(redirectUrl)
      return res.redirect(redirectUrl);
    }
  } catch (error) {
    console.log(error);
  }
});

// handle the callback from the Fitbit authorization flow
app.get("/authorizeCallback", async (req, res) => {
  // exchange the authorization code we just received for an access token
  console.log("in authorizeCallback route");

  console.log(req.query.state)

  let accessTokenResult = await client.getAccessToken(
    req.query.code,
    `${scordFitbitAuthApiUrl}/authorizeCallback`
  );

  let profileDetails = await client.get(
    "/profile.json",
    accessTokenResult.access_token
  );

  let accessToken = accessTokenResult.access_token;
  let refreshToken = accessTokenResult.refresh_token;
  let deviceUserId = accessTokenResult.user_id;



  //console.log(`saving access token for id to dataservice /accounts route`);


  //post this to dataService
  let options = {
    uri: `${scordUsersApiUrl}/accounts/${req.query.state}`,
    method: "PATCH",
    body: {
      id: req.query.state,
      devices: [
        {
          make: "fitbit",
          model: "charge3",
          deviceUserId,
          accessToken,
          refreshToken
        }
      ]
    },
    json: true
  };

  console.log(options)

  try {
    await rp(options);
    //return to home screen of app
    //return res.redirect(`http://${serverIP}:5000/accounts`);
  } catch (error) {
    console.log(`oops an error"`)
    console.log(error);
    //return to home screen of app
    //return res.redirect(`http://${serverIP}:5000/accounts`);
  }
});

module.exports = {
  app
};