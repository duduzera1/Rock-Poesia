// Configurações do Supabase
const SUPABASE_URL = 'https://hxbiexpadfaleozfywkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- VARIÁVEIS DE CONTROLE ---
let listaMembros = [];
let editandoIndex = null;

// --- ELEMENTOS DA INTERFACE ---
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

// --- 1. LÓGICA DO ESTILO MUSICAL (EDITAR/EXCLUIR) ---

// Mostrar/Esconder campo customizado
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

// Botão de Excluir Seleção (🗑️ ao lado do Select)
document.getElementById('btnResetEstilo').addEventListener('click', () => {
    selectEstilo.value = "";
    wrapperOutro.style.display = 'none';
    inputOutro.value = "";
    inputOutro.required = false;
});

// Botão de Apagar Texto (🗑️ ao lado do campo Outros)
document.getElementById('btnDelOutro').addEventListener('click', () => {
    inputOutro.value = "";
    inputOutro.focus();
});

// Botão de Editar Texto (✏️ ao lado do campo Outros)
document.getElementById('btnEditOutro').addEventListener('click', () => {
    inputOutro.focus();
});


// --- 2. LÓGICA DOS INTEGRANTES (ADD / EDIT / DEL) ---

function renderizarLista() {
    listaVisual.innerHTML = "";
    listaMembros.forEach((membro, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <strong>${membro.nome_musico}</strong>
                <small>(${membro.funcao})</small>
            </div>
            <div class="acoes-lista">
                <button type="button" class="btn-acao" onclick="prepararEdicao(${index})">✏️</button>
                <button type="button" class="btn-acao" onclick="removerMembro(${index})">🗑️</button>
            </div>
        `;
        listaVisual.appendChild(li);
    });
}

// Adicionar ou Salvar Edição
btnAddMembro.addEventListener('click', () => {
    const nome = inputNomeMembro.value.trim();
    const funcao = selectFuncaoMembro.value;

    if (!nome) {
        alert("Por favor, digite o nome do músico.");
        return;
    }

    if (editandoIndex !== null) {
        // Modo Edição
        listaMembros[editandoIndex] = { nome_musico: nome, funcao: funcao };
        editandoIndex = null;
        btnAddMembro.innerText = "ADD";
    } else {
        // Modo Inserção
        listaMembros.push({ nome_musico: nome, funcao: funcao });
    }

    inputNomeMembro.value = "";
    renderizarLista();
});

// Funções Globais para a Lista
window.removerMembro = (index) => {
    listaMembros.splice(index, 1);
    renderizarLista();
};

window.prepararEdicao = (index) => {
    const m = listaMembros[index];
    inputNomeMembro.value = m.nome_musico;
    selectFuncaoMembro.value = m.funcao;
    editandoIndex = index;
    btnAddMembro.innerText = "SALVAR";
    inputNomeMembro.focus();
};


// --- 3. ENVIO FINAL PARA O SUPABASE ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (listaMembros.length === 0) {
        alert("A banda precisa de pelo menos um integrante!");
        return;
    }

    btnEnviar.disabled = true;
    btnEnviar.innerText = "🤘 ENVIANDO...";

    const formData = new FormData(form);
    
    // Define o estilo musical final
    let estiloFinal = formData.get('estilo_musical');
    if (estiloFinal === 'Outros') {
        estiloFinal = formData.get('outro_estilo');
    }

    // A. Salvar a Banda
    const { data: banda, error: errBanda } = await _supabase
        .from('bandas')
        .insert([{
            nome_banda: formData.get('nome_banda'),
            estilo_musical: estiloFinal,
            whatsapp: formData.get('whatsapp'),
            instagram: formData.get('instagram')
        }])
        .select().single();

    if (errBanda) {
        statusMsg.innerHTML = `<span style="color: var(--primary)">Erro na banda: ${errBanda.message}</span>`;
        btnEnviar.disabled = false;
        btnEnviar.innerText = "TENTAR NOVAMENTE";
        return;
    }

    // B. Salvar Integrantes com o ID da banda criada
    const membrosComId = listaMembros.map(m => ({
        banda_id: banda.id,
        nome_musico: m.nome_musico,
        funcao: m.funcao
    }));

    const { error: errMembros } = await _supabase
        .from('integrantes')
        .insert(membrosComId);

    if (errMembros) {
        console.error("Erro nos integrantes:", errMembros);
        statusMsg.innerHTML = `<span style="color: orange">Banda salva, mas erro ao registrar músicos.</span>`;
    } else {
        statusMsg.innerHTML = `<span style="color: var(--success)">🤘 INSCRIÇÃO CONCLUÍDA COM SUCESSO!</span>`;
        // Limpeza Total
        form.reset();
        listaMembros = [];
        renderizarLista();
        wrapperOutro.style.display = 'none';
    }

    btnEnviar.disabled = false;
    btnEnviar.innerText = "ENVIAR INSCRIÇÃO 🤘";
});