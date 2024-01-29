
// Fonction pour obtenir la liste unique des pays à partir des données
function getPaysUnique(data) {
  let listePays = new Set();
  data.forEach((d) => {
    listePays.add(d["Country"]);
  });
  listePays = [...listePays].sort();
  return listePays;
}

// Fonction pour mettre à jour la liste déroulante des pays dans l'interface
function updateCountryDropdown(countries) {
  var countryDropdown = $("#country");
  countryDropdown.empty(); 

  countries.forEach(function (country) {
    var option = $("<option>").text(country).val(country);
    countryDropdown.append(option);
  });
}

// Fonction pour obtenir la liste unique des années d'expérience
function getYearUnique(data) {
  let uniqueYear = new Set();
  data.forEach((d) => {
    uniqueYear.add(d["WorkExp"]);
  });
  uniqueYear = [...uniqueYear].sort();
  return uniqueYear;
}

// Fonction pour obtenir la liste unique des niveaux d'éducation
function getEducationsUnique(data) {
  let uniqueEducations = new Set();
  data.forEach((d) => {
    uniqueEducations.add(d["EdLevel"]);
  });
  uniqueEducations = [...uniqueEducations].sort();
  return uniqueEducations;
}

// Fonction pour filtrer les données par pays, colonne et obtenir des données spécifiques
function getData(data, colonne, pays) {

  dataPays = data.filter((Element) => Element.Country == pays);

  year = getYearUnique(data);
  let listData = [];
  dataPays.forEach((d) => {
    if (d["CompTotal"] != "NA" && d[colonne] != "NA") {
      listData.push([
        ConvertionEuro(d["CompTotal"], d["Currency"]),
        d[colonne],
      ]);
    }
  });
  return listData;
}

// Fonction pour obtenir la liste unique des données de la colonne spécifiée
function SetCLoud(data) {
  let listCloud = new Set();
  data.forEach((lc) => {
    listCloud.add(lc[1]);
  });
  listCloud = [...listCloud].sort((a, b) => a - b);
  return listCloud;
}

// Fonction pour calculer la moyenne des salaires
function calculateAverageIncomeByEducation(data, colonne) {
  let pays = document.getElementById("country").value;

  let listeData = getData(data, colonne, pays);
  let listYear = SetCLoud(listeData);

  var listlab = [];
  var countList = [];

  listYear.forEach((sc) => {
    var preMoyenne = [];
    listeData.forEach((d) => {
      if (sc === d[1]) {
        preMoyenne.push(d[0]);
      }
    });
    if (MoySalaire(preMoyenne) < 700000 && MoySalaire(preMoyenne) > 8000) {
      listlab.push(sc);
      countList.push(MoySalaire(preMoyenne));
    }
  });

  return [listlab, countList];
}

function MoySalaire(data) {
  let sum = 0;
  data.forEach((d) => {
    sum = sum + d;
  });
  return Math.trunc(sum / data.length);
}

// Fonction pour charger les graphiques
function loadChartbar(data, id, id2) {
  Chart.register(ChartDataLabels);
  //la doc https://chartjs-plugin-datalabels.netlify.app/guide/#table-of-contents

  var [a, b] = calculateAverageIncomeByEducation(data, "WorkExp");
  var ctx = document.getElementById(id).getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: a,
      datasets: [
        {
          data: b,
          backgroundColor: "#F48024",
          borderColor: "#F48024",
          pointStyle: "circle",
          borderWidth: 1,
        },
      ],
    },
    options: {
      plugins: {
        datalabels: {
          align: "end",
          anchor: "end",
          color: "black",
          font: {size:11},
          formatter: function (value) {
            return Math.round((value / 1000) * 100) / 100;
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });

  var [c, d] = calculateAverageIncomeByEducation(data, "EdLevel");
  var ctx2 = document.getElementById(id2).getContext("2d");

  myChart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: c,
      datasets: [
        {
          data: d,
          backgroundColor: "rgb(255, 163, 37,0.8)",
        },
      ],
    },
    options: {
      indexAxis: "y",
      plugins: {
        datalabels: {
          color: "#00000",
          formatter: function (value) {
            return value + " € ";
          },
          align: "end",
          anchor: "end",
        },
        legend: {
          display: false,
        },
      },
    },
  });
}

// Fonction pour mettre à jour les graphiques
function updateChart(data) {
  var [a, b] = calculateAverageIncomeByEducation(data, "WorkExp");
  myChart.data.labels = a;
  myChart.data.datasets[0].data = b;
  myChart.update();

  var [c, d] = calculateAverageIncomeByEducation(data, "EdLevel");

  myChart2.data.labels = c;
  myChart2.data.datasets[0].data = d;
  myChart2.update();
}

