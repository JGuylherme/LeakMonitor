/**
 * Exibe o overlay de carregamento (spinner) na tela.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function showSpinner() {
  document.getElementById('spinner-overlay').style.display = 'block';
}

/**
 * Esconde o overlay de carregamento (spinner) da tela.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function hideSpinner() {
  document.getElementById('spinner-overlay').style.display = 'none';
}

/**
 * Simula a função 'map' do Arduino, convertendo um valor de um intervalo para outro.
 * @param {number} x - Valor de entrada.
 * @param {number} in_min - Mínimo do intervalo de entrada.
 * @param {number} in_max - Máximo do intervalo de entrada.
 * @param {number} out_min - Mínimo do intervalo de saída.
 * @param {number} out_max - Máximo do intervalo de saída.
 * @returns {number} Valor convertido para o novo intervalo.
 */
function map(x, in_min, in_max, out_min, out_max) {
  return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
}

const historyLength = 12; // Quantidade de pontos exibidos no gráfico
let historyLabels = [];
let historyData = [];
let historyTimestamps = [];
let chartRange = 12; // padrão

const ctx = document.getElementById('historyChart').getContext('2d');
const historyChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [{
      label: 'Umidade (%)',
      data: [],
      borderColor: '#2196f3',
      backgroundColor: 'rgba(33,150,243,0.1)',
      tension: 0.3,
      pointRadius: 2,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { min: 0, max: 100 }
    }
  }
});

/**
 * Atualiza as estatísticas e o gráfico de histórico de umidade.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function updateAnalyticsAndChart() {
  const range = chartRange === 'all' ? historyData.length : parseInt(chartRange, 10);
  const dataSlice = historyData.slice(-range);
  const labelsSlice = historyLabels.slice(-range);

  // Exibe ou esconde o estado vazio
  const emptyState = document.getElementById('empty-state');
  if (dataSlice.length === 0) {
    emptyState.style.display = 'block';
    document.getElementById('historyChart').style.display = 'none';
  } else {
    emptyState.style.display = 'none';
    document.getElementById('historyChart').style.display = 'block';
  }

  // Atualiza o gráfico
  historyChart.data.labels = labelsSlice;
  historyChart.data.datasets[0].data = dataSlice;
  historyChart.update();

  // Estatísticas
  if (dataSlice.length) {
    const min = Math.min(...dataSlice);
    const max = Math.max(...dataSlice);
    const avg = (dataSlice.reduce((a, b) => a + b, 0) / dataSlice.length).toFixed(1);

    document.getElementById('min-humidity').textContent = min;
    document.getElementById('max-humidity').textContent = max;
    document.getElementById('avg-humidity').textContent = avg;

    // Tendência: compara os últimos 3 valores
    let trend = 'Estável';
    if (dataSlice.length >= 3) {
      const last = dataSlice[dataSlice.length - 1];
      const prev = dataSlice[dataSlice.length - 2];
      const prev2 = dataSlice[dataSlice.length - 3];
      if (last > prev && prev > prev2) trend = 'Subindo';
      else if (last < prev && prev < prev2) trend = 'Caindo';
    }
    document.getElementById('trend-humidity').textContent = trend;
  } else {
    document.getElementById('min-humidity').textContent = '--';
    document.getElementById('max-humidity').textContent = '--';
    document.getElementById('avg-humidity').textContent = '--';
    document.getElementById('trend-humidity').textContent = '--';
  }
}

/**
 * Atualiza a interface com os dados recebidos do sensor.
 * @param {Object} data - Objeto com dados da leitura.
 * @param {string} data.hora - Horário da leitura.
 * @param {number} data.valor - Valor bruto do sensor.
 * @param {number} data.umidade - Umidade calculada (%).
 * @param {string} data.estado - Estado textual (Seco, Úmido, Molhado).
 * @param {string} data.intensidade - Intensidade textual (Normal, Alta).
 * Não retorna nada.
 */
function atualizarTela(data) {
  hideSkeletons(data);

  // Lógica de cores
  let color;
  if (data.umidade < 30) {
    color = '#2196f3';
  } else if (data.umidade < 60) {
    color = '#4caf50';
  } else if (data.umidade < 75) {
    color = '#ffeb3b';
  } else if (data.umidade < 90) {
    color = '#ff9800';
  } else {
    color = '#f44336';
  }
  document.querySelector('.container').style.borderColor = color;
  document.querySelector('.container').style.boxShadow = `0 4px 16px ${color}55`;

  document.getElementById('last-update').textContent = `Última atualização: ${data.hora}`;

  // Atualiza histórico
  const now = new Date();
  historyLabels.push(data.hora);
  historyData.push(data.umidade);
  historyTimestamps.push(now.toISOString().slice(0, 10));
  if (historyLabels.length > 500) {
    historyLabels.shift();
    historyData.shift();
    historyTimestamps.shift();
  }
  updateAnalyticsAndChart();
}

