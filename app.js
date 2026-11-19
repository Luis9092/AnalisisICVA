document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  renderKPIs();
  initTable();
  initCharts();
  initModal();
  initExports();
  initSearchAndFilter();
});

/* ==========================================================================
   THEME TOGGLE
   ========================================================================== */

function initTheme() {
  const toggleBtn = document.getElementById("theme-toggle");
  const storedTheme = localStorage.getItem("icva-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
  applyTheme(initialTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const current =
        document.documentElement.getAttribute("data-theme") || "dark";
      const nextTheme = current === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      localStorage.setItem("icva-theme", nextTheme);
      updateChartThemes();
    });
  }
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    const icon = document.querySelector(".theme-toggle-btn svg");
    if (icon) {
      icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>`; // Moon icon
    }
  } else {
    document.documentElement.removeAttribute("data-theme");
    const icon = document.querySelector(".theme-toggle-btn svg");
    if (icon) {
      icon.innerHTML = `<circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>`; // Sun icon
    }
  }
}

/* ==========================================================================
   KPI SUMMARY METRICS
   ========================================================================== */

function renderKPIs() {
  const hotels = AUDIT_DATA.hotels;
  const total = hotels.length;
  const icvaSum = hotels.reduce((acc, h) => acc + h.icva, 0);
  const avgICVA = (icvaSum / total).toFixed(1);

  const downCount = hotels.filter((h) => h.isDown).length;
  const downRate = ((downCount / total) * 100).toFixed(1);

  // Highest score
  const topHotel = [...hotels].sort((a, b) => b.icva - a.icva)[0];

  // HSTS deficiency (score < 15)
  const hstsDeficient = hotels.filter(
    (h) => (h.scores["2.4"] || 0) < 15,
  ).length;
  const hstsDeficientRate = ((hstsDeficient / total) * 100).toFixed(1);

  const kpiAvg = document.getElementById("kpi-avg-icva");
  const kpiDown = document.getElementById("kpi-down-rate");
  const kpiTop = document.getElementById("kpi-top-hotel");
  const kpiHsts = document.getElementById("kpi-hsts-gap");

  if (kpiAvg) kpiAvg.textContent = avgICVA;
  if (kpiDown) kpiDown.textContent = `${downRate}%`;
  if (kpiTop) kpiTop.textContent = `${topHotel.icva} pts`;
  if (kpiHsts) kpiHsts.textContent = `${hstsDeficientRate}%`;
}

/* ==========================================================================
   TABLE CONTROLLER (MODERN WEB GUIDANCE: sortable-table & responsive-table)
   ========================================================================== */

function initTable() {
  const tbody = document.getElementById("hotels-tbody");
  const table = document.getElementById("hotels-table");
  const statusAnnouncer = document.getElementById("sort-status");
  if (!tbody || !table) return;

  // Populate initial rows
  tbody.innerHTML = "";
  AUDIT_DATA.hotels.forEach((hotel) => {
    const tr = document.createElement("tr");
    tr.id = `hotel-row-${hotel.id}`;
    tr.dataset.hotelId = hotel.id;
    tr.dataset.tier = hotel.tier;
    tr.dataset.isDown = hotel.isDown;
    if (hotel.isDown) tr.classList.add("row-down");

    const tierClass =
      hotel.icva >= 70
        ? "tier-low"
        : hotel.icva >= 40
          ? "tier-mid"
          : "tier-high";
    const statusClass = hotel.isDown
      ? "down"
      : hotel.icva < 40
        ? "warn"
        : "active";

    tr.innerHTML = `
      <td data-value="${hotel.id}">${hotel.id}</td>
      <th scope="row" class="hotel-col" data-value="${hotel.name}">
        <div class="hotel-name-wrap">
          <span class="hotel-name-text">${hotel.name}</span>
          <a href="${hotel.url}" target="_blank" rel="noopener noreferrer" class="hotel-url-text">${hotel.cleanUrl} ↗</a>
        </div>
      </th>
      <td data-value="${hotel.icva}">
        <span class="score-badge ${tierClass}">${hotel.icva.toFixed(1)}</span>
        <div class="cell-progress-bar">
          <div class="cell-progress-fill" style="width: ${hotel.icva}%; color: ${hotel.icva >= 70 ? "var(--risk-low)" : hotel.icva >= 40 ? "var(--risk-mid)" : "var(--risk-high)"};"></div>
        </div>
      </td>
      <td data-value="${hotel.d1}">${hotel.d1.toFixed(1)} / 40</td>
      <td data-value="${hotel.d2}">${hotel.d2.toFixed(1)} / 60</td>
      <td data-value="${hotel.scores["2.2"]}">${hotel.scores["2.2"].toFixed(1)} / 15</td>
      <td data-value="${hotel.scores["2.3"]}">${hotel.scores["2.3"].toFixed(1)} / 10</td>
      <td data-value="${hotel.scores["2.4"]}">${hotel.scores["2.4"].toFixed(1)} / 15</td>
      <td data-value="${hotel.scores["2.6"]}">${hotel.scores["2.6"].toFixed(1)} / 5</td>
      <td data-value="${hotel.status}">
        <span class="status-pill ${statusClass}">${hotel.status}</span>
      </td>
      <td>
        <button type="button" class="action-btn-view" data-action="view-hotel" data-hotel-id="${hotel.id}">
          Ver Ficha
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Sorting functionality per sortable-table guidelines
  const collator = new Intl.Collator("es", {
    numeric: true,
    sensitivity: "base",
  });

  table.querySelectorAll("th button.sort-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const th = btn.closest("th");
      const cellIndex = th.cellIndex;
      const dataType = th.dataset.type || "string";
      const currentSort = th.getAttribute("aria-sort");
      const nextSort = currentSort === "ascending" ? "descending" : "ascending";

      // Clear aria-sort on all other headers
      table
        .querySelectorAll("thead th")
        .forEach((header) => header.removeAttribute("aria-sort"));
      th.setAttribute("aria-sort", nextSort);

      const rows = Array.from(tbody.rows);
      const factor = nextSort === "ascending" ? 1 : -1;

      rows.sort((a, b) => {
        const cellA = a.cells[cellIndex];
        const cellB = b.cells[cellIndex];
        const valA = cellA.dataset.value ?? cellA.textContent.trim();
        const valB = cellB.dataset.value ?? cellB.textContent.trim();

        if (dataType === "number") {
          return factor * (parseFloat(valA) - parseFloat(valB));
        } else {
          return factor * collator.compare(valA, valB);
        }
      });

      // Reorder existing TR nodes without rebuilding tbody.innerHTML
      reorderRows(tbody, rows);

      // Announce sort state to screen readers
      if (statusAnnouncer) {
        statusAnnouncer.textContent = `Tabla ordenada por ${btn.textContent.trim()}, orden ${nextSort === "ascending" ? "ascendente" : "descendente"}, ${rows.length} hoteles`;
      }
    });
  });
}

