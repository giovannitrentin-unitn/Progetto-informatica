const templateData = {
  Arrivi: {
    "2013-01": {
      ambito: "",
      italiani: "",
      stranieri: "",
    },
  },
  Presenze: {
    "2013-01": {
      ambito: "",
      italiani: "",
      stranieri: "",
    },
  },
};

const templateFilters = {
  filters: {
    ambito_mensile: ["ambito1", "ambito2"],
    target: ["target1", "target2"],
    metrica: ["metrica1", "metrica2"],
    periodo_dati: ["data_partenza", "data_arrivo"],
    periodo_previsione: "Mensile", // o annuale
  },
};

const MIN_YEAR = 2013;
const MAX_YEAR = 2024;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
let dataChart = null;
let filters = null;
let chartInstance = null;
let currentMode = "history";
const idMap = {
  Alberghieri: "chkHotel",
  Extralberghieri: "chkExtra",
  Italiani: "chkIta",
  Stranieri: "chkStr",
  Presenze: "chkPresenze",
  Arrivi: "chkArrivi",
};
const colorMap = {
  Presenze: "var(--accent)",
  Arrivi: "var(--secondary)",
};
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
  //updateChart();
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

// --- FILTER SECTION ---
function resetFilters() {
  // Reset Date Selects
  document.getElementById("startYearM").value = 2013;
  document.getElementById("startMonthM").value = 0;
  document.getElementById("endYearM").value = 2025;
  document.getElementById("endMonthM").value = 11;

  // Reset Checkboxes
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((c) => (c.checked = false));

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

function setMode(mode) {
  currentMode = mode;
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((c) => (c.checked = true));
  document
    .querySelectorAll(".mode-btn")
    .forEach((b) => b.classList.remove("active"));

  const sm = document.getElementById("startMonthM"),
    sy = document.getElementById("startYearM");
  const em = document.getElementById("endMonthM"),
    ey = document.getElementById("endYearM");
  sm.value = 0;
  em.value = 11;

  if (mode === "history") {
    document.getElementById("btnHistory").classList.add("active");
    sy.value = 2013;
    ey.value = 2024;
  } else if (mode === "forecast") {
    document.getElementById("btnGenerate").classList.add("active");
    sy.value = 2025;
    ey.value = 2109;
  } else {
    document.getElementById("btnAll").classList.add("active");
    sy.value = 2013;
    ey.value = 2109;
  }
  updateChart();
}

function isForecast(label) {
  if (!label) return false;
  const parts = label.split(" ");
  return parseInt(parts[1]) >= 2026;
}

function updateChart() {
  const showP = document.getElementById("chkPresenze")
    ? document.getElementById("chkPresenze").checked
    : false;
  const showA = document.getElementById("chkArrivi")
    ? document.getElementById("chkArrivi").checked
    : false;

  if (!showP && !showA) {
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
  const colors = getChartColors();

  const t = document.getElementById("chartTitle");
  const s = document.getElementById("chartSubtitle");
  if (currentMode === "history") {
    t.innerText = "Dati Storici";
    s.innerText = "Consolidato";
  } else if (currentMode === "forecast") {
    t.innerText = "Previsione Futura";
    s.innerText = "Algoritmo AI";
  } else {
    t.innerText = "Analisi Completa";
    s.innerText = "Trend globale";
  }

  if (chartInstance) chartInstance.destroy();

  const gradP = ctx.createLinearGradient(0, 0, 0, 400);
  gradP.addColorStop(0, "rgba(236, 72, 153, 0.2)");
  gradP.addColorStop(1, "rgba(236, 72, 153, 0)");
  const gradA = ctx.createLinearGradient(0, 0, 0, 400);
  gradA.addColorStop(0, "rgba(14, 165, 233, 0.2)");
  gradA.addColorStop(1, "rgba(14, 165, 233, 0)");

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
  const elP = document.getElementById("chkPresenze");
  const elA = document.getElementById("chkArrivi");
  if (elP) chartInstance.getDatasetMeta(0).hidden = !elP.checked;
  if (elA) chartInstance.getDatasetMeta(1).hidden = !elA.checked;
  chartInstance.update();
}

function getDataBySelection() {
  let labels = [],
    arrivi = [],
    presenze = [];
  const isMonthly =
    filters.filters.periodo_previsione.toLowerCase() === "mensile";

  // Ottieni ambiti selezionati per filtrare i dati
  const selectedAmbiti = Array.from(
    document.querySelectorAll(".ambito-checkbox:checked"),
  ).map((cb) => cb.value);
  const showIta = document.getElementById("chkIta")?.checked;
  const showStr = document.getElementById("chkStr")?.checked;

  let startY,
    endY,
    startM = 0,
    endM = 11;

  if (isMonthly) {
    startY = parseInt(document.getElementById("startYearM").value);
    startM = parseInt(document.getElementById("startMonthM").value);
    endY = parseInt(document.getElementById("endYearM").value);
    endM = parseInt(document.getElementById("endMonthM").value);
  } else {
    startY = parseInt(document.getElementById("startYearOnly").value);
    endY = parseInt(document.getElementById("endYearOnly").value);
  }

  // Iterazione sui dati (Assumendo che dataChart segua la struttura Metrica -> Data)
  for (let y = startY; y <= endY; y++) {
    // Supponiamo che monthMap sia ["Gennaio", "Febbraio", ...]
    monthMap.forEach((mName, mIdx) => {
      // Validazione del range temporale
      if (y === startY && mIdx < startM) return;
      if (y === endY && mIdx > endM) return;

      const dateKey = `${y}-${(mIdx + 1).toString().padStart(2, "0")}`;

      // Calcolo valori filtrati
      let valArrivi = 0;
      let valPresenze = 0;

      // Accedi ai dati reali (strutturati per Metrica)
      const dataA = dataChart.Arrivi[dateKey];
      const dataP = dataChart.Presenze[dateKey];

      if (
        dataA &&
        (selectedAmbiti.includes(dataA.ambito) ||
          document.getElementById("chk-all-valli").checked)
      ) {
        if (showIta) valArrivi += parseFloat(dataA.italiani || 0);
        if (showStr) valArrivi += parseFloat(dataA.stranieri || 0);
      }

      if (
        dataP &&
        (selectedAmbiti.includes(dataP.ambito) ||
          document.getElementById("chk-all-valli").checked)
      ) {
        if (showIta) valPresenze += parseFloat(dataP.italiani || 0);
        if (showStr) valPresenze += parseFloat(dataP.stranieri || 0);
      }

      labels.push(isMonthly ? `${mName} ${y}` : `${y}`);
      arrivi.push(valArrivi);
      presenze.push(valPresenze);
    });
  }

  // Se Annuale, raggruppiamo i dati per anno (sommando i mesi)
  if (!isMonthly) {
    return aggregateByYear(labels, arrivi, presenze);
  }

  return { labels, arrivi, presenze };
}

// --- 2. GENERATORE UI DINAMICO ---
/**
 * Genera dinamicamente la sidebar dei filtri basandosi sull'oggetto 'filters'
 * (caricato tramite templateFilters).
 */
function renderSidebar() {
  const container = document.getElementById("dynamicFiltersContainer");
  if (!container || !filters || !filters.filters) return;

  container.innerHTML = ""; // Pulisce il contenitore prima del rendering

  const filterData = filters.filters;
  // Determina se la previsione è Mensile o Annuale dal nuovo template
  const isMonthly =
    filterData.periodo_previsione &&
    filterData.periodo_previsione.toLowerCase() === "mensile";

  Object.keys(filterData).forEach((key) => {
    const values = filterData[key];

    if (key === "ambito_mensile") {
      // --- SEZIONE AMBITI ---
      const details = document.createElement("details");
      details.className = "filter-accordion";
      details.open = true;
      details.innerHTML = `<summary>Ambito Mensile</summary>`;

      const content = document.createElement("div");
      content.className = "accordion-content";
      const scroll = document.createElement("div");
      scroll.className = "scrollable-filter";

      values.forEach((opt, idx) => {
        const label = document.createElement("label");
        label.className = "checkbox-item";
        // Il primo elemento funge spesso da "Seleziona Tutti"
        if (idx === 0 && opt.toLowerCase().includes("tutti")) {
          label.innerHTML = `<input type="checkbox" id="chk-all-valli" checked onchange="toggleAllAmbiti(this)"> ${opt}`;
        } else {
          label.innerHTML = `<input type="checkbox" class="ambito-checkbox" value="${opt}" checked onchange="updateChart()"> ${opt}`;
        }
        scroll.appendChild(label);
      });
      content.appendChild(scroll);
      details.appendChild(content);
      container.appendChild(details);
    } else if (key === "target") {
      // --- SEZIONE TARGET (Italiani/Stranieri) ---
      const details = document.createElement("details");
      details.className = "filter-accordion";
      details.open = true;
      details.innerHTML = `<summary>Target</summary>`;

      const content = document.createElement("div");
      content.className = "accordion-content";
      const grp = document.createElement("div");
      grp.className = "checkbox-group";

      values.forEach((opt) => {
        const htmlId = idMap[opt] || opt; // Usa la mappa ID per collegare HTML e JSON
        const lbl = document.createElement("label");
        lbl.className = "checkbox-item";
        lbl.innerHTML = `<input type="checkbox" id="${htmlId}" checked onchange="updateChart()"> ${opt}`;
        grp.appendChild(lbl);
      });
      content.appendChild(grp);
      details.appendChild(content);
      container.appendChild(details);
    } else if (key === "metrica") {
      // --- SEZIONE METRICA (Arrivi/Presenze) ---
      const details = document.createElement("details");
      details.className = "filter-accordion";
      details.open = true;
      details.innerHTML = `<summary>Metrica</summary>`;

      const content = document.createElement("div");
      content.className = "accordion-content";
      const grp = document.createElement("div");
      grp.className = "checkbox-group";

      values.forEach((opt) => {
        const htmlId = idMap[opt] || opt;
        const color = colorMap[opt] || "var(--primary)";
        const lbl = document.createElement("label");
        lbl.className = "checkbox-item";
        const colorSpan = `<span style="display:inline-block; width:10px; height:10px; border-radius:3px; background:${color}; margin-right:8px;"></span>`;
        lbl.innerHTML = `<input type="checkbox" id="${htmlId}" checked onchange="toggleSeries()"> ${colorSpan} ${opt}`;
        grp.appendChild(lbl);
      });
      content.appendChild(grp);
      details.appendChild(content);
      container.appendChild(details);
    } else if (key === "periodo_dati") {
      // --- SEZIONE PERIODO (Configurazione dinamica) ---
      const div = document.createElement("div");
      div.className = "filter-section";
      div.style.marginTop = "12px";
      div.innerHTML = `<div class="filter-title">Periodo di Analisi</div>`;

      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.flexDirection = "column";
      row.style.gap = "8px";

      if (isMonthly) {
        // Layout Mese + Anno
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="font-size:0.75rem; color:var(--text-tertiary); width:20px;">Dal</span>
            <select class="periodo-select" id="startMonthM" onchange="updateChart()"></select>
            <select class="periodo-select" id="startYearM" onchange="updateChart()"></select>
          </div>
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="font-size:0.75rem; color:var(--text-tertiary); width:20px;">Al</span>
            <select class="periodo-select" id="endMonthM" onchange="updateChart()"></select>
            <select class="periodo-select" id="endYearM" onchange="updateChart()"></select>
          </div>`;
      } else {
        // Layout solo Anno
        row.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="font-size:0.75rem; color:var(--text-tertiary); width:20px;">Dal</span>
            <select class="periodo-select" id="startYearOnly" style="width:100%" onchange="updateChart()"></select>
          </div>
          <div style="display: flex; align-items: center; gap: 8px">
            <span style="font-size:0.75rem; color:var(--text-tertiary); width:20px;">Al</span>
            <select class="periodo-select" id="endYearOnly" style="width:100%" onchange="updateChart()"></select>
          </div>`;
      }

      div.appendChild(row);
      container.appendChild(div);

      // Popola le select subito dopo il rendering nel DOM
      setTimeout(() => {
        if (isMonthly) {
          populateDateSelects(MIN_YEAR, MAX_YEAR);
        } else {
          populateYearOnlySelects(MIN_YEAR, MAX_YEAR);
        }
      }, 0);
    }
  });
}

/**
 * Helper per popolare solo gli anni quando la previsione è annuale.
 */
function populateYearOnlySelects(min, max) {
  const sy = document.getElementById("startYearOnly");
  const ey = document.getElementById("endYearOnly");
  if (!sy || !ey) return;

  for (let y = min; y <= max; y++) {
    sy.add(new Option(y, y));
    ey.add(new Option(y, y));
  }
  sy.value = min;
  ey.value = max;
}

// --- 3. HELPER LOGIC ---
function populateDateSelects(min, max) {
  const sm = document.getElementById("startMonthM");
  const sy = document.getElementById("startYearM");
  const em = document.getElementById("endMonthM");
  const ey = document.getElementById("endYearM");

  for (let y = min; y <= max; y++) {
    sy.add(new Option(y, y));
    ey.add(new Option(y, y));
  }
  monthMap.forEach((m, i) => {
    sm.add(new Option(m, i));
    em.add(new Option(m, i));
  });

  // Defaults
  sy.value = 2013;
  sm.value = 0;
  ey.value = 2025;
  em.value = 11;
}

function toggleAllAmbiti(source) {
  document
    .querySelectorAll(".ambito-checkbox")
    .forEach((cb) => (cb.checked = source.checked));
  updateChart();
}

// --- DATA ---
async function fetchReceivedData(url) {
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error(
        "Errore nella richiesta:",
        response.status,
        response.statusText,
      );
      return [];
    }

    const data = await response.json();

    if (!data || !data.received) {
      console.warn("Chiave 'received' non trovata nel JSON ricevuto");
      return [];
    }

    return data.received;
  } catch (error) {
    console.error("Errore fetch:", error);
    return [];
  }
}

