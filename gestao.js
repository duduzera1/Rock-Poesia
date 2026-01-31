// --- 1. CONFIGURAÇÃO DA CONEXÃO COM O BANCO DE DADOS SUPABASE ---
const SUPABASE_URL = "https://hxbiexpadfaleozfywkh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ";

// Inicialização do cliente Supabase para permitir consultas e mutações
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Variáveis globais de controle para edição
let identificadorDaBandaSelecionada = null;
let nomeDaBandaSelecionada = "";

// Seleção de elementos do DOM para manipulação dinâmica
const elementoCorpoTabela = document.getElementById("corpoTabela");
const elementoTabelaPrincipal = document.getElementById("tabelaBandas");
const elementoLoading = document.getElementById("loading");
const elementoModalEscolha = document.getElementById("modalEscolha");

// --- 2. FUNÇÃO PARA CARREGAR DADOS DO BANCO DE DADOS ---
async function carregarListaDeBandas() {
  // Exibe o estado de carregamento e oculta a tabela
  elementoLoading.style.display = "block";
  elementoTabelaPrincipal.style.display = "none";

  // Realiza a consulta incluindo a relação com os integrantes (Inner Join)
  const { data: listaDeBandas, error: erroDeConsulta } = await _supabase
    .from("bandas")
    .select("*, integrantes(*)");

  if (erroDeConsulta) {
    console.error("Erro ao buscar dados no Supabase:", erroDeConsulta.message);
    return;
  }

  // Chama a função para desenhar a tabela com os dados recebidos
  renderizarTabelaDeGestao(listaDeBandas);
}

// --- 3. FUNÇÃO PARA RENDERIZAR A TABELA COM ÍCONES ---
function renderizarTabelaDeGestao(bandas) {
  elementoLoading.style.display = "none";
  elementoTabelaPrincipal.style.display = "table";
  elementoCorpoTabela.innerHTML = ""; // Limpa a tabela antes de reconstruir

  bandas.forEach(function (banda) {
    // Cria a lista visual de músicos com ícones de marcador
    const integrantesHtml = banda.integrantes
      .map(function (musico) {
        return `• ${musico.nome_musico} <small style="color:#888;">(${musico.funcao})</small>`;
      })
      .join("<br>");

    const linhaDaTabela = document.createElement("tr");

    // Injeção de HTML com classes do Font Awesome e Estilos do style.css
    linhaDaTabela.innerHTML = `
            <td><strong>${banda.nome_banda}</strong></td>
            <td><span class="badge-estilo" style="background:#444; padding:4px 8px; border-radius:4px;">${banda.estilo_musical}</span></td>
            <td style="font-size: 0.85rem; color: #bbbbbb;">${integrantesHtml}</td>
            <td>
                <a href="https://wa.me/${banda.whatsapp.replace(/\D/g, "")}" target="_blank" class="whatsapp-link">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </a>
            </td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn-acao-editar" onclick="abrirBannerDeEdicao('${banda.id}', '${banda.nome_banda}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-acao-excluir" onclick="confirmarExclusaoDeInscricao('${banda.id}')">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
    elementoCorpoTabela.appendChild(linhaDaTabela);
  });
}

// --- 4. FUNÇÕES DE GESTÃO DO MODAL E CRUD ---

// Abre o modal de escolha (Banner)
window.abrirBannerDeEdicao = function (idDaBanda, nomeDaBanda) {
  identificadorDaBandaSelecionada = idDaBanda;
  nomeDaBandaSelecionada = nomeDaBanda;
  document.getElementById("infoBandaModal").innerText = `Banda: ${nomeDaBanda}`;
  elementoModalEscolha.style.display = "flex";
};

// Fecha o modal de escolha
window.fecharBannerEdicao = function () {
  elementoModalEscolha.style.display = "none";
};

// Lógica para editar apenas os dados principais da banda
window.iniciarEdicaoBanda = async function () {
  fecharBannerEdicao();
  const { value: novoNomeInformado } = await Swal.fire({
    title: "Editar Nome da Banda",
    input: "text",
    inputValue: nomeDaBandaSelecionada,
    showCancelButton: true,
    background: "#1e1e1e",
    color: "#ffffff",
    confirmButtonColor: "#3498db",
  });

  if (novoNomeInformado && novoNomeInformado !== nomeDaBandaSelecionada) {
    const { error: erroUpdate } = await _supabase
      .from("bandas")
      .update({ nome_banda: novoNomeInformado })
      .eq("id", identificadorDaBandaSelecionada);

    if (!erroUpdate) {
      Swal.fire(
        "Atualizado!",
        "Nome da banda alterado com sucesso.",
        "success",
      );
      carregarListaDeBandas();
    }
  }
};

// Lógica para editar integrantes um por um
window.iniciarEdicaoIntegrantes = async function () {
  fecharBannerEdicao();
  const { data: integrantesAtuais } = await _supabase
    .from("integrantes")
    .select("*")
    .eq("banda_id", identificadorDaBandaSelecionada);

  for (const musico of integrantesAtuais) {
    const { value: novoNomeMusico } = await Swal.fire({
      title: `Editar ${musico.funcao}`,
      text: `Músico: ${musico.nome_musico}`,
      input: "text",
      inputValue: musico.nome_musico,
      showCancelButton: true,
      background: "#1e1e1e",
      color: "#ffffff",
    });

    if (novoNomeMusico && novoNomeMusico !== musico.nome_musico) {
      await _supabase
        .from("integrantes")
        .update({ nome_musico: novoNomeMusico })
        .eq("id", musico.id);
    }
  }
  carregarListaDeBandas();
};

// Lógica para remover completamente uma inscrição
window.confirmarExclusaoDeInscricao = async function (idParaDeletar) {
  const resultadoDaConfirmacao = await Swal.fire({
    title: "Tem certeza?",
    text: "Esta ação apagará a banda e todos os músicos associados!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#e63946",
    cancelButtonColor: "#444",
    confirmButtonText: "Sim, Apagar Tudo!",
    background: "#1e1e1e",
    color: "#ffffff",
  });

  if (resultadoDaConfirmacao.isConfirmed) {
    // Exclui primeiro os integrantes (Chave Estrangeira) e depois a banda
    await _supabase.from("integrantes").delete().eq("banda_id", idParaDeletar);
    await _supabase.from("bandas").delete().eq("id", idParaDeletar);

    Swal.fire("Removido!", "A inscrição foi eliminada do sistema.", "success");
    carregarListaDeBandas();
  }
};

// --- 5. INICIALIZAÇÃO AUTOMÁTICA ---
carregarListaDeBandas();
