# GCP-node-listener function for testing [activities.watch](https://developers.google.com/admin-sdk/reports/reference/rest/v1/activities/watch) Push notifications (scoped to an OU)

This is a complete, but bare-bones test environment that includes:

1. Creating and deploying an HTTP Cloud Function with Node.js in GCP
2. Setting up an Admin SDK Reports API channel to forward push notifications over to the GCP listener function

## Setting up the listener function

1. Clone this repository to the desired location.
2. Complete Steps 1. through 6. from [Create and deploy an HTTP Cloud Function with Node.js](https://cloud.google.com/functions/docs/create-deploy-http-nodejs#before_you_begin) guide.
3. Deploy the Cloud Function using the following command:
```
gcloud functions deploy hello-node-function \                              
  --gen2 \
  --runtime=nodejs20 \
  --region=europe-west1 \
  --source=. \
  --entry-point=helloPOST \
  --trigger-http \
  --allow-unauthenticated \
  --max-instances=1
```
4. Verify the deployment has been successful on https://console.cloud.google.com/functions/list.
5. To test the function (and logging capabilities) you can use the following `curl` command (replacing the function URL with the one returned in Step 3.):
```
curl -X POST -H "Content-Type: application/json" -d '{"name": "test", "status": "done"}'  https://europe-west1-gcp-functions-xxxxxxx.cloudfunctions.net/hello-node-function
```
6. You should see an `>>> Incoming POST:  { name: 'test', status: 'done' }` line in the function logs.

## Setting up the API channel

1. To set up the API channel, go to https://developers.google.com/oauthplayground
2. In Step 1., select & authorize `https://www.googleapis.com/auth/admin.reports.audit.readonly` scope under **Admin SDK API reports_v1**.
3. Under Step 2., exchange authorization code for tokens.
4. Under Step 3., set the following parameters:
- HTTP Method: `POST` 
- Request URL: `https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/drive/watch?orgUnitID=id:03ph8a2z3jmsbhm` << see the `orgUnitID` parameter used for filtering. Here, it is set to an OU Id from my domain which I got using the [orgunits.list](https://developers.google.com/admin-sdk/directory/reference/rest/v1/orgunits/list) method.
- Enter request body:
```
{
  "id": “007”,
  "token": “test,
  "type": "web_hook",
  "address": "https://europe-west1-gcp-functions-xxxxxxx.cloudfunctions.net/hello-node-function",
  "resourceId": "testId”,
  "resourceUri": "testId_v1",
  "kind": "api#channel"
}
```
5. Send the request. You should see a similar response, indicating a successful channel:
```
{
  "resourceUri": "https://admin.googleapis.com/admin/reports/v1/activity/users/all/applications/drive?alt=json&orgUnitID=id:03ph8a2z3jmsbhm", 
  "kind": "api#channel", 
  "resourceId": "FGCG703k5Qa4Io0s6Ukgd0A2nLE", 
  "token": "test", 
  "expiration": "1702432378000", 
  "id": "testId"
}
```
6. Now, the channel is established and the Reports API is ready to send event data to the listener function.

You can test push notifications by performing any activity (such as opening a file) in Google Drive with a test account. To verify the event data pushed to our GCP function, go to the logging section and look for the latest `>>> Incoming POST:  { ... }` lines.
