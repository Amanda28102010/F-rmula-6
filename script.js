// ==========================================
// CONFIGURAÇÃO DO SUPABASE
// ==========================================
const SUPABASE_URL = "COLE_SUA_URL_AQUI";
const SUPABASE_ANON_KEY = "COLE_SUA_ANON_KEY_AQUI";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==========================================
// FUNÇÃO PRINCIPAL PARA CARREGAR DADOS
// ==========================================
async function carregarDados() {
    try {
        // 1. Carregar Fotos
        const { data: fotos } = await supabase.from('fotos').select('*');
        renderizarLista('photoHistoryList', fotos, 'foto');

        // 2. Carregar Quebras
        const { data: quebras } = await supabase.from('quebras').select('*');
        renderizarLista('breakHistoryList', quebras, 'quebra');
        document.getElementById('breakCount').innerText = quebras ? quebras.length : 0;

        // 3. Carregar Histórico Semanal
        const { data: semanal } = await supabase.from('historico_semanal').select('*');
        renderizarLista('weeklyHistoryList', semanal, 'semanal');
        document.getElementById('weekCount').innerText = semanal ? semanal.length : 0;

        // 4. Carregar MATERIAIS
        const { data: materiais } = await supabase.from('materiais').select('*').order('material', { ascending: true });
        renderizarMateriais('materiaisList', materiais);

    } catch (error) {
        console.error("Erro ao buscar dados:", error.message);
    }
}

// ==========================================
// FUNÇÕES PARA RENDERIZAR
// ==========================================
function renderizarLista(idElemento, dados, tipo) {
    const container = document.getElementById(idElemento);
    container.innerHTML = '';
    if (!dados || dados.length === 0) return;

    dados.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';

        if (tipo === 'foto') {
            div.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${item.dia}</span>
                    <span class="item-subtitle"><i class="far fa-clock"></i> ${item.horario}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon view" onclick="alert('Ver foto')"><i class="fas fa-eye"></i></button>
                    <button class="btn-icon delete" onclick="deletarItem('fotos', ${item.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else if (tipo === 'quebra') {
            div.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${item.equipamento}</span>
                    <span class="item-subtitle">Relatado por: ${item.relatado_por} - ${item.data}</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon view" onclick="alert('Marcar como resolvido')"><i class="fas fa-check-circle" style="color: green;"></i></button>
                    <button class="btn-icon delete" onclick="deletarItem('quebras', ${item.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;
        } else if (tipo === 'semanal') {
            div.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${item.dia}</span>
                    <span class="item-subtitle">${item.agendamentos} Agendamentos • ${item.concluidos} Concluídos</span>
                </div>
                <div class="item-actions">
                    <button class="btn-icon view"><i class="fas fa-chevron-right"></i></button>
                </div>
            `;
        }
        container.appendChild(div);
    });
}

// Função específica para renderizar os MATERIAIS
function renderizarMateriais(idElemento, dados) {
    const container = document.getElementById(idElemento);
    container.innerHTML = '';

    if (!dados || dados.length === 0) {
        container.innerHTML = `<div style="padding:20px; text-align:center; color:#999;">Nenhum material cadastrado.</div>`;
        return;
    }

    dados.forEach(item => {
        const div = document.createElement('div');
        div.className = 'list-item';

        const porcentagem = (item.disponivel / item.total) * 100;
        let corBarra = '#28a745'; // Verde
        if (porcentagem < 50) corBarra = '#ffc107'; // Amarelo
        if (porcentagem < 20) corBarra = '#dc3545'; // Vermelho

        div.innerHTML = `
            <div class="item-info" style="width: 100%;">
                <div style="display:flex; justify-content:space-between; margin-bottom: 5px;">
                    <span class="item-title">${item.material}</span>
                    <span style="font-size:0.9rem; font-weight:600;">${item.disponivel} / ${item.total}</span>
                </div>
                <div style="width: 100%; height: 6px; background-color: #e9ecef; border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${porcentagem}%; background-color: ${corBarra}; transition: width 0.5s;"></div>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// ==========================================
// FUNÇÕES DE DELETAR E RESTAURAR
// ==========================================
async function deletarItem(tabela, id) {
    if (!confirm("Excluir?")) return;
    await supabase.from(tabela).delete().eq('id', id);
    carregarDados();
}

// 🚨 Restauração Completa
async function restaurarSistema() {
    if (!confirm("⚠️ Isso vai APAGAR TUDO e recriar com os dados padrão. Prosseguir?")) return;

    // Limpa tabelas
    await supabase.from('fotos').delete().neq('id', 0);
    await supabase.from('quebras').delete().neq('id', 0);
    await supabase.from('historico_semanal').delete().neq('id', 0);
    await supabase.from('materiais').delete().neq('id', 0); // Atualizado para 'materiais'

    // Dados padrão
    const semanas = [
        { dia: "Segunda-feira (Manhã)", agendamentos: 0, concluidos: 0 },
        { dia: "Segunda-feira (Tarde)", agendamentos: 0, concluidos: 0 },
        { dia: "Terça-feira (Manhã)", agendamentos: 0, concluidos: 0 },
        { dia: "Terça-feira (Tarde)", agendamentos: 0, concluidos: 0 },
        { dia: "Quarta-feira (Manhã)", agendamentos: 0, concluidos: 0 },
        { dia: "Quarta-feira (Tarde)", agendamentos: 0, concluidos: 0 },
        { dia: "Quinta-feira (Manhã)", agendamentos: 0, concluidos: 0 },
        { dia: "Quinta-feira (Tarde)", agendamentos: 0, concluidos: 0 },
        { dia: "Sexta-feira (Manhã)", agendamentos: 0, concluidos: 0 },
        { dia: "Sexta-feira (Tarde)", agendamentos: 0, concluidos: 0 }
    ];

    const materiais = [
        { material: "Microscópio", total: 5, disponivel: 4 },
        { material: "Multímetro", total: 8, disponivel: 7 },
        { material: "Osciloscópio", total: 3, disponivel: 2 },
        { material: "Tubo de Ensaio", total: 30, disponivel: 28 },
        { material: "Béquer", total: 20, disponivel: 18 },
        { material: "Proveta", total: 15, disponivel: 14 },
        { material: "Lâmina de Vidro", total: 50, disponivel: 48 },
        { material: "Termômetro", total: 10, disponivel: 9 },
        { material: "Fonte de Alimentação", total: 4, disponivel: 3 },
        { material: "Kit Eletrônica", total: 6, disponivel: 5 },
        { material: "Gerador de Sinais", total: 2, disponivel: 2 },
        { material: "Balança Digital", total: 3, disponivel: 3 }
    ];

    await supabase.from('historico_semanal').insert(semanas);
    await supabase.from('materiais').insert(materiais); // Inserindo na tabela materiais

    carregarDados();
    alert("Sistema restaurado com sucesso!");
}

// ==========================================
// INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', carregarDados);
