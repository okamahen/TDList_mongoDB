/*
1). To track the dependencies on our code, use command: npm init -y
This will create package.json file, under "dependencies" we will see express as dependencies file
2). Run npm install express first before running code below
3). HTML Template: https://github.com/LearnWebCode/javascript/blob/master/01_Simple_App/template.html
4). Initially, when we change the code, we need to stop the server using: ( ctrl + c ) and
restart with: node server. To make auto refresh:
    a. in console: npm install nodemon
    b. we can run: nodemon server, but this will set in global environment and most likely to cause technical difficulties, and to avoid it,
    c. run nodemon locally, by access file: package.json, and in object "scripts", add 
        "watch": "nodemon server",
    d. now in console: npm run watch
        This will make restarting server automatic after saving the code.
        We will not use: node server like before
5). To connect to mongoDB, we need: npm install mongodb
6). This part of server.js will solve the problem with duplication of html code in server.js and browser.js
duplication will make code maintaining hard, especially if you have multiple location to change the code
*/

//Requiring express npm package
let express = require('express')
//Requiring mongodb npm package
let mongodb = require('mongodb')
//requiring sanitize-html npm package
let sanitizeHTML = require('sanitize-html')

//myApp = express is a method to show that we use express.js
let myApp = express()

//Variable to catch dynamic port by Heroku / any app host
let port = process.env.PORT
//If somehow heroku fail to send the port, create fallback to another port
if (port == null || port == "") {
  port = 3000
}

//variable below will be used as container on "db" at mongodb.connect()
//"let" will have access to "block scope", if we declare variable inside block {}, it cannot be accessed outside of
//the block. after we refer it with inside the block of mongodb.connect(), we can use it anywhere in our code.
let db

//Using method: static() to give access to folder to be used in this code, in the folder we have folder named "public" containing "browser.js" file
myApp.use(express.static('public'))

//After install npm mongodb, we can now access method "connect"
//Connection string will be used as container for access to mongodb
//access mongodb atlas >> project >> cluster >> connect >> whitelist, add diff IP address and set to 0.0.0.0/0 (should allow incoming connection from any IP address, not security risk due to user and pass) >> create user id and pass >> connect app with node.js
let connectionString ='mongodb+srv://todoAppUser:Toshiba20@cluster0.ethf0.mongodb.net/todoApp?retryWrites=true&w=majority' 

//the mongodb.connect have 3 argument: mongodb.connect(a, b, c)
//arguments are:(a) connection string from mongodb, (c) function to run, (b) mongodb configuration properties
mongodb.connect(connectionString, {useNewUrlParser: true, useUnifiedTopology: true}, function(err, client) {
    //method: client.db(), to select our mongodb database
    db = client.db()
    //Method: listen() was placed at the end of the code, but replaced here as trigger for this function to run
    //listen(3000) was only used when we use port in localhost, when used in cloud, we need to catch
    //the dynamic port used by host, for this case, Heroku
    myApp.listen(port)
})

//This code is used for asynchronous request
myApp.use(express.json())

//Boilerplate from express used to access HTML element, see github udemy-JS-fullstack/experiment_express.js
myApp.use(express.urlencoded({extended: false}))

//Custom function to activate password protection
function passwordProtection(req, res, next) {
  //WWW-Authenticate response header defines the authentication method that should be used to gain access to a resource
  //syntax : WWW-Authenticate: <type> realm=<realm>, see: https://mzl.la/3avL48G
  res.set('www-Authenticate', 'Basic realm="Simple Todo App"')
  //How to set and get uid: "Basic" means encoding type, and to get the encryption, we test with console.log(req.headers.authorization)
  //For UID: user, and pass: user101, the basic encryption is : "Basic dXNlcjp1c2VyMTAx"
  if (req.headers.authorization == "Basic dXNlcjp1c2VyMTAx") {
    next()
  } else {
    res.status(401).send("Authentication required")
  }
}

//Initially we use passwordProtection on myApp.get(), but this only protect the login method.
//To protect the entire page, we use it in myApp.use()
//Also note, in express, method such as myApp.get(), myApp.post(), etc can use multiple argument.
myApp.use(passwordProtection)

//Create app.get to access our web app, using anonym function with req as user input and res as web respond
myApp.get('/', function(req, res) {
    //Testing use: res.send("welcome"), replaced with boilerplate from https://github.com/LearnWebCode/javascript/blob/master/01_Simple_App/template.html
    //For learning purpose only, we will mix the HTML code with server code as below, so we can edit as single file
    //Next app will separate HTML and server creating clean code
    
    //Now add db to catch data from mongodb, method: find() for read-filter data, method:toArray() to convert mongodb data into array to be used by JS
    //toArray() expecting function after data ready
    db.collection('items').find().toArray(function (err, viewItem) {
      //Testing use: console.log(viewItem), result >> [ { _id: 5fd6553789957024fce26c01, text: 'Beli Mie Goreng' }, ...]
      //To make HTML syntax able to get mongodb data, replace res.send() below this line, under toArray()
      res.send(`
    
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Simple To-Do App</title>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
    </head>
    <body>
      <div class="container">
        <h1 class="display-4 text-center py-1">To-Do App</h1>

        <div class="jumbotron p-3 shadow-sm">
          <form id="create-form" action="/create-item" method="POST">
            <div class="d-flex align-items-center">
              <input id="create-field" name="userInputItem" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
              <button class="btn btn-primary">Add New Item</button>
            </div>
          </form>
        </div>

        <ul id="item-list" class="list-group pb-5">
        </ul>

      </div>
    

    <script>
      let itemsHTML = ${JSON.stringify(viewItem)}
    </script>
  
    <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
    <script src="/browser.js"></script>
    </body>
    </html>

    `)
    })
})

//Accessing form in HTML element, with: action="/create-item" and method: "POST"
//First, under myApp.post, we test with: console.log to check input in console, and: res.send() to respond in web page 
//Second, to test, after stating express urlencoded, after function  use: console.log(req.body.userInputItem) to access user input inside console
myApp.post('/create-item', function (req, res) {
  //Now we use to variable to sanitize input text
  //argument:(a) what need to be sanitize, (b) options under object; allowedTags [] to not allow any HTML tags, allowedAttributes {} to not allow any JS attributes
  let sanitizedText = sanitizeHTML(req.body.newText, {allowedTags: [], allowedAttributes: {}})  
  
  //In the beginning, there is no variable "db" existed, and we need to set up ourselves
    //a variable represents Mongo DB database that we opened, and yes you can use other names rather than "db"
    db.collection('items').insertOne({text: sanitizedText}, function(err, info) {
        //for testing: res.send("Thanks for submitting the form")
        //Within the mongodb object, contain object named "ops" as json representation new document created, to look inside use array method
        res.json(info.ops[0])
    })
})

myApp.post('/update-item', function(req, res) {
  let sanitizedText = sanitizeHTML(req.body.text, {allowedTags: [], allowedAttributes: {}})
  
  //Testing: console.log(req.body.text); res.send("success")
  //Notes on console.log: If used in node environment, log will displayed in text editor terminal; if used in normal js environment, log will displayed in DevTools web browser
  //Working with db, method: findOneAndUpdate(); (a) document to update, (b) what to update, (c) function to work if data updated
  db.collection('items').findOneAndUpdate({_id: new mongodb.ObjectId(req.body.id)}, {$set: {text: sanitizedText}}, function() {
    res.send("Update success")
  })
})

myApp.post('/delete-item', function(req, res) {
  db.collection('items').deleteOne({_id: new mongodb.ObjectId(req.body.id)}, function() {
    res.send("Delete success")
  })
})