/**
 * Exibe placeholders de carregamento (skeletons) nos campos principais.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function showSkeletons() {
  ['hora', 'valor', 'umidade', 'estado', 'intensidade'].forEach(id => {
    document.getElementById(id).innerHTML = '<span class="skeleton"></span>';
  });
}

/**
 * Esconde os skeletons e preenche os campos principais com os dados.
 * @param {Object} data - Objeto com dados da leitura.
 * Não retorna nada.
 */
function hideSkeletons(data) {
  document.getElementById('hora').textContent = data.hora;
  document.getElementById('valor').textContent = data.valor;
  document.getElementById('umidade').textContent = `${data.umidade}%`;
  document.getElementById('estado').textContent = data.estado;
  document.getElementById('intensidade').textContent = data.intensidade;
}

/**
 * Carrega o histórico de leituras do backend e atualiza o gráfico.
 * Função assíncrona.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
async function loadHistory() {
  const res = await fetch('api/get_readings.php?limit=500');
  const readings = await res.json();
  historyLabels = [];
  historyData = [];
  historyTimestamps = [];
  readings.forEach(r => {
    historyLabels.push(r.hora);
    historyData.push(parseInt(r.umidade, 10));
    historyTimestamps.push(r.data);
  });
  updateAnalyticsAndChart();
}

/**
 * Função principal: conecta ao broker MQTT, escuta mensagens e atualiza a interface.
 * Função assíncrona.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
async function main() {
  await loadHistory();

  // Configuração MQTT via backend
  const res = await fetch('api/get_mqtt_config.php');
  const cfg = await res.json();

  const client = mqtt.connect(cfg.MQTT_BROKER, {
    username: cfg.MQTT_USER,
    password: cfg.MQTT_PASS
  });

  let lastReceivedData = null;

  client.on('connect', () => {
    console.log('✅ Conectado ao HiveMQ Cloud via WebSocket');
    client.subscribe("sensorfc28", (err) => {
      if (err) {
        console.error("❌ Falha ao se inscrever no tópico:", err);
      } else {
        console.log("📡 Inscrito no tópico sensorfc28");
      }
    });
  });

  client.on('message', (topic, message) => {
    try {
      const data = JSON.parse(message.toString());
      lastReceivedData = data;
      atualizarTela(data);
      saveReadingToDB(data);
      hideSpinner();
    } catch (e) {
      console.error("Erro ao processar JSON:", e);
    }
  });

  client.on('error', (err) => {
    console.error("Erro de conexão:", err);
  });
}

main(); // ❌ Comentado para desativar conexão com broker MQTT

/**
 * Simula leituras de umidade para testes, gerando dados fake e atualizando a interface.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function simularLeiturasFake() {
  let umidade = 0;
  let tempoTotal = 20000; // 20 segundos
  let intervalo = 1000;   // 1 segundo
  let passos = tempoTotal / intervalo;
  let incremento = 90 / passos;
  let contador = 0;

  function gerarLeitura() {
    if (contador >= passos) {
      console.log("✅ Simulação finalizada.");
      return;
    }

    umidade = Math.min(umidade + incremento, 90);
    const valor = Math.floor(Math.random() * 1023); // valor simulado do FC-28
    const estado = umidade < 30 ? 'Seco' : umidade < 60 ? 'Úmido' : 'Molhado';
    const intensidade = umidade >= 70 ? 'Alta' : 'Normal';
    const agora = new Date();
    const hora = agora.toLocaleTimeString('pt-BR', { hour12: false });

    const leitura = {
      hora,
      valor,
      umidade: Math.round(umidade),
      estado,
      intensidade
    };

    console.log("📡 Leitura fake:", leitura);
    atualizarTela(leitura);
    saveReadingToDB(leitura);

    contador++;
    setTimeout(gerarLeitura, intervalo);
  }

  gerarLeitura();
}

//simularLeiturasFake();

let alertLimitReached = false;

/**
 * Salva uma leitura no banco de dados via API e dispara alertas se necessário.
 * @param {Object} data - Objeto com dados da leitura.
 * Não retorna nada.
 */
