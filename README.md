# scord-gcp

## prerequisites 
to deploy the google cloud functions you will first need to install the google cloud sdk:
https://cloud.google.com/sdk/docs

    gcloud init 
    cd /<function_directory> 
    gcloud functions deploy <function_name> --trigger-http --runtime=nodejs10

