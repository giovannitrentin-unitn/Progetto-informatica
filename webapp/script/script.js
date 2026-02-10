// --- DATASET COMPLETO ---
const rawData = {
  history: {
    2023: {
      Arrivi: {
        Dicembre: 105000,
        Gennaio: 85000,
        Febbraio: 95000,
        Marzo: 100000,
        Aprile: 105000,
        Maggio: 110000,
        Giugno: 125000,
        Luglio: 160000,
        Agosto: 200000,
        Settembre: 140000,
        Ottobre: 120000,
        Novembre: 110000,
        Totale_Generale_TOT: 1350000,
      },
      Presenze: {
        Dicembre: 190000,
        Gennaio: 160000,
        Febbraio: 170000,
        Marzo: 180000,
        Aprile: 185000,
        Maggio: 195000,
        Giugno: 210000,
        Luglio: 250000,
        Agosto: 300000,
        Settembre: 220000,
        Ottobre: 200000,
        Novembre: 190000,
        Totale_Generale_TOT: 2250000,
      },
    },
    2024: {
      Arrivi: {
        Dicembre: 115000,
        Gennaio: 90000,
        Febbraio: 100000,
        Marzo: 110000,
        Aprile: 115000,
        Maggio: 120000,
        Giugno: 135000,
        Luglio: 175000,
        Agosto: 215000,
        Settembre: 155000,
        Ottobre: 130000,
        Novembre: 120000,
        Totale_Generale_TOT: 1480000,
      },
      Presenze: {
        Dicembre: 210000,
        Gennaio: 175000,
        Febbraio: 185000,
        Marzo: 195000,
        Aprile: 200000,
        Maggio: 210000,
        Giugno: 225000,
        Luglio: 270000,
        Agosto: 320000,
        Settembre: 240000,
        Ottobre: 220000,
        Novembre: 210000,
        Totale_Generale_TOT: 2460000,
      },
    },
    2025: {
      Arrivi: {
        Dicembre: 130000,
        Gennaio: 105000,
        Febbraio: 115000,
        Marzo: 125000,
        Aprile: 125000,
        Maggio: 135000,
        Giugno: 150000,
        Luglio: 190000,
        Agosto: 235000,
        Settembre: 170000,
        Ottobre: 145000,
        Novembre: 135000,
        Totale_Generale_TOT: 1660000,
      },
      Presenze: {
        Dicembre: 230000,
        Gennaio: 195000,
        Febbraio: 205000,
        Marzo: 215000,
        Aprile: 215000,
        Maggio: 230000,
        Giugno: 245000,
        Luglio: 290000,
        Agosto: 340000,
        Settembre: 260000,
        Ottobre: 240000,
        Novembre: 230000,
        Totale_Generale_TOT: 2695000,
      },
    },
  },
  forecast: {
    2026: {
      Arrivi: {
        Dicembre: 150000,
        Gennaio: 120000,
        Febbraio: 130000,
        Marzo: 140000,
        Aprile: 135000,
        Maggio: 145000,
        Giugno: 160000,
        Luglio: 200000,
        Agosto: 250000,
        Settembre: 180000,
        Ottobre: 160000,
        Novembre: 150000,
        Totale_Generale_TOT: 1575000,
      },
      Presenze: {
        Dicembre: 250000,
        Gennaio: 220000,
        Febbraio: 230000,
        Marzo: 240000,
        Aprile: 235000,
        Maggio: 245000,
        Giugno: 260000,
        Luglio: 300000,
        Agosto: 350000,
        Settembre: 270000,
        Ottobre: 260000,
        Novembre: 250000,
        Totale_Generale_TOT: 2595000,
      },
    },
    2027: {
      Arrivi: {
        Dicembre: 165000,
        Gennaio: 135000,
        Febbraio: 145000,
        Marzo: 155000,
        Aprile: 140000,
        Maggio: 150000,
        Giugno: 175000,
        Luglio: 210000,
        Agosto: 270000,
        Settembre: 195000,
        Ottobre: 175000,
        Novembre: 165000,
        Totale_Generale_TOT: 1695000,
      },
      Presenze: {
        Dicembre: 275000,
        Gennaio: 245000,
        Febbraio: 255000,
        Marzo: 265000,
        Aprile: 250000,
        Maggio: 260000,
        Giugno: 285000,
        Luglio: 320000,
        Agosto: 370000,
        Settembre: 290000,
        Ottobre: 280000,
        Novembre: 270000,
        Totale_Generale_TOT: 2855000,
      },
    },
    2028: {
      Arrivi: {
        Dicembre: 180000,
        Gennaio: 150000,
        Febbraio: 160000,
        Marzo: 170000,
        Aprile: 155000,
        Maggio: 165000,
        Giugno: 190000,
        Luglio: 225000,
        Agosto: 290000,
        Settembre: 210000,
        Ottobre: 190000,
        Novembre: 180000,
        Totale_Generale_TOT: 1770000,
      },
      Presenze: {
        Dicembre: 300000,
        Gennaio: 260000,
        Febbraio: 270000,
        Marzo: 280000,
        Aprile: 265000,
        Maggio: 275000,
        Giugno: 300000,
        Luglio: 340000,
        Agosto: 390000,
        Settembre: 310000,
        Ottobre: 300000,
        Novembre: 290000,
        Totale_Generale_TOT: 3050000,
      },
    },
    2029: {
      Arrivi: {
        Dicembre: 195000,
        Gennaio: 165000,
        Febbraio: 175000,
        Marzo: 185000,
        Aprile: 170000,
        Maggio: 180000,
        Giugno: 205000,
        Luglio: 240000,
        Agosto: 305000,
        Settembre: 225000,
        Ottobre: 205000,
        Novembre: 195000,
        Totale_Generale_TOT: 1850000,
      },
      Presenze: {
        Dicembre: 325000,
        Gennaio: 280000,
        Febbraio: 290000,
        Marzo: 300000,
        Aprile: 285000,
        Maggio: 295000,
        Giugno: 320000,
        Luglio: 360000,
        Agosto: 400000,
        Settembre: 330000,
        Ottobre: 320000,
        Novembre: 310000,
        Totale_Generale_TOT: 3310000,
      },
    },
    2030: {
      Arrivi: {
        Dicembre: 210000,
        Gennaio: 180000,
        Febbraio: 190000,
        Marzo: 200000,
        Aprile: 185000,
        Maggio: 195000,
        Giugno: 220000,
        Luglio: 255000,
        Agosto: 320000,
        Settembre: 240000,
        Ottobre: 220000,
        Novembre: 210000,
        Totale_Generale_TOT: 1930000,
      },
      Presenze: {
        Dicembre: 350000,
        Gennaio: 300000,
        Febbraio: 310000,
        Marzo: 320000,
        Aprile: 305000,
        Maggio: 315000,
        Giugno: 340000,
        Luglio: 380000,
        Agosto: 420000,
        Settembre: 350000,
        Ottobre: 340000,
        Novembre: 330000,
        Totale_Generale_TOT: 3570000,
      },
    },
  },
};

