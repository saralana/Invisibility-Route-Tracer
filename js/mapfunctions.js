// Where you want to render the map.
var element = document.getElementById('map');

var rotasElement = document.getElementById('rotas');

// Height has to be set. You can do this in CSS too.
//element.style = 'height:100vh;';

// Target's GPS coordinates.
var target = L.latLng(config.latCenter, config.lngCenter);

// Create Leaflet map on map element.
var map = L.map(element).setView(target, config.zoom);

const googleLink = config.CSV;

var csvGlobal;

var cameraPoints;

var directionsGeoJson;

//GET variables from URL
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

const profile = urlParams.get('profile');
const longA = urlParams.get('longA');
const latA = urlParams.get('latA');
const longB = urlParams.get('longB');
const latB = urlParams.get('latB');
const circleRadius = urlParams.get('circleRadius'); //in meters (m), needs to convert to km (10^-3)
const circleResolution = urlParams.get('circleResolution');
const iconsToggle = urlParams.get('iconsToggle');
const circleToggle = urlParams.get('circleToggle');



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
        //data.properties.id = i;
        data.properties = {};
      });

      cameraPoints2 = data;
      console.log(cameraPoints2);
      console.log(cameraPoints);
      
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




// function Google2CSV(googleLink){

  // $.ajax({
    // type: "GET",
    // url: googleLink,
    // dataType: "text",
    // success: function (csvData) { 
      // console.log(csvData);
      // //makeGeoJSON(csvData);
      // return csvData;
    // }
  // });

// }

// csvGlobal = Google2CSV(googleLink);



// function makeGeoJSON(csvData) {
  // csv2geojson.csv2geojson(csvData, {
    // latfield: 'Latitude',
    // lonfield: 'Longitude',
    // delimiter: ','
  // }, function (err, data) {
    
    // //cameraPoints = JSON.parse(data);
    // console.log(data);
    
    // return data;
  // });
// }


//var cameraPoints = JSON.parse();
//console.log(cameraPoints);




function showMarkers(pointsFeature){
  // var camIcon = L.icon({
    // iconUrl: 'media/camera.png',
    //shadowUrl: 'leaf-shadow.png',

    //iconSize:     [38, 95], // size of the icon
    //shadowSize:   [50, 64], // size of the shadow
    //iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    //shadowAnchor: [4, 62],  // the same for the shadow
    //popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
  // });
  
  // var camIcon = new L.Icon({
      // iconSize: [27, 27],
      // iconAnchor: [13, 27],
      // popupAnchor: [1, -24],
      // iconUrl: 'media/camera.png'
    // });
  
  // turf.featureEach(pointsFeature, function (currentFeature, featureIndex) {
    // //=currentFeature
    // //=featureIndex    
    
    // L.marker(currentFeature.geometry.coordinates, {icon: camIcon});
  // });
  
  
  my_json = L.geoJson(pointsFeature, {
    pointToLayer: function (feature, latlng) {
      var camIcon = new L.Icon({
        iconSize: [50, 50],
        iconAnchor: [27, 42],
        //popupAnchor: [1, -24],
        iconUrl: 'media/camera.png'
      });
      return L.marker(latlng, {icon: camIcon}).addTo(map);
    }
  });
  
  //L.geoJSON(my_json).addTo(map);
}

if(iconsToggle == true)
  showMarkers(cameraPoints2);


function pointsToCircles(FeatureCollection) {
  var circles = [];
  var circlesGeo = [];
  turf.featureEach(FeatureCollection, function (currentFeature, featureIndex) {
    //=currentFeature
    //=featureIndex
    //var center = [-75.343, 39.984];
    var radius = circleRadius/1000;
    //var options = {steps: 10, units: 'kilometers', properties: {foo: 'bar'}};
    var options = {steps: circleResolution};
    var circle = turf.circle(currentFeature, radius, options);
    circles.push(circle.geometry.coordinates);
    circlesGeo.push(circle);
  });
  
  //console.log(circles);
  //var multiPoly = turf.multiPolygon(circles);
  //console.log(multiPoly);
  if(circleToggle == true)
    L.geoJSON(circlesGeo).addTo(map);
  return circles;

}

