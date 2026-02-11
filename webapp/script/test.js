// --- THEME ENGINE ---
function toggleTheme(restore = false) {
  const html = document.documentElement;
  const switchBtn = document.getElementById("themeSwitch");
  let theme = "";
  if (restore) {
    theme = localStorage.getItem("theme");
  } else {
    const current = html.getAttribute("data-theme");
    theme = current === "dark" ? "light" : "dark";
    localStorage.setItem("theme", theme);
  }
  html.setAttribute("data-theme", theme);
  switchBtn.setAttribute("data-mode", theme);
  updateChart();
}

function getChartColors() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const computedStyle = getComputedStyle(document.documentElement);
  return {
    grid: isDark ? "#334155" : "#e2e8f0",
    text: isDark ? "#94a3b8" : "#64748b",
    arrivi: computedStyle.getPropertyValue("--secondary").trim(),
    presenze: computedStyle.getPropertyValue("--accent").trim(),
    forecastArrivi: computedStyle.getPropertyValue("--forecast-arrivi").trim(),
    forecastPresenze: computedStyle
      .getPropertyValue("--forecast-presenze")
      .trim(),
  };
}

// --- UI LOGIC ---
function toggleSidebar(side = null) {
  const sidebars = {
    leftfilter: {
      element: document.getElementById("sidebarLeftFilter"),
      button: document.getElementById("btnToggleLeftFilter"),
      group: "left",
    },
    leftgenerate: {
      element: document.getElementById("sidebarLeftGenerate"),
      button: document.getElementById("btnToggleLeftGenerate"),
      group: "left",
    },
    right: {
      element: document.getElementById("sidebarRight"),
      button: document.getElementById("btnToggleRight"),
      group: "right",
    },
  };

  const current = sidebars[side];
  if (!current) return;

  // Se è una sidebar di sinistra, chiudo le altre di sinistra
  if (current.group === "left") {
    Object.values(sidebars).forEach((s) => {
      if (s.group === "left" && s !== current) {
        s.element.classList.add("collapsed");
        s.button.classList.remove("active");
      }
    });
  }

  // Toggle della selezionata
  current.element.classList.toggle("collapsed");
  current.button.classList.toggle("active");

  setTimeout(() => {
    if (chartInstance) chartInstance.resize();
  }, 400);
}

function resetFilters() {
  document
    .querySelectorAll(".year-checkbox")
    .forEach((cb) => (cb.checked = false));
  // Clear range visual selection
  document
    .querySelectorAll(".range-item")
    .forEach((btn) => btn.classList.remove("selected"));

  document.getElementById("locationFilter").value = "all";
  [
    "chkHotel",
    "chkExtra",
    "chkIta",
    "chkStr",
    "chkPresenze",
    "chkArrivi",
  ].forEach((id) => {
    document.getElementById(id).checked = false;
  });
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));
  currentMode = null;

  document.getElementById("chartTitle").textContent = "Pronto";
  document.getElementById("chartSubtitle").textContent = "Configura l'analisi";

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
  document.getElementById("mainChart").style.display = "none";
  document.getElementById("chartPlaceholder").style.display = "block";

  const icon = document.querySelector(".reset-icon");
  icon.style.transform = "rotate(-360deg)";
  setTimeout(() => (icon.style.transform = "rotate(0deg)"), 500);
}

// --- DATA & CHART ENGINE ---
const monthMap = [
  "Gen",
  "Feb",
  "Mar",
  "Apr",
  "Mag",
  "Giu",
  "Lug",
  "Ago",
  "Set",
  "Ott",
  "Nov",
  "Dic",
];
const historyData = {
  2023: {
    Arrivi: {
      Gen: 85000,
      Feb: 95000,
      Mar: 100000,
      Apr: 105000,
      Mag: 110000,
      Giu: 125000,
      Lug: 160000,
      Ago: 200000,
      Set: 140000,
      Ott: 120000,
      Nov: 110000,
      Dic: 105000,
    },
    Presenze: {
      Gen: 160000,
      Feb: 170000,
      Mar: 180000,
      Apr: 185000,
      Mag: 195000,
      Giu: 210000,
      Lug: 250000,
      Ago: 300000,
      Set: 220000,
      Ott: 200000,
      Nov: 190000,
      Dic: 190000,
    },
  },
  2024: {
    Arrivi: {
      Gen: 90000,
      Feb: 100000,
      Mar: 110000,
      Apr: 115000,
      Mag: 120000,
      Giu: 135000,
      Lug: 175000,
      Ago: 215000,
      Set: 155000,
      Ott: 130000,
      Nov: 120000,
      Dic: 115000,
    },
    Presenze: {
      Gen: 175000,
      Feb: 185000,
      Mar: 195000,
      Apr: 200000,
      Mag: 210000,
      Giu: 225000,
      Lug: 270000,
      Ago: 320000,
      Set: 240000,
      Ott: 220000,
      Nov: 210000,
      Dic: 210000,
    },
  },
  2025: {
    Arrivi: {
      Gen: 105000,
      Feb: 115000,
      Mar: 125000,
      Apr: 125000,
      Mag: 135000,
      Giu: 150000,
      Lug: 190000,
      Ago: 235000,
      Set: 170000,
      Ott: 145000,
      Nov: 135000,
      Dic: 130000,
    },
    Presenze: {
      Gen: 195000,
      Feb: 205000,
      Mar: 215000,
      Apr: 215000,
      Mag: 230000,
      Giu: 245000,
      Lug: 290000,
      Ago: 340000,
      Set: 260000,
      Ott: 240000,
      Nov: 230000,
      Dic: 230000,
    },
  },
};