async function getData() {
  await fetchReceivedData("http://localhost:5000/get_prediction").then(
    (receivedData) => {
      dataChart = receivedData;
      console.log(dataChart);
    },
  );
  await fetchReceivedData("http://localhost:5000/get_filters").then(
    (receivedData) => {
      filters = receivedData;
      console.log(filters);
    },
  );
}

// --- GENERATION SECTION ---
function generateForecast() {
  const predictionLength = parseInt(
    document.getElementById("predictionLength").value,
  );

  const predictionPrecision = parseInt(
    document.getElementById("predictionPrecision").value,
  );

  // Ambito mensile selezionato
  const ambito = Array.from(
    document.querySelectorAll(".ambito-item:checked"),
  ).map((el) => el.value);

  const target = Array.from(
    document.querySelectorAll(".target-item:checked"),
  ).map((el) => el.value);

  const metrica = Array.from(
    document.querySelectorAll(".metrica-item:checked"),
  ).map((el) => el.value);

  payload = {
    filters: {
      prediction_length: predictionLength,
      prediction_precision: predictionPrecision,
      ambito_mensile: ambito,
      target: target,
      metrica: metrica,
      periodo_dati: [periodStart, periodEnd],
      periodo_previsione: getPeriodoSelezionato(),
    },
  };

  // Richiesta di generazione
  fetch("http://localhost:5000/genera_previsioni", {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Indica che stiamo inviando JSON
    },
    body: JSON.stringify(payload), // Converte l'oggetto JS in JSON
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Errore nella richiesta: " + response.status);
      }
      return response.json(); // Convertiamo la risposta in JSON
    })
    .then((data) => {
      dataChart = data;
      updateChart();
    })
    .catch((error) => {
      console.error("Errore:", error);
    });
}

