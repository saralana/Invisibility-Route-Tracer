// Where you want to render the map.
var element = document.getElementById('map');

//DOM element da área de resultados
var rotasElement = document.getElementById('rotas');

// Height has to be set. You can do this in CSS too.
//element.style = 'height:100vh;';

// Target's GPS coordinates.
var target = L.latLng(config.latCenter, config.lngCenter);

// Create Leaflet map on map element.
var map = L.map(element).setView(target, config.zoom);

map.options.minZoom = 15;
map.options.maxZoom = 18;

// Variáveis globais para utilizar entre funções
var cameraPoints;
var directionsGeoJson;
var avoidingCircles;
var circlesGeo = [];

//GET variables from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

//lendo todos os parametros que estão vindo por GET e aparecendo na URL depois do ?
//usar document.getElementById quando o form estiver dentro do mapa


const profile = urlParams.get('profile');
const longA = urlParams.get('longA');
const latA = urlParams.get('latA');
const longB = urlParams.get('longB');
const latB = urlParams.get('latB');
const circleRadius = "20"; //in meters (m), needs to convert to km (10^-3)
const circleResolution = "16";
const iconsToggle = "1";
const circleToggle = "0";

//Quando a página carrega faz o download da planilha do Google e chama a função "makeGeoJSON(csvData)"
$(document).ready(() => {
  console.log('ready');
  $.ajax({
    type: 'GET',
    url: config.CSV,
    dataType: 'text',
    success: function (csvData) {
      makeGeoJSON(csvData);
    },
    error: function (request, status, error) {
      console.log(request);
      console.log(status);
      console.log(error);
    },
  });  
  
});

//função que recebe o CSV do Google, transforma em GeoJson e chama as principais funções do mapa
function makeGeoJSON(csvData) {
  csv2geojson.csv2geojson(
    csvData,
    {
      latfield: 'Latitude',
      lonfield: 'Longitude',
      delimiter: ',',
    },
    (err, data) => {
      data.features.forEach((data, i) => {
        //data.properties.id = i; //adiciona um ID único para cada câmera, não sendo utilizado agora
        data.properties = {}; //usado para apagar o campo de properties removendo a coluna "COLETA" da planilha
      });
      
      //variável global recebe o geoJson com uma Feature Collection de points com todas as câmeras
      cameraPoints = data;
      //console.log(cameraPoints);

      //Só mostra os markers das câmeras se for checked no formulário
      if(iconsToggle == true){
        showMarkers(cameraPoints);
      }        
      
      //chama a função que transforma os pontos em polygons (circles), para usar no avoiding polygons
      //avoidingCircles = pointsToCircles(cameraPoints);
      
      //chama a função que chama o ORS para calcular e exibir as rotas 
      //getDirectionsORS2(avoidingCircles);
      
    },
  );
 
}


// Add Sara MAPBOX tile layer to the Leaflet map.
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: config.maxZoom,
    id: config.styleId,
    tileSize: 512,
    zoomOffset: -1,
    accessToken: config.accessToken,
}).addTo(map);


//função que exibe os marcadores das câmeras
function showMarkers(pointsFeature){
    
  my_json = L.geoJson(pointsFeature, {
    pointToLayer: function (feature, latlng) {
      var camIcon = new L.Icon({
        iconSize: [50, 50],
        iconAnchor: [27, 42],
        'icon-allow-overlap': false,
        //popupAnchor: [1, -24],
        iconUrl: 'media/camera.png'
      });
      return L.marker(latlng, {icon: camIcon}).addTo(map);
    }
  });
  
  //L.geoJSON(my_json).addTo(map);
}