var avoidingCircles = pointsToCircles(cameraPoints2);
//console.dir(avoidingCircles);
//L.geoJSON(avoidingCircles).addTo(map);

function getDirectionsORS2(avoidingPolygons) {
  let orsDirections = new Openrouteservice.Directions({
    api_key: config.apiORS
  });

  // var node = document.getElementById("driving-car-directions");
  

  
  var markerA = L.marker([latA,longA]).addTo(map);
  markerA._icon.classList.add("huechangeA");
  
  var markerB = L.marker([latB,longB]).addTo(map);
  markerB._icon.classList.add("huechangeB");
  
  orsDirections.calculate({
    coordinates: [[longA,latA],[longB,latB]],
    profile: profile,
    //extra_info: ["waytype", "steepness"],
    format: "geojson",
    api_version: 'v2',
    options:{
      avoid_polygons:{
        type: "MultiPolygon",
        coordinates: avoidingPolygons
      }
    }
  })
    .then(function(json) {
        // Add your own result handling here
        let response = JSON.stringify(json, null, "\t");
        //console.dir(json);
        console.dir(json);
        L.geoJSON(json).addTo(map);
        // response = response.replace(/(\n)/g, '<br>');
        // response = response.replace(/(\t)/g, '&nbsp;&nbsp;');
        //node.innerHTML = "<h3>Response</h3><p>" + response + "</p>";
        rotaResumo(json);
    })
    .catch(function(err) {
        let response = JSON.stringify(err, null, "\t");
        console.error(response);
        // response = response.replace(/(\n)/g, '<br>');
        // response = response.replace(/(\t)/g, '&nbsp;&nbsp;');
        //node.innerHTML = "<h3>Error</h3><p>" + response + "</p>";
    });
    
}
getDirectionsORS2(avoidingCircles);


function rotaResumo(directionsGeoJson){
  //console.dir(directionsGeoJson);
  //console.dir(directionsGeoJson.features[0].properties.segments[0]);
  
  let rota = directionsGeoJson.features[0].properties.segments[0];
  //console.dir(rota);
  
  let rotaDistance = rota.distance + " metros";
  let rotaDuration = rota.duration + " segundos";
  let rotaSteps = rota.steps;
    
  //console.log(rotaDistance);
  //console.log(rotaDuration);
  //console.dir(rotaSteps);
  
  const summaryTitle = document.createElement('h2');
  summaryTitle.innerText = "Summary";
  rotasElement.appendChild(summaryTitle);
  
  const summaryDistance = document.createElement('span');
  summaryDistance.innerText = "Total distance: " + rotaDistance;
  rotasElement.appendChild(summaryDistance);
  
  rotasElement.appendChild(document.createElement('br'));
  
  const summaryDuration = document.createElement('span');
  summaryDuration.innerText = "Total distance: " + rotaDuration;
  rotasElement.appendChild(summaryDuration);  
  
  rotasElement.appendChild(document.createElement('br'));
  rotasElement.appendChild(document.createElement('br'));  
  
  
  const stepsTitle = document.createElement('h2');
  stepsTitle.innerText = "Steps";
  rotasElement.appendChild(stepsTitle);


  let i = 1;
  for(var step in rotaSteps) {
    //console.log(i);
    let instruction = rotaSteps[step].instruction;
    let distance = rotaSteps[step].distance + " metros";
    let duration = rotaSteps[step].duration + " segundos";
    
    //console.log(instruction);
    //console.log(distance);
    //console.log(duration);
    
    //console.log(i + ": " + instruction + " (" + distance + " e " + duration + ").");   
    
    
    const stepParagraph = document.createElement('span');
    stepParagraph.innerText = i + ": " + instruction + " (" + distance + " e " + duration + ").";
    rotasElement.appendChild(stepParagraph);
    rotasElement.appendChild(document.createElement('br'));
    
    i++;
  }   
  
}




