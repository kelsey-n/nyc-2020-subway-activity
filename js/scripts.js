mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// Initialize mapboxgl map and insert into mapcontainer div:
var map = new mapboxgl.Map({
  container: 'mapcontainer', // container ID
  style: 'mapbox://styles/mapbox/dark-v10', // style URL
  center: [-73.984, 40.7128], // starting position [lng, lat]
  zoom: 10 // starting zoom
});

// Add navigation control:
map.addControl(new mapboxgl.NavigationControl({
  showCompass: false,
  showZoom: true
}));


map.on('style.load', function() {
  // add the geojson source
  map.addSource('activity-data', {
    type: 'geojson',
    data: 'data/subwayactivitydata.geojson'
  });

  map.addLayer({
    'id': 'entries-layer',
    'type': 'circle',
    'source': 'activity-data',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'entries'],
        1000, 2,
        100000, 7,
        500000, 10,
        700000, 12,
        1000000, 15
      ],
      'circle-stroke-color': 'black', //use these properties to highlight selected stations
      //'circle-stroke-opacity': 1,
      'circle-stroke-width': 1,
      'circle-color': [
        'match',
        ['get', 'line_color'],
        'blue', '#0039A6',
        'brown', '#996633',
        'gray', '#A7A9AC',
        'green', '#00933C',
        'lightgreen', '#6CBE45',
        'orange', '#FF6319',
        'purple', '#B933AD',
        'red', '#EE352E',
        'shuttlegray', '#808183',
        'yellow', '#FCCC0A',
        'white' //'multiple' line_colors
      ],
      'circle-opacity': 0.8
    },
    'filter': ['==', ['number', ['get', 'month']], 1]
  })

  map.addLayer({
    'id': 'exits-layer',
    'type': 'circle',
    'source': 'activity-data',
    'layout': {
      'visibility': 'none'
    },
    'paint': {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['get', 'exits'],
        1000, 2,
        100000, 7,
        500000, 10,
        700000, 12,
        1000000, 15
      ],
      'circle-stroke-color': 'black', //use these properties to highlight selected stations
      //'circle-stroke-opacity': 1,
      'circle-stroke-width': 1,
      'circle-color': [
        'match',
        ['get', 'line_color'],
        'blue', '#0039A6',
        'brown', '#996633',
        'gray', '#A7A9AC',
        'green', '#00933C',
        'lightgreen', '#6CBE45',
        'orange', '#FF6319',
        'purple', '#B933AD',
        'red', '#EE352E',
        'shuttlegray', '#808183',
        'yellow', '#FCCC0A',
        'white' //'multiple' line_colors
      ],
      'circle-opacity': 0.8
    },
    'filter': ['==', ['number', ['get', 'month']], 1]
  })

  $('#exits-button').click(function () {
    $('#entries-button').removeClass('active');
    $('#exits-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','none');
    map.setLayoutProperty('exits-layer', 'visibility','visible');
  })

  $('#entries-button').click(function () {
    $('#exits-button').removeClass('active');
    $('#entries-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','visible');
    map.setLayoutProperty('exits-layer', 'visibility','none');
  })


  document.getElementById('slider').addEventListener('input', function(e) {
  var month = parseInt(e.target.value);
  // update the filter on the map layer
  map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], month]);
  map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], month]);

  // create variable to convert number to month here


  document.getElementById('active-month').innerText = month;
  });

})