function enforceAtLeastOne(groupClass) {
  const checkboxes = document.querySelectorAll("." + groupClass);

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checked = document.querySelectorAll("." + groupClass + ":checked");

      if (checked.length === 0) {
        checkbox.checked = true; // riattiva l'ultimo deselezionato
      }
    });
  });
}

function initAmbitoMensile() {
  const ambitoItems = document.querySelectorAll(".ambito-item");
  const modeRadios = document.querySelectorAll('input[name="ambitoMode"]');

  if (!ambitoItems.length || !modeRadios.length) return;

  // ---- CLICK RADIO (Tutti / Strutture / Luoghi)
  modeRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;

      const value = radio.value;

      ambitoItems.forEach((item) => {
        if (value === "all") {
          item.checked = true;
        } else if (value === "strutture") {
          item.checked = item.classList.contains("strutture");
        } else if (value === "luoghi") {
          item.checked = item.classList.contains("luoghi");
        }
      });
    });
  });

  // ---- CLICK MANUALE CHECKBOX
  ambitoItems.forEach((item) => {
    item.addEventListener("change", updateAmbitoMode);
  });

  function updateAmbitoMode() {
    const all = Array.from(ambitoItems);
    const checked = all.filter((i) => i.checked);

    const strutture = all.filter((i) => i.classList.contains("strutture"));
    const luoghi = all.filter((i) => i.classList.contains("luoghi"));

    const allChecked = checked.length === all.length;

    const onlyStrutture =
      strutture.every((i) => i.checked) && luoghi.every((i) => !i.checked);

    const onlyLuoghi =
      luoghi.every((i) => i.checked) && strutture.every((i) => !i.checked);

    // Reset radio
    modeRadios.forEach((r) => (r.checked = false));

    if (allChecked) {
      document.querySelector('input[value="all"]').checked = true;
    } else if (onlyStrutture) {
      document.querySelector('input[value="strutture"]').checked = true;
    } else if (onlyLuoghi) {
      document.querySelector('input[value="luoghi"]').checked = true;
    }
    // Se misto → restano tutti vuoti
  }
}

