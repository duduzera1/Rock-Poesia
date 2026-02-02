/**
 * ROCK & POESIA - Sistema de Inscrição de Bandas
 * Configurações de Integração com Supabase
 */

const SUPABASE_URL = 'https://hxbiexpadfaleozfywkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- ESTADO GLOBAL DA APLICAÇÃO ---
let listaMembros = [];
let editandoIndex = null;

// --- SELEÇÃO DE ELEMENTOS DO DOM ---
const form = document.getElementById('formInscricao');
const inputNomeMembro = document.getElementById('nome_membro');
const selectFuncaoMembro = document.getElementById('funcao_membro');
const btnAddMembro = document.getElementById('btnAddMembro');
const listaVisual = document.getElementById('listaVisual');
const selectEstilo = document.getElementById('estilo_musical');
const wrapperOutro = document.getElementById('wrapper_outro');
const inputOutro = document.getElementById('outro_estilo');
const statusMsg = document.getElementById('status');
const btnEnviar = document.getElementById('btnEnviar');
const inputWhatsApp = document.querySelector('input[name="whatsapp"]');

// --- MÁSCARA PARA WHATSAPP (Formata enquanto digita) ---
inputWhatsApp.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
    } else {
        value = value.replace(/^(\d*)/, "($1");
    }
    e.target.value = value;
});

// --- LÓGICA DO CAMPO "OUTROS" NO ESTILO MUSICAL ---
selectEstilo.addEventListener('change', function() {
    if (this.value === 'Outros') {
        wrapperOutro.style.display = 'block';
        inputOutro.required = true;
        inputOutro.focus();
    } else {
        wrapperOutro.style.display = 'none';
        inputOutro.required = false;
        inputOutro.value = "";
    }
});

// --- GERENCIAMENTO DE INTEGRANTES ---

function atualizarListaVisual() {
    listaVisual.innerHTML = "";
    
    if (listaMembros.length === 0) {
        listaVisual.innerHTML = "<li style='border:none; color:#666; justify-content:center;'>Nenhum integrante adicionado.</li>";
        return;
    }

    listaMembros.forEach((membro, index) => {
        const li = document.createElement('li');
        
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `<strong>${membro.nome_musico}</strong> <br> <small style="color:var(--primary)">${membro.funcao}</small>`;
        
        const acoesDiv = document.createElement('div');
        acoesDiv.className = "acoes-lista";
        acoesDiv.style.display = "flex";
        acoesDiv.style.gap = "10px";

        const btnEdit = document.createElement('button');
        btnEdit.type = "button";
        btnEdit.className = "btn-acao";
        btnEdit.innerHTML = "✏️";
        btnEdit.onclick = () => prepararEdicao(index);

        const btnDel = document.createElement('button');
        btnDel.type = "button";
        btnDel.className = "btn-acao";
        btnDel.innerHTML = "🗑️";
        btnDel.onclick = () => removerMembro(index);

        acoesDiv.appendChild(btnEdit);
        acoesDiv.appendChild(btnDel);
        
        li.appendChild(infoDiv);
        li.appendChild(acoesDiv);
        listaVisual.appendChild(li);
    });
}

btnAddMembro.addEventListener('click', () => {
    const nome = inputNomeMembro.value.trim();
    const funcao = selectFuncaoMembro.value;

    if (!nome) {
        alert("Por favor, digite o nome do integrante.");
        inputNomeMembro.focus();
        return;
    }

    if (editandoIndex !== null) {
        // Modo Edição
        listaMembros[editandoIndex] = { nome_musico: nome, funcao: funcao };
        editandoIndex = null;
        btnAddMembro.innerText = "ADD";
        btnAddMembro.style.backgroundColor = "";
    } else {
        // Modo Adição
        listaMembros.push({ nome_musico: nome, funcao: funcao });
    }

    inputNomeMembro.value = "";
    inputNomeMembro.focus();
    atualizarListaVisual();
});

function removerMembro(index) {
    if (confirm(`Remover ${listaMembros[index].nome_musico}?`)) {
        listaMembros.splice(index, 1);
        atualizarListaVisual();
    }
}

function prepararEdicao(index) {
    const membro = listaMembros[index];
    inputNomeMembro.value = membro.nome_musico;
    selectFuncaoMembro.value = membro.funcao;
    editandoIndex = index;
    
    btnAddMembro.innerText = "SALVAR";
    btnAddMembro.style.backgroundColor = "#2a9d8f";
    inputNomeMembro.focus();
}

// --- ENVIO DO FORMULÁRIO PARA O SUPABASE ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validação de Integrantes
    if (listaMembros.length === 0) {
        alert("A banda precisa de pelo menos um integrante!");
        return;
    }

    // Bloqueio do botão para evitar cliques duplicados
    btnEnviar.disabled = true;
    btnEnviar.innerText = "🤘 PROCESSANDO INSCRIÇÃO...";
    statusMsg.innerHTML = "Aguarde, enviando dados...";
    statusMsg.className = "";

    const formData = new FormData(form);
    
    // Define o estilo musical final (tratando o campo "Outros")
    let estiloSelecionado = formData.get('estilo_musical');
    if (estiloSelecionado === 'Outros') {
        estiloSelecionado = formData.get('outro_estilo');
    }

    try {
        // 1. Inserir a Banda
        const { data: bandaInserida, error: erroBanda } = await _supabase
            .from('bandas')
            .insert([{
                nome_banda: formData.get('nome_banda'),
                estilo_musical: estiloSelecionado,
                possui_autorais: formData.get('possui_autorais'),
                videos_banda: formData.get('videos_banda'),
                redes_sociais: formData.get('redes_sociais'),
                whatsapp: formData.get('whatsapp')
            }])
            .select()
            .single();

        if (erroBanda) throw erroBanda;

        // 2. Inserir Integrantes vinculados ao ID da banda
        const membrosComVinculo = listaMembros.map(m => ({
            banda_id: bandaInserida.id,
            nome_musico: m.nome_musico,
            funcao: m.funcao
        }));

        const { error: erroMembros } = await _supabase
            .from('integrantes')
            .insert(membrosComVinculo);

        if (erroMembros) throw erroMembros;

        // Sucesso Total
        statusMsg.innerHTML = "<span class='success-msg'>🤘 INSCRIÇÃO REALIZADA COM SUCESSO!</span>";
        form.reset();
        listaMembros = [];
        atualizarListaVisual();
        wrapperOutro.style.display = 'none';

        // Scroll para o topo para ver a mensagem
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("Erro no envio:", error);
        statusMsg.innerHTML = `<span class='error-msg'>Erro: ${error.message}</span>`;
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerText = "ENVIAR INSCRIÇÃO 🤘";
    }
});

// Inicializa a lista vazia no carregamento
atualizarListaVisual();