function reorderRows(container, orderedRows) {
  // Use moveBefore if supported, else appendChild
  if (typeof container.moveBefore === "function") {
    for (const row of orderedRows) {
      container.moveBefore(row, null);
    }
  } else {
    for (const row of orderedRows) {
      container.appendChild(row);
    }
  }
}

/* ==========================================================================
   SEARCH & FILTER
   ========================================================================== */

function initSearchAndFilter() {
  const searchInput = document.getElementById("table-search");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const tbody = document.getElementById("hotels-tbody");

  let activeTier = "all";
  let searchTerm = "";

  function applyFilters() {
    if (!tbody) return;
    const rows = Array.from(tbody.rows);

    rows.forEach((row) => {
      const hotelId = parseInt(row.dataset.hotelId, 10);
      const hotel = AUDIT_DATA.hotels.find((h) => h.id === hotelId);
      if (!hotel) return;

      const matchesSearch =
        searchTerm === "" ||
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.cleanUrl.toLowerCase().includes(searchTerm);

      let matchesTier = true;
      if (activeTier === "alta")
        matchesTier = hotel.tier === "Vulnerabilidad Alta";
      else if (activeTier === "media")
        matchesTier = hotel.tier === "Vulnerabilidad Media";
      else if (activeTier === "baja")
        matchesTier = hotel.tier === "Vulnerabilidad Baja";
      else if (activeTier === "down") matchesTier = hotel.isDown === true;

      row.style.display = matchesSearch && matchesTier ? "" : "none";
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeTier = btn.dataset.filter || "all";
      applyFilters();
    });
  });
}

/* ==========================================================================
   CHARTS (CHART.JS WITH SVG FALLBACK)
   ========================================================================== */

let chartInstances = {};