function initGenerationValidation() {
  const predictionLength = document.getElementById("predictionLength");
  const predictionPrecision = document.getElementById("predictionPrecision");

  // ---- VALIDAZIONE NUMERI ----
  function clampNumber(input) {
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    let value = parseInt(input.value);

    if (isNaN(value)) value = min;

    if (value < min) value = min;
    if (value > max) value = max;

    input.value = value;
  }

  predictionLength.addEventListener("change", () =>
    clampNumber(predictionLength),
  );

  predictionPrecision.addEventListener("change", () =>
    clampNumber(predictionPrecision),
  );

  clampNumber(predictionLength);
  clampNumber(predictionPrecision);
}

function setPeriodType(type) {
  currentPeriodType = type;
  const btnYear = document.getElementById("btnPeriodYear");
  const btnMonth = document.getElementById("btnPeriodMonth");
  const rowYear = document.getElementById("periodYearRow");
  const rowMonth = document.getElementById("periodMonthRow");

  if (type === "year") {
    btnYear.classList.add("active");
    btnMonth.classList.remove("active");
    rowYear.style.display = "flex";
    rowMonth.style.display = "none";
  } else {
    btnYear.classList.remove("active");
    btnMonth.classList.add("active");
    rowYear.style.display = "none";
    rowMonth.style.display = "flex";
  }
}

