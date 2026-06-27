const API = "https://yzat-almoxarifado.onrender.com";

async function criarUsuario() {
    const nome = document.getElementById("nome").value.trim();
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const cargo = document.getElementById("cargo").value;
    const msg = document.getElementById("msg");

    msg.innerText = "";

    try {
        const resposta = await fetch(`${API}/usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome,
                usuario,
                senha,
                cargo
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            msg.style.color = "#22c55e";
            msg.innerText = "Usuário cadastrado com sucesso!";

            document.getElementById("nome").value = "";
            document.getElementById("usuario").value = "";
            document.getElementById("senha").value = "";
            document.getElementById("cargo").value = "almoxarife";
        } else {
            msg.style.color = "#ef4444";
            msg.innerText = dados.mensagem;
        }

    } catch (erro) {
        msg.style.color = "#ef4444";
        msg.innerText = "Erro ao conectar com o servidor.";
    }
}