function initCharts() {
  if (typeof Chart === "undefined") {
    console.warn(
      "Chart.js no detectado vía CDN. Generando visualizaciones SVG nativas.",
    );
    renderSvgFallbacks();
    return;
  }

  renderChart1Ranking();
  renderChart2Distribution();
  renderChart3Indicators();
  renderChart4Dimensions();
}

function getChartColors() {
  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";
  return {
    textColor: isLight ? "#0f172a" : "#f8fafc",
    mutedColor: isLight ? "#64748b" : "#94a3b8",
    gridColor: isLight ? "rgba(0, 0, 0, 0.06)" : "rgba(255, 255, 255, 0.06)",
    cardBg: isLight ? "#ffffff" : "#131d33",
  };
}

function updateChartThemes() {
  const colors = getChartColors();
  Object.values(chartInstances).forEach((chart) => {
    if (!chart) return;
    if (chart.options.scales) {
      if (chart.options.scales.x) {
        chart.options.scales.x.ticks.color = colors.mutedColor;
        chart.options.scales.x.grid.color = colors.gridColor;
      }
      if (chart.options.scales.y) {
        chart.options.scales.y.ticks.color = colors.mutedColor;
        chart.options.scales.y.grid.color = colors.gridColor;
      }
      if (chart.options.scales.r) {
        chart.options.scales.r.pointLabels.color = colors.textColor;
        chart.options.scales.r.grid.color = colors.gridColor;
        chart.options.scales.r.angleLines.color = colors.gridColor;
      }
    }
    if (chart.options.plugins && chart.options.plugins.legend) {
      chart.options.plugins.legend.labels.color = colors.textColor;
    }
    chart.update();
  });
}

// Chart 1: Ranking General de Hoteles (Horizontal Bar)
function renderChart1Ranking() {
  const ctx = document.getElementById("chart-ranking")?.getContext("2d");
  if (!ctx) return;

  const sortedHotels = [...AUDIT_DATA.hotels].sort((a, b) => b.icva - a.icva);
  const labels = sortedHotels.map((h) => h.name);
  const data = sortedHotels.map((h) => h.icva);
  const bgColors = sortedHotels.map((h) => {
    if (h.icva >= 70) return "#10b981";
    if (h.icva >= 40) return "#f59e0b";
    return "#f43f5e";
  });

  const colors = getChartColors();

  chartInstances.ranking = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Puntaje ICVA (0-100)",
          data: data,
          backgroundColor: bgColors,
          borderRadius: 6,
          barThickness: 16,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              `ICVA: ${ctx.parsed.x} pts (${sortedHotels[ctx.dataIndex].tier})`,
          },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: {
            color: colors.mutedColor,
            font: { family: "Inter", size: 11 },
          },
          grid: { color: colors.gridColor },
        },
        y: {
          ticks: {
            color: colors.textColor,
            font: { family: "Inter", size: 11, weight: "500" },
          },
          grid: { display: false },
        },
      },
    },
  });
}

