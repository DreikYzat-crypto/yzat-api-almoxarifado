const pool = require("./database");

async function criarTabelas() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS produtos (
                id SERIAL PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                quantidade INTEGER NOT NULL DEFAULT 0,
                localizacao VARCHAR(100) NOT NULL
            );
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS historico (
                id SERIAL PRIMARY KEY,
                tipo VARCHAR(50) NOT NULL,
                descricao TEXT NOT NULL,
                data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("✅ Tabelas criadas com sucesso!");
        process.exit();
    } catch (erro) {
        console.error("❌ Erro ao criar tabelas:", erro);
        process.exit(1);
    }
}

criarTabelas();