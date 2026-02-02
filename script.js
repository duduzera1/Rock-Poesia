/**
 * ROCK & POESIA - Sistema de Inscrição de Bandas
 * Código revisado para eliminar conflitos de mesclagem (merge conflicts)
 */

// --- 1. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS SUPABASE ---
// As chaves de acesso permitem que o site salve informações no banco de dados na nuvem.
const SUPABASE_URL = "https://hxbiexpadfaleozfywkh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ";

// Inicializa o cliente do Supabase para operações de inserção e consulta.
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. ESTADO GLOBAL DA APLICAÇÃO ---
// Armazenamos os integrantes em um array antes de enviar tudo de uma vez para o banco.
let listaDeIntegrantesDaBanda = [];
let indiceParaEdicao = null;

// --- 3. SELEÇÃO DE ELEMENTOS DO DOCUMENTO (DOM) ---
const formularioDeInscricao = document.getElementById("formInscricao");
const inputNomeDoMusico = document.getElementById("nome_membro");
const selectFuncaoDoMusico = document.getElementById("funcao_membro");
const botaoAdicionarIntegrante = document.getElementById("btnAddMembro");
const listaVisualDeIntegrantes = document.getElementById("listaVisual");
const selectEstiloMusical = document.getElementById("estilo_musical");
const wrapperCampoOutroEstilo = document.getElementById("wrapper_outro");
const inputOutroEstilo = document.getElementById("outro_estilo");
const botaoDeEnvioFinal = document.getElementById("btnEnviar");
const inputWhatsApp = document.querySelector('input[name="whatsapp"]');

// --- 4. TELA DE ABERTURA (SPLASH SCREEN) ---
// Controla a animação inicial que aparece ao carregar o site.
document.addEventListener("DOMContentLoaded", function () {
    const elementoDaSplash = document.getElementById("splash");
    const elementoTextoBemVindo = document.getElementById("welcome-text");
    const elementoConteudoPrincipal = document.getElementById("main-content");

    if (elementoDaSplash) {
        document.body.classList.add("no-scroll");

        // Exibe o texto de boas-vindas após 2 segundos de carregamento.
        setTimeout(function () {
            if (elementoTextoBemVindo) {
                elementoTextoBemVindo.classList.remove("hidden");
                setTimeout(function () {
                    elementoTextoBemVindo.classList.add("show");
                }, 100);
            }
        }, 2000);

        // Remove a tela de abertura e libera o site após 5,5 segundos.
        setTimeout(function () {
            elementoDaSplash.style.opacity = "0";
            setTimeout(function () {
                elementoDaSplash.style.display = "none";
                if (elementoConteudoPrincipal) {
                    elementoConteudoPrincipal.style.display = "block";
                }
                document.body.classList.remove("no-scroll");
            }, 1000);
        }, 5500);
    }
});

// --- 5. FORMATAÇÃO AUTOMÁTICA DO WHATSAPP ---
if (inputWhatsApp) {
    inputWhatsApp.addEventListener("input", function (evento) {
        let valorApenasNumeros = evento.target.value.replace(/\D/g, "");
        if (valorApenasNumeros.length > 11) {
            valorApenasNumeros = valorApenasNumeros.slice(0, 11);
        }
        
        if (valorApenasNumeros.length > 10) {
            valorApenasNumeros = valorApenasNumeros.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
        } else if (valorApenasNumeros.length > 6) {
            valorApenasNumeros = valorApenasNumeros.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
        } else if (valorApenasNumeros.length > 2) {
            valorApenasNumeros = valorApenasNumeros.replace(/^(\d{2})(\d{0,5})/, "($1) $2");
        } else {
            valorApenasNumeros = valorApenasNumeros.replace(/^(\d*)/, "($1");
        }
        evento.target.value = valorApenasNumeros;
    });
}

// --- 6. GERENCIAMENTO DA LISTA DE INTEGRANTES ---

botaoAdicionarIntegrante.addEventListener("click", function () {
    const nomeDigitado = inputNomeDoMusico.value.trim();
    const funcaoEscolhida = selectFuncaoDoMusico.value;

    if (nomeDigitado === "") {
        Swal.fire({
            icon: "warning",
            title: "Campo Obrigatório",
            text: "Por favor, digite o nome do integrante da banda.",
            background: "#1e1e1e",
            color: "#ffffff"
        });
        return;
    }

    if (indiceParaEdicao !== null) {
        // Atualiza os dados de um integrante que já estava na lista.
        listaDeIntegrantesDaBanda[indiceParaEdicao] = { 
            nome_musico: nomeDigitado, 
            funcao: funcaoEscolhida 
        };
        indiceParaEdicao = null;
        botaoAdicionarIntegrante.innerText = "ADD";
    } else {
        // Insere um novo integrante no final da lista.
        listaDeIntegrantesDaBanda.push({ 
            nome_musico: nomeDigitado, 
            funcao: funcaoEscolhida 
        });
    }

    inputNomeDoMusico.value = "";
    inputNomeDoMusico.focus();
    renderizarListaDeIntegrantesNaTela();
});

