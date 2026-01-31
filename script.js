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

  conteudoHtmlDoRecibo += `</ul>`;
  areaDeDadosDoRecibo.innerHTML = conteudoHtmlDoRecibo;

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
