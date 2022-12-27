// Where you want to render the map.
var element = document.getElementById('map');

//DOM element da área de resultados
var rotasElement = document.getElementById('rotas');
const contentElement = document.getElementsByClassName('content');
var compareElement = document.getElementsByClassName('compare');
var contentElement1 = contentElement[0];
var contentElement2 = contentElement[1];
const collapsibleElement = document.getElementsByClassName('collapsible');
var collapsElement1 = collapsibleElement[0];
var collapsElement2 = collapsibleElement[1];

// Height has to be set. You can do this in CSS too.
//element.style = 'height:100vh;';

// Target's GPS coordinates.
var target = L.latLng(config.latCenter, config.lngCenter);

// Create Leaflet map on map element.
var map = L.map(element).setView(target, config.zoom);

new L.Control.Zoom({ position: 'topright' }).addTo(map);

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
const circleRadius = urlParams.get('circleRadius'); //in meters (m), needs to convert to km (10^-3)
const circleResolution = urlParams.get('circleResolution');
const iconsToggle = urlParams.get('iconsToggle');
const circleToggle = urlParams.get('circleToggle');

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
      avoidingCircles = pointsToCircles(cameraPoints);
      
      //chama a função que chama o ORS para calcular e exibir as rotas 
      getDirectionsORS2(avoidingCircles);
      
    },
  );
 
}


// Add Sara MAPBOX tile layer to the Leaflet map.
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: config.maxZoom,
    minZoom: config.minZoom,
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
        iconSize: [25, 30],
        iconAnchor: [15, 28],
        'icon-allow-overlap': false,
        //popupAnchor: [1, -24],
        iconUrl: 'media/camera.png'
      });
      return L.marker(latlng, {icon: camIcon}).addTo(map);
    }
  });
  
  //L.geoJSON(my_json).addTo(map);
}

//função que usa o TURF para transformar os pontos das câmeras em polygon (círculo)
//utilizando o raio e a resolução (número de lados do polígono) informados no formulário.
function pointsToCircles(FeatureCollection) {
  var circles = [];
  // var circlesGeo = [];
  turf.featureEach(FeatureCollection, function (currentFeature, featureIndex) {
    //=currentFeature
    //=featureIndex
     var radius = circleRadius/1000; // no form vem como metro, precisa converter em km
    //var options = {steps: 10, units: 'kilometers', properties: {foo: 'bar'}}; 
    var options = {steps: circleResolution}; // resolução do form
    var circle = turf.circle(currentFeature, radius, options);
    circles.push(circle.geometry.coordinates); //adiciona só as coordenadas para usar de retorno da função
    circlesGeo.push(circle); //adiciona a feature inteira em geoJson
  });
  
  //console.log(circles);
  //var multiPoly = turf.multiPolygon(circles);
  //console.log(multiPoly);
  //se no form está para exibir os raios de alcance da câmera, usamos o geoJson para adicionar os polígonos
  if(circleToggle == true)
    L.geoJSON(circlesGeo).addTo(map);
  return circles;

}

