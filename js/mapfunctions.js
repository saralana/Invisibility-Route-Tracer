// Where you want to render the map.
var element = document.getElementById('map');

// Height has to be set. You can do this in CSS too.
element.style = 'height:100vh;';

// Target's GPS coordinates.
var target = L.latLng('-23.549000', '-46.639000');

// Create Leaflet map on map element.
var map = L.map(element).setView(target, 15);

const googleLink = "https://docs.google.com/spreadsheets/d/1blQipxbPUX1n2n8ZU5QunKnfmqdIlyXdD7kIxTUsYJw/gviz/tq?tqx=out:csv&sheet=Sheet1";

var csvGlobal;

var cameraPoints;


// Add Sara MAPBOX tile layer to the Leaflet map.
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'saralgc/ckwo48ncq3iht14lrkxn237z4',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1Ijoic2FyYWxnYyIsImEiOiJja2NjbTAyczkwNXA3Mnlscm5nbjN5OHZiIn0.yNcJkPBSugRlIeGkXDRlZw'
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
  
  var camIcon = new L.Icon({
    iconSize: [27, 27],
    iconAnchor: [13, 27],
    popupAnchor: [1, -24],
    iconUrl: 'media/camera.png'
  });
  
  turf.featureEach(pointsFeature, function (currentFeature, featureIndex) {
    //=currentFeature
    //=featureIndex
    
    L.marker(currentFeature.geometry.coordinates, {icon: camIcon});
  });
  
  
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

showMarkers(cameraPoints);

//rotaGeojson = {"type":"FeatureCollection","features":[{"bbox":[-46.646701,-23.555806,-46.633752,-23.543824],"type":"Feature","properties":{"segments":[{"distance":3890.2,"duration":574.2,"steps":[{"distance":186.9,"duration":36.9,"type":11,"instruction":"Head south on Praça da Sé","name":"Praça da Sé","way_points":[0,8]},{"distance":223.1,"duration":34.8,"type":1,"instruction":"Turn right onto Rua Senador Feijó","name":"Rua Senador Feijó","way_points":[8,17]},{"distance":330.2,"duration":70.5,"type":0,"instruction":"Turn left onto Rua Cristovão Colombo","name":"Rua Cristovão Colombo","way_points":[17,33]},{"distance":169.1,"duration":32.9,"type":2,"instruction":"Turn sharp left","name":"-","way_points":[33,44]},{"distance":677.5,"duration":75.3,"type":13,"instruction":"Keep right onto Rua Assembleia","name":"Rua Assembleia","way_points":[44,62]},{"distance":820.4,"duration":93.1,"type":6,"instruction":"Continue straight onto Viaduto Júlio de Mesquita Filho","name":"Viaduto Júlio de Mesquita Filho","way_points":[62,81]},{"distance":244.4,"duration":28.2,"type":13,"instruction":"Keep right","name":"-","way_points":[81,84]},{"distance":329.7,"duration":54.2,"type":1,"instruction":"Turn right onto Rua da Consolação","name":"Rua da Consolação","way_points":[84,91]},{"distance":628,"duration":90.9,"type":12,"instruction":"Keep left onto Rua da Consolação","name":"Rua da Consolação","way_points":[91,113]},{"distance":71.7,"duration":10.3,"type":0,"instruction":"Turn left onto Praça Ramos de Azevedo","name":"Praça Ramos de Azevedo","way_points":[113,114]},{"distance":26.2,"duration":3.1,"type":0,"instruction":"Turn left onto Praça Ramos de Azevedo","name":"Praça Ramos de Azevedo","way_points":[114,116]},{"distance":182.9,"duration":43.9,"type":1,"instruction":"Turn right onto Rua 24 de Maio","name":"Rua 24 de Maio","way_points":[116,120]},{"distance":0,"duration":0,"type":10,"instruction":"Arrive at Rua 24 de Maio, on the left","name":"-","way_points":[120,120]}]}],"summary":{"distance":3890.2,"duration":574.2},"way_points":[0,120]},"geometry":{"coordinates":[[-46.633752,-23.549303],[-46.633902,-23.549645],[-46.634111,-23.550072],[-46.634223,-23.550288],[-46.634338,-23.550537],[-46.634356,-23.550572],[-46.634433,-23.550729],[-46.634445,-23.550754],[-46.634488,-23.550842],[-46.634588,-23.550807],[-46.634794,-23.550734],[-46.635091,-23.550631],[-46.635198,-23.550594],[-46.635291,-23.550561],[-46.635395,-23.550523],[-46.635582,-23.550459],[-46.636443,-23.550163],[-46.636536,-23.550133],[-46.636701,-23.550523],[-46.63674,-23.550616],[-46.636782,-23.550702],[-46.637016,-23.551142],[-46.637019,-23.551148],[-46.637097,-23.551297],[-46.637296,-23.551666],[-46.637395,-23.55185],[-46.637403,-23.551866],[-46.637618,-23.552262],[-46.63766,-23.552338],[-46.637704,-23.552424],[-46.637759,-23.55252],[-46.63783,-23.552656],[-46.637853,-23.5527],[-46.637919,-23.552816],[-46.637848,-23.552797],[-46.637791,-23.55278],[-46.637671,-23.552783],[-46.637564,-23.552835],[-46.637543,-23.552855],[-46.637496,-23.55302],[-46.637449,-23.55318],[-46.637321,-23.553482],[-46.637196,-23.553783],[-46.637171,-23.553865],[-46.637159,-23.553945],[-46.637204,-23.554066],[-46.637246,-23.554167],[-46.637329,-23.554294],[-46.637615,-23.554711],[-46.638327,-23.55568],[-46.638391,-23.555712],[-46.638587,-23.555789],[-46.638743,-23.555806],[-46.639203,-23.555755],[-46.63935,-23.555759],[-46.639403,-23.555749],[-46.640123,-23.555616],[-46.640417,-23.555573],[-46.64105,-23.555511],[-46.641556,-23.555452],[-46.641936,-23.555388],[-46.642274,-23.555304],[-46.642642,-23.555181],[-46.643218,-23.554976],[-46.644224,-23.554601],[-46.644416,-23.554516],[-46.644646,-23.554381],[-46.644796,-23.554267],[-46.644968,-23.554087],[-46.645069,-23.553964],[-46.645219,-23.553715],[-46.645221,-23.553711],[-46.645354,-23.553397],[-46.645378,-23.553336],[-46.645615,-23.552684],[-46.645787,-23.552242],[-46.646057,-23.55155],[-46.646282,-23.55094],[-46.646408,-23.550571],[-46.64649,-23.550299],[-46.64655,-23.549987],[-46.646701,-23.549417],[-46.64618,-23.548066],[-46.646023,-23.547625],[-46.64594,-23.547333],[-46.645821,-23.547365],[-46.64531,-23.547481],[-46.644429,-23.547665],[-46.644235,-23.547703],[-46.643205,-23.547919],[-46.64285,-23.547978],[-46.642785,-23.54798],[-46.642733,-23.547964],[-46.642703,-23.547957],[-46.642592,-23.547929],[-46.642473,-23.547904],[-46.641519,-23.547756],[-46.641431,-23.547743],[-46.641297,-23.547719],[-46.640139,-23.547513],[-46.640111,-23.547508],[-46.639809,-23.547449],[-46.639761,-23.547423],[-46.639729,-23.547391],[-46.639546,-23.547133],[-46.638976,-23.54616],[-46.638942,-23.546121],[-46.638883,-23.546051],[-46.638829,-23.545987],[-46.638767,-23.545927],[-46.638663,-23.545802],[-46.638559,-23.545679],[-46.63836,-23.545433],[-46.638077,-23.54508],[-46.638645,-23.544699],[-46.63872,-23.544802],[-46.63879,-23.544894],[-46.638867,-23.544835],[-46.639298,-23.544499],[-46.640061,-23.543896],[-46.640152,-23.543824]],"type":"LineString"}}],"bbox":[-46.646701,-23.555806,-46.633752,-23.543824],"metadata":{"attribution":"openrouteservice.org | OpenStreetMap contributors","service":"routing","timestamp":1648619562629,"query":{"coordinates":[[-46.63383007049561,-23.549274336622684],[-46.64096949118043,-23.544691004890126]],"profile":"driving-car","format":"geojson","options":{"avoid_polygons":{"coordinates":[[[[-46.640739,-23.553956],[-46.640739,-23.548999],[-46.638508,-23.548999],[-46.638508,-23.553956],[-46.640739,-23.553956]]],[[[-46.636448,-23.543452],[-46.639023,-23.54713],[-46.632972,-23.544239],[-46.636448,-23.543452]]]],"type":"MultiPolygon"}}},"engine":{"version":"6.7.0","build_date":"2022-02-18T19:37:41Z","graph_date":"2022-03-13T11:00:24Z"}}};