// --- UTILS ---
const formatNum = (num) => new Intl.NumberFormat("it-IT").format(num);
const formatK = (num) => (num / 1000).toFixed(0) + "k";
const monthOrder = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

// UNIONE DATI
const unifiedData = { ...rawData.history, ...rawData.forecast };
const allYears = Object.keys(unifiedData).sort();

let selectedYears = [...allYears];
let myChart = null;

// --- 1. INIZIALIZZAZIONE ---
document.addEventListener("DOMContentLoaded", () => {
  initFilterMenu();
  renderSidebar();
  renderChart();
  updateSubtitle();
  updateLegendUI(); // Inizializza stato UI legenda

  // Gestione Click Pulsante Filtro
  const filterBtn = document.getElementById("filterBtn");
  const dropdown = document.getElementById("filterDropdown");

  filterBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });

  dropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });
});

// --- 2. LOGICA FILTRO ---
function initFilterMenu() {
  const container = document.getElementById("filterDropdown");
  container.innerHTML = "";

  allYears.forEach((year) => {
    const div = document.createElement("div");
    div.className = "filter-option";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `chk-${year}`;
    checkbox.value = year;
    checkbox.checked = true;

    const label = document.createElement("label");
    label.htmlFor = `chk-${year}`;
    label.textContent = year;

    checkbox.addEventListener("change", () => {
      updateSelectedYears();
    });

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });
}

function updateSelectedYears() {
  const checkboxes = document.querySelectorAll(
    '.filter-dropdown input[type="checkbox"]',
  );
  selectedYears = [];
  checkboxes.forEach((chk) => {
    if (chk.checked) selectedYears.push(chk.value);
  });
  renderSidebar();
  renderChart();
  updateSubtitle();
}

// --- LOGICA TOGGLE DATASET (NUOVA) ---
function toggleDataset(index) {
  if (!myChart) return;

  const isVisible = myChart.isDatasetVisible(index);
  if (isVisible) {
    myChart.hide(index);
  } else {
    myChart.show(index);
  }

  updateLegendUI();
}

function updateLegendUI() {
  if (!myChart) return;

  const legendPresenze = document.getElementById("legend-presenze");
  const legendArrivi = document.getElementById("legend-arrivi");

  // Indici: 0 = Presenze, 1 = Arrivi (vedi ordine datasets in renderChart)
  const presenzeVisible = myChart.isDatasetVisible(0);
  const arriviVisible = myChart.isDatasetVisible(1);

  if (presenzeVisible) legendPresenze.classList.remove("disabled");
  else legendPresenze.classList.add("disabled");

  if (arriviVisible) legendArrivi.classList.remove("disabled");
  else legendArrivi.classList.add("disabled");
}

