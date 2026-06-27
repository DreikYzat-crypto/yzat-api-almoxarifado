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
            msg.innerText = dados.mensagem || "Usuário cadastrado com sucesso!";

            document.getElementById("nome").value = "";
            document.getElementById("usuario").value = "";
            document.getElementById("senha").value = "";
            document.getElementById("cargo").value = "almoxarife";

            carregarUsuarios();
        } else {
            msg.style.color = "#ef4444";
            msg.innerText = dados.mensagem || "Erro ao cadastrar usuário.";
        }

    } catch (erro) {
        msg.style.color = "#ef4444";
        msg.innerText = "Erro ao conectar com o servidor.";
    }
}

async function carregarUsuarios() {
    try {
        const resposta = await fetch(`${API}/usuarios`);
        const usuarios = await resposta.json();

        const lista = document.getElementById("listaUsuarios");
        lista.innerHTML = "";

        if (usuarios.length === 0) {
            lista.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
            return;
        }

        usuarios.forEach(user => {
            lista.innerHTML += `
                <div style="background:#1e293b;padding:15px;margin-top:10px;border-radius:10px;">
                    <b>${user.nome}</b><br>
                    Usuário: ${user.usuario}<br>
                    Cargo: ${user.cargo}<br>
                    Status: ${user.ativo ? "🟢 Ativo" : "🔴 Inativo"}
                    <br><br>

                    <button onclick="editarUsuario(${user.id})">
                        ✏️ Editar
                    </button>

                    <button onclick="alterarStatus(${user.id})">
                        ${user.ativo ? "🔴 Desativar" : "🟢 Ativar"}
                    </button>

                    <button onclick="excluirUsuario(${user.id})">
                        🗑 Excluir
                    </button>
                </div>
            `;
        });

    } catch (erro) {
        const lista = document.getElementById("listaUsuarios");
        lista.innerHTML = "<p>Erro ao carregar usuários.</p>";
    }
}

async function excluirUsuario(id) {
    if (!confirm("Deseja realmente excluir este usuário?")) {
        return;
    }

    try {
        const resposta = await fetch(`${API}/usuarios/${id}`, {
            method: "DELETE"
        });

        const dados = await resposta.json();

        alert(dados.mensagem || "Usuário excluído.");

        carregarUsuarios();

    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function alterarStatus(id) {
    try {
        const resposta = await fetch(`${API}/usuarios/${id}/status`, {
            method: "PUT"
        });

        const dados = await resposta.json();

        alert(dados.mensagem);

        carregarUsuarios();

    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

async function editarUsuario(id) {
    const nome = prompt("Novo nome:");
    if (nome === null) return;

    const usuario = prompt("Novo usuário:");
    if (usuario === null) return;

    const cargo = prompt("Cargo (admin, supervisor ou almoxarife):");
    if (cargo === null) return;

    try {
        const resposta = await fetch(`${API}/usuarios/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome.trim(),
                usuario: usuario.trim(),
                cargo: cargo.trim()
            })
        });

        const dados = await resposta.json();

        if (resposta.ok) {
            alert(dados.mensagem || "Usuário atualizado com sucesso.");
            carregarUsuarios();
        } else {
            alert(dados.mensagem || "Erro ao editar usuário.");
        }

    } catch (erro) {
        alert("Erro ao conectar com o servidor.");
    }
}

carregarUsuarios();