# scord-gcp

## description
this repo contains all of the google cloud functions which are part of the scord platform


## prerequisites 
to deploy the google cloud functions you will first need to install and configure the google cloud sdk:
https://cloud.google.com/sdk/docs


## deployment 

    cd /<function_directory> 
    gcloud functions deploy <function_name> --trigger-http --runtime=nodejs10

