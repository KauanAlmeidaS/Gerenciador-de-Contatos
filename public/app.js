document.addEventListener('DOMContentLoaded', function() {
    const formAdicionarContato = document.getElementById('form-adicionar-contato');
    const listaContatos = document.getElementById('lista-contatos');
    let contatos = []; 
      
    carregarContatos();

    formAdicionarContato.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const nome = document.getElementById('nome').value;
        const telefone = document.getElementById('telefone').value;
        const email = document.getElementById('email').value;

        if (existeContatoComEmail(email)) {
            alert('Já existe um contato com este email. Não é possível adicionar novamente.');
            return;
        }

        const novoContato = { nome, telefone, email };

        adicionarContato(novoContato);
    });

    function carregarContatos() {
        fetch('/contatos')
            .then(response => response.json())
            .then(data => {
                contatos = data;
                mostrarContatos(contatos);
            })
            .catch(error => {
                console.error('Erro ao carregar contatos:', error);
                alert('Erro ao carregar contatos. Verifique o console para mais detalhes.');
            });
    }

    function adicionarContato(contato) {
        fetch('/contatos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contato)
        })
        .then(response => response.json())
        .then(contatoAdicionado => {
            alert('Contato adicionado com sucesso!');
            carregarContatos();
            formAdicionarContato.reset();
        })
        .catch(error => {
            console.error('Erro ao adicionar contato:', error);
            alert('Erro ao adicionar contato. Verifique o console para mais detalhes.');
        });
    }

    function mostrarContatos(contatos) {
        listaContatos.innerHTML = '';

        contatos.forEach(contato => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${contato.nome}</h3>
                <p>Telefone: ${contato.telefone}</p>
                <p>Email: ${contato.email}</p>
                <button onclick="deletarContato(${contato.id})">Deletar</button>
                <button onclick="preencherFormularioAtualizar(${contato.id}, '${contato.nome}', '${contato.telefone}', '${contato.email}')">Atualizar</button>
            `;
            listaContatos.appendChild(li);
        });
    }

    window.deletarContato = function(id) {
        fetch(`/contatos/${id}`, { method: 'DELETE' })
        .then(() => {
            alert('Contato deletado com sucesso!');
            carregarContatos();
        })
        .catch(error => {
            console.error('Erro ao deletar contato:', error);
            alert('Erro ao deletar contato. Verifique o console para mais detalhes.');
        });
    };

    window.preencherFormularioAtualizar = function(id, nome, telefone, email) {
        document.getElementById('nome').value = nome;
        document.getElementById('telefone').value = telefone;
        document.getElementById('email').value = email;

        formAdicionarContato.onsubmit = function(event) {
            event.preventDefault();
            atualizarContato(id, { nome, telefone, email });
        };
    };

    function atualizarContato(id, contato) {
        fetch(`/contatos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contato)
        })
        .then(response => response.json())
        .then(contatoAtualizado => {
            alert('Contato atualizado com sucesso!');
            carregarContatos();
            formAdicionarContato.reset();
            formAdicionarContato.onsubmit = adicionarContato;
        })
        .catch(error => {
            console.error('Erro ao atualizar contato:', error);
            alert('Erro ao atualizar contato. Verifique o console para mais detalhes.');
        });
    }

    function existeContatoComEmail(email) {
        return contatos.some(contato => contato.email === email);
    }
});
