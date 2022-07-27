// Where you want to render the map.
var element = document.getElementById('map');

var rotasElement = document.getElementById('rotas');

// Height has to be set. You can do this in CSS too.
//element.style = 'height:100vh;';

// Target's GPS coordinates.
var target = L.latLng(config.latCenter, config.lngCenter);

// Create Leaflet map on map element.
var map = L.map(element).setView(target, config.zoom);

var cameraPoints;
var directionsGeoJson;
var avoidingCircles;
var circlesGeo = [];

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

      cameraPoints = data;
      console.log(cameraPoints);
      //console.log(cameraPoints);
      
      if(iconsToggle == true)
        showMarkers(cameraPoints);
            
      avoidingCircles = pointsToCircles(cameraPoints);
      
      getDirectionsORS2(avoidingCircles);

      

      //rotaResumo(invisibleRoute.rota);
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

// if(iconsToggle == true)
  // showMarkers(cameraPoints2);


function pointsToCircles(FeatureCollection) {
  var circles = [];
  // var circlesGeo = [];
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

// var avoidingCircles = pointsToCircles(cameraPoints2);
//console.dir(avoidingCircles);
//L.geoJSON(avoidingCircles).addTo(map);

function getDirectionsORS2(avoidingPolygons) {
  let orsDirections = new Openrouteservice.Directions({
    api_key: config.apiORS
  });
  
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
    //maneuvers: true,
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
        console.log(response);
        console.dir(json);
        L.geoJSON(json, {
          style:{
            // "color": "#3388ff",
            "color": "#00ff00",
            "opacity": 0.8
          }
        }).addTo(map);
        //rotaResumo(json);


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
              // Add your own result handling here
              let response = JSON.stringify(json2, null, "\t");
              console.log(response);
              console.dir(json2);
              L.geoJSON(json2, {
                style:{
                  "color": "#ff0000",
                  "opacity": 0.65
                }
              }).addTo(map);
              rotaResumo(json,json2);
          })
          .catch(function(err) {
              let response = JSON.stringify(err, null, "\t");
              console.error(response);
              //console.log(`Status Error NormalRoute: ${err.response.status}`);
          });



    })
    .catch(function(err) {
        let response = JSON.stringify(err, null, "\t");
        console.error(response);

        const routeError = document.createElement('span');
        routeError.innerText = "Nenhuma rota encontrada com os parâmetros informados, favor refazer a busca";
        rotasElement.appendChild(routeError);
        //console.log(`Status Error InvisibleRoute: ${err.response.status}`);
    });
}
// getDirectionsORS2(avoidingCircles);


function rotaResumo(directionsGeoJson,directionsGeoJson2){
  //console.dir(directionsGeoJson);
  //console.dir(directionsGeoJson.features[0].properties.segments[0]);
  
  let rota = directionsGeoJson.features[0].properties.segments[0];
  let rota2 = directionsGeoJson2.features[0].properties.segments[0];
  //console.dir(rota);
  
  let rotaDistance = rota.distance + " metros";
  let rotaDuration = rota.duration + " segundos";
  let rotaSteps = rota.steps;

  let rota2Distance = rota2.distance + " metros";
  let rota2Duration = rota2.duration + " segundos";
  let rota2Steps = rota2.steps;

  let distanceDiff = rota.distance - rota2.distance;
  let durationDiff = rota.duration - rota2.duration;
    
  //console.log(rotaDistance);
  //console.log(rotaDuration);
  //console.dir(rotaSteps);
  
  const summaryTitle = document.createElement('h2');
  summaryTitle.innerText = "Summary";
  rotasElement.appendChild(summaryTitle);

  const invisibleTitle = document.createElement('h3');
  invisibleTitle.innerText = "Invisible";
  rotasElement.appendChild(invisibleTitle);
  
  const summaryDistance = document.createElement('span');
  summaryDistance.innerText = "Total distance: " + rotaDistance + " (" + distanceDiff.toFixed(1) + " metros a mais)";
  rotasElement.appendChild(summaryDistance);
  
  rotasElement.appendChild(document.createElement('br'));
  
  const summaryDuration = document.createElement('span');
  summaryDuration.innerText = "Total duration: " + rotaDuration + " (" + durationDiff.toFixed(1) + " segundos a mais)";
  rotasElement.appendChild(summaryDuration);  
  
  rotasElement.appendChild(document.createElement('br'));

  const normalTitle = document.createElement('h3');
  normalTitle.innerText = "Normal";
  rotasElement.appendChild(normalTitle);
  
  const summary2Distance = document.createElement('span');
  summary2Distance.innerText = "Total distance: " + rota2Distance;
  rotasElement.appendChild(summary2Distance);
  
  rotasElement.appendChild(document.createElement('br'));
  
  const summary2Duration = document.createElement('span');
  summary2Duration.innerText = "Total duration: " + rota2Duration;
  rotasElement.appendChild(summary2Duration);

  var featureCirclesGeo = turf.featureCollection(circlesGeo);

  console.log(featureCirclesGeo);
  //console.dir(directionsGeoJson2);
  var intersects = turf.lineIntersect(featureCirclesGeo, directionsGeoJson2);
  console.dir(intersects);
  var routeCameras = (intersects.features.length/2).toFixed();
  console.log(routeCameras);

  // //exibe marker azul nos intersects da rota normal com as bordas dos círculos das câmeras
  // L.geoJson(intersects, {
  //   pointToLayer: function (feature, latlng) {
  //     return L.marker(latlng).addTo(map);
  //   }
  // });

  rotasElement.appendChild(document.createElement('br'));

  const summaryRouteCameras = document.createElement('span');
  summaryRouteCameras.innerText = "Total cameras: " + routeCameras;
  rotasElement.appendChild(summaryRouteCameras);

  rotasElement.appendChild(document.createElement('br'));
  rotasElement.appendChild(document.createElement('br'));  
  
  
  const stepsTitle = document.createElement('h2');
  stepsTitle.innerText = "Steps";
  rotasElement.appendChild(stepsTitle);

  const invisibleStepsTitle = document.createElement('h3');
  invisibleStepsTitle.innerText = "Invisible";
  rotasElement.appendChild(invisibleStepsTitle);


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

  const normalStepsTitle = document.createElement('h3');
  normalStepsTitle.innerText = "Normal";
  rotasElement.appendChild(normalStepsTitle);


  let j = 1;
  for(var step in rota2Steps) {
    //console.log(j);
    let instruction = rota2Steps[step].instruction;
    let distance = rota2Steps[step].distance + " metros";
    let duration = rota2Steps[step].duration + " segundos";
    
    //console.log(instruction);
    //console.log(distance);
    //console.log(duration);
    
    //console.log(j + ": " + instruction + " (" + distance + " e " + duration + ").");   
    
    
    const stepParagraph = document.createElement('span');
    stepParagraph.innerText = j + ": " + instruction + " (" + distance + " e " + duration + ").";
    rotasElement.appendChild(stepParagraph);
    rotasElement.appendChild(document.createElement('br'));
    
    j++;
  }  
  
}