// Chart 2: Distribución por Nivel de Vulnerabilidad (Donut)
function renderChart2Distribution() {
  const ctx = document.getElementById("chart-distribution")?.getContext("2d");
  if (!ctx) return;

  const colors = getChartColors();
  const tiersCount = {
    "Baja (Resiliente)": AUDIT_DATA.hotels.filter((h) => h.icva >= 70).length,
    Media: AUDIT_DATA.hotels.filter((h) => h.icva >= 40 && h.icva < 70).length,
    "Alta (Crítica)": AUDIT_DATA.hotels.filter((h) => h.icva < 40).length,
  };

  chartInstances.distribution = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: Object.keys(tiersCount),
      datasets: [
        {
          data: Object.values(tiersCount),
          backgroundColor: ["#10b981", "#f59e0b", "#f43f5e"],
          borderWidth: 2,
          borderColor: colors.cardBg,
          hoverOffset: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: colors.textColor,
            font: { family: "Inter", size: 12 },
            padding: 16,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.label}: ${ctx.parsed} hoteles (${((ctx.parsed / 13) * 100).toFixed(1)}%)`,
          },
        },
      },
      cutout: "68%",
    },
  });
}

// Chart 3: Cumplimiento por Indicador Técnico (Radar)
function renderChart3Indicators() {
  const ctx = document.getElementById("chart-indicators")?.getContext("2d");
  if (!ctx) return;

  const colors = getChartColors();
  const labels = AUDIT_DATA.indicators.map(
    (ind) => ind.id + " " + ind.name.split("(")[0].trim(),
  );
  const maxScores = AUDIT_DATA.indicators.map((ind) => ind.maxPoints);

  // Calculate average score per indicator across all 13 hotels
  const avgScores = AUDIT_DATA.indicators.map((ind) => {
    const sum = AUDIT_DATA.hotels.reduce(
      (acc, h) => acc + (h.scores[ind.id] || 0),
      0,
    );
    return parseFloat((sum / AUDIT_DATA.hotels.length).toFixed(2));
  });

  // Calculate percentage of achievement (avg / max * 100)
  const pctScores = avgScores.map((avg, i) =>
    parseFloat(((avg / maxScores[i]) * 100).toFixed(1)),
  );

  chartInstances.indicators = new Chart(ctx, {
    type: "radar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "% Cobertura Promedio",
          data: pctScores,
          backgroundColor: "rgba(6, 182, 212, 0.25)",
          borderColor: "#06b6d4",
          borderWidth: 2,
          pointBackgroundColor: "#06b6d4",
          pointBorderColor: "#ffffff",
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const idx = ctx.dataIndex;
              return ` Cumplimiento: ${ctx.parsed.r}% (Promedio: ${avgScores[idx]} / ${maxScores[idx]} pts)`;
            },
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 25,
            color: colors.mutedColor,
            backdropColor: "transparent",
            font: { size: 9 },
          },
          grid: { color: colors.gridColor },
          angleLines: { color: colors.gridColor },
          pointLabels: {
            color: colors.textColor,
            font: { family: "Inter", size: 10, weight: "500" },
          },
        },
      },
    },
  });
}

// Chart 4: Matriz Bidimensional de Ciberseguridad (D1 vs D2)
function renderChart4Dimensions() {
  const ctx = document.getElementById("chart-dimensions")?.getContext("2d");
  if (!ctx) return;

  const colors = getChartColors();
  const hotels = AUDIT_DATA.hotels;
  const labels = hotels.map((h) => h.name.replace("Hotel ", ""));
  const d1Scores = hotels.map((h) => h.d1);
  const d2Scores = hotels.map((h) => h.d2);

  chartInstances.dimensions = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "D1: Amenazas Externas (Max 40 pts)",
          data: d1Scores,
          backgroundColor: "#3b82f6",
          borderRadius: 4,
        },
        {
          label: "D2: Controles Defensivos (Max 60 pts)",
          data: d2Scores,
          backgroundColor: "#8b5cf6",
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: colors.textColor,
            font: { family: "Inter", size: 11 },
            padding: 12,
          },
        },
        tooltip: {
          callbacks: {
            footer: (items) => {
              const total = items.reduce((a, b) => a + b.parsed.y, 0);
              return `ICVA Total: ${total} pts`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            color: colors.textColor,
            font: { family: "Inter", size: 10 },
          },
          grid: { display: false },
        },
        y: {
          stacked: true,
          min: 0,
          max: 100,
          ticks: {
            color: colors.mutedColor,
            font: { family: "Inter", size: 10 },
          },
          grid: { color: colors.gridColor },
        },
      },
    },
  });
}

/* ==========================================================================
   SVG FALLBACK RENDERING (IF OFFLINE)
   ========================================================================== */

function renderSvgFallbacks() {
  // Fallback 1: Ranking
  const rankingWrap = document.getElementById("chart-ranking")?.parentElement;
  if (rankingWrap) {
    const sorted = [...AUDIT_DATA.hotels].sort((a, b) => b.icva - a.icva);
    let html = `<div class="svg-fallback-chart" style="display:flex;flex-direction:column;gap:8px;padding:8px;overflow-y:auto;max-height:300px;">`;
    sorted.forEach((h) => {
      const col =
        h.icva >= 70
          ? "var(--risk-low)"
          : h.icva >= 40
            ? "var(--risk-mid)"
            : "var(--risk-high)";
      html += `
        <div style="display:flex;align-items:center;gap:10px;font-size:0.75rem;">
          <span style="width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:600;">${h.name}</span>
          <div style="flex-grow:1;height:12px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
            <div style="width:${h.icva}%;height:100%;background:${col};border-radius:6px;"></div>
          </div>
          <span style="font-weight:700;font-family:var(--font-mono);min-width:40px;text-align:right;">${h.icva}</span>
        </div>
      `;
    });
    html += `</div>`;
    rankingWrap.innerHTML = html;
  }

  // Fallback 2: Distribution
  const distWrap = document.getElementById("chart-distribution")?.parentElement;
  if (distWrap) {
    distWrap.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:16px;">
        <div style="display:flex;gap:20px;justify-content:center;">
          <div style="text-align:center;padding:12px;background:var(--risk-low-bg);border:1px solid var(--risk-low-border);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--risk-low);">5</div>
            <div style="font-size:0.75rem;font-weight:600;">Baja (38.5%)</div>
          </div>
          <div style="text-align:center;padding:12px;background:var(--risk-mid-bg);border:1px solid var(--risk-mid-border);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--risk-mid);">3</div>
            <div style="font-size:0.75rem;font-weight:600;">Media (23.1%)</div>
          </div>
          <div style="text-align:center;padding:12px;background:var(--risk-high-bg);border:1px solid var(--risk-high-border);border-radius:12px;">
            <div style="font-size:1.75rem;font-weight:800;color:var(--risk-high);">5</div>
            <div style="font-size:0.75rem;font-weight:600;">Alta (38.5%)</div>
          </div>
        </div>
      </div>
    `;
  }

  // Fallback 3: Indicators
  const indWrap = document.getElementById("chart-indicators")?.parentElement;
  if (indWrap) {
    let indHtml = `<div style="display:flex;flex-direction:column;gap:8px;padding:8px;overflow-y:auto;max-height:300px;">`;
    AUDIT_DATA.indicators.forEach((ind) => {
      const sum = AUDIT_DATA.hotels.reduce(
        (acc, h) => acc + (h.scores[ind.id] || 0),
        0,
      );
      const avg = sum / AUDIT_DATA.hotels.length;
      const pct = ((avg / ind.maxPoints) * 100).toFixed(1);
      indHtml += `
        <div style="font-size:0.75rem;">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <span>${ind.id} ${ind.name}</span>
            <strong>${avg.toFixed(1)} / ${ind.maxPoints} pts (${pct}%)</strong>
          </div>
          <div style="height:8px;background:rgba(255,255,255,0.06);border-radius:4px;overflow:hidden;">
            <div style="width:${pct}%;height:100%;background:var(--accent-cyan);border-radius:4px;"></div>
          </div>
        </div>
      `;
    });
    indHtml += `</div>`;
    indWrap.innerHTML = indHtml;
  }

  // Fallback 4: Dimensions
  const dimWrap = document.getElementById("chart-dimensions")?.parentElement;
  if (dimWrap) {
    let dimHtml = `<div style="display:flex;flex-direction:column;gap:8px;padding:8px;overflow-y:auto;max-height:300px;">`;
    AUDIT_DATA.hotels.forEach((h) => {
      dimHtml += `
        <div style="display:flex;align-items:center;gap:8px;font-size:0.75rem;">
          <span style="width:130px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h.name}</span>
          <div style="flex-grow:1;display:flex;height:12px;background:rgba(255,255,255,0.06);border-radius:6px;overflow:hidden;">
            <div style="width:${h.d1}%;height:100%;background:#3b82f6;" title="D1: ${h.d1} pts"></div>
            <div style="width:${h.d2}%;height:100%;background:#8b5cf6;" title="D2: ${h.d2} pts"></div>
          </div>
          <span style="font-family:var(--font-mono);font-weight:700;width:35px;text-align:right;">${h.icva}</span>
        </div>
      `;
    });
    dimHtml += `</div>`;
    dimWrap.innerHTML = dimHtml;
  }
}