const rawData = { history: historyData, forecast: {} };
let chartInstance = null;
let currentMode = "history";

function generateForecastData() {
  const startYear = 2026;
  const endYear = 2109;
  const baseData = rawData.history[2025];

  let prevA = { ...baseData.Arrivi };
  let prevP = { ...baseData.Presenze };

  for (let y = startYear; y <= endYear; y++) {
    rawData.forecast[y] = { Arrivi: {}, Presenze: {} };
    const yearsFromStart = y - startYear;
    const baseGrowth = Math.max(0.005, 0.015 - yearsFromStart * 0.00015);
    const cycleFactor = Math.sin(yearsFromStart * 0.7) * 0.025;
    const growthFactor = 1 + baseGrowth + cycleFactor;

    monthMap.forEach((m) => {
      const noise = 0.98 + Math.random() * 0.04;
      const newA = Math.round(prevA[m] * growthFactor * noise);
      const newP = Math.round(prevP[m] * growthFactor * noise);
      rawData.forecast[y].Arrivi[m] = newA;
      rawData.forecast[y].Presenze[m] = newP;
      prevA[m] = newA;
      prevP[m] = newP;
    });
  }
}

// --- FILTER INIT ---
function initYearsFilter() {
  const container = document.getElementById("yearsFilterContainer");
  container.innerHTML = "";
  for (let year = 2013; year <= 2109; year++) {
    const label = document.createElement("label");
    label.className = "checkbox-item";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = year;
    input.id = `chk-year-${year}`;
    input.className = "year-checkbox";
    input.checked = year <= 2025;
    input.addEventListener("change", () => {
      updateRangeButtonState();
      updateChart();
    });
    label.appendChild(input);
    label.appendChild(document.createTextNode(` ${year}`));
    container.appendChild(label);
  }
}

function initRangeFilters() {
  createRangeButtons(2013, 2024, 5, "historicRangeContainer");
  createRangeButtons(2025, 2109, 5, "forecastRangeContainer");
}

function createRangeButtons(startYear, endYear, step, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  for (let y = startYear; y <= endYear; y += step) {
    // Ensure ranges align with user request (e.g. 2013-2018, 2018-2023)
    // Using simple chunks for now: 2013-2017 (5 yrs), 2018-2022
    // Adjusted logic to match "2013-2018" style overlapping ranges if desired, or discrete chunks.
    // Standard UI usually uses discrete. Let's do y to y+4.
    let end = Math.min(y + step - 1, endYear);
    if (end < y) break;

    const btn = document.createElement("button");
    btn.className = "range-item";
    btn.textContent = `${y}-${end}`;
    btn.dataset.start = y;
    btn.dataset.end = end;
    btn.onclick = () => {
      toggleYearsRange(y, end, btn);
    };
    container.appendChild(btn);
  }
}

// --- SELECTION LOGIC ---
function toggleYearsRange(start, end, btnElement) {
  // Check if this range is currently "fully selected"
  // If fully selected, deselect it. If partial or none, select it.
  const checkboxes = document.querySelectorAll(".year-checkbox");
  let allChecked = true;

  // First pass check
  for (let y = start; y <= end; y++) {
    const cb = document.getElementById(`chk-year-${y}`);
    if (cb && !cb.checked) {
      allChecked = false;
      break;
    }
  }

  const newState = !allChecked; // Toggle

  for (let y = start; y <= end; y++) {
    const cb = document.getElementById(`chk-year-${y}`);
    if (cb) cb.checked = newState;
  }

  updateRangeButtonState();
  updateChart();
}

function updateRangeButtonState() {
  // Update visual state of all range buttons based on underlying checkboxes
  document.querySelectorAll(".range-item").forEach((btn) => {
    const start = parseInt(btn.dataset.start);
    const end = parseInt(btn.dataset.end);
    let allChecked = true;
    for (let y = start; y <= end; y++) {
      const cb = document.getElementById(`chk-year-${y}`);
      if (cb && !cb.checked) {
        allChecked = false;
        break;
      }
    }
    if (allChecked) btn.classList.add("selected");
    else btn.classList.remove("selected");
  });
}

