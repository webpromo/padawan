
import { Meteor } from 'meteor/meteor';  
import { WebApp } from 'meteor/webapp';  
// var express = require('express');

import express from 'express';

export function setupApi() {  
  var app = express();

  var port = 8080;

  console.log("####  Got to here  ######")
  
  app.get('/auth', (req, res) => {
    res.status(200).json({ message: 'Hello World!!!'});
  });

  WebApp.connectHandlers.use(app);

  // app.listen(port);
}

