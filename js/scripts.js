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

// Create array of objects to hold max and min perc_change values for each month (to dynamically populate range slider):
var month_maxmin = [
  {
    month: 2,
    min_percchange_entries: -83,
    max_percchange_entries: 56,
    min_percchange_exits: -80,
    max_percchange_exits: 56
  }
]

console.log(month_maxmin[0].min_percchange_entries)


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

  //var layer_id = 'entries'

  $('#exits-button').click(function () {
    $('#entries-button').removeClass('active');
    $('#exits-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','none');
    map.setLayoutProperty('exits-layer', 'visibility','visible');
    // set filter to only month, not range:

  })

  $('#entries-button').click(function () {
    $('#exits-button').removeClass('active');
    $('#entries-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','visible');
    map.setLayoutProperty('exits-layer', 'visibility','none');
    //set filter to only month, not range:

  })


  $(function() {
    $( "#slider-month" ).slider({
      'min': 1,
      'max': 12,
      'animate': 'slow', //can remove since does not animate the slider ui itself, just movement from A to B
      'slide': function(event,ui) {
        window['month'] = parseInt(ui.value);
        map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]);
        map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], window['month']]);

        // create variable to convert number to month here:

        // represent the month in text here:
        //document.getElementById('active-month').innerText = month;
        if (window['month'] > 1) {
          $( "#slider-perc-range" ).slider("enable");
          $( "#slider-perc-range" ).slider( "values", 0, -100 );
          $( "#slider-perc-range" ).slider( "values", 1, 100 )
        }
        else if (window['month'] === 1) {
          $( "#slider-perc-range" ).slider("disable");
        }

      }
    });
  });


  // TO DO: if month slider moves, reset range slider - DONE, just need to reset it to the min/max of relevant month...
  //TO DO: separate entries and exits range slider functions so can set min & max values dynamically
  //ISSUE: when switching layers, range slider does not reset
  //using if ($('#entries-button').hasClass('active')) {}


  $(function() {
    $( "#slider-perc-range" ).slider({
      'disabled': true,
      'min': -100,
      'max': 100,
      'step': 1,
      'range': true,
      'values': [-100,100], //initial values for each handle of the range slider = min & max of perc_change applied to the map
      'slide': function(event,ui) {
        map.setFilter('entries-layer', ['all',
                                        ['==', ['number', ['get', 'month']], window['month']],
                                        ['<=', ['number', ['get', 'perc_change_entries']], ui.values[1]],
                                        ['>=', ['number', ['get', 'perc_change_entries']], ui.values[0]]
                                      ]);

        map.setFilter('exits-layer', ['all',
                                        ['==', ['number', ['get', 'month']], window['month']],
                                        ['<=', ['number', ['get', 'perc_change_exits']], ui.values[1]],
                                        ['>=', ['number', ['get', 'perc_change_exits']], ui.values[0]]
                                      ]);

        $( "#price" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );
      }
    });
  })


})