function renderizarListaDeIntegrantesNaTela() {
    listaVisualDeIntegrantes.innerHTML = "";
    
    listaDeIntegrantesDaBanda.forEach(function (integrante, indice) {
        const itemDaLista = document.createElement("li");
        itemDaLista.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                <span><strong>${integrante.nome_musico}</strong> - ${integrante.funcao}</span>
                <div>
                    <button type="button" onclick="prepararEdicao(${indice})" style="background: none; border: none; cursor: pointer;">✏️</button>
                    <button type="button" onclick="removerIntegrante(${indice})" style="background: none; border: none; cursor: pointer; color: #e63946;">🗑️</button>
                </div>
            </div>
        `;
        listaVisualDeIntegrantes.appendChild(itemDaLista);
    });
}

// Funções globais para permitir o uso em atributos onclick
window.removerIntegrante = function (indice) {
    listaDeIntegrantesDaBanda.splice(indice, 1);
    renderizarListaDeIntegrantesNaTela();
};

window.prepararEdicao = function (indice) {
    const integrante = listaDeIntegrantesDaBanda[indice];
    inputNomeDoMusico.value = integrante.nome_musico;
    selectFuncaoDoMusico.value = integrante.funcao;
    indiceParaEdicao = indice;
    botaoAdicionarIntegrante.innerText = "SALVAR";
    inputNomeDoMusico.focus();
};

// --- 7. CONTROLE DO CAMPO DE ESTILO MUSICAL ---
selectEstiloMusical.addEventListener("change", function () {
    if (this.value === "Outros") {
        wrapperCampoOutroEstilo.style.display = "block";
        inputOutroEstilo.required = true;
    } else {
        wrapperCampoOutroEstilo.style.display = "none";
        inputOutroEstilo.required = false;
    }
});

// --- 8. ENVIO DOS DADOS PARA O BANCO DE DADOS ---
formularioDeInscricao.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    if (listaDeIntegrantesDaBanda.length === 0) {
        Swal.fire({ 
            icon: "error", 
            title: "Banda sem membros", 
            text: "Adicione pelo menos um integrante antes de enviar." 
        });
        return;
    }

    botaoDeEnvioFinal.disabled = true;
    botaoDeEnvioFinal.innerText = "ENVIANDO... 🤘";

    const dadosDoFormulario = new FormData(formularioDeInscricao);
    let estiloFinal = dadosDoFormulario.get("estilo_musical");
    if (estiloFinal === "Outros") {
        estiloFinal = inputOutroEstilo.value;
    }

    try {
        // Passo A: Grava os dados da banda principal.
        const { data: bandaInserida, error: erroAoInserirBanda } = await _supabase
            .from("bandas")
            .insert([{
                nome_banda: dadosDoFormulario.get("nome_banda"),
                estilo_musical: estiloFinal,
                whatsapp: dadosDoFormulario.get("whatsapp"),
                instagram: dadosDoFormulario.get("instagram")
            }])
            .select()
            .single();

        if (erroAoInserirBanda) throw erroAoInserirBanda;

        // Passo B: Grava os integrantes vinculados ao ID da banda criada.
        const listaIntegrantesComId = listaDeIntegrantesDaBanda.map(function (membro) {
            return {
                banda_id: bandaInserida.id,
                nome_musico: membro.nome_musico,
                funcao: membro.funcao
            };
        });

        const { error: erroAoInserirIntegrantes } = await _supabase
            .from("integrantes")
            .insert(listaIntegrantesComId);

        if (erroAoInserirIntegrantes) throw erroAoInserirIntegrantes;

        // Notificação de sucesso final.
        Swal.fire({
            icon: "success",
            title: "🤘 INSCRIÇÃO CONCLUÍDA!",
            text: "Sua banda foi registrada com sucesso no Rock & Poesia.",
            background: "#1e1e1e",
            color: "#ffffff"
        }).then(function () {
            window.location.href = "index.html";
        });

    } catch (erroDoProcesso) {
        console.error("Erro capturado:", erroDoProcesso);
        Swal.fire({ 
            icon: "error", 
            title: "Erro ao Salvar", 
            text: "Não foi possível completar a inscrição: " + erroDoProcesso.message 
        });
    } finally {
        botaoDeEnvioFinal.disabled = false;
        botaoDeEnvioFinal.innerText = "ENVIAR INSCRIÇÃO 🤘";
    }
});