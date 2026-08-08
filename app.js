/* ==========================================================================
   PERSONAL DASHBOARD COMMAND CENTER - JAVASCRIPT ENGINE
   Features: 3-Layer Persistence, Timestamp Guard, Task Timer (Cronômetro/Regressivo/Pomodoro),
   Focus Score 4-Criteria Engine, Health Metric & Hábitos Saudáveis Engine (Sono, Exercícios Cardio/Musculação, Calorias),
   IMC Status Indicator (Verde/Vermelho), and Comparative SVG Charts.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'command_center_state';
  const GITHUB_OWNER = 'elielos123';
  const GITHUB_REPO = 'hubpersonal';

  // Default Global Application State
  let appState = {
    lastUpdated: "2026-08-08T01:44:37.000Z",
    user: {
      name: "Eliel Tavares",
      role: "Lead Architect & Systems Engineer",
      status: "Online",
      avatar: "ET",
      birthDate: "1994-08-15",
      weight: "78.5",
      height: "1.78",
      currentBmi: 24.8,
      healthyBmi: "18.5 - 24.9",
      commitmentStatus: "ALTO (94%)"
    },
    kpis: {
      focusScore: {
        value: 85,
        label: "Focus Score",
        target: "85%",
        deepWork: {
          accumulatedSeconds: 24480, // 6.8 hours
          targetHours: 8.0
        },
        deepWorkHistory: {
          today: 6.8,
          yesterday: 5.2,
          weeklyAvg7Days: 6.1,
          monthlyAvg: 5.8
        }
      },
      healthMetric: {
        value: 92,
        label: "Health Index",
        history: [65, 70, 72, 78, 80, 82, 85, 84, 88, 90, 89, 92],
        sleep: {
          hours: 7.5,
          target: 7.5,
          completed: true
        },
        exercise: {
          type: "Cardio",
          time: "07:00 AM",
          durationMinutes: 45,
          completed: true
        },
        caloricBalance: {
          intakeKcal: 2100,
          expenditureKcal: 2450,
          netKcal: -350,
          isPositive: true,
          completed: true
        }
      },
      financesMetric: { value: "$14,250", trend: "+12.4%", label: "Monthly Cashflow", isPositive: true },
      learningMetric: { value: 68, label: "Quarterly Target", details: "34 / 50 Hours Completed" }
    },
    timerState: {
      mode: 'pomodoro', // 'cronometro', 'regressivo', 'pomodoro'
      seconds: 1500,     // 25 mins
      initialSeconds: 1500,
      isRunning: false
    },
    pipeline: { ideation: 2, construction: 4, validation: 1, completed: 8 },
    projects: [
      {
        id: "proj-1",
        title: "Quantum Flow Engine",
        impactThesis: "Automate cross-cloud distributed workflow execution with sub-millisecond latency.",
        completionPercentage: 78,
        status: "ON TRACK",
        stage: "Construction",
        nextMilestone: { title: "gRPC Streaming Pipeline Integration", date: "Aug 08, 2026" },
        milestones: [
          { title: "Core Async Event Loop Architecture", completed: true },
          { title: "In-Memory State Snapshotting", completed: true },
          { title: "gRPC Streaming Pipeline Integration", completed: false },
          { title: "Multi-Region Distributed Failover", completed: false }
        ]
      },
      {
        id: "proj-2",
        title: "Aegis AI Guardrails",
        impactThesis: "Zero-trust prompt isolation & real-time PII redactor proxy for LLM APIs.",
        completionPercentage: 45,
        status: "DELAYED",
        stage: "Construction",
        nextMilestone: { title: "Contextual Embedding Filter Benchmark", date: "Aug 12, 2026" },
        milestones: [
          { title: "Proxy Interceptor Middleware", completed: true },
          { title: "Regex & Entity Recognition Rule Engine", completed: true },
          { title: "Contextual Embedding Filter Benchmark", completed: false },
          { title: "SOC2 Compliance Audit Trail Logger", completed: false }
        ]
      },
      {
        id: "proj-3",
        title: "Atlas Bio-Analytics Dashboard",
        impactThesis: "Unified clinical genomic data visualization & variant pathogenicity workbench.",
        completionPercentage: 90,
        status: "ON TRACK",
        stage: "Validation",
        nextMilestone: { title: "Final User Acceptance Testing & Vercel Edge Deploy", date: "Aug 05, 2026" },
        milestones: [
          { title: "VCF Reader & High-throughput Parser", completed: true },
          { title: "Interactive 3D Protein Viewer Module", completed: true },
          { title: "ClinVar & gnomAD API Integration", completed: true },
          { title: "Final User Acceptance Testing & Vercel Edge Deploy", completed: false }
        ]
      },
      {
        id: "proj-4",
        title: "Hyperion Design System",
        impactThesis: "Ultra-lightweight dark technical UI components & custom WebGL canvas shaders.",
        completionPercentage: 25,
        status: "ON TRACK",
        stage: "Ideation",
        nextMilestone: { title: "Tokens & Monospaced Typography Specs", date: "Aug 18, 2026" },
        milestones: [
          { title: "Palette & CSS Variable Foundation", completed: true },
          { title: "Tokens & Monospaced Typography Specs", completed: false },
          { title: "Component Library Storybook", completed: false }
        ]
      }
    ],
    timeline: [
      { id: "item-1", group: "Today", title: "Review gRPC proto schemas for Quantum Flow", projectTag: "#QuantumFlow", status: "ON TRACK", completed: true, time: "09:30 AM" },
      { id: "item-2", group: "Today", title: "Benchmark Aegis PII redact latency under load", projectTag: "#AegisAI", status: "DELAYED", completed: false, time: "02:15 PM" },
      { id: "item-3", group: "Today", title: "Deploy Atlas Bio-Analytics beta to staging Vercel", projectTag: "#AtlasBio", status: "ON TRACK", completed: false, time: "05:00 PM" },
      { id: "item-4", group: "Tomorrow", title: "Hyperion Design Token review with team", projectTag: "#HyperionUI", status: "ON TRACK", completed: false, time: "10:00 AM" },
      { id: "item-5", group: "Tomorrow", title: "Weekly architecture review & sprint retrospective", projectTag: "#SystemHealth", status: "ON TRACK", completed: false, time: "04:00 PM" }
    ],
    activeFilter: "ALL",
    selectedProjectId: null
  };

  let timerInterval = null;

  // Check LocalStorage cache
  const localSaved = localStorage.getItem(STORAGE_KEY);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && parsed.user) {
        appState = Object.assign({}, appState, parsed);
      }
    } catch (e) {
      console.warn('Invalid local storage cache');
    }
  }

  initApp();
  syncWithCloud();

  function initApp() {
    setupLiveClock();
    renderUserProfile();
    renderKPIs();
    renderProjectsStack();
    renderPipelineFooter();
    renderDeliveryStream();
    setupEventListeners();
    updateTimerDisplay();
  }

  /* --------------------------------------------------------------------------
     HEALTH METRICS & HÁBITOS SAUDÁVEIS ENGINE
     -------------------------------------------------------------------------- */
  function calculateHealthMetrics() {
    const bmi = parseFloat(appState.user.currentBmi) || 24.8;
    const isHealthyBmi = bmi >= 18.5 && bmi <= 24.9;

    const sleep = appState.kpis.healthMetric.sleep || { hours: 7.5, completed: true };
    const sleepDiff = sleep.hours - 7.5;
    const isSleepHealthy = sleep.hours >= 7.0 && sleep.hours <= 8.5;

    const exercise = appState.kpis.healthMetric.exercise || { type: "Cardio", time: "07:00 AM", durationMinutes: 45, completed: true };
    
    const cal = appState.kpis.healthMetric.caloricBalance || { intakeKcal: 2100, expenditureKcal: 2450, netKcal: -350, isPositive: true };
    const netKcal = cal.intakeKcal - cal.expenditureKcal;

    // Caloric Rule: Positive if Intake < Expenditure when BMI > 24.9 (overweight)
    let isCaloriePositive = false;
    if (bmi > 24.9) {
      isCaloriePositive = netKcal < 0;
    } else {
      isCaloriePositive = netKcal <= 300;
    }

    let completedHabits = 0;
    if (isSleepHealthy) completedHabits++;
    if (exercise.durationMinutes >= 20) completedHabits++;
    if (isCaloriePositive) completedHabits++;

    const healthScore = Math.round((completedHabits / 3) * 100);
    appState.kpis.healthMetric.value = healthScore > 0 ? healthScore : 92;

    return {
      bmi,
      isHealthyBmi,
      sleepHours: sleep.hours,
      sleepDiff: sleepDiff > 0 ? `+${sleepDiff.toFixed(1)}h` : `${sleepDiff.toFixed(1)}h`,
      isSleepHealthy,
      exerciseType: exercise.type,
      exerciseTime: exercise.time,
      exerciseDuration: exercise.durationMinutes,
      intakeKcal: cal.intakeKcal,
      expenditureKcal: cal.expenditureKcal,
      netKcal,
      isCaloriePositive,
      completedHabits
    };
  }

  /* --------------------------------------------------------------------------
     FOCUS SCORE & 4 CRITERIA CALCULATION ENGINE
     -------------------------------------------------------------------------- */
  function calculateFocusScore() {
    let completedCount = 0;
    let pendingCount = 0;
    let delayedCount = 0;

    appState.timeline.forEach(item => {
      if (item.completed) completedCount++;
      else if (item.status === 'DELAYED') delayedCount++;
      else pendingCount++;
    });

    appState.projects.forEach(proj => {
      if (proj.status === 'DELAYED') delayedCount += 0.5;
    });

    const dw = appState.kpis.focusScore.deepWork || { accumulatedSeconds: 24480, targetHours: 8.0 };
    const accumulatedHours = (dw.accumulatedSeconds / 3600);
    appState.kpis.focusScore.deepWorkHistory.today = parseFloat(accumulatedHours.toFixed(1));

    const dwRatio = Math.min(1.0, accumulatedHours / dw.targetHours);
    const totalTasks = (completedCount + pendingCount + (delayedCount * 1.5)) || 1;
    const taskRatio = (completedCount / totalTasks);
    
    let score = Math.round((taskRatio * 60) + (dwRatio * 40));
    score = Math.max(10, Math.min(99, score));

    appState.kpis.focusScore.value = score;
    return {
      score,
      completedCount,
      pendingCount,
      delayedCount: Math.ceil(delayedCount),
      accumulatedHours: accumulatedHours.toFixed(1),
      targetHours: dw.targetHours
    };
  }

  /* --------------------------------------------------------------------------
     STATE PERSISTENCE & TIMESTAMP CONFLICT GUARD
     -------------------------------------------------------------------------- */
  function updateState(updaterFn) {
    if (typeof updaterFn === 'function') {
      updaterFn(appState);
    }
    appState.lastUpdated = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    
    updateSyncBadge('syncing', 'Sincronizando...');
    syncWithCloud();
  }

  async function syncWithCloud() {
    updateSyncBadge('syncing', 'Conectando nuvem...');

    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          state: appState,
          clientTimestamp: appState.lastUpdated || new Date().toISOString()
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.action === 'pulled_cloud_to_client' && data.cloudState) {
          appState = Object.assign({}, appState, data.cloudState);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
          renderAll();
          updateSyncBadge('synced', `☁️ Nuvem (Atualizado do Servidor)`);
        } else {
          updateSyncBadge('synced', `☁️ Sincronizado (Nuvem/GitHub)`);
        }
        return;
      }
    } catch (e) {
      await fallbackGitHubSync();
    }
  }

  async function fallbackGitHubSync() {
    try {
      const fileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/projects.json`;
      const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'CommandCenterApp' };

      const checkRes = await fetch(fileUrl, { headers });
      if (!checkRes.ok) throw new Error('GitHub API unreachable');

      const ghData = await checkRes.json();
      const contentUtf8 = Buffer.from(ghData.content, 'base64').toString('utf8');
      const cloudState = JSON.parse(contentUtf8);
      const cloudTime = new Date(cloudState.lastUpdated || '1970-01-01').getTime();
      const clientTime = new Date(appState.lastUpdated || '1970-01-01').getTime();

      if (cloudTime > clientTime) {
        appState = Object.assign({}, appState, cloudState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
        renderAll();
        updateSyncBadge('synced', `☁️ GitHub: Dados Atualizados`);
      } else {
        updateSyncBadge('synced', `💾 Salvo no Navegador`);
      }
    } catch (err) {
      updateSyncBadge('synced', `💾 Salvo no Navegador`);
    }
  }

  function updateSyncBadge(status, text) {
    const dot = document.getElementById('sync-status-dot');
    const label = document.getElementById('sync-status-text');

    if (dot) {
      dot.className = `sync-dot ${status === 'synced' ? 'dot-synced' : status === 'syncing' ? 'dot-syncing' : 'dot-conflict'}`;
    }
    if (label) {
      label.textContent = text;
    }
  }

  function renderAll() {
    renderUserProfile();
    renderKPIs();
    renderProjectsStack();
    renderPipelineFooter();
    renderDeliveryStream();
  }

  /* --------------------------------------------------------------------------
     EXPORT & IMPORT BACKUP (JSON)
     -------------------------------------------------------------------------- */
  function exportBackupJSON() {
    appState.lastUpdated = new Date().toISOString();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dashboard_backup_${dateStamp}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    alert('Backup baixado com sucesso!');
  }

  function importBackupJSON(file) {
    if (!file) return;
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (imported && (imported.user || imported.projects)) {
          appState = Object.assign({}, appState, imported);
          appState.lastUpdated = new Date().toISOString();
          
          localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
          renderAll();
          syncWithCloud();
          alert('Backup restaurado e sincronizado com sucesso!');
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao ler o arquivo JSON de backup.');
      }
    };

    reader.readAsText(file);
  }

  /* --------------------------------------------------------------------------
     TASK TIMER ENGINE (RELÓGIO DE TAREFA)
     -------------------------------------------------------------------------- */
  function setTimerMode(mode) {
    appState.timerState.mode = mode;
    pauseTimer();

    if (mode === 'cronometro') {
      appState.timerState.seconds = 0;
      appState.timerState.initialSeconds = 0;
    } else if (mode === 'regressivo') {
      appState.timerState.seconds = 2700;
      appState.timerState.initialSeconds = 2700;
    } else if (mode === 'pomodoro') {
      appState.timerState.seconds = 1500;
      appState.timerState.initialSeconds = 1500;
    }

    updateTimerDisplay();

    document.querySelectorAll('.timer-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
  }

  function startTimer() {
    if (appState.timerState.isRunning) return;
    appState.timerState.isRunning = true;

    const startBtn = document.getElementById('timer-btn-start');
    if (startBtn) startBtn.textContent = '▶ Em Execução...';

    timerInterval = setInterval(() => {
      if (appState.timerState.mode === 'cronometro') {
        appState.timerState.seconds++;
      } else {
        if (appState.timerState.seconds > 0) {
          appState.timerState.seconds--;
        } else {
          pauseTimer();
          alert('Tempo de Foco concluído!');
        }
      }

      appState.kpis.focusScore.deepWork.accumulatedSeconds++;
      updateTimerDisplay();
      renderKPIs();
    }, 1000);
  }

  function pauseTimer() {
    appState.timerState.isRunning = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const startBtn = document.getElementById('timer-btn-start');
    if (startBtn) startBtn.textContent = '▶ Iniciar Focus';

    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }

  function resetTimer() {
    pauseTimer();
    setTimerMode(appState.timerState.mode);
  }

  function updateTimerDisplay() {
    const displayEl = document.getElementById('timer-display-val');
    if (!displayEl) return;

    const sec = appState.timerState.seconds;
    const h = String(Math.floor(sec / 3600)).padStart(2, '0');
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');

    displayEl.textContent = `${h}:${m}:${s}`;
  }

  /* --------------------------------------------------------------------------
     HÁBITOS SAUDÁVEIS SVG CHARTS RENDERER
     -------------------------------------------------------------------------- */
  function renderHabitsFulfillmentChart(hMetrics) {
    const container = document.getElementById('chart-habits-fulfillment-container');
    if (!container) return;

    const completed = hMetrics.completedHabits || 3;
    const pending = 3 - completed;

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <line x1="0" y1="60" x2="400" y2="60" stroke="#232C36" stroke-dasharray="3,3" />

        <!-- Bar 1: Concluídos -->
        <rect x="80" y="${100 - (completed * 25)}" width="90" height="${completed * 25}" rx="4" fill="#00E676" />
        <text x="125" y="${88 - (completed * 25)}" fill="#00E676" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${completed} Hábitos (${Math.round((completed/3)*100)}%)</text>
        <text x="125" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Realizados Hoje</text>

        <!-- Bar 2: Pendentes -->
        <rect x="230" y="${100 - (pending * 25)}" width="90" height="${pending * 25}" rx="4" fill="#FF9100" />
        <text x="275" y="${88 - (pending * 25)}" fill="#FF9100" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${pending} Pendentes</text>
        <text x="275" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Não Realizados</text>
      </svg>
    `;
  }

  function renderHabitsVarianceChart(hMetrics) {
    const container = document.getElementById('chart-habits-variance-container');
    if (!container) return;

    const sleepDiffVal = (hMetrics.sleepHours - 7.5).toFixed(1);
    const netKcal = hMetrics.netKcal;

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <line x1="0" y1="60" x2="400" y2="60" stroke="#5E81AC" stroke-width="1.5" />

        <!-- Bar 1: Variação de Sono (Horas vs 7.5h Meta) -->
        <rect x="70" y="${sleepDiffVal >= 0 ? 60 - Math.min(45, Math.abs(sleepDiffVal) * 20) : 60}" width="80" height="${Math.max(10, Math.min(45, Math.abs(sleepDiffVal) * 20))}" rx="4" fill="${hMetrics.isSleepHealthy ? '#00E676' : '#FF9100'}" />
        <text x="110" y="${sleepDiffVal >= 0 ? 50 - Math.min(45, Math.abs(sleepDiffVal) * 20) : 80 + Math.min(45, Math.abs(sleepDiffVal) * 20)}" fill="${hMetrics.isSleepHealthy ? '#00E676' : '#FF9100'}" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${hMetrics.sleepDiff}</text>
        <text x="110" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Sono vs Meta</text>

        <!-- Bar 2: Balanço Calórico (Líquido kcal) -->
        <rect x="250" y="${netKcal <= 0 ? 60 - Math.min(45, Math.abs(netKcal) / 10) : 60}" width="80" height="${Math.max(10, Math.min(45, Math.abs(netKcal) / 10))}" rx="4" fill="${hMetrics.isCaloriePositive ? '#00E676' : '#FF5252'}" />
        <text x="290" y="${netKcal <= 0 ? 50 - Math.min(45, Math.abs(netKcal) / 10) : 80 + Math.min(45, Math.abs(netKcal) / 10)}" fill="${hMetrics.isCaloriePositive ? '#00E676' : '#FF5252'}" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${netKcal} kcal</text>
        <text x="290" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Balanço Calórico</text>
      </svg>
    `;
  }

  /* --------------------------------------------------------------------------
     FOCUS SCORE SVG CHARTS RENDERER
     -------------------------------------------------------------------------- */
  function renderTaskRatioChart(metrics) {
    const container = document.getElementById('chart-task-ratio-container');
    if (!container) return;

    const completed = metrics.completedCount || 3;
    const pending = metrics.pendingCount || 2;
    const delayed = metrics.delayedCount || 1;
    const total = completed + pending + delayed || 1;

    const pComp = Math.round((completed / total) * 100);
    const pPend = Math.round((pending / total) * 100);
    const pDel = Math.round((delayed / total) * 100);

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <line x1="0" y1="30" x2="400" y2="30" stroke="#232C36" stroke-dasharray="3,3" />
        <line x1="0" y1="70" x2="400" y2="70" stroke="#232C36" stroke-dasharray="3,3" />

        <rect x="40" y="${100 - pComp}" width="70" height="${pComp}" rx="4" fill="#00E676" />
        <text x="75" y="${90 - pComp}" fill="#00E676" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${completed} (${pComp}%)</text>
        <text x="75" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Concluídas</text>

        <rect x="165" y="${100 - pPend}" width="70" height="${pPend}" rx="4" fill="#88C0D0" />
        <text x="200" y="${90 - pPend}" fill="#88C0D0" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${pending} (${pPend}%)</text>
        <text x="200" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Pendentes</text>

        <rect x="290" y="${100 - pDel}" width="70" height="${pDel}" rx="4" fill="#FF9100" />
        <text x="325" y="${90 - pDel}" fill="#FF9100" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${delayed} (${pDel}%)</text>
        <text x="325" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Atrasadas</text>
      </svg>
    `;
  }

  function renderDeepWorkComparativeChart() {
    const container = document.getElementById('chart-deepwork-container');
    if (!container) return;

    const dh = appState.kpis.focusScore.deepWorkHistory || { today: 6.8, yesterday: 5.2, weeklyAvg7Days: 6.1, monthlyAvg: 5.8 };
    const maxVal = 10.0;

    const hToday = Math.round((dh.today / maxVal) * 80);
    const hWeekly = Math.round((dh.weeklyAvg7Days / maxVal) * 80);
    const hMonthly = Math.round((dh.monthlyAvg / maxVal) * 80);

    container.innerHTML = `
      <svg width="100%" height="100%" viewBox="0 0 400 120" preserveAspectRatio="none">
        <line x1="0" y1="36" x2="400" y2="36" stroke="#5E81AC" stroke-width="1.5" stroke-dasharray="4,4" />
        <text x="395" y="32" fill="#5E81AC" font-size="10" font-family="JetBrains Mono" text-anchor="end">Target: 8.0h</text>

        <rect x="40" y="${100 - hToday}" width="70" height="${hToday}" rx="4" fill="#00E676" />
        <text x="75" y="${90 - hToday}" fill="#00E676" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${dh.today}h</text>
        <text x="75" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Diário (Hoje)</text>

        <rect x="165" y="${100 - hWeekly}" width="70" height="${hWeekly}" rx="4" fill="#88C0D0" />
        <text x="200" y="${90 - hWeekly}" fill="#88C0D0" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${dh.weeklyAvg7Days}h</text>
        <text x="200" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Média 7d</text>

        <rect x="290" y="${100 - hMonthly}" width="70" height="${hMonthly}" rx="4" fill="#5E81AC" />
        <text x="325" y="${90 - hMonthly}" fill="#5E81AC" font-size="12" font-family="JetBrains Mono" font-weight="700" text-anchor="middle">${dh.monthlyAvg}h</text>
        <text x="325" y="115" fill="#81A1C1" font-size="11" font-family="Inter" text-anchor="middle">Média Mensal</text>
      </svg>
    `;
  }

  /* --------------------------------------------------------------------------
     LIVE CLOCK & UTILS
     -------------------------------------------------------------------------- */
  function setupLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    
    function updateClock() {
      const now = new Date();
      const hours = String(now.getUTCHours()).padStart(2, '0');
      const minutes = String(now.getUTCMinutes()).padStart(2, '0');
      const seconds = String(now.getUTCSeconds()).padStart(2, '0');
      clockEl.textContent = `${hours}:${minutes}:${seconds} UTC`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  function calculateAge(birthDateStr) {
    if (!birthDateStr) return '31';
    const birth = new Date(birthDateStr);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : 31;
  }

  function formatDatePt(dateStr) {
    if (!dateStr) return '15/08/1994';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  /* --------------------------------------------------------------------------
     PROFILE & KPIS RENDER
     -------------------------------------------------------------------------- */
  function renderUserProfile() {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');
    const birthAgeEl = document.getElementById('user-birth-age');
    const weightEl = document.getElementById('user-weight');
    const heightEl = document.getElementById('user-height');
    const currentBmiEl = document.getElementById('user-current-bmi');
    const healthyBmiEl = document.getElementById('user-healthy-bmi');
    const commitmentEl = document.getElementById('user-commitment');

    const u = appState.user;

    if (avatarEl) avatarEl.textContent = u.avatar || 'ET';
    if (nameEl) nameEl.textContent = u.name || 'Eliel Tavares';
    if (roleEl) roleEl.textContent = u.role || 'Systems Architect';

    const age = calculateAge(u.birthDate);
    const formattedBirth = formatDatePt(u.birthDate);
    if (birthAgeEl) birthAgeEl.textContent = `${formattedBirth} (${age} anos)`;

    if (weightEl) weightEl.textContent = `${u.weight || '78.5'} kg`;
    if (heightEl) heightEl.textContent = `${u.height || '1.78'} m`;
    if (currentBmiEl) currentBmiEl.textContent = u.currentBmi || '24.8';
    if (healthyBmiEl) healthyBmiEl.textContent = u.healthyBmi || '18.5 - 24.9';
    if (commitmentEl) commitmentEl.textContent = u.commitmentStatus || 'ALTO (94%)';
  }

  function renderKPIs() {
    // Render Focus Score Card
    const metrics = calculateFocusScore();
    const focusValEl = document.getElementById('focus-score-val');
    const focusFillEl = document.getElementById('focus-ring-fill');
    const focusDwEl = document.getElementById('focus-deepwork-val');
    const focusSubEl = document.getElementById('focus-trend-subtext');

    if (focusValEl && focusFillEl) {
      focusValEl.textContent = `${metrics.score}%`;
      const circumference = 2 * Math.PI * 24;
      const offset = circumference - (metrics.score / 100) * circumference;
      focusFillEl.style.strokeDashoffset = offset;
    }
    if (focusDwEl) focusDwEl.textContent = `${metrics.accumulatedHours} / ${metrics.targetHours} hrs`;
    if (focusSubEl) focusSubEl.textContent = `Média 7d: ${appState.kpis.focusScore.deepWorkHistory.weeklyAvg7Days}h`;

    // Render Health Metric Card (Card 3)
    const hMetrics = calculateHealthMetrics();
    const healthValEl = document.getElementById('health-val');
    const cardImcBadge = document.getElementById('card-imc-badge');
    const cardHabitsCounter = document.getElementById('card-habits-counter');

    if (healthValEl) healthValEl.textContent = `${hMetrics.completedHabits === 3 ? 95 : 82}%`;
    if (cardImcBadge) {
      if (hMetrics.isHealthyBmi) {
        cardImcBadge.className = 'badge badge-imc-green';
        cardImcBadge.textContent = `IMC ${hMetrics.bmi} SAUDÁVEL`;
      } else {
        cardImcBadge.className = 'badge badge-imc-red';
        cardImcBadge.textContent = `IMC ${hMetrics.bmi} ATENÇÃO`;
      }
    }
    if (cardHabitsCounter) {
      cardHabitsCounter.textContent = `${hMetrics.completedHabits}/3 Hábitos Concluídos`;
    }

    // Render Finances & Learning Metrics
    const finValEl = document.getElementById('finances-val');
    const finTrendEl = document.getElementById('finances-trend');
    if (finValEl) finValEl.textContent = appState.kpis.financesMetric.value || '$14,250';
    if (finTrendEl) finTrendEl.textContent = `${appState.kpis.financesMetric.trend} ↑`;

    const learnValEl = document.getElementById('learning-val');
    const learnFillEl = document.getElementById('learning-bar-fill');
    const learnDetailsEl = document.getElementById('learning-details');
    if (learnValEl) learnValEl.textContent = `${appState.kpis.learningMetric.value}%`;
    if (learnFillEl) learnFillEl.style.width = `${appState.kpis.learningMetric.value}%`;
    if (learnDetailsEl) learnDetailsEl.textContent = appState.kpis.learningMetric.details;

    renderFocusModalData(metrics);
    renderHealthModalData(hMetrics);
  }

  function renderFocusModalData(metrics) {
    const cComp = document.getElementById('crit-completed-val');
    const cPend = document.getElementById('crit-pending-val');
    const cDel = document.getElementById('crit-delayed-val');
    const cDw = document.getElementById('crit-deepwork-val');

    if (cComp) cComp.textContent = `${metrics.completedCount} tarefas`;
    if (cPend) cPend.textContent = `${metrics.pendingCount} tarefas`;
    if (cDel) cDel.textContent = `${metrics.delayedCount} (Penalidade 1.5x)`;
    if (cDw) cDw.textContent = `${metrics.accumulatedHours} / ${metrics.targetHours} hrs`;

    renderTaskRatioChart(metrics);
    renderDeepWorkComparativeChart();
  }

  function renderHealthModalData(hMetrics) {
    const badgeEl = document.getElementById('modal-imc-status-badge');
    const descEl = document.getElementById('modal-imc-desc');

    if (badgeEl) {
      if (hMetrics.isHealthyBmi) {
        badgeEl.className = 'badge badge-imc-green';
        badgeEl.textContent = `IMC ${hMetrics.bmi} — SAUDÁVEL`;
      } else {
        badgeEl.className = 'badge badge-imc-red';
        badgeEl.textContent = `IMC ${hMetrics.bmi} — FORA DA FAIXA`;
      }
    }

    if (descEl) {
      if (hMetrics.isHealthyBmi) {
        descEl.textContent = `Seu IMC atual (${hMetrics.bmi}) está dentro do critério de referência saudável (18.5 - 24.9).`;
      } else {
        descEl.textContent = `Atenção: Seu IMC atual (${hMetrics.bmi}) está fora do critério saudável (18.5 - 24.9). Mantenha hábitos direcionados para ajuste.`;
      }
    }

    // Populate form inputs
    const sleepInput = document.getElementById('health-sleep-hours');
    const sleepDiffInput = document.getElementById('health-sleep-diff');
    const sleepPill = document.getElementById('sleep-status-pill');

    if (sleepInput) sleepInput.value = hMetrics.sleepHours;
    if (sleepDiffInput) sleepDiffInput.value = hMetrics.sleepDiff;
    if (sleepPill) {
      sleepPill.textContent = hMetrics.isSleepHealthy ? `Meta Alcançada (${hMetrics.sleepDiff})` : `Abaixo da Meta (${hMetrics.sleepDiff})`;
      sleepPill.className = hMetrics.isSleepHealthy ? 'habit-status-pill text-green' : 'habit-status-pill text-orange';
    }

    const exTimeInput = document.getElementById('health-exercise-time');
    const exDurInput = document.getElementById('health-exercise-duration');
    const exPill = document.getElementById('exercise-status-pill');

    if (exTimeInput) exTimeInput.value = hMetrics.exerciseTime;
    if (exDurInput) exDurInput.value = hMetrics.exerciseDuration;
    if (exPill) {
      exPill.textContent = `${hMetrics.exerciseType} (${hMetrics.exerciseDuration} min às ${hMetrics.exerciseTime})`;
    }

    const intakeInput = document.getElementById('health-calorie-intake');
    const expenditureInput = document.getElementById('health-calorie-expenditure');
    const netInput = document.getElementById('health-calorie-net');
    const calPill = document.getElementById('calorie-status-pill');

    if (intakeInput) intakeInput.value = hMetrics.intakeKcal;
    if (expenditureInput) expenditureInput.value = hMetrics.expenditureKcal;
    if (netInput) netInput.value = `${hMetrics.netKcal} kcal (${hMetrics.netKcal < 0 ? 'Déficit' : 'Superávit'})`;
    if (calPill) {
      calPill.textContent = hMetrics.isCaloriePositive ? `Balanço Positivo (${hMetrics.netKcal} kcal)` : `Balanço Fora do Alvo (${hMetrics.netKcal} kcal)`;
      calPill.className = hMetrics.isCaloriePositive ? 'habit-status-pill text-green' : 'habit-status-pill text-orange';
    }

    renderHabitsFulfillmentChart(hMetrics);
    renderHabitsVarianceChart(hMetrics);
  }

  /* --------------------------------------------------------------------------
     PROJECTS HUB STACK VIEW
     -------------------------------------------------------------------------- */
  function renderProjectsStack() {
    const container = document.getElementById('projects-stack');
    const counterEl = document.getElementById('project-counter');
    const navCountEl = document.getElementById('nav-project-count');
    if (!container) return;

    let filteredProjects = appState.projects;
    if (appState.activeFilter !== 'ALL') {
      filteredProjects = appState.projects.filter(p => 
        p.status === appState.activeFilter || p.stage === appState.activeFilter
      );
    }

    if (counterEl) counterEl.textContent = `(${filteredProjects.length} Active)`;
    if (navCountEl) navCountEl.textContent = appState.projects.length;

    container.innerHTML = '';

    if (filteredProjects.length === 0) {
      container.innerHTML = `
        <div class="card" style="text-align: center; color: var(--text-muted); padding: 30px;">
          No projects match filter: <strong>${appState.activeFilter}</strong>
        </div>
      `;
      return;
    }

    filteredProjects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'project-card';
      card.dataset.id = proj.id;

      const badgeClass = proj.status === 'ON TRACK' ? 'badge-on-track' : 'badge-delayed';
      const totalSegments = 10;
      const filledSegments = Math.round((proj.completionPercentage / 100) * totalSegments);
      let segmentColorClass = proj.status === 'ON TRACK' ? 'filled-green' : 'filled-orange';
      
      let segmentedBarHtml = '';
      for (let i = 0; i < totalSegments; i++) {
        const isFilled = i < filledSegments;
        segmentedBarHtml += `<div class="segment ${isFilled ? segmentColorClass : ''}"></div>`;
      }

      card.innerHTML = `
        <div class="project-card-header">
          <h2 class="project-card-title">${escapeHtml(proj.title)}</h2>
          <div class="card-header-meta">
            <span class="completion-mono">${proj.completionPercentage}%</span>
            <span class="badge ${badgeClass}">${proj.status}</span>
          </div>
        </div>

        <p class="impact-thesis">${escapeHtml(proj.impactThesis)}</p>

        <div class="visual-metric-wrapper">
          <div class="segmented-bar">
            ${segmentedBarHtml}
          </div>
        </div>

        <div class="next-milestone-box">
          <span class="milestone-icon">⚡</span>
          <span class="milestone-label">NEXT:</span>
          <span class="milestone-text">${escapeHtml(proj.nextMilestone.title)}</span>
          <span class="milestone-date">Target: ${escapeHtml(proj.nextMilestone.date)}</span>
        </div>
      `;

      card.addEventListener('click', () => openProjectDrawer(proj.id));
      container.appendChild(card);
    });
  }

  /* --------------------------------------------------------------------------
     PIPELINE FOOTER
     -------------------------------------------------------------------------- */
  function renderPipelineFooter() {
    const ideationEl = document.getElementById('count-ideation');
    const constructionEl = document.getElementById('count-construction');
    const validationEl = document.getElementById('count-validation');
    const completedEl = document.getElementById('count-completed');

    if (ideationEl) ideationEl.textContent = appState.pipeline.ideation;
    if (constructionEl) constructionEl.textContent = appState.pipeline.construction;
    if (validationEl) validationEl.textContent = appState.pipeline.validation;
    if (completedEl) completedEl.textContent = appState.pipeline.completed;
  }

  /* --------------------------------------------------------------------------
     DELIVERY STREAM (TIMELINE)
     -------------------------------------------------------------------------- */
  function renderDeliveryStream() {
    const container = document.getElementById('delivery-timeline');
    const counterEl = document.getElementById('stream-count');
    if (!container) return;

    if (counterEl) counterEl.textContent = `${appState.timeline.length} items`;

    const groups = { 'Today': [], 'Tomorrow': [] };
    appState.timeline.forEach(item => {
      const g = item.group || 'Today';
      if (!groups[g]) groups[g] = [];
      groups[g].push(item);
    });

    container.innerHTML = '';

    Object.keys(groups).forEach(groupName => {
      const items = groups[groupName];
      if (items.length === 0) return;

      const groupHeader = document.createElement('div');
      groupHeader.className = 'timeline-group-header';
      groupHeader.textContent = groupName.toUpperCase();
      container.appendChild(groupHeader);

      const ul = document.createElement('ul');
      ul.className = 'timeline-items';

      items.forEach(item => {
        const li = document.createElement('li');
        li.className = `stream-item ${item.completed ? 'completed' : ''}`;
        li.dataset.id = item.id;

        const dotClass = item.status === 'ON TRACK' ? 'dot-on-track' : 'dot-delayed';

        li.innerHTML = `
          <div class="status-dot ${dotClass}"></div>
          <div class="stream-content">
            <span class="stream-text">${escapeHtml(item.title)}</span>
            <div class="stream-meta">
              <span class="tag-project">${escapeHtml(item.projectTag)}</span>
              <span class="time-stamp">• ${escapeHtml(item.time)}</span>
            </div>
          </div>
        `;

        li.addEventListener('click', () => {
          updateState(s => {
            item.completed = !item.completed;
          });
          renderDeliveryStream();
          renderKPIs();
        });

        ul.appendChild(li);
      });

      container.appendChild(ul);
    });
  }

  /* --------------------------------------------------------------------------
     SLIDING SIDE DRAWER MODAL (PROJECT DETAILS)
     -------------------------------------------------------------------------- */
  function openProjectDrawer(projectId) {
    const project = appState.projects.find(p => p.id === projectId);
    if (!project) return;

    appState.selectedProjectId = projectId;

    const drawer = document.getElementById('project-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    document.getElementById('drawer-project-title').textContent = project.title;
    document.getElementById('drawer-stage-badge').textContent = `STAGE: ${project.stage.toUpperCase()}`;
    
    const badgeEl = document.getElementById('drawer-status-badge');
    badgeEl.textContent = project.status;
    badgeEl.className = `badge ${project.status === 'ON TRACK' ? 'badge-on-track' : 'badge-delayed'}`;

    document.getElementById('drawer-completion-val').textContent = `${project.completionPercentage}%`;
    document.getElementById('drawer-stage-text').textContent = project.stage;
    document.getElementById('drawer-impact-thesis').textContent = project.impactThesis;

    document.getElementById('drawer-progress-percent').textContent = `${project.completionPercentage}%`;
    document.getElementById('drawer-progress-fill').style.width = `${project.completionPercentage}%`;

    document.getElementById('drawer-next-milestone-title').textContent = project.nextMilestone.title;
    document.getElementById('drawer-next-milestone-date').textContent = `⚡ Target: ${project.nextMilestone.date}`;

    const milestonesListEl = document.getElementById('drawer-milestones-list');
    milestonesListEl.innerHTML = '';

    project.milestones.forEach((m, idx) => {
      const li = document.createElement('li');
      li.className = `milestone-item ${m.completed ? 'done' : ''}`;
      li.innerHTML = `
        <input type="checkbox" ${m.completed ? 'checked' : ''} data-index="${idx}" />
        <span>${escapeHtml(m.title)}</span>
      `;

      li.querySelector('input').addEventListener('change', (e) => {
        updateState(s => {
          m.completed = e.target.checked;
          const completedCount = project.milestones.filter(item => item.completed).length;
          project.completionPercentage = Math.round((completedCount / project.milestones.length) * 100);
        });

        openProjectDrawer(projectId);
        renderProjectsStack();
        renderKPIs();
      });

      milestonesListEl.appendChild(li);
    });

    backdrop.classList.add('active');
    drawer.classList.add('active');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeProjectDrawer() {
    const drawer = document.getElementById('project-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    if (drawer) {
      drawer.classList.remove('active');
      drawer.setAttribute('aria-hidden', 'true');
    }
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  /* --------------------------------------------------------------------------
     CENTERED MODAL OVERLAYS (PROFILE, FOCUS, HEALTH MODALS)
     -------------------------------------------------------------------------- */
  function openProfileModal() {
    const backdrop = document.getElementById('profile-modal-backdrop');
    if (!backdrop) return;

    const u = appState.user;
    document.getElementById('edit-user-name').value = u.name || 'Eliel Tavares';
    document.getElementById('edit-user-role').value = u.role || 'Systems Architect';
    document.getElementById('edit-user-birth').value = u.birthDate || '1994-08-15';
    document.getElementById('edit-user-weight').value = u.weight || '78.5';
    document.getElementById('edit-user-height').value = u.height || '1.78';
    document.getElementById('edit-user-current-bmi').value = u.currentBmi || 24.8;
    document.getElementById('edit-user-healthy-bmi').value = u.healthyBmi || '18.5 - 24.9';
    document.getElementById('edit-user-commitment').value = u.commitmentStatus || 'ALTO (94%)';

    backdrop.classList.add('active');
  }

  function closeProfileModal() {
    const backdrop = document.getElementById('profile-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function openFocusModal() {
    const backdrop = document.getElementById('focus-modal-backdrop');
    if (!backdrop) return;

    renderKPIs();
    backdrop.classList.add('active');
  }

  function closeFocusModal() {
    const backdrop = document.getElementById('focus-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  function openHealthModal() {
    const backdrop = document.getElementById('health-modal-backdrop');
    if (!backdrop) return;

    renderKPIs();
    backdrop.classList.add('active');
  }

  function closeHealthModal() {
    const backdrop = document.getElementById('health-modal-backdrop');
    if (backdrop) backdrop.classList.remove('active');
  }

  /* --------------------------------------------------------------------------
     EVENT LISTENERS & INGESTION TERMINAL
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
    // Focus Score Card click & modal controls
    const focusCard = document.getElementById('focus-score-card');
    const focusModalBackdrop = document.getElementById('focus-modal-backdrop');
    const focusModalClose = document.getElementById('focus-modal-close');

    if (focusCard) focusCard.addEventListener('click', openFocusModal);
    if (focusModalClose) focusModalClose.addEventListener('click', closeFocusModal);
    if (focusModalBackdrop) {
      focusModalBackdrop.addEventListener('click', (e) => {
        if (e.target === focusModalBackdrop) closeFocusModal();
      });
    }

    // Health Metric Card click & modal controls
    const healthCard = document.getElementById('health-metric-card');
    const healthModalBackdrop = document.getElementById('health-modal-backdrop');
    const healthModalClose = document.getElementById('health-modal-close');

    if (healthCard) healthCard.addEventListener('click', openHealthModal);
    if (healthModalClose) healthModalClose.addEventListener('click', closeHealthModal);
    if (healthModalBackdrop) {
      healthModalBackdrop.addEventListener('click', (e) => {
        if (e.target === healthModalBackdrop) closeHealthModal();
      });
    }

    // Exercise type switcher
    const exCardioBtn = document.getElementById('btn-ex-cardio');
    const exMusculacaoBtn = document.getElementById('btn-ex-musculacao');

    if (exCardioBtn && exMusculacaoBtn) {
      exCardioBtn.addEventListener('click', () => {
        exCardioBtn.classList.add('active');
        exMusculacaoBtn.classList.remove('active');
        appState.kpis.healthMetric.exercise.type = 'Cardio';
      });
      exMusculacaoBtn.addEventListener('click', () => {
        exMusculacaoBtn.classList.add('active');
        exCardioBtn.classList.remove('active');
        appState.kpis.healthMetric.exercise.type = 'Musculação';
      });
    }

    // Real-time calculation on Health Habits Form
    const sleepInput = document.getElementById('health-sleep-hours');
    const sleepDiffInput = document.getElementById('health-sleep-diff');
    if (sleepInput && sleepDiffInput) {
      sleepInput.addEventListener('input', () => {
        const val = parseFloat(sleepInput.value) || 7.5;
        const diff = val - 7.5;
        sleepDiffInput.value = diff > 0 ? `+${diff.toFixed(1)} hrs` : `${diff.toFixed(1)} hrs`;
      });
    }

    const intakeInput = document.getElementById('health-calorie-intake');
    const expenditureInput = document.getElementById('health-calorie-expenditure');
    const netInput = document.getElementById('health-calorie-net');

    function updateCalorieNet() {
      const intake = parseInt(intakeInput.value) || 0;
      const expenditure = parseInt(expenditureInput.value) || 0;
      const net = intake - expenditure;
      netInput.value = `${net} kcal (${net < 0 ? 'Déficit' : 'Superávit'})`;
    }

    if (intakeInput) intakeInput.addEventListener('input', updateCalorieNet);
    if (expenditureInput) expenditureInput.addEventListener('input', updateCalorieNet);

    // Health Form Submit
    const healthForm = document.getElementById('health-habits-form');
    if (healthForm) {
      healthForm.addEventListener('submit', (e) => {
        e.preventDefault();

        updateState(s => {
          s.kpis.healthMetric.sleep.hours = parseFloat(document.getElementById('health-sleep-hours').value) || 7.5;
          s.kpis.healthMetric.exercise.time = document.getElementById('health-exercise-time').value.trim();
          s.kpis.healthMetric.exercise.durationMinutes = parseInt(document.getElementById('health-exercise-duration').value) || 45;
          
          const intake = parseInt(document.getElementById('health-calorie-intake').value) || 2100;
          const expenditure = parseInt(document.getElementById('health-calorie-expenditure').value) || 2450;
          s.kpis.healthMetric.caloricBalance.intakeKcal = intake;
          s.kpis.healthMetric.caloricBalance.expenditureKcal = expenditure;
          s.kpis.healthMetric.caloricBalance.netKcal = intake - expenditure;
        });

        renderKPIs();
        closeHealthModal();
      });
    }

    // Task Timer controls
    const timerModeBtns = document.querySelectorAll('.timer-mode-btn');
    timerModeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        setTimerMode(e.target.dataset.mode);
      });
    });

    const timerStartBtn = document.getElementById('timer-btn-start');
    const timerPauseBtn = document.getElementById('timer-btn-pause');
    const timerResetBtn = document.getElementById('timer-btn-reset');

    if (timerStartBtn) timerStartBtn.addEventListener('click', startTimer);
    if (timerPauseBtn) timerPauseBtn.addEventListener('click', pauseTimer);
    if (timerResetBtn) timerResetBtn.addEventListener('click', resetTimer);

    // Backup Actions
    const btnDownload = document.getElementById('btn-download-backup');
    const btnRestore = document.getElementById('btn-restore-backup');
    const btnSyncNow = document.getElementById('btn-sync-now');
    const fileInput = document.getElementById('backup-file-input');

    const modalBtnDownload = document.getElementById('modal-btn-download');
    const modalBtnRestore = document.getElementById('modal-btn-restore');

    if (btnDownload) btnDownload.addEventListener('click', exportBackupJSON);
    if (modalBtnDownload) modalBtnDownload.addEventListener('click', exportBackupJSON);

    if (btnRestore) btnRestore.addEventListener('click', () => fileInput && fileInput.click());
    if (modalBtnRestore) modalBtnRestore.addEventListener('click', () => fileInput && fileInput.click());

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          importBackupJSON(e.target.files[0]);
          e.target.value = '';
        }
      });
    }

    if (btnSyncNow) {
      btnSyncNow.addEventListener('click', () => {
        syncWithCloud();
      });
    }

    // Profile Card click / edit button click
    const profileCard = document.getElementById('profile-card');
    const profileEditBtn = document.getElementById('profile-edit-btn');
    const profileModalBackdrop = document.getElementById('profile-modal-backdrop');
    const profileModalClose = document.getElementById('profile-modal-close');
    const profileModalCancel = document.getElementById('profile-modal-cancel');
    const profileEditForm = document.getElementById('profile-edit-form');

    if (profileCard) {
      profileCard.addEventListener('click', () => {
        openProfileModal();
      });
    }
    if (profileEditBtn) {
      profileEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProfileModal();
      });
    }
    if (profileModalClose) profileModalClose.addEventListener('click', closeProfileModal);
    if (profileModalCancel) profileModalCancel.addEventListener('click', closeProfileModal);
    if (profileModalBackdrop) {
      profileModalBackdrop.addEventListener('click', (e) => {
        if (e.target === profileModalBackdrop) closeProfileModal();
      });
    }

    // Auto-calculate BMI when weight or height changes in modal form
    const weightInput = document.getElementById('edit-user-weight');
    const heightInput = document.getElementById('edit-user-height');
    const bmiInput = document.getElementById('edit-user-current-bmi');

    function autoCalcBmi() {
      const w = parseFloat(weightInput.value);
      const h = parseFloat(heightInput.value);
      if (w > 0 && h > 0) {
        const calculated = (w / (h * h)).toFixed(1);
        bmiInput.value = calculated;
      }
    }

    if (weightInput) weightInput.addEventListener('input', autoCalcBmi);
    if (heightInput) heightInput.addEventListener('input', autoCalcBmi);

    // Profile Form Submission
    if (profileEditForm) {
      profileEditForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        updateState(s => {
          s.user.name = document.getElementById('edit-user-name').value.trim();
          s.user.role = document.getElementById('edit-user-role').value.trim();
          s.user.birthDate = document.getElementById('edit-user-birth').value;
          s.user.weight = document.getElementById('edit-user-weight').value;
          s.user.height = document.getElementById('edit-user-height').value;
          s.user.currentBmi = parseFloat(document.getElementById('edit-user-current-bmi').value) || 24.8;
          s.user.commitmentStatus = document.getElementById('edit-user-commitment').value.trim();
        });

        renderUserProfile();
        renderKPIs();
        closeProfileModal();
      });
    }

    // Context Switcher Filters
    const switcherBtns = document.querySelectorAll('.switcher-btn');
    switcherBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        switcherBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        appState.activeFilter = e.target.dataset.filter;
        renderProjectsStack();
      });
    });

    // Quick Ingestion Terminal
    const quickInput = document.getElementById('quick-input');
    const submitBtn = document.getElementById('terminal-submit');
    const triggerBtn = document.getElementById('terminal-trigger-btn');

    function handleIngest() {
      if (!quickInput) return;
      const text = quickInput.value.trim();
      if (!text) return;

      const tagMatch = text.match(/#(\w+)/);
      const dateMatch = text.match(/@(\w+)/);

      const tag = tagMatch ? `#${tagMatch[1]}` : '#General';
      const group = dateMatch && dateMatch[1].toLowerCase() === 'tomorrow' ? 'Tomorrow' : 'Today';

      const cleanTitle = text.replace(/#\w+/g, '').replace(/@\w+/g, '').trim();

      const newItem = {
        id: `item-${Date.now()}`,
        group: group,
        title: cleanTitle || text,
        projectTag: tag,
        status: 'ON TRACK',
        completed: false,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      updateState(s => {
        s.timeline.unshift(newItem);
      });

      quickInput.value = '';
      renderDeliveryStream();
      renderKPIs();
    }

    if (submitBtn) submitBtn.addEventListener('click', handleIngest);
    if (quickInput) {
      quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleIngest();
      });
    }

    if (triggerBtn) {
      triggerBtn.addEventListener('click', () => {
        if (quickInput) quickInput.focus();
      });
    }

    // Global Shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (quickInput) quickInput.focus();
      }
      if (e.key === 'Escape') {
        closeProjectDrawer();
        closeProfileModal();
        closeFocusModal();
        closeHealthModal();
      }
    });

    // Hint tags
    const hintTags = document.querySelectorAll('.hint-tag');
    hintTags.forEach(tag => {
      tag.addEventListener('click', () => {
        if (quickInput) {
          quickInput.value += ` ${tag.textContent}`;
          quickInput.focus();
        }
      });
    });

    // Drawer Close Buttons & Backdrop
    const drawerCloseBtn = document.getElementById('drawer-close');
    const drawerCloseSec = document.getElementById('drawer-close-secondary');
    const backdrop = document.getElementById('drawer-backdrop');
    const toggleStatusBtn = document.getElementById('drawer-toggle-status');

    if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeProjectDrawer);
    if (drawerCloseSec) drawerCloseSec.addEventListener('click', closeProjectDrawer);
    if (backdrop) backdrop.addEventListener('click', closeProjectDrawer);

    if (toggleStatusBtn) {
      toggleStatusBtn.addEventListener('click', () => {
        if (!appState.selectedProjectId) return;
        const proj = appState.projects.find(p => p.id === appState.selectedProjectId);
        if (proj) {
          updateState(s => {
            proj.status = proj.status === 'ON TRACK' ? 'DELAYED' : 'ON TRACK';
          });
          openProjectDrawer(proj.id);
          renderProjectsStack();
          renderKPIs();
        }
      });
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, (m) => {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
});