//L.geoJSON(rotaGeojson).addTo(map);

function pointsToCircles(FeatureCollection) {
  var circles = [];
  var circlesGeo = [];
  turf.featureEach(FeatureCollection, function (currentFeature, featureIndex) {
    //=currentFeature
    //=featureIndex
    //var center = [-75.343, 39.984];
    var radius = 0.005;
    //var options = {steps: 10, units: 'kilometers', properties: {foo: 'bar'}};
    var options = {steps: 32};
    var circle = turf.circle(currentFeature, radius, options);
    circles.push(circle.geometry.coordinates);
    circlesGeo.push(circle);
  });
  
  //console.log(circles);
  //var multiPoly = turf.multiPolygon(circles);
  //console.log(multiPoly);
  L.geoJSON(circlesGeo).addTo(map);
  return circles;

}

var avoidingCircles = pointsToCircles(cameraPoints);
console.dir(avoidingCircles);
//L.geoJSON(avoidingCircles).addTo(map);

function getDirectionsORS2(avoidingPolygons) {
  let orsDirections = new Openrouteservice.Directions({
    api_key: '5b3ce3597851110001cf62487a9231f0aafb4d82afe9dd031a26d5d5'
  });

  // var node = document.getElementById("driving-car-directions");
  
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  
  const profile = urlParams.get('profile');
  const longA = urlParams.get('longA');
  const latA = urlParams.get('latA');
  const longB = urlParams.get('longB');
  const latB = urlParams.get('latB');
  
  
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
        let response = JSON.stringify(json, null, "\t")
        console.log(response);
        L.geoJSON(json).addTo(map);
        // response = response.replace(/(\n)/g, '<br>');
        // response = response.replace(/(\t)/g, '&nbsp;&nbsp;');
        //node.innerHTML = "<h3>Response</h3><p>" + response + "</p>";
    })
    .catch(function(err) {
        let response = JSON.stringify(err, null, "\t")
        console.error(response);
        // response = response.replace(/(\n)/g, '<br>');
        // response = response.replace(/(\t)/g, '&nbsp;&nbsp;');
        //node.innerHTML = "<h3>Error</h3><p>" + response + "</p>";
    });
}
getDirectionsORS2(avoidingCircles);