function saveReadingToDB(data) {
  fetch('api/save_reading.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
    .then(res => res.text())
    .then(result => {
      console.log("💾 Leitura salva:", result);

      const intensidadeAlta = data.intensidade.toLowerCase() === 'alta';

      if (!intensidadeAlta) {
        console.log('🔕 Alerta não enviado: Intensidade não é alta.');
        return;
      }

      if (alertLimitReached) {
        console.log("⛔ Alerta não enviado: Limite diário de mensagens atingido.");
        return;
      }

      const mensagem = `Alerta de Umidade Alta!\nO sensor FC-28 detectou umidade de ${data.umidade}% às ${data.hora}.\nRisco de vazamento ou solo encharcado.`;

      // Envia SMS
      fetch('api/send_sms.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: mensagem })
      })
        .then(res => res.text())
        .then(msg => {
          if (msg.includes("exceeded the 9 daily messages limit")) {
            alertLimitReached = true;
            console.warn("🚫 SMS não enviado: Limite diário atingido.");
          } else if (msg.toLowerCase().includes("já enviado")) {
            console.warn("⏱️ SMS já enviado na última hora. Aguardando.");
          } else if (msg.toLowerCase().includes("enviado")) {
            console.log("✅ SMS enviado com sucesso.");
          } else {
            console.warn("⚠️ SMS não enviado. Resposta:", msg);
          }
        })
        .catch(err => console.error("❌ Erro ao enviar SMS:", err));

      // Envia WhatsApp
      fetch('api/send_whatsapp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg: mensagem })
      })
        .then(res => res.text())
        .then(msg => {
          if (msg.includes("exceeded") || msg.includes("limit")) {
            alertLimitReached = true;
            console.warn("🚫 WhatsApp não enviado: Limite diário atingido.");
          } else if (msg.toLowerCase().includes("já enviado")) {
            console.warn("⏱️ WhatsApp já enviado na última hora. Aguardando.");
          } else if (msg.toLowerCase().includes("enviado")) {
            console.log("✅ WhatsApp enviado com sucesso.");
          } else {
            console.warn("⚠️ WhatsApp não enviado. Resposta:", msg);
          }
        })
        .catch(err => console.error("❌ Erro ao enviar WhatsApp:", err));
    });
}

/**
 * Retorna a cor de fonte ideal para o gráfico, de acordo com o tema atual.
 * Não recebe parâmetros.
 * @returns {string} Cor em hexadecimal.
 */
function getChartFontColor() {
  return document.body.classList.contains('dark') ? '#fff' : '#222';
}

/**
 * Atualiza as cores do gráfico conforme o tema (claro/escuro).
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function updateChartColors() {
  const fontColor = getChartFontColor();
  const gridColor = document.body.classList.contains('dark') ? '#fff' : '#e0e0e0';
  historyChart.options.scales.x.ticks.color = fontColor;
  historyChart.options.scales.y.ticks.color = fontColor;
  historyChart.options.scales.x.grid.color = gridColor;
  historyChart.options.scales.y.grid.color = gridColor;
  historyChart.options.plugins.legend.labels.color = fontColor;
  historyChart.data.datasets[0].borderColor = document.body.classList.contains('dark') ? '#90caf9' : '#2196f3';
  historyChart.data.datasets[0].backgroundColor = document.body.classList.contains('dark') ? 'rgba(144,202,249,0.1)' : 'rgba(33,150,243,0.1)';
  historyChart.update();
}

/**
 * Converte um array de objetos em uma string CSV.
 * @param {Array<Object>} arr - Array de objetos a serem convertidos.
 * @returns {string} CSV gerado.
 */
