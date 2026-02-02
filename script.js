<<<<<<< HEAD
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
=======
// --- 1. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS SUPABASE ---
// Credenciais necessárias para a comunicação com o banco de dados na nuvem
const SUPABASE_URL = "https://hxbiexpadfaleozfywkh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ";

// Inicialização do cliente Supabase para permitir operações de inserção e consulta
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 2. GERENCIAMENTO DA TELA DE ABERTURA (SPLASH SCREEN) ---
// O evento DOMContentLoaded garante que o código execute após o carregamento do HTML
document.addEventListener("DOMContentLoaded", function () {
  const elementoDaSplash = document.getElementById("splash");
  const elementoTextoBemVindo = document.getElementById("welcome-text");
  const elementoConteudoPrincipal = document.getElementById("main-content");

  // Adiciona classe para bloquear o scroll durante a abertura
  document.body.classList.add("no-scroll");

  // Etapa 1: Após 2 segundos, exibe a mensagem de boas-vindas
  setTimeout(function () {
    elementoTextoBemVindo.classList.remove("hidden");
    setTimeout(function () {
      elementoTextoBemVindo.classList.add("show");
    }, 100);
  }, 2000);

  // Etapa 2: Após 5.5 segundos, remove a splash e revela o formulário
  setTimeout(function () {
    elementoDaSplash.style.opacity = "0"; // Efeito de desvanecimento suave

    setTimeout(function () {
      elementoDaSplash.style.display = "none"; // Remove o elemento do fluxo da página
      elementoConteudoPrincipal.style.display = "block"; // Mostra o conteúdo do formulário
      document.body.classList.remove("no-scroll"); // Libera o scroll para o usuário
    }, 1000); // Tempo de conclusão da transição de opacidade
  }, 5500);
});

// --- 3. CONTROLE DOS INTEGRANTES DA BANDA ---
// Armazenamento temporário dos músicos antes do envio final
let listaDeIntegrantesDaBanda = [];

const formularioDeInscricao = document.getElementById("formInscricao");
const inputNomeDoMusico = document.getElementById("nome_membro");
const selectFuncaoDoMusico = document.getElementById("funcao_membro");
const botaoAdicionarIntegrante = document.getElementById("btnAddMembro");
const listaVisualDeIntegrantes = document.getElementById("listaVisual");

// Escutador de clique para adicionar músicos à lista
botaoAdicionarIntegrante.addEventListener("click", function () {
  const nomeInformado = inputNomeDoMusico.value.trim();
  const funcaoSelecionada = selectFuncaoDoMusico.value;

  // Validação de segurança para campo vazio utilizando SweetAlert2
  if (nomeInformado === "") {
    Swal.fire({
      icon: "warning",
      title: "Campo Vazio",
      text: "Por favor, digite o nome do músico.",
      background: "#1e1e1e",
      color: "#ffffff",
>>>>>>> 85b05e4d2439c565073a7a48753d8887577de998
    });
    return;
  }

  // Adiciona o novo integrante ao array de controle
  listaDeIntegrantesDaBanda.push({
    nome_musico: nomeInformado,
    funcao: funcaoSelecionada,
  });

  // Limpa os campos e atualiza a interface
  inputNomeDoMusico.value = "";
  inputNomeDoMusico.focus();
  renderizarListaDeIntegrantesNaTela();
});

// Função para desenhar os músicos adicionados no formulário
function renderizarListaDeIntegrantesNaTela() {
  listaVisualDeIntegrantes.innerHTML = ""; // Limpa a lista para reconstrução

  listaDeIntegrantesDaBanda.forEach(function (integrante, indice) {
    const itemDeLista = document.createElement("li");
    itemDeLista.innerHTML = `
            <span><strong>${integrante.nome_musico}</strong> (${integrante.funcao})</span>
            <button type="button" onclick="removerIntegranteDaLista(${indice})" style="background:none; border:none; color:#e63946; cursor:pointer;">REMOVER</button>
        `;
    listaVisualDeIntegrantes.appendChild(itemDeLista);
  });
}

<<<<<<< HEAD
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
=======
// Função global para remover integrantes antes da inscrição
window.removerIntegranteDaLista = function (indiceParaRemover) {
  listaDeIntegrantesDaBanda.splice(indiceParaRemover, 1);
  renderizarListaDeIntegrantesNaTela();
};

// --- 4. CONTROLE DO ESTILO MUSICAL (CAMPO "OUTROS") ---
const selectEstiloMusical = document.getElementById("estilo_musical");
const wrapperCampoOutroEstilo = document.getElementById("wrapper_outro");

selectEstiloMusical.addEventListener("change", function () {
  // Revela o campo de texto caso a opção "Outros" seja escolhida
  if (this.value === "Outros") {
    wrapperCampoOutroEstilo.style.display = "block";
  } else {
    wrapperCampoOutroEstilo.style.display = "none";
  }
});