function initPeriodoSelector() {
  const startYear = document.getElementById("startYear");
  const endYear = document.getElementById("endYear");

  const startMonthM = document.getElementById("startMonthM");
  const startYearM = document.getElementById("startYearM");
  const endMonthM = document.getElementById("endMonthM");
  const endYearM = document.getElementById("endYearM");

  // -------- POPOLA ANNI --------
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
    startYear.innerHTML += `<option value="${y}">${y}</option>`;
    endYear.innerHTML += `<option value="${y}">${y}</option>`;
    startYearM.innerHTML += `<option value="${y}">${y}</option>`;
    endYearM.innerHTML += `<option value="${y}">${y}</option>`;
  }

  // -------- POPOLA MESI --------
  for (let m = 1; m <= 12; m++) {
    const label = m.toString().padStart(2, "0");
    startMonthM.innerHTML += `<option value="${m}">${label}</option>`;
    endMonthM.innerHTML += `<option value="${m}">${label}</option>`;
  }

  // Default valori
  startYear.value = MIN_YEAR;
  endYear.value = MAX_YEAR;

  startYearM.value = MIN_YEAR;
  endYearM.value = MAX_YEAR;
  startMonthM.value = 1;
  endMonthM.value = 12;

  // Eventi validazione
  startYear.addEventListener("change", validateYearRange);
  endYear.addEventListener("change", validateYearRange);

  startYearM.addEventListener("change", validateMonthRange);
  endYearM.addEventListener("change", validateMonthRange);
  startMonthM.addEventListener("change", validateMonthRange);
  endMonthM.addEventListener("change", validateMonthRange);

  validateYearRange();
  validateMonthRange();
}