// Fonction pour charger les données des pays
function loadCountryData() {
  let continent = document.getElementById("continent").value;
  var dataset;

  if (continent == "Amerique") {
    dataset = "survey_results_NA.json";
  } else if (continent == "Europe") {
    dataset = "survey_results_WE.json";
  }

  let request = $.ajax({
    type: "GET",
    url: "http://localhost/"+path+"/" + dataset,
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

// Fonction pour charger le jeu de données initial
function LoadDataset() {
  let continent = document.getElementById("continent").value;
  var dataset;

  if (continent == "Amerique") {
    dataset = "survey_results_NA.json";
  } else if (continent == "Europe") {
    dataset = "survey_results_WE.json";
  }

  let request = $.ajax({
    type: "GET",
    url: "http://localhost/"+path+"/" + dataset,
  });

  request.done(function (output) {
    updateCountryDropdown(getPaysUnique(output));

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
    updateCountryDropdown(getPaysUnique(output));

    loadChartbar(output, "incomeChart", "educationChart");
  });

  request.fail(function (http_error) {
    let server_msg = http_error.responseText;
    let code = http_error.status;
    let code_label = http_error.statusText;
    alert("Erreur " + code + " (" + code_label + ") : " + server_msg);
  });
});

// Fonction pour convertir le salaire en euros en fonction de la monnaie
function ConvertionEuro(salaire, monnaie) {
  // Taux de change du 29 novembre
  switch (monnaie) {
    case "ZAR\tSouth African rand":
      salaire = salaire * 0.049;
      break;
    case "CNY\tChinese Yuan Renminbi":
      salaire = salaire * 0.12769;
      break;
    case "CHF\tSwiss franc":
      salaire = salaire * 1.03645;
      break;
    case "PLN\tPolish zloty":
      salaire = salaire * 0.23015;
      break;
    case "ILS\tIsraeli new shekel":
      salaire = salaire * 0.2465;
      break;
    case "JPY\tJapanese yen":
      salaire = salaire * 0.00614;
      break;
    case "FJD\tFijian dollar":
      salaire = salaire * 0.40782;
      break;
    case "CDF\tCongolese franc":
      salaire = salaire * 0.00034;
      break;
    case "SLL\tSierra Leonean leone":
      salaire = salaire * 0.00007;
      break;
    case "GBP\tPound sterling":
      salaire = salaire * 1.1522;
      break;
    case "AFN\tAfghan afghani":
      salaire = salaire * 0.01307;
      break;
    case "NOK\tNorwegian krone":
      salaire = salaire * 0.0853;
      break;
    case "YER\tYemeni rial":
      salaire = salaire * 0.00364;
      break;
    case "SAR\tSaudi Arabian riyal":
      salaire = salaire * 0.24285;
      break;
    case "CRC\tCosta Rican colon":
      salaire = salaire * 0.00172;
      break;
    case "UGX\tUgandan shilling":
      salaire = salaire * 0.00024;
      break;
    case "GHS\tGhanaian cedi":
      salaire = salaire * 0.07593;
      break;
    case "BGN\tBulgarian lev":
      salaire = salaire * 0.5109;
      break;
    case "BAM\tBosnia and Herzegovina convertible mark":
      salaire = salaire * 0.51098;
      break;
    case "INR\tIndian rupee":
      salaire = salaire * 0.01093;
      break;
    case "ALL\tAlbanian lek":
      salaire = salaire * 0.00976;
      break;
    case "NA":
      salaire = salaire * 1;
      break;
    case "CLP\tChilean peso":
      salaire = salaire * 0.00105;
      break;
    case "AUD\tAustralian dollar":
      salaire = salaire * 0.60366;
      break;
    case "BRL\tBrazilian real":
      salaire = salaire * 0.18613;
      break;
    case "DJF\tDjiboutian franc":
      salaire = salaire * 0.00512;
      break;
    case "BOB\tBolivian boliviano":
      salaire = salaire * 0.13205;
      break;
    case "HUF\tHungarian forint":
      salaire = salaire * 0.00264;
      break;
    case "AZN\tAzerbaijan manat":
      salaire = salaire * 0.53597;
      break;
    case "AMD\tArmenian dram":
      salaire = salaire * 0.00228;
      break;
    case "UZS\tUzbekistani som":
      salaire = salaire * 0.00007;
      break;
    case "MYR\tMalaysian ringgit":
      salaire = salaire * 0.19504;
      break;
    case "TWD\tNew Taiwan dollar":
      salaire = salaire * 0.02899;
      break;
    case "HKD\tHong Kong dollar":
      salaire = salaire * 0.11686;
      break;
    case "GIP\tGibraltar pound":
      salaire = salaire * 1.15154;
      break;
    case "USD\tUnited States dollar":
      salaire = salaire * 0.91112;
      break;
    case "FKP\tFalkland Islands pound":
      salaire = salaire * 1.15206;
      break;
    case "THB\tThai baht":
      salaire = salaire * 0.02615;
      break;
    case "CAD\tCanadian dollar":
      salaire = salaire * 0.67035;
      break;
    case "AWG\tAruban florin":
      salaire = salaire * 0.50896;
      break;
    case "LAK\tLao kip":
      salaire = salaire * 0.00004;
      break;
    case "PEN\tPeruvian sol":
      salaire = salaire * 0.2447;
      break;
    case "BIF\tBurundi franc":
      salaire = salaire * 0.00032;
      break;
    case "IDR\tIndonesian rupiah":
      salaire = salaire * 0.00006;
      break;
    case "XPF\tCFP franc":
      salaire = salaire * 0.00837;
      break;
    case "IRR\tIranian rial":
      salaire = salaire * 0.00216;
      break;
    case "UAH\tUkrainian hryvnia":
      salaire = salaire * 0.02506;
      break;
    case "QAR\tQatari riyal":
      salaire = salaire * 0.25019;
      break;
    case "ARS\tArgentine peso":
      salaire = salaire * 0.00253;
      break;
    case "COP\tColombian peso":
      salaire = salaire * 0.00023;
      break;
    case "AED\tUnited Arab Emirates dirham":
      salaire = salaire * 0.2481;
      break;
    case "CUP\tCuban peso":
      salaire = salaire * 0.03807;
      break;
    case "ANG\tNetherlands Antillean guilder":
      salaire = salaire * 0.50896;
      break;
    case "ZMW\tZambian kwacha":
      salaire = salaire * 0.00015;
      break;
    default:
      salaire = salaire * 1;
  }
  return salaire;
}
