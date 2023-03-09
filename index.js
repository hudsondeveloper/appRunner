import express from "express";
import fetch from "node-fetch";
var app = express();

app.listen(process.env.APP_PORT, () => {
  console.log("rodou na porta", process.env.APP_PORT);
});
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  res.send("hello world");
});

app.get("/route", async function (req, res) {
  const cep = await fetch("https://viacep.com.br/ws/41320010/json").then(
    (data) => data.json()
  );
  res.send({ cep: cep });
});
