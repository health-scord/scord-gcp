const FitbitApiClient = require("fitbit-node");
const express = require("express");
const rp = require("request-promise");
const https = require("https");
const fs = require("fs");
const path = require("path");

const app = express();

const client = new FitbitApiClient({
  clientId: "22DPF6",
  clientSecret: "5f3538567d187a52768935217b220558",
  apiVersion: "1.2" // 1.2 is the default
});

const serverIP = "68.183.100.145";

const apiUrl = `https://us-central1-scord-260818.cloudfunctions.net/scord-user-api-test/`;

let globalScopeId;

// redirect the user to the Fitbit authorization page
app.get("/accounts/:id/authorize", async (req, res) => {
  try {
    globalScopeId = req.params.id;
    console.log("in authorize route");


    let isAccountAuthorized = false;
    //get account details from dataService using id
    //if access token and refresh token are available for account then send user to "this device is already authorized" page or modal.

    if (isAccountAuthorized) {
      return;
    } else {
      let url = await client.getAuthorizeUrl(
        "activity heartrate location nutrition profile settings sleep social weight",
        `${apiUrl}/authorizeCallback`
      );
      return res.redirect(url);
    }
  } catch (error) {
    console.log(error);
  }
});

// handle the callback from the Fitbit authorization flow
app.get("/authorizeCallback", async (req, res) => {
  // exchange the authorization code we just received for an access token
  console.log("in authorizeCallback route");

  let accessTokenResult = await client.getAccessToken(
    req.query.code,
    callbackUrl
  );
  let profileDetails = await client.get(
    "/profile.json",
    accessTokenResult.access_token
  );

  let accessToken = accessTokenResult.access_token;
  let refreshToken = accessTokenResult.refresh_token;
  let deviceUserId = accessTokenResult.user_id;

  console.log(deviceUserId);
  console.log(accessToken);
  console.log(refreshToken);

  console.log(`saving access token for id to dataservice /accounts route`);

  console.log(globalScopeId);

  //post this to dataService
  let options = {
    uri: `${apiUrl}/accounts/${globalScopeId}`,
    method: "PATCH",
    body: {
      id: globalScopeId,
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

  try {
    await rp(options);
    return res.redirect(`http://${serverIP}:5000/accounts`);
  } catch (error) {
    console.log(error);
    return res.redirect(`http://${serverIP}:5000/accounts`);
  }
});

module.exports = {
  app
};