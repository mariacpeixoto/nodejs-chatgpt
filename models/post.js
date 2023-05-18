const db = require("./banco");

const Produtos = db.sequelize.define("produtos", {
  produto: {
    type: db.Sequelize.STRING,
  },
  marca: {
    type: db.Sequelize.STRING,
  },
  modelo: {
    type: db.Sequelize.STRING,
  },
  descricao: {
    type: db.Sequelize.TEXT,
  },
  palavras_chave: {
    type: db.Sequelize.TEXT,
  },
});

//Produtos.sync({force: true})

module.exports = Produtos;
