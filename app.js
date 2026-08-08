/* ==========================================================================
   PERSONAL DASHBOARD COMMAND CENTER - JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  let appState = {
    user: {
      name: "Eliel Tavares",
      role: "Lead Architect & Systems Engineer",
      status: "Online",
      avatar: "ET"
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

  // Attempt to fetch fresh project JSON data if running via web server
  fetch('projects.json')
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data) {
        appState.user = data.user || appState.user;
        appState.kpis = data.kpis || appState.kpis;
        appState.pipeline = data.pipeline || appState.pipeline;
        appState.projects = data.projects || appState.projects;
        appState.timeline = data.timeline || appState.timeline;
      }
    })
    .catch(() => console.log('Using local fallback state.'))
    .finally(() => {
      initApp();
    });

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
     LIVE CLOCK
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

  /* --------------------------------------------------------------------------
     PROFILE & KPIS RENDER
     -------------------------------------------------------------------------- */
  function renderUserProfile() {
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const roleEl = document.getElementById('user-role');

    if (avatarEl) avatarEl.textContent = appState.user.avatar || 'ET';
    if (nameEl) nameEl.textContent = appState.user.name || 'Eliel Tavares';
    if (roleEl) roleEl.textContent = appState.user.role || 'Systems Architect';
  }

  function renderKPIs() {
    // 1. Focus Score Progress Ring
    const focusValEl = document.getElementById('focus-score-val');
    const focusFillEl = document.getElementById('focus-ring-fill');
    if (focusValEl && focusFillEl) {
      const focusVal = appState.kpis.focusScore.value || 85;
      focusValEl.textContent = `${focusVal}%`;
      const circumference = 2 * Math.PI * 24; // r=24 -> ~150.79
      const offset = circumference - (focusVal / 100) * circumference;
      focusFillEl.style.strokeDashoffset = offset;
    }

    // 2. Health Sparkline
    const healthValEl = document.getElementById('health-val');
    if (healthValEl) {
      healthValEl.textContent = `${appState.kpis.healthMetric.value || 92}%`;
    }

    // 3. Finances Metric
    const finValEl = document.getElementById('finances-val');
    const finTrendEl = document.getElementById('finances-trend');
    if (finValEl) finValEl.textContent = appState.kpis.financesMetric.value || '$14,250';
    if (finTrendEl) finTrendEl.textContent = `${appState.kpis.financesMetric.trend} ↑`;

    // 4. Learning Progress
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

    // Filter projects based on active filter
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

      // Status Badge class
      const badgeClass = proj.status === 'ON TRACK' ? 'badge-on-track' : 'badge-delayed';

      // Build Segmented Bar HTML
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

    // Group timeline items by group ('Today', 'Tomorrow')
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
          item.completed = !item.completed;
          renderDeliveryStream();
        });

        ul.appendChild(li);
      });

      container.appendChild(ul);
    });
  }

  /* --------------------------------------------------------------------------
     SLIDING SIDE DRAWER MODAL
     -------------------------------------------------------------------------- */
  function openProjectDrawer(projectId) {
    const project = appState.projects.find(p => p.id === projectId);
    if (!project) return;

    appState.selectedProjectId = projectId;

    const drawer = document.getElementById('project-drawer');
    const backdrop = document.getElementById('drawer-backdrop');

    // Populate drawer fields
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

    // Render milestone checklist
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
        m.completed = e.target.checked;
        
        // Recalculate percentage
        const completedCount = project.milestones.filter(item => item.completed).length;
        project.completionPercentage = Math.round((completedCount / project.milestones.length) * 100);

        // Re-update drawer and cards stack
        openProjectDrawer(projectId);
        renderProjectsStack();
      });

      milestonesListEl.appendChild(li);
    });

    // Show drawer & backdrop
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
     EVENT LISTENERS & INGESTION TERMINAL
     -------------------------------------------------------------------------- */
  function setupEventListeners() {
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

      // Extract #tags and @dates
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

      appState.timeline.unshift(newItem);
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

    // Global Cmd + K or Ctrl + K shortcut
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (quickInput) quickInput.focus();
      }
      if (e.key === 'Escape') {
        closeProjectDrawer();
      }
    });

    // Hint tag clicks
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
          proj.status = proj.status === 'ON TRACK' ? 'DELAYED' : 'ON TRACK';
          openProjectDrawer(proj.id);
          renderProjectsStack();
        }
      });
    }
  }

  // Utility function to escape HTML string
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