function getSelectedYears() {
  return Array.from(document.querySelectorAll(".year-checkbox:checked"))
    .map((cb) => parseInt(cb.value))
    .sort((a, b) => a - b);
}

function getDataBySelection() {
  let labels = [],
    arrivi = [],
    presenze = [];
  getSelectedYears().forEach((year) => {
    let d = rawData.history[year] || rawData.forecast[year];
    if (d) {
      monthMap.forEach((m) => {
        labels.push(`${m} ${year}`);
        arrivi.push(d.Arrivi[m]);
        presenze.push(d.Presenze[m]);
      });
    }
  });
  return { labels, arrivi, presenze };
}

function isForecast(label) {
  if (!label) return false;
  const parts = label.split(" ");
  const year = parseInt(parts[1]);
  return year >= 2026;
}

function updateChart() {
  const selectedYears = getSelectedYears();
  if (selectedYears.length === 0) {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
    document.getElementById("mainChart").style.display = "none";
    document.getElementById("chartPlaceholder").style.display = "block";
    return;
  }

  document.getElementById("chartPlaceholder").style.display = "none";
  document.getElementById("mainChart").style.display = "block";

  const ctx = document.getElementById("mainChart").getContext("2d");
  const data = getDataBySelection();

  // Text logic
  const t = document.getElementById("chartTitle");
  const s = document.getElementById("chartSubtitle");
  if (currentMode === "history") {
    t.textContent = "Dati Storici";
    s.textContent = "Visualizzazione storico";
  } else if (currentMode === "forecast") {
    t.textContent = "Previsione Futura";
    s.textContent = "Visualizzazione previsione";
  } else {
    t.textContent = "Analisi Completa";
    s.textContent = "Visualizzazione dati selezionati";
  }

  const colors = getChartColors();

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels: data.labels,
      datasets: [
        {
          label: "Presenze",
          data: data.presenze,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          segment: {
            borderColor: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex])
                ? colors.forecastPresenze
                : colors.presenze,
            borderDash: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex]) ? [5, 5] : [],
          },
        },
        {
          label: "Arrivi",
          data: data.arrivi,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 6,
          segment: {
            borderColor: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex])
                ? colors.forecastArrivi
                : colors.arrivi,
            borderDash: (ctx) =>
              isForecast(data.labels[ctx.p1DataIndex]) ? [5, 5] : [],
          },
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: "index",
          intersect: false,
          backgroundColor:
            document.documentElement.getAttribute("data-theme") === "dark"
              ? "#334155"
              : "#1e293b",
          titleColor: "#f8fafc",
          bodyColor: "#f8fafc",
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            maxTicksLimit: 10,
            color: colors.text,
            font: { family: "Plus Jakarta Sans" },
          },
        },
        y: {
          border: { display: false },
          grid: { color: colors.grid, borderDash: [5, 5] },
          ticks: {
            callback: (v) => v / 1000 + "k",
            color: colors.text,
            font: { family: "Plus Jakarta Sans" },
          },
        },
      },
      interaction: { mode: "nearest", axis: "x", intersect: false },
    },
  });
  toggleSeries();
}

function toggleSeries() {
  if (!chartInstance) return;
  chartInstance.getDatasetMeta(0).hidden =
    !document.getElementById("chkPresenze").checked;
  chartInstance.getDatasetMeta(1).hidden =
    !document.getElementById("chkArrivi").checked;
  chartInstance.update();
}

function setMode(mode) {
  // Note: Completo button now simply sets mode label, doesn't force selection
  currentMode = mode;
  [
    "chkHotel",
    "chkExtra",
    "chkIta",
    "chkStr",
    "chkPresenze",
    "chkArrivi",
  ].forEach((id) => {
    document.getElementById(id).checked = true;
  });
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));

  if (mode === "history") {
    document.getElementById("btnHistory").classList.add("active");
    // Select only historic range for "Storico" preset
    document.querySelectorAll(".year-checkbox").forEach((cb) => {
      cb.checked = parseInt(cb.value) <= 2024;
    });
  } else if (mode === "forecast") {
    document.getElementById("btnGenerate").classList.add("active");
    // Select only forecast range for "Generate" preset
    document.querySelectorAll(".year-checkbox").forEach((cb) => {
      cb.checked = parseInt(cb.value) >= 2025;
    });
  } else {
    document.getElementById("btnAll").classList.add("active");
    // "Completo" DOES NOT change selection, just mode label as requested
  }

  updateRangeButtonState(); // Sync range buttons
  updateChart();
}

document.addEventListener("DOMContentLoaded", () => {
  toggleTheme(true);
  generateForecastData();
  initYearsFilter();
  initRangeFilters();
  // Start with history checked but update visual state
  updateRangeButtonState();
  setMode("history");
});
