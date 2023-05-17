const express = require("express");
const app = express();
const handlebars = require("express-handlebars").engine;
const bodyParser = require("body-parser");
const post = require("./models/post");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/", function (req, res) {
  res.render("Formulario");
});
app.get("/consulta", function (req, res) {
  post
    .findAll()
    .then(function (post) {
      res.render("Consulta", { post });
    })
    .catch(function (erro) {
      console.log("Erro ao carregar os dados do banco: " + erro);
    });
});

app.post("/cadastrar", async function (req, res) {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  const messages = [];
  try {
    const { produto, marca, modelo } = req.body;
    const response = `O produto ${produto}, da marca ${marca}, modelo ${modelo}, possui a seguinte descrição:`;
    messages.push({ role: "user", content: response });

    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });

    const descricao = completion.data.choices[0].message.content;
    const palavra_chave = descricao
      .replace(/[^\w\s]|_/g, "")
      .replace(/\d+/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2)
      .slice(0, 100)
      .join(", ");

    post
      .create({
        produto,
        marca,
        modelo,
        descricao,
        palavra_chave,
      })
      .then(function () {
        res.redirect("/consulta");
      })
      .catch(function (erro) {
        res.send("Falha ao cadastrar os dados: " + erro);
      });
  } catch (error) {
    console.error(error);
  }
});

app.listen(8081, function () {
  console.log("Servidor ativo!");
});
