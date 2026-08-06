(function () {
    const STORAGE_KEY = 'lab_ciencias_agendamentos_v5';
    const FOTOS_KEY = 'lab_ciencias_fotos';
    const QUEBRAS_KEY = 'lab_ciencias_quebras';

    const diasSemana = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'];

    // Horários fixos
    const horariosFixos = [
        { inicio: '06:50', fim: '07:40', label: '06:50 - 07:40' },
        { inicio: '07:40', fim: '08:30', label: '07:40 - 08:30' },
        { inicio: '08:30', fim: '09:20', label: '08:30 - 09:20' },
        { inicio: '09:20', fim: '10:20', label: '09:20 - 10:20' },
        { inicio: '10:20', fim: '11:10', label: '10:20 - 11:10' },
        { inicio: '11:10', fim: '12:00', label: '11:10 - 12:00' }
    ];

    // Lista de materiais do laboratório
    const materiaisLaboratorio = [
        { id: 1, nome: 'Microscópio', icone: 'bi-eye', quantidade: 5, disponiveis: 4 },
        { id: 2, nome: 'Multímetro', icone: 'bi-lightning-charge', quantidade: 8, disponiveis: 7 },
        { id: 3, nome: 'Osciloscópio', icone: 'bi-graph-up', quantidade: 3, disponiveis: 2 },
        { id: 4, nome: 'Tubo de Ensaio', icone: 'bi-droplet', quantidade: 30, disponiveis: 28 },
        { id: 5, nome: 'Béquer', icone: 'bi-cup', quantidade: 20, disponiveis: 18 },
        { id: 6, nome: 'Proveta', icone: 'bi-sliders', quantidade: 15, disponiveis: 14 },
        { id: 7, nome: 'Lâmina de Vidro', icone: 'bi-square', quantidade: 50, disponiveis: 48 },
        { id: 8, nome: 'Termômetro', icone: 'bi-thermometer-half', quantidade: 10, disponiveis: 9 },
        { id: 9, nome: 'Fonte de Alimentação', icone: 'bi-plug', quantidade: 4, disponiveis: 3 },
        { id: 10, nome: 'Kit Eletrônica', icone: 'bi-cpu', quantidade: 6, disponiveis: 5 },
        { id: 11, nome: 'Gerador de Sinais', icone: 'bi-soundwave', quantidade: 2, disponiveis: 2 },
        { id: 12, nome: 'Balança Digital', icone: 'bi-speedometer2', quantidade: 3, disponiveis: 3 }
    ];

    // Controle de semana
    let offsetSemana = 0;
    let diaSelecionado = diasSemana[0];

    // Funções para calcular datas da semana
    function getDataInicioSemana(offset = 0) {
        const hoje = new Date();
        const diaSemana = hoje.getDay();
        const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() + diff + (offset * 7));
        segunda.setHours(0, 0, 0, 0);
        return segunda;
    }

    function getDataDiaSemana(diaIndex, offset = 0) {
        const segunda = getDataInicioSemana(offset);
        const data = new Date(segunda);
        data.setDate(segunda.getDate() + diaIndex);
        return data;
    }

    function formatarData(data) {
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    function getChaveSemana(offset = 0) {
        const segunda = getDataInicioSemana(offset);
        return `semana_${segunda.getTime()}`;
    }

    // Funções de armazenamento
    function safeGetItem(key, fallback) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return fallback;
            return JSON.parse(item);
        } catch (e) {
            localStorage.removeItem(key);
            return fallback;
        }
    }

    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            alert('Erro ao salvar. Armazenamento cheio.');
            return false;
        }
    }

    function criarDadosIniciais() {
        const dados = {};
        diasSemana.forEach(dia => { dados[dia] = {}; });
        return dados;
    }

    function carregarDados(offset = 0) {
        const chave = getChaveSemana(offset);
        const todosDados = safeGetItem(STORAGE_KEY, {});
        if (!todosDados[chave]) {
            todosDados[chave] = criarDadosIniciais();
        }
        return todosDados[chave];
    }

    function salvarDados(dados, offset = 0) {
        const chave = getChaveSemana(offset);
        const todosDados = safeGetItem(STORAGE_KEY, {});
        todosDados[chave] = dados;
        safeSetItem(STORAGE_KEY, todosDados);
    }

    function carregarFotos() {
        return safeGetItem(FOTOS_KEY, []);
    }

    function salvarFotos(fotos) {
        safeSetItem(FOTOS_KEY, fotos);
    }

    function carregarQuebras() {
        return safeGetItem(QUEBRAS_KEY, []);
    }

    function salvarQuebras(quebras) {
        safeSetItem(QUEBRAS_KEY, quebras);
    }

    // ---------- Atualizar navegação da semana ----------
    function atualizarInfoSemana() {
        const segunda = getDataInicioSemana(offsetSemana);
        const sexta = new Date(segunda);
        sexta.setDate(segunda.getDate() + 4);

        const semanaInfo = document.getElementById('semanaInfo');
        if (offsetSemana === 0) {
            semanaInfo.textContent = '📅 Semana atual';
        } else if (offsetSemana === 1) {
            semanaInfo.textContent = '📅 Próxima semana';
        } else if (offsetSemana === -1) {
            semanaInfo.textContent = '📅 Semana passada';
        } else if (offsetSemana > 0) {
            semanaInfo.textContent = `📅 +${offsetSemana} semanas`;
        } else {
            semanaInfo.textContent = `📅 ${Math.abs(offsetSemana)} semanas atrás`;
        }

        document.getElementById('dataCompleta').textContent =
            `${formatarData(segunda)} - ${formatarData(sexta)}`;
    }

    // ---------- Renderizar Materiais no Modal ----------
    function renderizarMateriais() {
        const container = document.getElementById('materiaisLista');
        if (!container) return;

        container.innerHTML = '';
        materiaisLaboratorio.forEach(material => {
            const div = document.createElement('div');
            div.className = 'material-item';

            let statusClass, statusTexto;
            if (material.disponiveis === 0) {
                statusClass = 'material-indisponivel';
                statusTexto = 'Indisponível';
            } else if (material.disponiveis < material.quantidade * 0.3) {
                statusClass = 'material-em-uso';
                statusTexto = 'Poucos';
            } else {
                statusClass = 'material-disponivel';
                statusTexto = 'Disponível';
            }

            div.innerHTML = `
                <div class="material-icone">
                    <i class="bi ${material.icone}"></i>
                </div>
                <div class="material-info">
                    <div class="material-nome">${material.nome}</div>
                    <div class="material-qtd">${material.disponiveis}/${material.quantidade} disponíveis</div>
                </div>
                <span class="material-status ${statusClass}">${statusTexto}</span>
            `;
            container.appendChild(div);
        });
    }

    // ---------- Renderizar Abas dos Dias ----------
    function renderizarAbasDias() {
        const container = document.getElementById('diasTabs');
        if (!container) return;

        const hoje = new Date();
        const diasAbreviados = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
        const datasSemana = [];

        for (let i = 0; i < 5; i++) {
            datasSemana.push(getDataDiaSemana(i, offsetSemana));
        }

        container.innerHTML = '';
        diasSemana.forEach((dia, index) => {
            const tab = document.createElement('div');
            tab.className = 'dia-tab';
            if (dia === diaSelecionado) tab.classList.add('active');

            const dataDia = datasSemana[index];
            if (offsetSemana === 0 && dataDia.toDateString() === hoje.toDateString()) {
                tab.style.borderBottom = '3px solid #f1b24a';
            }

            const dados = carregarDados(offsetSemana);
            const agendamentosDoDia = dados[dia] || {};
            const totalAgendamentos = Object.keys(agendamentosDoDia).length;

            const dataFormatada = dataDia.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit'
            });

            tab.innerHTML = `
                ${diasAbreviados[index]}
                <small style="display:block;font-size:0.6rem;">${dataFormatada}</small>
                <span class="dia-contagem">${totalAgendamentos} agend.</span>
            `;

            tab.addEventListener('click', () => {
                diaSelecionado = dia;
                renderizarAbasDias();
                renderizarGradeHorarios();
            });

            container.appendChild(tab);
        });
    }

    // ---------- Verificar se horário está encerrado ----------
    function isHorarioEncerrado(dataDia, horarioFim) {
        const agora = new Date();
        const [horaFim, minFim] = horarioFim.split(':').map(Number);
        const dataFimHorario = new Date(dataDia);
        dataFimHorario.setHours(horaFim, minFim, 0, 0);
        return dataFimHorario < agora;
    }

    // ---------- Verificar se o dia inteiro já passou ----------
    function isDiaEncerrado(dataDia) {
        const agora = new Date();
        agora.setHours(0, 0, 0, 0);
        const diaComparar = new Date(dataDia);
        diaComparar.setHours(0, 0, 0, 0);
        return diaComparar < agora;
    }

    // ---------- Renderizar Grade de Horários ----------
    function renderizarGradeHorarios() {
        const grid = document.getElementById('horariosGrid');
        const tituloDia = document.getElementById('tituloDiaSelecionado');
        const badgeTotal = document.getElementById('badgeTotalAgendamentos');
        if (!grid) return;

        const diaIndex = diasSemana.indexOf(diaSelecionado);
        const dataAtual = getDataDiaSemana(diaIndex, offsetSemana);

        if (tituloDia) {
            tituloDia.textContent = `${diaSelecionado} - ${formatarData(dataAtual)}`;
        }

        const dados = carregarDados(offsetSemana);
        const agendamentosDoDia = dados[diaSelecionado] || {};
        grid.innerHTML = '';

        let totalAgendados = 0;
        const diaCompletamenteEncerrado = isDiaEncerrado(dataAtual);

        horariosFixos.forEach(horario => {
            const slot = document.createElement('div');
            const chaveHorario = horario.label;
            const agendamento = agendamentosDoDia[chaveHorario];

            // Verificar se o horário está encerrado
            const horarioEncerrado = diaCompletamenteEncerrado || isHorarioEncerrado(dataAtual, horario.fim);

            if (horarioEncerrado) {
                // Horário encerrado - não clicável
                slot.className = 'horario-slot encerrado';
                if (agendamento) {
                    // Se tinha agendamento, mostra o nome do professor
                    slot.innerHTML = `
                        <span class="horario-hora">${horario.label}</span>
                        <span class="horario-status">⏰ Encerrado</span>
                        <span class="horario-professor">👨‍🏫 ${agendamento.responsavel}</span>
                    `;
                    totalAgendados++;
                } else {
                    slot.innerHTML = `
                        <span class="horario-hora">${horario.label}</span>
                        <span class="horario-status">⏰ Encerrado</span>
                    `;
                }
                // Sem evento de clique - não pode mexer
            } else if (agendamento) {
                // Horário ocupado mas ainda não encerrado
                slot.className = 'horario-slot ocupado';
                slot.innerHTML = `
                    <span class="horario-hora">${horario.label}</span>
                    <span class="horario-status">🔴 Ocupado</span>
                    <span class="horario-professor">${agendamento.responsavel}</span>
                    <span class="horario-professor" style="font-size: 0.65rem;">${agendamento.materia || ''} - ${agendamento.turma || ''}</span>
                `;
                totalAgendados++;
                slot.addEventListener('click', () => {
                    abrirModalEdicao(diaSelecionado, chaveHorario, agendamento, dataAtual);
                });
            } else {
                // Horário livre
                slot.className = 'horario-slot livre';
                slot.innerHTML = `
                    <span class="horario-hora">${horario.label}</span>
                    <span class="horario-status">🟢 Livre</span>
                `;
                slot.addEventListener('click', () => {
                    abrirModalNovoAgendamento(diaSelecionado, chaveHorario, dataAtual);
                });
            }

            grid.appendChild(slot);
        });

        if (badgeTotal) {
            badgeTotal.innerHTML = `<i class="bi bi-people"></i> ${totalAgendados} agendamentos`;
        }
    }

    // ---------- Atualizar tudo ----------
    function atualizarTudo() {
        atualizarInfoSemana();
        renderizarAbasDias();
        renderizarGradeHorarios();
    }

    // ---------- Modal de Agendamento ----------
    function abrirModalNovoAgendamento(dia, horario, dataAtual) {
        const modal = new bootstrap.Modal(document.getElementById('agendamentoModal'));

        document.getElementById('agendamentoModalTitulo').innerHTML =
            `<i class="bi bi-calendar-plus me-2"></i>Agendar: ${dia} - ${horario}`;
        document.getElementById('horarioInput').value = horario;
        document.getElementById('responsavelInput').value = '';
        document.getElementById('materiaInput').value = '';
        document.getElementById('turmaInput').value = '';
        document.getElementById('cancelarAgendamentoBtn').style.display = 'none';
        document.getElementById('dataInput').value = dataAtual.toISOString().split('T')[0];

        const modalEl = document.getElementById('agendamentoModal');
        modalEl.dataset.modo = 'novo';
        modalEl.dataset.dia = dia;
        modalEl.dataset.horario = horario;
        modalEl.dataset.offsetSemana = offsetSemana;

        renderizarMateriais();
        modal.show();
    }

    function abrirModalEdicao(dia, horario, agendamento, dataAtual) {
        const modal = new bootstrap.Modal(document.getElementById('agendamentoModal'));

        document.getElementById('agendamentoModalTitulo').innerHTML =
            `<i class="bi bi-pencil me-2"></i>Editar: ${dia} - ${horario}`;
        document.getElementById('horarioInput').value = horario;
        document.getElementById('responsavelInput').value = agendamento.responsavel || '';
        document.getElementById('materiaInput').value = agendamento.materia || '';
        document.getElementById('turmaInput').value = agendamento.turma || '';
        document.getElementById('dataInput').value = dataAtual.toISOString().split('T')[0];
        document.getElementById('cancelarAgendamentoBtn').style.display = 'inline-block';

        const modalEl = document.getElementById('agendamentoModal');
        modalEl.dataset.modo = 'editar';
        modalEl.dataset.dia = dia;
        modalEl.dataset.horario = horario;
        modalEl.dataset.offsetSemana = offsetSemana;

        renderizarMateriais();
        modal.show();
    }

    function salvarAgendamento() {
        const modalEl = document.getElementById('agendamentoModal');
        const dia = modalEl.dataset.dia;
        const horario = modalEl.dataset.horario;
        const offset = parseInt(modalEl.dataset.offsetSemana);
        const responsavel = document.getElementById('responsavelInput').value.trim();
        const materia = document.getElementById('materiaInput').value.trim();
        const turma = document.getElementById('turmaInput').value.trim();
        const data = document.getElementById('dataInput').value;
        const checklist = document.getElementById('checklistCheck').checked;

        if (!responsavel || !materia || !turma) {
            alert('Preencha todos os campos obrigatórios.');
            return;
        }
        if (!checklist) {
            alert('Confirme o checklist de segurança.');
            return;
        }

        const dados = carregarDados(offset);
        if (!dados[dia]) dados[dia] = {};

        const dataObj = new Date(data + 'T00:00:00');
        const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        });

        dados[dia][horario] = {
            responsavel: responsavel,
            materia: materia,
            turma: turma,
            data: dataFormatada,
            status: 'agendado'
        };

        salvarDados(dados, offset);
        atualizarTudo();

        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();

        const modo = modalEl.dataset.modo;
        alert(modo === 'novo' ? 'Agendamento realizado com sucesso!' : 'Agendamento atualizado com sucesso!');
    }

    function cancelarAgendamento() {
        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        const modalEl = document.getElementById('agendamentoModal');
        const dia = modalEl.dataset.dia;
        const horario = modalEl.dataset.horario;
        const offset = parseInt(modalEl.dataset.offsetSemana);

        const dados = carregarDados(offset);
        if (dados[dia] && dados[dia][horario]) {
            delete dados[dia][horario];
            salvarDados(dados, offset);
        }

        atualizarTudo();

        const modal = bootstrap.Modal.getInstance(modalEl);
        modal.hide();
        alert('Agendamento cancelado com sucesso!');
    }

    // ---------- Fotos ----------
    function configurarPreviewFotos() {
        const inputFotos = document.getElementById('inputFotos');
        if (!inputFotos) return;
        inputFotos.addEventListener('change', function (e) {
            const files = Array.from(e.target.files);
            const previewContainer = document.getElementById('previewContainer');
            previewContainer.innerHTML = '';
            if (files.length === 0) return;
            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function (ev) {
                    const img = document.createElement('img');
                    img.src = ev.target.result;
                    img.style.width = '70px';
                    img.style.height = '70px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '12px';
                    img.style.margin = '4px';
                    previewContainer.appendChild(img);
                };
                reader.readAsDataURL(file);
            });
        });
    }

    function configurarSalvarChecklist() {
        const salvarBtn = document.getElementById('salvarChecklistBtn');
        if (!salvarBtn) return;
        salvarBtn.addEventListener('click', function () {
            const tipo = document.getElementById('tipoChecklist').value;
            const files = document.getElementById('inputFotos').files;

            if (!tipo) { alert('Selecione o tipo de registro.'); return; }
            if (files.length === 0) { alert('Selecione pelo menos uma foto.'); return; }

            const promises = [];
            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                promises.push(new Promise(resolve => {
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(files[i]);
                }));
            }

            Promise.all(promises).then(imagensBase64 => {
                const fotos = carregarFotos();
                fotos.push({
                    tipo: tipo,
                    data: new Date().toLocaleString('pt-BR'),
                    imagens: imagensBase64
                });
                salvarFotos(fotos);
                alert(`Checklist de "${tipo}" salvo com sucesso!`);
                const modal = bootstrap.Modal.getInstance(document.getElementById('checklistFotoModal'));
                if (modal) modal.hide();
                document.getElementById('formChecklistFotos').reset();
                document.getElementById('previewContainer').innerHTML = '';
            });
        });
    }

    // ---------- Quebras ----------
    function configurarQuebras() {
        const salvarQuebraBtn = document.getElementById('salvarQuebraBtn');
        if (!salvarQuebraBtn) return;
        salvarQuebraBtn.addEventListener('click', function () {
            const material = document.getElementById('materialQuebraSelect').value;
            const descricao = document.getElementById('descricaoQuebra').value.trim();
            const relatadoPor = document.getElementById('relatadoPorInput').value.trim();

            if (!material || !descricao || !relatadoPor) {
                alert('Preencha todos os campos.');
                return;
            }

            const quebras = carregarQuebras();
            quebras.push({
                material,
                descricao,
                relatadoPor,
                data: new Date().toLocaleString('pt-BR')
            });
            salvarQuebras(quebras);

            alert('Quebra registrada com sucesso!');
            const modal = bootstrap.Modal.getInstance(document.getElementById('registrarQuebraModal'));
            if (modal) modal.hide();
            document.getElementById('formQuebra').reset();
        });
    }

    // ---------- Inicialização ----------
    document.addEventListener('DOMContentLoaded', function () {
        const hoje = new Date();
        const diaHojeNum = hoje.getDay();
        if (diaHojeNum >= 1 && diaHojeNum <= 5) {
            diaSelecionado = diasSemana[diaHojeNum - 1];
        }

        document.getElementById('btnSemanaAnterior').addEventListener('click', () => {
            offsetSemana--;
            atualizarTudo();
        });

        document.getElementById('btnProximaSemana').addEventListener('click', () => {
            offsetSemana++;
            atualizarTudo();
        });

        document.getElementById('btnHoje').addEventListener('click', () => {
            offsetSemana = 0;
            const hoje = new Date();
            const diaHojeNum = hoje.getDay();
            if (diaHojeNum >= 1 && diaHojeNum <= 5) {
                diaSelecionado = diasSemana[diaHojeNum - 1];
            }
            atualizarTudo();
        });

        atualizarTudo();

        document.getElementById('salvarAgendamentoBtn')?.addEventListener('click', salvarAgendamento);
        document.getElementById('cancelarAgendamentoBtn')?.addEventListener('click', cancelarAgendamento);

        configurarPreviewFotos();
        configurarSalvarChecklist();
        configurarQuebras();
    });
})();