/**
 * ROCK & POESIA - Sistema de Inscrição 2026
 * Versão Final: Splash, Termos de Aceite, Integrantes e Envio Supabase
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
        }, 4000);
    }
});

// --- 2. LÓGICA DE ACEITE DOS TERMOS (INSCRICAO.HTML) ---
document.addEventListener("DOMContentLoaded", function() {
    const checkTermos = document.getElementById("check-termos");
    const checkRegras = document.getElementById("check-regras");
    const btnProsseguir = document.getElementById("btn-prosseguir");
    const secaoTermos = document.getElementById("secao-termos");
    const formInscricao = document.getElementById("formInscricao");
    const subtitulo = document.getElementById("subtitulo-pagina");

    if (checkTermos && checkRegras && btnProsseguir) {
        const validarChecks = () => {
            if (checkTermos.checked && checkRegras.checked) {
                btnProsseguir.disabled = false;
                btnProsseguir.classList.remove("btn-bloqueado");
                btnProsseguir.style.cursor = "pointer";
            } else {
                btnProsseguir.disabled = true;
                btnProsseguir.classList.add("btn-bloqueado");
                btnProsseguir.style.cursor = "not-allowed";
            }
        };

        checkTermos.addEventListener("change", validarChecks);
        checkRegras.addEventListener("change", validarChecks);

        btnProsseguir.addEventListener("click", () => {
            secaoTermos.style.display = "none";
            formInscricao.style.display = "block";
            if (subtitulo) subtitulo.innerText = "Preencha os dados da banda";
            window.scrollTo(0, 0);
        });
    }
});

// --- 3. GERENCIAMENTO DE INTEGRANTES ---
window.adicionarIntegrante = function() {
    const nomeInput = document.getElementById("nome_membro");
    const funcaoSelect = document.getElementById("funcao_membro");
    
    if (!nomeInput) return;

    const nome = nomeInput.value.trim();

    if (nome === "") {
        Swal.fire({ 
            icon: "warning", 
            title: "Atenção", 
            text: "Digite o nome do músico.", 
            background: "#1e1e1e", 
            color: "#fff" 
        });
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

// --- 4. CONTROLE DO ESTILO MUSICAL (CAMPO OUTROS) ---
const selectEstilo = document.getElementById("estilo_musical");
const wrapperOutro = document.getElementById("wrapper_outro");

if (selectEstilo && wrapperOutro) {
    selectEstilo.addEventListener("change", function() {
        wrapperOutro.style.display = (this.value === "Outros") ? "block" : "none";
    });
}

// --- 5. ENVIO DO FORMULÁRIO PARA O SUPABASE ---
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
        
        // Trata o Estilo Musical
        let estiloFinal = formData.get("estilo_musical");
        if (estiloFinal === "Outros") {
            estiloFinal = document.getElementById("outro_estilo").value;
        }

        // Tratamento de Segurança para o Link de Vídeo
        let linkVideoLimpo = (formData.get("videos_banda") || "").trim();
        if (linkVideoLimpo !== "" && !linkVideoLimpo.startsWith('http')) {
            linkVideoLimpo = 'https://' + linkVideoLimpo;
        }

        try {
            // Inserção na tabela 'bandas'
            const { data: banda, error: erroBanda } = await _supabase.from("bandas").insert([{
                nome_banda: formData.get("nome_banda"),
                estilo_musical: estiloFinal,
                whatsapp: formData.get("whatsapp"),
                redes_sociais: formData.get("redes_sociais"),
                videos_banda: linkVideoLimpo,
                possui_autorais: formData.get("possui_autorais")
            }]).select().single();

            if (erroBanda) throw erroBanda;

            // Inserção na tabela 'integrantes'
            const membrosParaInserir = listaDeIntegrantesDaBanda.map(m => ({
                banda_id: banda.id,
                nome_musico: m.nome_musico,
                funcao: m.funcao
            }));

            const { error: erroIntegrantes } = await _supabase.from("integrantes").insert(membrosParaInserir);
            if (erroIntegrantes) throw erroIntegrantes;

            Swal.fire({ 
                icon: "success", 
                title: "SUCESSO!", 
                text: "Banda inscrita com sucesso!", 
                background: "#1e1e1e", 
                color: "#fff" 
            }).then(() => window.location.reload());

        } catch (err) {
            Swal.fire({ icon: "error", title: "Falha na Inscrição", text: err.message });
            btn.disabled = false;
            btn.innerText = "ENVIAR INSCRIÇÃO 🤘";
        }
    });
}