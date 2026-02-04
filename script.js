/**
 * ROCK & POESIA - Sistema de Inscrição 2026
 * Versão Corrigida: Sem erros de 'null' e com espaçamento garantido
 */

const SUPABASE_URL = "https://hxbiexpadfaleozfywkh.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let listaDeIntegrantesDaBanda = [];

// --- 1. LÓGICA DA SPLASH SCREEN (INDEX.HTML) ---
document.addEventListener("DOMContentLoaded", function () {
    const splash = document.getElementById("splash");
    const mainContent = document.getElementById("main-content");
    const welcomeText = document.getElementById("welcome-text");

    if (splash) {
        document.body.style.overflow = "hidden";
        
        setTimeout(() => {
            if (welcomeText) welcomeText.classList.add("show");
        }, 1000);

        setTimeout(() => {
            splash.style.opacity = "0";
            if (mainContent) mainContent.style.display = "block";
            
            setTimeout(() => {
                splash.style.display = "none";
                document.body.style.overflow = "auto";
            }, 1000);
        }, 4000); // Reduzi para 4s para não cansar o usuário
    }
});

// --- 2. GERENCIAMENTO DE INTEGRANTES (INSCRICAO.HTML) ---
window.adicionarIntegrante = function() {
    const nomeInput = document.getElementById("nome_membro");
    const funcaoSelect = document.getElementById("funcao_membro");
    
    if (!nomeInput) return; // Segurança caso não esteja na página de inscrição

    const nome = nomeInput.value.trim();

    if (nome === "") {
        Swal.fire({ icon: "warning", title: "Atenção", text: "Digite o nome do músico.", background: "#1e1e1e", color: "#fff" });
        return;
    }

    listaDeIntegrantesDaBanda.push({ nome_musico: nome, funcao: funcaoSelect.value });
    nomeInput.value = "";
    nomeInput.focus();
    renderizarListaIntegrantes();
};

function renderizarListaIntegrantes() {
    const listaVisual = document.getElementById("listaVisual");
    if (!listaVisual) return;

    listaVisual.innerHTML = "";
    listaDeIntegrantesDaBanda.forEach((integrante, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span><strong>${integrante.nome_musico}</strong> (${integrante.funcao})</span>
            <button type="button" onclick="removerIntegrante(${index})" style="background:none; border:none; color:#e63946; cursor:pointer;">🗑️</button>
        `;
        listaVisual.appendChild(li);
    });
}

window.removerIntegrante = function(index) {
    listaDeIntegrantesDaBanda.splice(index, 1);
    renderizarListaIntegrantes();
};

// --- 3. CONTROLE DO ESTILO MUSICAL ---
const selectEstilo = document.getElementById("estilo_musical");
const wrapperOutro = document.getElementById("wrapper_outro");

if (selectEstilo && wrapperOutro) {
    selectEstilo.addEventListener("change", function() {
        wrapperOutro.style.display = (this.value === "Outros") ? "block" : "none";
    });
}

// --- 4. ENVIO DO FORMULÁRIO (PROTEÇÃO CONTRA ERRO DE NULL) ---
const form = document.getElementById("formInscricao");
if (form) {
    form.addEventListener("submit", async function(e) {
        e.preventDefault();

        if (listaDeIntegrantesDaBanda.length === 0) {
            Swal.fire({ icon: "error", title: "Erro", text: "Adicione pelo menos um integrante." });
            return;
        }

        const btn = document.getElementById("btnEnviar");
        btn.disabled = true;
        btn.innerText = "ENVIANDO... 🤘";

        const formData = new FormData(this);
        let estiloFinal = formData.get("estilo_musical");
        if (estiloFinal === "Outros") {
            estiloFinal = document.getElementById("outro_estilo").value;
        }

        try {
            const { data: banda, error: erroBanda } = await _supabase.from("bandas").insert([{
                nome_banda: formData.get("nome_banda"),
                estilo_musical: estiloFinal,
                whatsapp: formData.get("whatsapp"),
                instagram: formData.get("redes_sociais")
            }]).select().single();

            if (erroBanda) throw erroBanda;

            const membrosParaInserir = listaDeIntegrantesDaBanda.map(m => ({
                banda_id: banda.id,
                nome_musico: m.nome_musico,
                funcao: m.funcao
            }));

            await _supabase.from("integrantes").insert(membrosParaInserir);

            Swal.fire({ icon: "success", title: "SUCESSO!", text: "Banda inscrita!", background: "#1e1e1e", color: "#fff" })
                .then(() => window.location.reload());

        } catch (err) {
            Swal.fire({ icon: "error", title: "Falha", text: err.message });
            btn.disabled = false;
            btn.innerText = "ENVIAR INSCRIÇÃO 🤘";
        }
    });
}