function toCSV(arr) {
  if (!arr.length) return '';
  const keys = Object.keys(arr[0]);
  const lines = [keys.join(',')];
  arr.forEach(obj => {
    lines.push(keys.map(k => `"${(obj[k] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  });
  return lines.join('\r\n');
}

/**
 * Faz download de um arquivo com o conteúdo e tipo especificados.
 * @param {string|Blob} content - Conteúdo do arquivo.
 * @param {string} filename - Nome do arquivo.
 * @param {string} mime - Tipo MIME do arquivo.
 * Não retorna nada.
 */
function downloadFile(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Renderiza o heatmap de calendário com médias diárias de umidade.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
function renderCalendarHeatmap() {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10); // yyyy-mm-dd
    days.push({ date: key, values: [] });
  }

  // Agrupa leituras por data
  for (let i = 0; i < historyTimestamps.length; i++) {
    const date = historyTimestamps[i];
    const idx = days.findIndex(day => day.date === date);
    if (idx !== -1) {
      days[idx].values.push(historyData[i]);
    }
  }

  // Calcula médias
  days.forEach(day => {
    if (day.values.length) {
      day.avg = Math.round(day.values.reduce((a, b) => a + b, 0) / day.values.length);
    } else {
      day.avg = null;
    }
  });

  // Determina o nível de cor pela média de umidade
  function getLevel(avg) {
    if (avg == null) return 0;
    if (avg < 30) return 1;
    if (avg < 60) return 2;
    if (avg < 80) return 3;
    return 4;
  }

  // Renderiza o grid
  calendarHeatmap.innerHTML = '';
  days.forEach(day => {
    const div = document.createElement('div');
    div.className = 'heatmap-day';
    div.dataset.level = getLevel(day.avg);
    if (day.date === today.toISOString().slice(0, 10)) div.classList.add('today');
    div.title = day.avg != null
      ? `${day.date}\nMédia: ${day.avg}%`
      : `${day.date}\nSem dados`;
    div.textContent = day.avg != null ? day.avg : '';
    calendarHeatmap.appendChild(div);
  });
}

/**
 * Carrega e exibe a lista de contatos cadastrados no modal.
 * Função assíncrona.
 * Não recebe parâmetros.
 * Não retorna nada.
 */
async function loadContactsList() {
  contactsListDiv.innerHTML = 'Carregando...';
  const res = await fetch('api/get_contacts.php');
  const contacts = await res.json();
  if (!contacts.length) {
    contactsListDiv.innerHTML = '<p style="text-align:center;color:#888;">Nenhum contato cadastrado.</p>';
    return;
  }
  contactsListDiv.innerHTML = `
    <div style="display:flex; font-weight:bold; border-bottom:1px solid #eee; padding-bottom:6px; margin-bottom:8px;">
      <span style="flex:2;">Contato</span>
      <span style="flex:1;">Tipo</span>
      <span style="width:120px;"></span>
    </div>
  `;
  contacts.forEach(contact => {
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.justifyContent = 'space-between';
    div.style.marginBottom = '10px';
    div.style.gap = '10px';

    // Exibe o tipo de forma amigável
    let tipoLabel = '';
    if (contact.tipo === 'telefone') tipoLabel = 'Telefone (SMS)';
    else if (contact.tipo === 'email') tipoLabel = 'E-mail';
    else if (contact.tipo === 'whatsapp') tipoLabel = 'WhatsApp';
    else tipoLabel = contact.tipo || '-';

    div.innerHTML = `
      <span style="flex:2;">${contact.contato}</span>
      <span style="flex:1;text-transform:capitalize;">${tipoLabel}</span>
      <span style="display:flex;gap:6px;"></span>
    `;

    const actionsSpan = div.querySelector('span[style*="display:flex"]');

    // Botão SMS apenas para telefone
    if (contact.tipo === 'telefone') {
      const smsBtn = document.createElement('button');
      smsBtn.className = 'contact-sms-btn';
      smsBtn.title = "Enviar SMS";
      smsBtn.style = "background:#43a047;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;";
      smsBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 21l21-9-21-9v7l15 2-15 2v7z" fill="#fff"/></svg>';
      smsBtn.onclick = async () => {
        const res = await fetch('api/send_sms.php?id=' + contact.id, { method: 'POST' });
        const msg = await res.text();
        alert(msg);
        console.log('Resultado do envio de SMS:', msg);
      };
      actionsSpan.appendChild(smsBtn);
    }

    // Botão WhatsApp apenas para whatsapp
    if (contact.tipo === 'whatsapp') {
      const whatsappBtn = document.createElement('button');
      whatsappBtn.title = "Enviar WhatsApp";
      whatsappBtn.style = "background:#25d366;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;";
      whatsappBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.67.15-.198.297-.767.967-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.205 5.077 4.366.71.306 1.263.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347z" fill="#fff"/></svg>';
      whatsappBtn.onclick = async () => {
        const res = await fetch('api/send_whatsapp.php?id=' + contact.id, { method: 'POST' });
        const msg = await res.text();
        alert(msg);
        console.log('Resultado do envio de WhatsApp:', msg);
      };
      actionsSpan.appendChild(whatsappBtn);
    }

    // Botão excluir para todos
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'contact-delete-btn';
    deleteBtn.title = "Excluir";
    deleteBtn.style = "background:#e53935;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;";
    deleteBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16z" stroke="#fff" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="#fff" stroke-width="2"/></svg>';
    deleteBtn.onclick = async () => {
      if (confirm('Excluir este contato?')) {
        await fetch('api/delete_contact.php?id=' + contact.id, { method: 'POST' });
        await loadContactsList();
      }
    };
    actionsSpan.appendChild(deleteBtn);

    contactsListDiv.appendChild(div);
  });
}