// --- 5. GERAÇÃO DO COMPROVANTE PARA IMPRESSÃO ---
// Prepara os dados inseridos para serem exibidos no papel
function gerarComprovanteDeInscricao(nomeDaBanda, estiloFinal, musicos) {
  const areaDeDadosDoRecibo = document.getElementById("dados-recibo");
  const spanDataEmissao = document.getElementById("data-emissao");

  const dataAtual = new Date();
  spanDataEmissao.innerText = dataAtual.toLocaleString("pt-BR");

  let conteudoHtmlDoRecibo = `
        <p><strong>BANDA:</strong> ${nomeDaBanda}</p>
        <p><strong>ESTILO:</strong> ${estiloFinal}</p>
        <h3 style="margin-top: 20px;">INTEGRANTES:</h3>
        <ul style="list-style-type: square;">
    `;

  musicos.forEach(function (musico) {
    conteudoHtmlDoRecibo += `<li>${musico.nome_musico} - ${musico.funcao}</li>`;
  });
>>>>>>> 85b05e4d2439c565073a7a48753d8887577de998

  conteudoHtmlDoRecibo += `</ul>`;
  areaDeDadosDoRecibo.innerHTML = conteudoHtmlDoRecibo;

<<<<<<< HEAD
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
=======
  // Chama o comando de impressão do sistema operacional
  window.print();
}

// --- 6. ENVIO DOS DADOS PARA O SUPABASE ---
formularioDeInscricao.addEventListener("submit", async function (evento) {
  evento.preventDefault(); // Impede o envio padrão do formulário

  // Validação: A banda precisa ter músicos registrados
  if (listaDeIntegrantesDaBanda.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Ops!",
      text: "A banda precisa de integrantes para ser inscrita.",
      background: "#1e1e1e",
      color: "#ffffff",
    });
    return;
  }

  const botaoDeEnvioFinal = document.getElementById("btnEnviar");
  botaoDeEnvioFinal.disabled = true; // Impede cliques múltiplos
  botaoDeEnvioFinal.innerText = "ENVIANDO INSCRIÇÃO... 🤘";

  const objetoFormData = new FormData(formularioDeInscricao);

  // Determina o valor final do estilo musical
  let estiloMusicalFinal = objetoFormData.get("estilo_musical");
  if (estiloMusicalFinal === "Outros") {
    estiloMusicalFinal = document.getElementById("outro_estilo").value;
  }

  // PASSO A: Salvar a banda na tabela 'bandas'
  const { data: registroDaBandaNoBanco, error: erroAoCriarBanda } =
    await _supabase
      .from("bandas")
      .insert([
        {
          nome_banda: objetoFormData.get("nome_banda"),
          estilo_musical: estiloMusicalFinal,
          whatsapp: objetoFormData.get("whatsapp"),
          instagram: objetoFormData.get("instagram"),
        },
      ])
      .select()
      .single();

  if (erroAoCriarBanda) {
    Swal.fire({
      icon: "error",
      title: "Erro Crítico",
      text: erroAoCriarBanda.message,
    });
    botaoDeEnvioFinal.disabled = false;
    botaoDeEnvioFinal.innerText = "ENVIAR INSCRIÇÃO 🤘";
    return;
  }

  // PASSO B: Salvar músicos vinculados ao ID da banda criada
  const listaFinalDeMusicosComIdentificador = listaDeIntegrantesDaBanda.map(
    function (musico) {
      return {
        banda_id: registroDaBandaNoBanco.id,
        nome_musico: musico.nome_musico,
        funcao: musico.funcao,
      };
    },
  );

  const { error: erroAoCriarIntegrantes } = await _supabase
    .from("integrantes")
    .insert(listaFinalDeMusicosComIdentificador);

  if (erroAoCriarIntegrantes) {
    Swal.fire({
      icon: "warning",
      title: "Atenção",
      text: "Banda salva, mas erro ao registrar músicos.",
    });
  } else {
    // Sucesso final: Alerta interativo com opção de impressão
    Swal.fire({
      icon: "success",
      title: "🤘 INSCRIÇÃO CONCLUÍDA!",
      text: "Gostaria de imprimir o seu comprovante?",
      showCancelButton: true,
      confirmButtonText: "Sim, Imprimir 🖨️",
      cancelButtonText: "Não, Ir para o Início",
      background: "#1e1e1e",
      color: "#ffffff",
      confirmButtonColor: "#e63946",
    }).then(function (resultadoDaEscolha) {
      if (resultadoDaEscolha.isConfirmed) {
        gerarComprovanteDeInscricao(
          registroDaBandaNoBanco.nome_banda,
          estiloMusicalFinal,
          listaDeIntegrantesDaBanda,
        );
      }
      // Redireciona o usuário para a página de menu
      window.location.href = "home.html";
    });
  }
});
>>>>>>> 85b05e4d2439c565073a7a48753d8887577de998