/* ==========================================================================
   MODAL CONTROLLER (MODERN WEB GUIDANCE: dialog & light-dismiss-a-dialog)
   ========================================================================== */

function initModal() {
  const dialog = document.getElementById("hotel-detail-modal");
  if (!dialog) return;

  // Delegate click for table buttons
  document.addEventListener("click", (e) => {
    const btn = e.target.closest('[data-action="view-hotel"]');
    if (btn) {
      const hotelId = parseInt(btn.dataset.hotelId, 10);
      openHotelModal(hotelId);
    }
  });

  // Native showModal
  window.openHotelModal = function (hotelId) {
    const hotel = AUDIT_DATA.hotels.find((h) => h.id === hotelId);
    if (!hotel) return;

    document.getElementById("modal-hotel-name").textContent = hotel.name;
    document.getElementById("modal-hotel-url").textContent = hotel.url;
    document.getElementById("modal-hotel-url").href = hotel.url;

    const icvaBadge = document.getElementById("modal-hotel-icva");
    icvaBadge.textContent = `${hotel.icva.toFixed(1)} / 100 pts`;
    icvaBadge.className = `score-badge ${hotel.icva >= 70 ? "tier-low" : hotel.icva >= 40 ? "tier-mid" : "tier-high"}`;

    document.getElementById("modal-d1-score").textContent =
      `${hotel.d1.toFixed(1)} / 40 pts`;
    document.getElementById("modal-d2-score").textContent =
      `${hotel.d2.toFixed(1)} / 60 pts`;

    // Indicators list
    const scoresList = document.getElementById("modal-scores-list");
    scoresList.innerHTML = "";
    AUDIT_DATA.indicators.forEach((ind) => {
      const score = hotel.scores[ind.id] || 0;
      const pct = (score / ind.maxPoints) * 100;
      const item = document.createElement("div");
      item.className = "modal-score-item";
      item.innerHTML = `
        <div>
          <strong>${ind.id} ${ind.name}</strong>
          <div style="font-size:0.75rem;color:var(--text-dim);">${ind.description}</div>
        </div>
        <div style="font-weight:700;font-family:var(--font-mono);">${score.toFixed(1)} / ${ind.maxPoints} pts</div>
        <div class="modal-score-bar-bg">
          <div class="modal-score-bar-val" style="width: ${pct}%;"></div>
        </div>
      `;
      scoresList.appendChild(item);
    });

    // Notes
    document.getElementById("modal-hotel-notes").textContent = hotel.notes;

    // Recommendations list
    const recsList = document.getElementById("modal-recommendations-list");
    recsList.innerHTML = "";
    hotel.recommendations.forEach((rec) => {
      const li = document.createElement("li");
      li.textContent = rec;
      recsList.appendChild(li);
    });

    dialog.showModal();
  };

  // Close handlers
  const closeBtn = dialog.querySelector(".modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => dialog.close());
  }

  // Light dismiss fallback for browsers without native closedby support
  if (!("closedBy" in HTMLDialogElement.prototype)) {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const isInside =
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width;
      if (!isInside) dialog.close();
    });
  }
}

