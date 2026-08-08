/* ==========================================================================
   PERSONAL DASHBOARD COMMAND CENTER - JAVASCRIPT ENGINE
   Persistence: LocalStorage + Vercel Serverless Sync API + GitHub Auto Commit
   Timestamp Guard: Client > Cloud over-writes; Cloud > Client pulls cloud.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'command_center_state';
  const GITHUB_OWNER = 'elielos123';
  const GITHUB_REPO = 'hubpersonal';

  // Default Global Application State
  let appState = {
    lastUpdated: "2026-08-08T01:19:24.000Z",
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
      focusScore: { value: 85, label: "Focus Score", target: "85%" },
      healthMetric: { value: 92, label: "Health Index", history: [65, 70, 72, 78, 80, 82, 85, 84, 88, 90, 89, 92] },
      financesMetric: { value: "$14,250", trend: "+12.4%", label: "Monthly Cashflow", isPositive: true },
      learningMetric: { value: 68, label: "Quarterly Target", details: "34 / 50 Hours Completed" }
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

  // 1. Check LocalStorage first
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

  // 2. Initial Setup
  initApp();

  // 3. Trigger initial cloud sync check
  syncWithCloud();

  function initApp() {
    setupLiveClock();
    renderUserProfile();
    renderKPIs();
    renderProjectsStack();
    renderPipelineFooter();
    renderDeliveryStream();
    setupEventListeners();
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
      // First attempt: Vercel Serverless Function /api/sync
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
          // Cloud was newer! Update client state from cloud
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
      // Fallback for local development or static hosting: direct GitHub REST API sync
      await fallbackGitHubSync();
    }
  }

  async function fallbackGitHubSync() {
    try {
      const fileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/projects.json`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CommandCenterApp'
      };

      const checkRes = await fetch(fileUrl, { headers });
      if (!checkRes.ok) throw new Error('GitHub API unreachable');

      const ghData = await checkRes.json();
      const contentUtf8 = Buffer.from(ghData.content, 'base64').toString('utf8');
      const cloudState = JSON.parse(contentUtf8);
      const cloudTime = new Date(cloudState.lastUpdated || '1970-01-01').getTime();
      const clientTime = new Date(appState.lastUpdated || '1970-01-01').getTime();

      if (cloudTime > clientTime) {
        // Cloud is newer: Pull cloud data into client
        appState = Object.assign({}, appState, cloudState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
        renderAll();
        updateSyncBadge('synced', `☁️ GitHub: Dados Atualizados`);
      } else {
        updateSyncBadge('synced', `💾 Salvo no Navegador`);
      }
    } catch (err) {
      console.log('Sync fallback notice:', err.message);
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
    const focusValEl = document.getElementById('focus-score-val');
    const focusFillEl = document.getElementById('focus-ring-fill');
    if (focusValEl && focusFillEl) {
      const focusVal = appState.kpis.focusScore.value || 85;
      focusValEl.textContent = `${focusVal}%`;
      const circumference = 2 * Math.PI * 24;
      const offset = circumference - (focusVal / 100) * circumference;
      focusFillEl.style.strokeDashoffset = offset;
    }

    const healthValEl = document.getElementById('health-val');
    if (healthValEl) {
      healthValEl.textContent = `${appState.kpis.healthMetric.value || 92}%`;
    }

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
     CENTERED MODAL OVERLAY (PROFILE & BIOMETRICS EDIT MODAL)
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

  /* --------------------------------------------------------------------------
     EVENT LISTENERS & INGESTION TERMINAL
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
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
        if (e.target === profileModalBackdrop) {
          closeProfileModal();
        }
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
    }

    if (submitBtn) submitBtn.addEventListener('click', handleIngest);
    if (quickInput) {
      quickInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          handleIngest();
        }
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
