/**
 * ROCK & POESIA - Sistema de Inscrição de Bandas
 * Código completo e sem abreviações
 */

// --- 1. CONFIGURAÇÃO DE CONEXÃO COM O SUPABASE ---
const SUPABASE_URL = "https://hxbiexpadfaleozfywkh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ";

// Inicializa o cliente do banco de dados
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. VARIÁVEIS DE ESTADO ---
let listaDeIntegrantesDaBanda = [];

// --- 3. REFERÊNCIAS DOS ELEMENTOS DA PÁGINA ---
const formularioDeInscricao = document.getElementById("formInscricao");
const listaVisualDeIntegrantes = document.getElementById("listaVisual");
const selectEstiloMusical = document.getElementById("estilo_musical");
const wrapperCampoOutroEstilo = document.getElementById("wrapper_outro");
const inputOutroEstilo = document.getElementById("outro_estilo");
const botaoDeEnvioFinal = document.getElementById("btnEnviar");

// --- 4. LÓGICA DA TELA DE ABERTURA (SPLASH SCREEN) ---
document.addEventListener("DOMContentLoaded", function () {
    const elementoDaSplash = document.getElementById("splash");
    const elementoTextoBemVindo = document.getElementById("welcome-text");

    if (elementoDaSplash) {
        // Bloqueia a rolagem enquanto a animação acontece
        document.body.style.overflow = "hidden";

        // Exibe o texto após 2 segundos
        setTimeout(function () {
            if (elementoTextoBemVindo) {
                elementoTextoBemVindo.classList.remove("hidden");
                elementoTextoBemVindo.classList.add("show");
            }
        }, 2000);

        // Desaparece com a tela de splash após 5.5 segundos
        setTimeout(function () {
            elementoDaSplash.style.opacity = "0";
            setTimeout(function () {
                elementoDaSplash.style.display = "none";
                document.body.style.overflow = "auto";
            }, 1000);
        }, 5500);
    }
});

// --- 5. GERENCIAMENTO DE INTEGRANTES ---

// Função global para adicionar um membro à lista temporária
window.adicionarIntegrante = function () {
    const inputNomeMembro = document.getElementById("nome_membro");
    const selectFuncaoMembro = document.getElementById("funcao_membro");
    
    const nomeInformado = inputNomeMembro.value.trim();
    const funcaoSelecionada = selectFuncaoMembro.value;

    if (nomeInformado === "") {
        Swal.fire({
            icon: "warning",
            title: "Campo Vazio",
            text: "Por favor, digite o nome do integrante.",
            background: "#1e1e1e",
            color: "#ffffff"
        });
        return;
    }

    // Adiciona o objeto ao array
    listaDeIntegrantesDaBanda.push({
        nome_musico: nomeInformado,
        funcao: funcaoSelecionada
    });

    // Limpa o campo e foca para o próximo
    inputNomeMembro.value = "";
    inputNomeMembro.focus();

    // Atualiza a visualização na tela
    renderizarListaDeIntegrantes();
};

// Função para desenhar a lista na tela com o botão de remover (Lixeira)
function renderizarListaDeIntegrantes() {
    listaVisualDeIntegrantes.innerHTML = "";

    listaDeIntegrantesDaBanda.forEach(function (integrante, indice) {
        const itemDaLista = document.createElement("li");
        
        // Aqui a lixeira é mantida pois é necessária para correções na lista
        itemDaLista.innerHTML = `
            <span><strong>${integrante.nome_musico}</strong> - ${integrante.funcao}</span>
            <button type="button" onclick="removerIntegrante(${indice})" style="background: none; border: none; cursor: pointer; color: #e63946; font-size: 1.2rem;">
                🗑️
            </button>
        `;
        listaVisualDeIntegrantes.appendChild(itemDaLista);
    });
}

// Função global para remover um integrante específico
window.removerIntegrante = function (indice) {
    listaDeIntegrantesDaBanda.splice(indice, 1);
    renderizarListaDeIntegrantes();
};

// --- 6. CONTROLE DO CAMPO DE ESTILO MUSICAL ---
// Sem lixeira aqui, apenas lógica de exibição do campo "Outros"
selectEstiloMusical.addEventListener("change", function () {
    if (this.value === "Outros") {
        wrapperCampoOutroEstilo.style.display = "block";
        inputOutroEstilo.required = true;
    } else {
        wrapperCampoOutroEstilo.style.display = "none";
        inputOutroEstilo.required = false;
    }
});

// --- 7. ENVIO FINAL PARA O SUPABASE ---
formularioDeInscricao.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    // Validação: a banda precisa ter pelo menos um membro
    if (listaDeIntegrantesDaBanda.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Lista Vazia",
            text: "Adicione pelo menos um integrante à sua banda antes de enviar."
        });
        return;
    }

    // Desativa o botão para evitar múltiplos cliques
    botaoDeEnvioFinal.disabled = true;
    botaoDeEnvioFinal.innerText = "PROCESSANDO... 🤘";

    const dadosDoFormulario = new FormData(formularioDeInscricao);
    
    // Define qual estilo salvar (o selecionado ou o digitado em "Outros")
    let estiloMusicalFinal = dadosDoFormulario.get("estilo_musical");
    if (estiloMusicalFinal === "Outros") {
        estiloMusicalFinal = inputOutroEstilo.value;
    }

    try {
        // PASSO 1: Salvar os dados da Banda
        const { data: bandaCriada, error: erroBanda } = await _supabase
            .from("bandas")
            .insert([{
                nome_banda: dadosDoFormulario.get("nome_banda"),
                estilo_musical: estiloMusicalFinal,
                whatsapp: dadosDoFormulario.get("whatsapp"),
                instagram: dadosDoFormulario.get("instagram")
            }])
            .select()
            .single();

        if (erroBanda) throw erroBanda;

        // PASSO 2: Preparar e salvar os Integrantes vinculados ao ID da banda
        const listaParaInserir = listaDeIntegrantesDaBanda.map(function (integrante) {
            return {
                banda_id: bandaCriada.id,
                nome_musico: integrante.nome_musico,
                funcao: integrante.funcao
            };
        });

        const { error: erroIntegrantes } = await _supabase
            .from("integrantes")
            .insert(listaParaInserir);

        if (erroIntegrantes) throw erroIntegrantes;

        // SUCESSO
        Swal.fire({
            icon: "success",
            title: "🤘 INSCRIÇÃO REALIZADA!",
            text: "Sua banda está oficialmente inscrita no Rock & Poesia.",
            background: "#1e1e1e",
            color: "#ffffff"
        }).then(function () {
            // Recarrega a página ou redireciona
            window.location.reload();
        });

    } catch (erro) {
        console.error("Erro durante o processo:", erro);
        Swal.fire({
            icon: "error",
            title: "Falha no Envio",
            text: "Ocorreu um erro ao salvar: " + erro.message
        });
        botaoDeEnvioFinal.disabled = false;
        botaoDeEnvioFinal.innerText = "ENVIAR INSCRIÇÃO 🤘";
    }
});