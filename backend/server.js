const express = require("express");
const cors = require("cors");
const pool = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function formatarData(data) {
    return new Date(data).toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo"
    });
}

async function registrarHistorico(tipo, descricao) {
    await pool.query(
        "INSERT INTO historico (tipo, descricao) VALUES ($1, $2)",
        [tipo, descricao]
    );
}

app.get("/", (req, res) => {
    res.json({
        mensagem: "API YZAT Almoxarifado com PostgreSQL funcionando 🚀",
        versao: "3.0"
    });
});

app.get("/produtos", async (req, res) => {
    const resultado = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(resultado.rows);
});

app.post("/produtos", async (req, res) => {
    const { nome, quantidade, localizacao } = req.body;

    const resultado = await pool.query(
        "INSERT INTO produtos (nome, quantidade, localizacao) VALUES ($1, $2, $3) RETURNING *",
        [nome, quantidade, localizacao]
    );

    const produto = resultado.rows[0];

    await registrarHistorico(
        "cadastro",
        `Produto cadastrado: ${produto.nome} | Quantidade: ${produto.quantidade} | Localização: ${produto.localizacao}`
    );

    res.status(201).json({
        mensagem: "Produto cadastrado com sucesso",
        produto
    });
});

app.put("/produtos/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { nome, quantidade, localizacao } = req.body;

    const existe = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [id]
    );

    if (existe.rows.length === 0) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    const resultado = await pool.query(
        `
        UPDATE produtos
        SET nome = $1, quantidade = $2, localizacao = $3
        WHERE id = $4
        RETURNING *
        `,
        [nome, quantidade, localizacao, id]
    );

    const produto = resultado.rows[0];

    await registrarHistorico(
        "edicao",
        `Produto editado: ${produto.nome} | Quantidade: ${produto.quantidade} | Localização: ${produto.localizacao}`
    );

    res.json({
        mensagem: "Produto atualizado",
        produto
    });
});

app.put("/produtos/entrada/:id", async (req, res) => {
    const id = Number(req.params.id);
    const quantidade = Number(req.body.quantidade);

    const existe = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [id]
    );

    if (existe.rows.length === 0) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    const produtoAtual = existe.rows[0];
    const novaQuantidade = Number(produtoAtual.quantidade) + quantidade;

    const resultado = await pool.query(
        "UPDATE produtos SET quantidade = $1 WHERE id = $2 RETURNING *",
        [novaQuantidade, id]
    );

    const produto = resultado.rows[0];

    await registrarHistorico(
        "entrada",
        `Entrada de ${quantidade} unidade(s) em ${produto.nome}. Estoque atual: ${produto.quantidade}`
    );

    res.json({
        mensagem: "Entrada registrada",
        produto
    });
});

app.put("/produtos/saida/:id", async (req, res) => {
    const id = Number(req.params.id);
    const quantidade = Number(req.body.quantidade);

    const existe = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [id]
    );

    if (existe.rows.length === 0) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    const produtoAtual = existe.rows[0];

    if (Number(produtoAtual.quantidade) < quantidade) {
        return res.status(400).json({
            mensagem: "Estoque insuficiente"
        });
    }

    const novaQuantidade = Number(produtoAtual.quantidade) - quantidade;

    const resultado = await pool.query(
        "UPDATE produtos SET quantidade = $1 WHERE id = $2 RETURNING *",
        [novaQuantidade, id]
    );

    const produto = resultado.rows[0];

    await registrarHistorico(
        "saida",
        `Saída de ${quantidade} unidade(s) em ${produto.nome}. Estoque atual: ${produto.quantidade}`
    );

    res.json({
        mensagem: "Saída registrada",
        produto
    });
});

app.delete("/produtos/:id", async (req, res) => {
    const id = Number(req.params.id);

    const resultado = await pool.query(
        "DELETE FROM produtos WHERE id = $1 RETURNING *",
        [id]
    );

    if (resultado.rows.length === 0) {
        return res.status(404).json({
            mensagem: "Produto não encontrado"
        });
    }

    const produto = resultado.rows[0];

    await registrarHistorico(
        "exclusao",
        `Produto excluído: ${produto.nome} | Quantidade: ${produto.quantidade} | Localização: ${produto.localizacao}`
    );

    res.json({
        mensagem: "Produto removido",
        produto
    });
});

app.get("/historico", async (req, res) => {
    const resultado = await pool.query(`
        SELECT
            id,
            tipo,
            descricao,
            data
        FROM historico
        ORDER BY id DESC
    `);

    const historico = resultado.rows.map(item => ({
        ...item,
        data: formatarData(item.data)
    }));

    res.json(historico);
});

app.listen(PORT, () => {
    console.log(`Servidor PostgreSQL rodando na porta ${PORT}`);
});