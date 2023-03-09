const express = require("express");
//const fetch = require("node-fetch");
//import { nodeSDKBuilder } from "./nodeSDK";
var app;

app = express();
//nodeSDKBuilder().then(() => {});

app.listen(process.env.APP_PORT || 3001, () => {
  console.log("rodou na porta", process.env.APP_PORT || 3001);
});
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  res.send("hello world");
});

// app.get("/route", async function (req, res) {
//   const cep = await fetch("https://viacep.com.br/ws/41320010/json").then(
//     (data) => data.json()
//   );
//   res.send({ cep: cep });
// });
