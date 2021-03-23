mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// This function will open the side navigation menu when user clicks on any of the floating menu buttons
// and populate the menu with text relevant to the button that was clicked
function openNav() {
  /* Set the width of the side navigation to be viewable at 250px, and set the left margin of the page content to 250px to shift page content over*/
  document.getElementById("sidenav-menu").style.width = "250px";
  document.getElementById("grid-container").style.marginLeft = "250px";
  document.getElementById("legend-controls").style.left = "400px";
  document.getElementById("sidenav-buttons").style.left = "250px";
  $('.sidenav-button').click(function() {
    var button_id = $(this).attr('id') //pull out the id name of the clicked sidenav button
    var menu_text = $(`#${button_id}-text`).text(); //get the menu text for the clicked button
    $(".sidenav-menu-text").text(menu_text); //populate the sidenav menu with the appropriate text
  })
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
function closeNav() {
  document.getElementById("sidenav-menu").style.width = "0";
  document.getElementById("grid-container").style.marginLeft = "0";
  document.getElementById("legend-controls").style.left = "150px";
  document.getElementById("sidenav-buttons").style.left = "0px";
}

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
var months = ['January','February','March','April','May','June','July','August','September','October','November','December']

map.on('style.load', function() {

  openNav(); //load welcome message

  // add the geojson source
  map.addSource('activity-data', {
    type: 'geojson',
    data: 'data/subwayactivitydata.geojson',
    generateId: true //each feature will get a unique ID, which can be used for data-driven styling upon hover
  });

  map.addLayer({
    'id': 'entries-layer',
    'type': 'circle',
    'source': 'activity-data',
    'layout': {
      'visibility': 'visible'
    },
    'paint': {
    // The feature-state dependent circle-radius expression will render
    // the radius size according to its magnitude when
    // a feature's hover state is set to true
      'circle-radius': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        [
          'interpolate', ['linear'],
          ['get', 'entries'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      [
        'interpolate', ['linear'],
        ['get', 'entries'],
        1000, 2,
        100000, 7,
        500000, 10,
        700000, 12,
        1000000, 15
      ]
      ],
      'circle-stroke-color': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        [
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
        '#000000'
      ],
      //'circle-stroke-opacity': 1,
      'circle-stroke-width': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        1.5,
        0
      ],
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
      'circle-opacity': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        1,
        0.7
      ]
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
    // The feature-state dependent circle-radius expression will render
    // the radius size according to its magnitude when
    // a feature's hover state is set to true
      'circle-radius': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        [
          'interpolate', ['linear'],
          ['get', 'exits'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      [
        'interpolate', ['linear'],
        ['get', 'exits'],
        1000, 2,
        100000, 7,
        500000, 10,
        700000, 12,
        1000000, 15
      ]
      ],
      'circle-stroke-color': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        [
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
        '#000000'
      ],
      'circle-stroke-width': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        1.5,
        0
      ],
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
      'circle-opacity': [
        'case',
        ['boolean',
          ['feature-state', 'hover'],
          false
        ],
        1,
        0.7
      ]
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
        // insert the previous month into the range slider:
        document.getElementById('previous-month').innerText = months[window['month']-2];

        if (window['month'] > 1) {
          $( "#slider-perc-range" ).slider("enable");
          $( "#slider-perc-range" ).slider( "values", 0, -100 );
          $( "#slider-perc-range" ).slider( "values", 1, 100 );
          $('#range-filter-content').css('color', 'black');
        }
        else if (window['month'] === 1) {
          $( "#slider-perc-range" ).slider("disable");
          document.getElementById('previous-month').innerText = '--';
          $('#range-filter-content').css('color', '#808080');
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
        $('#lower-range-limit').text(ui.values[0]+'%')
        $('#upper-range-limit').text(ui.values[1]+'%')

        //if range slider is used, set text in refresh button to 'Reset range filter':
        $('#refresh-button').text('Reset Range Filter')
      }
    });
  })

  //$(".outlier-checkbox").checkboxradio({}); not sure why this is not working...

  //NOT WORKING, maybe change this to a button with active/non active state, to match the entries/exits buttons
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
      document.getElementById('active-month').innerText = 'January';
      document.getElementById('previous-month').innerText = '--';
      map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], 1]);
      map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], 1]);
      $('#range-filter-content').css('color', '#808080');
    }
    else if ($('#refresh-button').text() === 'Reset Range Filter') {
      $( "#slider-perc-range" ).slider( "values", 0, -100 );
      $( "#slider-perc-range" ).slider( "values", 1, 100 );
      map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]);
      map.setFilter('exits-layer', ['==', ['number', ['get', 'month']], window['month']]);
      $('#lower-range-limit').text('-100%')
      $('#upper-range-limit').text('100%')
      $('#refresh-button').text('Refresh Timeline')
    }
  })

  // Create a popup, but don't add it to the map yet.
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });
  // CHECK IF RIGHT: Use this to check the feature ID of the hovered feature
  var stationID = null;

  map.on('mousemove', function(e) {
      //query for the features under the mouse in both layers:
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['entries-layer', 'exits-layer'],
      });

    // Check whether features exist
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer'; //change cursor to pointer if hovering over a circle/feature

      var hoveredFeature = features[0];
      var station_name = hoveredFeature.properties.stop_name;

      if (hoveredFeature.layer.id === 'entries-layer') {
        var num_entries = hoveredFeature.properties.entries;
        var perc_change_entries = hoveredFeature.properties.perc_change_entries
        var popupContent = `
          <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${num_entries} entries</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_entries}% change from __</div>
        `;
        //fix the position of the popup as the position of the circle:
        popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent).addTo(map);
      } else if (hoveredFeature.layer.id === 'exits-layer') {
          var num_exits = hoveredFeature.properties.exits;
          var perc_change_exits = hoveredFeature.properties.perc_change_exits
          var popupContent2 = `
            <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${num_exits} exits</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_exits}% change from __</div>
          `;
          //fix the position of the popup as the position of the circle:
          popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent2).addTo(map);
        }

      // If stationID for the hovered feature is not null,
      // use removeFeatureState to reset to the default behavior
      if (stationID) {
        map.removeFeatureState({
          source: 'activity-data',
          id: stationID
        });
      }

      stationID = hoveredFeature.id;

      // When the mouse moves over the earthquakes-viz layer, update the
      // feature state for the feature under the mouse
      map.setFeatureState({
        source: 'activity-data',
        id: stationID
      }, {
        hover: true
      });

    } else { //if len(features) <1
        // remove the Popup and change back to default cursor
        popup.remove();
        map.getCanvas().style.cursor = '';
      }
  });

})
