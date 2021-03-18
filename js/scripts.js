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

// Create array to convert number in data to month:
var months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sept','Oct','Nov','Dec']

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


  $(function() {
    $( "#slider-month" ).slider({
      'min': 1,
      'max': 12,
      'slide': function(event,ui) {
        window['month'] = parseInt(ui.value);
        map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]);
        map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], window['month']]);

        // Since sliding the month-slider automatically removes the range filter (if any), set button text to 'refresh timeline':
        $('#refresh-button').text('Refresh Timeline')

        // represent the month in text here using months variable:
        document.getElementById('active-month').innerText = months[window['month']-1];

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


  // DONE: if month slider moves, reset range slider
  //ISSUE: outliers only come back if month slider is moved, not if toggling between entries/exit layers
  //SOLUTION: refresh button for range slider AND month slider - same button, vary text.
  //reset range filter brings back all outliers, but toggling between layers does not. keep this way.
  //first click: ALL stations (incl outliers) should reappear and range slider should be reset while staying in same mth & layer
  //second click: month slider reset to jan
  //($('#entries-button').hasClass('active')) {}
  // ISSUE: outlier checkbox not working. default should be disabled; enabled when in a month with outlier vals

  $(function() {
    $( "#slider-perc-range" ).slider({
      'disabled': true,
      'min': -100,
      'max': 100,
      'step': 1,
      'range': true,
      'values': [-100,100], //initial values for each handle of the range slider
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
        //temporary text box to see vals of range slider: delete later
        $( "#price" ).val(ui.values[ 0 ] + " - " + ui.values[ 1 ] );

        //if range slider is used, set text in refresh button to 'Reset range filter':
        $('#refresh-button').text('Reset Range Filter')
      }
    });
  })

  //$(".outlier-checkbox").checkboxradio({}); not sure why this is not working...

  //NOT WORKING:
  $('.outlier-checkbox').bind('change', function(){
    if($(this).is(':checked')){
      map.setFilter('entries-layer', ['all',
                                      ['==', ['number', ['get', 'month']], window['month']],
                                      ['>=', ['number', ['get', 'perc_change_entries']], 100],
                                      ['<=', ['number', ['get', 'perc_change_entries']], -100]
                                    ]);

      map.setFilter('exits-layer', ['all',
                                      ['==', ['number', ['get', 'month']], window['month']],
                                      ['>=', ['number', ['get', 'perc_change_exits']], 100],
                                      ['<=', ['number', ['get', 'perc_change_exits']], -100]
                                    ]);
    }
  });

  $('#refresh-button').click(function () {
    if ($('#refresh-button').text() === 'Refresh Timeline') {
      $( "#slider-month" ).slider("value", 1);
      $( "#slider-perc-range" ).slider("disable");
      document.getElementById('active-month').innerText = 'Jan';
      map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], 1]);
      map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], 1]);
    }
    else if ($('#refresh-button').text() === 'Reset Range Filter') {
      $( "#slider-perc-range" ).slider( "values", 0, -100 );
      $( "#slider-perc-range" ).slider( "values", 1, 100 );
      map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]);
      map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], window['month']]);
      $('#refresh-button').text('Refresh Timeline')
    }
  })

})