// --- 3. RENDER SIDEBAR ---
function updateSubtitle() {
  const subtitleEl = document.getElementById("chartSubtitle");

  if (selectedYears.length === 0) {
    subtitleEl.textContent = "Nessun dato visualizzato";
    return;
  }

  const sortedYears = selectedYears
    .map((y) => parseInt(y))
    .sort((a, b) => a - b);

  const history = sortedYears.filter((y) => y < 2026);
  const forecast = sortedYears.filter((y) => y >= 2026);

  let parts = [];

  if (history.length > 0) {
    const range =
      history.length > 1
        ? `${history[0]}-${history[history.length - 1]}`
        : history[0];
    parts.push(`Storico (${range})`);
  }

  if (forecast.length > 0) {
    const range =
      forecast.length > 1
        ? `${forecast[0]}-${forecast[forecast.length - 1]}`
        : forecast[0];
    parts.push(`Previsioni (${range})`);
  }

  subtitleEl.textContent = parts.join(" e ");
}

function renderSidebar() {
  const dataContainer = document.getElementById("dataContainer");
  dataContainer.innerHTML = "";

  if (selectedYears.length === 0) {
    dataContainer.innerHTML =
      '<p class="no-data-msg">Nessun anno selezionato</p>';
    return;
  }

  selectedYears.sort().forEach((year) => {
    const yData = unifiedData[year];
    const isHistory = parseInt(year) < 2026;
    const badgeClass = isHistory ? "badge-history" : "badge-forecast";
    const badgeText = isHistory ? "Storico" : "Previsione";

    const card = document.createElement("div");
    card.className = "year-card";

    let tableRows = "";
    monthOrder.forEach((month) => {
      tableRows += `
                        <tr>
                            <td>${month}</td>
                            <td style="color: #2563eb;">${formatNum(yData.Arrivi[month])}</td>
                            <td style="color: #db2777;">${formatNum(yData.Presenze[month])}</td>
                        </tr>
                    `;
    });

    tableRows += `
                    <tr class="row-total">
                        <td>Totale</td>
                        <td>${formatK(yData.Arrivi.Totale_Generale_TOT)}</td>
                        <td>${formatK(yData.Presenze.Totale_Generale_TOT)}</td>
                    </tr>
                `;

    card.innerHTML = `
                    <div class="year-header">
                        <span class="year-title">
                            ${year}
                            <span class="year-badge ${badgeClass}">${badgeText}</span>
                        </span>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Mese</th>
                                <th>Arr.</th>
                                <th>Pres.</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                `;
    dataContainer.appendChild(card);
  });
}

// --- 4. RENDER GRAFICO ---
function renderChart() {
  const ctx = document.getElementById("tourismChart").getContext("2d");

  const labels = [];
  const dataArrivi = [];
  const dataPresenze = [];

  if (selectedYears.length === 0) {
    if (myChart) {
      myChart.data.labels = [];
      myChart.data.datasets.forEach((dataset) => {
        dataset.data = [];
      });
      myChart.update();
    }
    return;
  }

  selectedYears.sort().forEach((year) => {
    const yData = unifiedData[year];
    monthOrder.forEach((month) => {
      labels.push(`${month.substring(0, 3)} ${year}`);
      dataArrivi.push(yData.Arrivi[month]);
      dataPresenze.push(yData.Presenze[month]);
    });
  });

  // Gradienti
  const gradientPresenze = ctx.createLinearGradient(0, 0, 0, 600);
  gradientPresenze.addColorStop(0, "rgba(219, 39, 119, 0.25)");
  gradientPresenze.addColorStop(1, "rgba(219, 39, 119, 0.0)");

  const gradientArrivi = ctx.createLinearGradient(0, 0, 0, 600);
  gradientArrivi.addColorStop(0, "rgba(37, 99, 235, 0.25)");
  gradientArrivi.addColorStop(1, "rgba(37, 99, 235, 0.0)");

  // Config Dataset
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Presenze",
        data: dataPresenze,
        borderColor: "#db2777",
        backgroundColor: gradientPresenze,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.45,
      },
      {
        label: "Arrivi",
        data: dataArrivi,
        borderColor: "#2563eb",
        backgroundColor: gradientArrivi,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.45,
      },
    ],
  };

  if (myChart) {
    // Recupera stato visibilità precedente
    const presenzeHidden = !myChart.isDatasetVisible(0);
    const arriviHidden = !myChart.isDatasetVisible(1);

    // Aggiorna dati
    myChart.data = chartData;

    // Rialpplica stato visibilità sui nuovi dati
    myChart.getDatasetMeta(0).hidden = presenzeHidden ? true : null;
    myChart.getDatasetMeta(1).hidden = arriviHidden ? true : null;

    myChart.update();
  } else {
    myChart = new Chart(ctx, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, // Nascondiamo legenda default Chart.js
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            titleColor: "#111",
            bodyColor: "#333",
            borderColor: "#eee",
            borderWidth: 1,
            padding: 10,
            boxPadding: 4,
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 12,
              color: "#9ca3af",
            },
          },
          y: {
            border: { display: false },
            grid: {
              color: "#f3f4f6",
              drawBorder: false,
            },
            ticks: {
              callback: (val) => val / 1000 + "k",
              color: "#6b7280",
              padding: 10,
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
      },
    });
  }
  updateLegendUI(); // Aggiorna stato iniziale
}