/* ==========================================================================
   DATA EXPORTS & PRINT
   ========================================================================== */

function initExports() {
  const csvBtn = document.getElementById("export-csv-btn");
  const jsonBtn = document.getElementById("export-json-btn");

  if (csvBtn) {
    csvBtn.addEventListener("click", exportToCSV);
  }

  if (jsonBtn) {
    jsonBtn.addEventListener("click", exportToJSON);
  }
}

function exportToCSV() {
  const headers = [
    "ID",
    "Establecimiento",
    "URL Oficial",
    "Estado Web",
    "ICVA Total",
    "D1 (40 pts)",
    "D2 (60 pts)",
    "1.1 Typosquatting (15)",
    "1.2 Certificados Anomalos (15)",
    "1.3 Contenido Imitador (10)",
    "2.1 Titularidad Dominio (10)",
    "2.2 Cifrado TLS/SSL (15)",
    "2.3 DNSSEC (10)",
    "2.4 HSTS (15)",
    "2.5 Cabeceras HTTP (5)",
    "2.6 SPF/DMARC (5)",
    "Nivel Vulnerabilidad",
  ];

  const rows = AUDIT_DATA.hotels.map((h) => [
    h.id,
    `"${h.name}"`,
    `"${h.url}"`,
    `"${h.status}"`,
    h.icva,
    h.d1,
    h.d2,
    h.scores["1.1"],
    h.scores["1.2"],
    h.scores["1.3"],
    h.scores["2.1"],
    h.scores["2.2"],
    h.scores["2.3"],
    h.scores["2.4"],
    h.scores["2.5"],
    h.scores["2.6"],
    `"${h.tier}"`,
  ]);

  const csvContent =
    "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Auditoria_ICVA_Hoteles_Antigua_Guatemala_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function exportToJSON() {
  const jsonContent = JSON.stringify(AUDIT_DATA, null, 2);
  const blob = new Blob([jsonContent], {
    type: "application/json;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Auditoria_ICVA_Hoteles_Antigua_Guatemala_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
