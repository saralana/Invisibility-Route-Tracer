const geocoderA = new MapboxGeocoder({
  accessToken: config.accessToken,
  placeholder: "Buscar partida",
  types: 'country,region,place,postcode,locality,neighborhood, district, address, poi'
});
 
geocoderA.addTo('#geocoderA');
 
// Get the geocoder results container.
const lngA = document.getElementById('longA');
const latA = document.getElementById('latA');

 
// Add geocoder result to container.
geocoderA.on('result', (e) => {
  lngA.value = e.result.center[0];
  latA.value = e.result.center[1];
  //console.dir(e.result.center);
  //results.innerText = JSON.stringify(e.result, null, 2);
});
 
// Clear results container when search is cleared.
geocoderA.on('clear', () => {
  latA.value = '';
  lngA.value = '';
}); 



const geocoderB = new MapboxGeocoder({
  accessToken: config.accessToken,
  placeholder: "Buscar chegada",
  types: 'country,region,place,postcode,locality,neighborhood, district, address, poi'
});
 
geocoderB.addTo('#geocoderB');
 
// Get the geocoder results container.
const lngB = document.getElementById('longB');
const latB = document.getElementById('latB');

 
// Add geocoder result to container.
geocoderB.on('result', (e) => {
  lngB.value = e.result.center[0];
  latB.value = e.result.center[1];
});
 
// Clear results container when search is cleared.
geocoderB.on('clear', () => {
  latB.value = '';
  lngB.value = '';
}); 