function validateYearRange() {
  const startYear = document.getElementById("startYear");
  const endYear = document.getElementById("endYear");

  let start = parseInt(startYear.value);
  let end = parseInt(endYear.value);

  if (start < MIN_YEAR) start = MIN_YEAR;
  if (end > MAX_YEAR) end = MAX_YEAR;

  if (start > end) start = end;

  startYear.value = start;
  endYear.value = end;
}

function validateMonthRange() {
  const sY = parseInt(document.getElementById("startYearM").value);
  const eY = parseInt(document.getElementById("endYearM").value);
  const sM = parseInt(document.getElementById("startMonthM").value);
  const eM = parseInt(document.getElementById("endMonthM").value);

  let startDate = new Date(sY, sM - 1);
  let endDate = new Date(eY, eM - 1);

  const minDate = new Date(MIN_YEAR, 0);
  const maxDate = new Date(MAX_YEAR, 11);

  if (startDate < minDate) startDate = minDate;
  if (endDate > maxDate) endDate = maxDate;

  if (startDate > endDate) startDate = endDate;

  // Riassegna valori corretti
  document.getElementById("startYearM").value = startDate.getFullYear();
  document.getElementById("startMonthM").value = startDate.getMonth() + 1;

  document.getElementById("endYearM").value = endDate.getFullYear();
  document.getElementById("endMonthM").value = endDate.getMonth() + 1;
}

function getPeriodoSelezionato() {
  const isYearMode = document
    .getElementById("btnPeriodYear")
    .classList.contains("active");

  if (isYearMode) {
    const start = document.getElementById("startYear").value + "-01";
    const end = document.getElementById("endYear").value + "-12";
    return [start, end];
  } else {
    const sY = document.getElementById("startYearM").value;
    const sM = document.getElementById("startMonthM").value.padStart(2, "0");

    const eY = document.getElementById("endYearM").value;
    const eM = document.getElementById("endMonthM").value.padStart(2, "0");

    return [`${sY}-${sM}`, `${eY}-${eM}`];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  toggleTheme(true);
  getData().then(() => {
    renderSidebar();
    setMode("history");
  });
  // Funziona
  enforceAtLeastOne("target-item");
  enforceAtLeastOne("metrica-item");
  initAmbitoMensile();
  initGenerationValidation();
  initPeriodoSelector();
});
