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

// Create array to convert 'month' number in data to month word:
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

  // add an empty data source, which we will use to highlight the station that the user is hovering over
  map.addSource('highlight-feature', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the highlighted lot
  map.addLayer({
    id: 'highlight-station',
    type: 'line',
    source: 'highlight-feature',
    paint: {
      'line-width': 5,
      //'line-opacity': 0.9,
      'line-color': 'white',
      // 'circle-radius': [
      //   'interpolate',
      //   ['linear'],
      //   ['get', 'entries'],
      //   1000, 2,
      //   100000, 7,
      //   500000, 10,
      //   700000, 12,
      //   1000000, 15
      // ],
      // 'line-color': 'black',
      //'circle-stroke-opacity': 0.4,
      //'circle-stroke-width': 1
    },
    'circle-opacity': 0.4
  });

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

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });
  map.on('mousemove', function (e) {
    // query for the features under the mouse in both layers:
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['entries-layer', 'exits-layer'],
    });

    // if only one layer is selected by the user, we want to populate the popup with only the data from that layer:
    if (features.length == 1) {
      var hoveredFeature = features[0];
      var station_name = hoveredFeature.properties.stop_name;
      // if it is the entries layer use that data
      if (features[0].layer.id === 'entries-layer') {
        var num_entries = hoveredFeature.properties.entries;
        var perc_change_entries = hoveredFeature.properties.perc_change_entries
        var popupContent = `
          <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${num_entries} entries</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_entries}% change from __</div>
        `;
        popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);
        // set this lot's polygon feature as the data for the highlight source
        map.getSource('highlight-feature').setData(hoveredFeature.geometry);
      } else if (features[0].layer.id === 'exits-layer') {
        var num_exits = hoveredFeature.properties.exits;
        var perc_change_exits = hoveredFeature.properties.perc_change_exits
          var popupContent2 = `
            <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${num_exits} exits</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_exits}% change from __</div>
          `;
          popup.setLngLat(e.lngLat).setHTML(popupContent2).addTo(map);
          // set this lot's polygon feature as the data for the highlight source
          map.getSource('highlight-feature').setData(hoveredFeature.geometry);
        }
      map.getCanvas().style.cursor = 'pointer';

    }   else {
      // remove the Popup
      popup.remove();
      map.getCanvas().style.cursor = '';
      map.getSource('highlight-feature').setData({
        'type': 'FeatureCollection',
        'features': []
      });
    }
  });

})
