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

  const messagesDescricao = [];
  try {
    const { produto, marca, modelo } = req.body;
    const responseD = `O produto ${produto}, da marca ${marca}, modelo ${modelo}, possui a seguinte descrição:`;
    messagesDescricao.push({ role: "user", content: responseD });

    const completionD = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messagesDescricao,
    });

    const descricao = completionD.data.choices[0].message.content;

    const messagesPalavras = [];
    const responseP = `Preciso de 100 palavras-chave individuais sem repetições, em letras minusculas e separadas apenas por vírgula para essa descrição: ${descricao}`;
    messagesPalavras.push({ role: "user", content: responseP });

    const completionP = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messagesPalavras,
    });
    const palavras_chave = completionP.data.choices[0].message.content;

    post
      .create({
        produto,
        marca,
        modelo,
        descricao,
        palavras_chave,
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
