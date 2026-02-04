/**
 * ROCK & POESIA - Painel de Controle do Gestor
 * Versão Corrigida: Proteção contra links nulos e erro /null
 */

const SUPABASE_URL = 'https://hxbiexpadfaleozfywkh.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4YmlleHBhZGZhbGVvemZ5d2toIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MjYxOTYsImV4cCI6MjA4NTMwMjE5Nn0.Tk5ENRCxrjiAnOBmFIUBEvEPK8indX7vurVDkd8UKyQ';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Configuração de Segurança
const SENHA_MESTRA = "rock2024";

/**
 * Verifica se o usuário tem permissão para visualizar os dados
 */
async function verificarAcesso() {
    const sessaoAtiva = sessionStorage.getItem('gestor_logado');

    if (sessaoAtiva === 'true') {
        renderizarPainel();
    } else {
        const tentativaSenha = prompt("ACESSO RESTRITO\nDigite a senha do administrador:");
        
        if (tentativaSenha === SENHA_MESTRA) {
            sessionStorage.setItem('gestor_logado', 'true');
            renderizarPainel();
        } else {
            alert("Senha incorreta! Acesso negado.");
            window.location.href = "index.html";
        }
    }
}

/**
 * Busca dados no Supabase e preenche a tabela
 */
async function renderizarPainel() {
    const tabelaBody = document.getElementById('corpoTabela');
    if (!tabelaBody) return;

    tabelaBody.innerHTML = "<tr><td colspan='5' style='text-align:center; padding:50px;'>🤘 Carregando lista de bandas...</td></tr>";

    try {
        // Busca bandas e seus respectivos integrantes
        const { data: listaBandas, error } = await _supabase
            .from('bandas')
            .select(`
                *,
                integrantes (nome_musico, funcao)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!listaBandas || listaBandas.length === 0) {
            tabelaBody.innerHTML = "<tr><td colspan='5' style='text-align:center;'>Nenhuma banda inscrita até o momento.</td></tr>";
            return;
        }

        tabelaBody.innerHTML = ""; // Limpa o carregamento

        listaBandas.forEach(banda => {
            const linha = document.createElement('tr');

            // Formatação dos integrantes
            const htmlIntegrantes = banda.integrantes && banda.integrantes.length > 0 
                ? banda.integrantes.map(i => 
                    `<div style="margin-bottom:4px; border-bottom:1px solid #333; padding-bottom:2px;">
                        • <strong>${i.nome_musico}</strong> <br> <small>${i.funcao}</small>
                    </div>`
                ).join('')
                : '<span style="color:#666;">Nenhum integrante listado</span>';

            // --- CORREÇÃO DO LINK DE VÍDEO (Evita o erro /null) ---
            let linkVideo = banda.videos_banda;
            let botaoVideoHtml = "";

            if (linkVideo && linkVideo.trim() !== "" && linkVideo !== "null") {
                // Garante que o link comece com http para o navegador não achar que é uma pasta interna
                const urlValida = linkVideo.startsWith('http') ? linkVideo : `https://${linkVideo}`;
                botaoVideoHtml = `<a href="${urlValida}" target="_blank" style="color:#3498db; text-decoration:none; font-weight:bold;">📺 Ver Vídeos/Mídia</a>`;
            } else {
                botaoVideoHtml = `<span style="color:#666; font-style:italic;">🚫 Sem link de vídeo</span>`;
            }

            // Limpeza do link do WhatsApp
            const telLimpo = banda.whatsapp ? banda.whatsapp.replace(/\D/g, "") : "";

            linha.innerHTML = `
                <td style="vertical-align: top;">
                    <strong style="color:var(--primary); font-size:1.1rem;">${banda.nome_banda}</strong><br>
                    <small>Inscrito em: ${new Date(banda.created_at).toLocaleDateString('pt-BR')}</small>
                </td>
                <td style="vertical-align: top;">
                    <strong>${banda.estilo_musical || 'Não informado'}</strong><br>
                    <span style="font-size:0.8rem; padding:2px 5px; border-radius:3px; background:${banda.possui_autorais === 'SIM' ? '#1b4332' : '#432818'}">
                        Autoral: ${banda.possui_autorais || 'N/A'}
                    </span>
                </td>
                <td style="font-size: 0.85rem;">
                    ${htmlIntegrantes}
                </td>
                <td style="vertical-align: top;">
                    ${botaoVideoHtml}<br>
                    <div style="margin-top:8px; font-size:0.8rem; color:#aaa;">
                        Redes: ${banda.redes_sociais || 'Não informado'}
                    </div>
                </td>
                <td style="vertical-align: top;">
                    <a href="https://wa.me/55${telLimpo}" target="_blank" class="btn-acao" style="background:#25d366; text-decoration:none; display:inline-block; text-align:center; padding: 5px 10px; border-radius: 5px; color: white;">
                        WhatsApp
                    </a>
                    <div style="margin-top:5px; font-size:0.8rem;">${banda.whatsapp || ''}</div>
                </td>
            `;
            tabelaBody.appendChild(linha);
        });

    } catch (err) {
        console.error("Erro ao renderizar painel:", err);
        tabelaBody.innerHTML = `<tr><td colspan='5' style='text-align:center; color:red;'>Erro ao carregar dados: ${err.message}</td></tr>`;
    }
}

/**
 * Remove a sessão e volta para o início
 */
window.logout = function() {
    sessionStorage.removeItem('gestor_logado');
    window.location.href = "index.html";
}

// Inicialização automática
verificarAcesso();