"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const app = express()
    .use(bodyParser.json());
app.listen(8080, () => {
    console.log('WebFarm listening on port 8080');
});
