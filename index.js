const functions = require('@google-cloud/functions-framework')

// Register an HTTP function with the Functions Framework that will be executed
// when you make an HTTP POST request to the deployed function's endpoint.

functions.http('helloPOST', (req, res) => {
  body = req.body
  console.log('>>> Incoming POST: ', body)

  res.status(200).send()
})
