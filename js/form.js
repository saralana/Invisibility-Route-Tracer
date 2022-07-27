const geocoderA = new MapboxGeocoder({
  accessToken: config.accessToken,
  placeholder: "Buscar partida",
  types: 'country,region,place,postcode,locality,neighborhood, district, address, poi'
});
 
geocoderA.addTo('#geocoderA');
 
// Get the geocoder results container.
const lngAGeo = document.getElementById('longA');
const latAGeo = document.getElementById('latA');

 
// Add geocoder result to container.
geocoderA.on('result', (e) => {
  lngAGeo.value = e.result.center[0];
  latAGeo.value = e.result.center[1];
  //console.dir(e.result.center);
  //results.innerText = JSON.stringify(e.result, null, 2);
});
 
// Clear results container when search is cleared.
geocoderA.on('clear', () => {
  latAGeo.value = '';
  lngAGeo.value = '';
}); 



const geocoderB = new MapboxGeocoder({
  accessToken: config.accessToken,
  placeholder: "Buscar chegada",
  types: 'country,region,place,postcode,locality,neighborhood, district, address, poi'
});
 
geocoderB.addTo('#geocoderB');
 
// Get the geocoder results container.
const lngBGeo = document.getElementById('longB');
const latBGeo = document.getElementById('latB');

 
// Add geocoder result to container.
geocoderB.on('result', (e) => {
  lngBGeo.value = e.result.center[0];
  latBGeo.value = e.result.center[1];
});
 
// Clear results container when search is cleared.
geocoderB.on('clear', () => {
  latBGeo.value = '';
  lngBGeo.value = '';
}); 