////função que usa a API do Open Route Service para calcular as rotas (invisível e normal)
function getDirectionsORS2(avoidingPolygons) {
  let orsDirections = new Openrouteservice.Directions({
    api_key: config.apiORS
  });
  
  var aIcon = new L.Icon({
        iconSize: [50, 60],
        iconAnchor: [60, 60],
        zIndexOffset: 5000,
        //popupAnchor: [1, -24],
        iconUrl: 'media/A.png'
  });    
    
  var bIcon = new L.Icon({
        iconSize: [50, 60],
        iconAnchor: [60, 60],
        zIndexOffset: 6000,
        //popupAnchor: [1, -24],
        iconUrl: 'media/B.png'
  });  
    
  //marcador de partida
  var markerA = L.marker([latA,longA], {icon: aIcon}).addTo(map);
  //altera o markador de partida para verde
  //markerA._icon.classList.add("huechangeA");
    
    
  //marcador de chegada
  //altera o markador de chegada para vermelho 
  var markerB = L.marker([latB,longB], {icon: bIcon}).addTo(map);
  //markerB._icon.classList.add("huechangeB");

  
  //calcula a rota usado os circulos gerados como avoid_polygons
  orsDirections.calculate({
    coordinates: [[longA,latA],[longB,latB]], //lat e long do form
    profile: profile, //profile do form
    //extra_info: ["waytype", "steepness"],
    format: "geojson",
    api_version: 'v2',
    //maneuvers: true,
    options:{
      avoid_polygons:{
        type: "MultiPolygon",
        coordinates: avoidingPolygons //gerados na função "pointsToCircles" e recebido por parâmetro na função
      }
    }
  })
    .then(function(json) {
        // se conseguir fazer a busca com sucesso, adiciona a rota no mapa e pede para calcular a rota padrão ("normal")
        
        //let response = JSON.stringify(json, null, "\t");
        //console.log(response);
        //console.dir(json);
        L.geoJSON(json, {
          style:{
            "color": "#fcee21", //amarelo
            //"color": "#FFFFFF", //branca 
            "opacity": 1
          }
        }).addTo(map); //adiciona rota invisível de amarelo
        //rotaResumo(json);

        // usa return para chamar o cálculo da rota padrão, atualmente como "shortest"
        return orsDirections.calculate({
          coordinates: [[longA,latA],[longB,latB]],
          profile: profile,
          format: "geojson",
          api_version: 'v2',
          // preference: "recommended",
          // preference: "fastest",
          preference: "shortest",
          options:{
          }
        })
          .then(function(json2) {
              // se conseguir fazer a busca com sucesso, adiciona a rota no mapa e chama a função que adiciona o resumo de rota
              //let response = JSON.stringify(json2, null, "\t");
              //console.log(response);
              //console.dir(json2);
              L.geoJSON(json2, {
                style:{
                  "color": "#ff7400", //laranja
                  //"color": "#fff", //branco
                  "opacity": 1
                }
              }).addTo(map); //adiciona rota padrão no mapa de vermelho
              rotaResumo(json,json2); //chama a função que adiciona o "detalhamento de rota" na barra inferior/lateral
          })
          .catch(function(err) {
              //let response = JSON.stringify(err, null, "\t");
              //console.error(response);
              //console.log(`Status Error NormalRoute: ${err.response.status}`);
              const routeNormalError = document.createElement('span');
              routeNormalError.innerText = "Sorry. We couldn't trace your route. This is a beta version but soon a complete version will be launched.";
              rotasElement.appendChild(routeNormalError);
          });



    })
    .catch(function(err) {
        //let response = JSON.stringify(err, null, "\t");
        //console.error(response);

        const routeError = document.createElement('span');
        routeError.innerText = "No route found with these parameters. Please change A or B points and try to retrace your route.";
        rotasElement.appendChild(routeError);
        //console.log(`Status Error InvisibleRoute: ${err.response.status}`);
    });
}
// getDirectionsORS2(avoidingCircles);

