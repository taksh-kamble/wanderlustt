mapboxgl.accessToken = mapToken;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: coordinates,   // [lng, lat]
  zoom: 11
});


const marker = new mapboxgl.Marker({ color: "red" })
  .setLngLat(coordinates)
  .addTo(map);


const popup = new mapboxgl.Popup({ offset: 25 })
  .setHTML("<h4>Welcome to Staynest!</h4>");

marker.setPopup(popup);
