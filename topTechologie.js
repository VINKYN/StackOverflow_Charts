
// Fonction pour obtenir la liste unique des types de développeurs à partir des données
function getDevType(data) {
  let SetDev = new Set();
  data.forEach((d) => {
    if (d["DevType"] != "NA") {
      SetDev.add(d["DevType"]);
    }
  });
  SetDev = [...SetDev].sort();
  return SetDev;
}

// Fonction pour remplir la liste déroulante des métiers dans l'interface
function RemplirMetier(listeDev) {
  var select = document.getElementById("metier");
  select.innerHTML = "";
  listeDev.forEach((dev) => {
    var opt = document.createElement("option");
    opt.value = dev;
    opt.innerHTML = dev;
    select.appendChild(opt);
  });
}

// Fonction pour extraire les données en fonction du métier, de la colonne et du top N
function extractData(data, colonne, metier, n) {
  const devTypeCounts = [];
  let datafilter = data.filter((Element) => Element.DevType == metier);
  let col;
  datafilter.forEach((dt) => {
    col = dt[colonne].split(";");
    col.forEach((c) => {
      if (c !== "NA" && c !== undefined && c !== "") {
        devTypeCounts.push(c);
      }
    });
  });
  let dataSort = topN(devTypeCounts, n);
  return dataSort;
}

// Fonction pour obtenir les éléments les plus fréquents dans une liste
function topN(list, n) {
  let countList = countOccurences(list);
  let sortable = Object.entries(countList).sort((a, b) => b[1] - a[1]);
  return sortable.slice(0, n);
}

// Fonction pour compter les occurrences des éléments dans une liste
function countOccurences(tab) {
  var result = {};
  tab.forEach(function (elem) {
    if (elem in result) {
      result[elem] = ++result[elem];
    } else {
      result[elem] = 1;
    }
  });
  return result;
}

// Fonction pour obtenir les données finales en fonction du métier et de la colonne spécifiés
function DonneFinale(data, colonne) {
  let metier = document.getElementById("metier").value;
  let top = document.getElementById("top").value;
  let listeData = extractData(data, colonne, metier, top);
  let valeur = [];
  let label = [];

  listeData.forEach((sc) => {
    valeur.push(sc[0]);
    label.push(sc[1]);
  });
  return [valeur, label];
}

// Fonction pour afficher les graphiques
function displayChart(data, id, id2) {
  Chart.register(ChartDataLabels);
  var [a, b] = DonneFinale(data, "OpSysProfessionaluse");

  var ctx = document.getElementById(id).getContext("2d");
  let sum = 0;
  for (let i = 0; i < b.length; i++) {
    sum += b[i];
  }


  var colorPalette = [
    '#8c2617',
    '#c44b27',
    '#e0a656',
    '#FF7F26',
    '#FFA526',
    '#FF5926',
    '#ffc87b',
    '#ffeba0'
];

  myChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: a,
      datasets: [
        {
          data: b,
          backgroundColor: colorPalette,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          anchor: "center",
          color: "black",
          backgroundColor: "white",
          formatter: function (value) {
            return value;
          },
        },
        legend: {
          labels: {
            boxWidth: 30,
            boxHeight: 30,
          },
        },
      },
    },
  });

  var [c, d] = DonneFinale(data, "OfficeStackSyncHaveWorkedWith");

  var ctx2 = document.getElementById(id2).getContext("2d");
  let sum2 = 0;
  for (let i = 0; i < b.length; i++) {
    sum2 += b[i];
  }

  myChart2 = new Chart(ctx2, {
    type: "pie",
    data: {
      labels: c,
      datasets: [
        {
          data: d,
          backgroundColor: colorPalette,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          anchor: "center",
          color: "black",
          backgroundColor: "white",
          formatter: function (value) {
            return value;
          },
        },
        legend: {
          labels: {
            boxWidth: 30,
            boxHeight: 30,
          },
        },
      },
    },
  });
}

// Fonction pour mettre à jour les graphiques
function updateChart(data) {
  var [a, b] = DonneFinale(data, "OpSysProfessionaluse");

  myChart.data.labels = a;
  myChart.data.datasets[0].data = b;
  myChart.update();

  var [c, d] = DonneFinale(data, "OfficeStackSyncHaveWorkedWith");

  myChart2.data.labels = c;
  myChart2.data.datasets[0].data = d;
  myChart2.update();
}

// Fonction pour charger les données
function LoadData() {
  let continent = document.getElementById("continent").value;
  var dataset;

  if (continent == "Amerique") {
    dataset = "survey_results_NA.json";
  } else if (continent == "Europe") {
    dataset = "survey_results_WE.json";
  }

  let request = $.ajax({
    type: "GET",
    url:"http://localhost/"+path+"/" + dataset,
  });

  request.done(function (output) {
    updateChart(output);
  });

  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
}

// Initialisation lors du chargement du document
$(document).ready(function () {
  let request = $.ajax({
    type: "GET",
    url: "http://localhost/"+path+"/"+"survey_results_WE.json",
  });

  request.done(function (output) {
    listeDev = getDevType(output);
    RemplirMetier(listeDev);

    DonneFinale(output, "OpSysProfessionaluse");

    displayChart(output, "osChart", "communicationChart");
  });

  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
});