// função que exibe os resumos das rotas, calcula as diferenças e o número de câmeras que a rota padrão possui
function rotaResumo(directionsGeoJson,directionsGeoJson2){
  //console.dir(directionsGeoJson);
  //console.dir(directionsGeoJson.features[0].properties.segments[0]);
  
  let rota = directionsGeoJson.features[0].properties.segments[0];
  let rota2 = directionsGeoJson2.features[0].properties.segments[0];
  //console.dir(rota);
    
  let rotakms = rota.distance / 1000;
  let rotaKm = rotakms.toFixed(2);
  
  let rotaMins = rota.duration/60;
  let rotaMin = rotaMins.toFixed(1);
    
  let rotakms2 = rota2.distance / 1000;
  let rotaKm2 = rotakms2.toFixed(2);
  
  let rotaMins2 = rota2.duration/60;
  let rotaMin2 = rotaMins2.toFixed(1);
  
  let rotaDistance = rotaKm + " km";
  let rotaDuration = rotaMin + " min";
  let rotaSteps = rota.steps;

  let rota2Distance = rotaKm2 + " km ";
  let rota2Duration = rotaMin2 + " min ";
  let rota2Steps = rota2.steps;

  //calcula a diferença das duas rotas
  let distanceDiff = rota.distance - rota2.distance;
  let distanceDiffKm = distanceDiff/1000;
  let durationDiff = rota.duration - rota2.duration;
  let durationDiffMin = durationDiff/60;
    
  //console.log(rotaDistance);
  //console.log(rotaDuration);
  //console.dir(rotaSteps);
  
  const summaryTitle = document.createElement('h2');
  summaryTitle.innerText = "ROUTES COMPARISON";
  rotasElement.appendChild(summaryTitle);

  const invisibleTitle = document.createElement('h3');
  invisibleTitle.innerText = "INVISIBLE ROUTE";
  rotasElement.appendChild(invisibleTitle);
  
  const summaryDistance = document.createElement('span');
  summaryDistance.innerText =  "Distance: " + rotaDistance;   
  rotasElement.appendChild(summaryDistance);
  
  rotasElement.appendChild(document.createElement('br'));
  
  const summaryDuration = document.createElement('span');
  summaryDuration.innerText = "Duration: " + rotaDuration;
  rotasElement.appendChild(summaryDuration);  
  
  rotasElement.appendChild(document.createElement('br'));
  rotasElement.appendChild(document.createElement('br'));
    
  const summaryDiff = document.createElement('span');
  summaryDiff.innerText = durationDiffMin.toFixed(1) + " min and " + distanceDiffKm.toFixed(2) + "km more than the surveilled route";
  rotasElement.appendChild(summaryDiff);
  
    const normalTitle = document.createElement('h3');
  normalTitle.innerText = "SURVEILLED ROUTE";
  rotasElement.appendChild(normalTitle);
  
  const summary2Distance = document.createElement('span');
  summary2Distance.innerText = "Distance: " + rota2Distance;
  rotasElement.appendChild(summary2Distance);
  
  rotasElement.appendChild(document.createElement('br'));
  
  const summary2Duration = document.createElement('span');
  summary2Duration.innerText = "Duration: " + rota2Duration;
  rotasElement.appendChild(summary2Duration);

  //gera a feature collection dos círculos e calcula o número de intersecções com a rota padrão
  var featureCirclesGeo = turf.featureCollection(circlesGeo);
  var intersects = turf.lineIntersect(featureCirclesGeo, directionsGeoJson2);

  //como a rota normalmente corta cada círclo em 2 pontos, precisa dividir por 2 e arredondar para cima
  var routeCameras = (intersects.features.length/2).toFixed();


  // //exibe marker azul nos intersects da rota normal com as bordas dos círculos das câmeras
  // L.geoJson(intersects, {
  //   pointToLayer: function (feature, latlng) {
  //     return L.marker(latlng).addTo(map);
  //   }
  // });

  rotasElement.appendChild(document.createElement('br'));

  const summaryRouteCameras = document.createElement('span');
  summaryRouteCameras.innerText = "Cameras on the way: " + routeCameras;
  rotasElement.appendChild(summaryRouteCameras);

  rotasElement.appendChild(document.createElement('br'));
  rotasElement.appendChild(document.createElement('br'));  
  
  /*
  const stepsTitle = document.createElement('h2');
  stepsTitle.innerText = "STEPS";
  rotasElement.appendChild(stepsTitle);
  */
    
  const invisibleStepsTitle = document.createElement('h3');
  invisibleStepsTitle.innerText = "INVISIBLE ROUTE ▼";
  collapsElement1.appendChild(invisibleStepsTitle);


  // exibe os passos de cada rota
  let i = 1;
  for(var step in rotaSteps) {
    //console.log(i);
    let instruction = rotaSteps[step].instruction;
    let distance = rotaSteps[step].distance + " meters";
    let duration = rotaSteps[step].duration + " seconds";
    
    //console.log(instruction);
    //console.log(distance);
    //console.log(duration);
    
    //console.log(i + ": " + instruction + " (" + distance + " e " + duration + ").");   
    
    
    const stepParagraph = document.createElement('span');
    stepParagraph.innerText = i + ": " + instruction + " (" + distance + " e " + duration + ").";
    contentElement1.appendChild(stepParagraph);
    contentElement1.appendChild(document.createElement('br'));
    contentElement1.appendChild(document.createElement('br'));
    
    i++;
  }


  const normalStepsTitle = document.createElement('h3');
  normalStepsTitle.innerText = "SURVEILLED ROUTE ▼";  
  collapsElement2.appendChild(normalStepsTitle);
  
      
  let j = 1;
  for(var step in rota2Steps) {
    //console.log(j);
    let instruction = rota2Steps[step].instruction;
    let distance = rota2Steps[step].distance + " meters";
    let duration = rota2Steps[step].duration + " seconds";
    
    //console.log(instruction);
    //console.log(distance);
    //console.log(duration);
    
    //console.log(j + ": " + instruction + " (" + distance + " e " + duration + ").");   

    const stepParagraph = document.createElement('span');
    stepParagraph.innerText = j + ": " + instruction + " (" + distance + " and " + duration + ").";
    contentElement2.appendChild(stepParagraph);
    contentElement2.appendChild(document.createElement('br'));
    contentElement2.appendChild(document.createElement('br'));

    j++;
  }
}

var coll = document.getElementsByClassName("collapsible");
var i;

for (i = 0; i < coll.length; i++) {
  coll[i].addEventListener("click", function() {
    this.classList.toggle("active");
        var content = this.nextElementSibling;
    if (content.style.display === "block") {
            var h3This = this.getElementsByTagName("h3");
            let h3ThisText = h3This[0].innerText;
            let change = h3ThisText.replace(" ▲", " ▼");
            console.log(h3ThisText);
            console.log(change);
            h3This[0].innerText = change;
      content.style.display = "none";
    } else {
            var h3This = this.getElementsByTagName("h3");
            let h3ThisText = h3This[0].innerText;
            let change = h3ThisText.replace(" ▼", " ▲");
            console.log(h3ThisText);
            console.log(change);
            h3This[0].innerText = change;
      content.style.display = "block";
    }
  });
}
