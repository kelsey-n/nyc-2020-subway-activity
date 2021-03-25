// Set mapbox gl access token:
mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// Load google charts
google.charts.load('current', {'packages':['corechart']});



// This function will open the side navigation menu when user clicks on any of the floating menu buttons
// and populate the menu with text relevant to the button that was clicked
function openNav() {
  // Set the width of the side navigation to be viewable at 250px, and set the left margin of the page content to 250px to shift page content over
  document.getElementById("sidenav-menu").style.width = "250px";
  document.getElementById("grid-container").style.marginLeft = "250px";
  document.getElementById("legend-controls").style.left = "400px";
  document.getElementById("sidenav-buttons").style.left = "250px";
  $('.sidenav-button').click(function() {
    var button_id = $(this).attr('id') //pull out the id name of the clicked sidenav button
    var menu_text = $(`#${button_id}-text`).text(); //get the menu text for the clicked button
    $(".sidenav-menu-text").text(menu_text); //populate the sidenav menu with the appropriate text
    // TO DO: style the clicked button here:
  });
  document.getElementById("line-chart-div").style.width = "0"; //having both sidenav and linechart open at same time would be too cluttered
}

// Set the width of the side navigation to 0 and the left margin of the page content to 0
function closeNav() {
  document.getElementById("sidenav-menu").style.width = "0";
  document.getElementById("grid-container").style.marginLeft = "0";
  document.getElementById("legend-controls").style.left = "150px";
  document.getElementById("sidenav-buttons").style.left = "0px";
}

function closeChart() {
  document.getElementById("line-chart-div").style.width = "0";
  popup_click.remove();
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

  openNav(); //load welcome message on load

  // add geojson source for subway routes
  map.addSource('nyc-subway-routes', {
    type: 'geojson',
    data: 'data/nycsubwayroutes.geojson'
  });

  // TESTING: diff color for subway routes
  // map.addLayer({
  //   'id': 'subway-routes-layer',
  //   'type': 'line',
  //   'source': 'nyc-subway-routes',
  //   'layout': {
  //     'visibility': 'visible'
  //   },
  //   'paint': {
  //     'line-color': 'white'
  //   }
  // })

  // add layers by iterating over the styles in the array defined in subway-layer-styles.js
  subwayLayerStyles.forEach((style) => {
    map.addLayer(style)
  })

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
          'interpolate', ['linear'],
          ['get', 'entries'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
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
      'circle-opacity': 0.75
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
          'interpolate', ['linear'],
          ['get', 'exits'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
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
      'circle-opacity': 0.75
    },
    'filter': ['==', ['number', ['get', 'month']], 1]
  })

  // add an empty data source, which we will use to highlight the station that the user is hovering over in the entries layer
  map.addSource('highlight-feature-entries', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the highlighted station in the entries layer
  map.addLayer({
    id: 'highlight-station-entries',
    type: 'circle',
    source: 'highlight-feature-entries',
    paint: {
      'circle-radius': [
          'interpolate', ['linear'],
          ['get', 'entries'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      'circle-stroke-color': [
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
      'circle-stroke-width': 1.5, //stroke color and stroke width give the effect of the circle becoming slightly larger upon hovering
    },
    'circle-opacity': 1
  });

  // add an empty data source, which we will use to highlight the station that the user is hovering over in the exits layer
  map.addSource('highlight-feature-exits', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the highlighted station in the exits layer
  map.addLayer({
    id: 'highlight-station-exits',
    type: 'circle',
    source: 'highlight-feature-exits',
    paint: {
      'circle-radius': [
          'interpolate', ['linear'],
          ['get', 'exits'],
          1000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      'circle-stroke-color': [
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
      'circle-stroke-width': 1.5, //stroke color and stroke width give the effect of the circle becoming slightly larger upon hovering
    },
    'circle-opacity': 1
  });

  // TESTING: add an empty invisible source to filter the activity data for complex_id of the clicked station (to get data for chart)
  map.addLayer({
    'id': 'invisible-layer-for-querying',
    'type': 'circle',
    'source': 'activity-data',
    'layout': {
      'visibility': 'none'
    },
  });


  $('#exits-button').click(function () {
    $('#entries-button').removeClass('active');
    $('#exits-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','none');
    map.setLayoutProperty('exits-layer', 'visibility','visible');
    closeChart();
  })

  $('#entries-button').click(function () {
    $('#exits-button').removeClass('active');
    $('#entries-button').addClass('active');
    map.setLayoutProperty('entries-layer', 'visibility','visible');
    map.setLayoutProperty('exits-layer', 'visibility','none');
    closeChart();
  })


  window['month'] = 1;

  $(function() {
    $( "#slider-month" ).slider({
      'min': 1,
      'max': 12,
      'slide': function(event,ui) {
        closeChart();
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

        closeChart();
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
      window['month'] = 1; //to reset popup content
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
      var station_lines = hoveredFeature.properties.daytime_routes;
      var id = hoveredFeature.id;

      // If we are in the entries layer:
      if (hoveredFeature.layer.id === 'entries-layer') {
        var num_entries = hoveredFeature.properties.entries;
        var perc_change_entries = hoveredFeature.properties.perc_change_entries
        if (window['month'] == 1) {
          window['popupContent'] = `
            <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
            <div style = "font-family:sans-serif; font-size:11px; font-weight:600">(${station_lines})</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_entries).format('0,0')} entries</div>
          `;
        } else {
          window['popupContent'] = `
            <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
            <div style = "font-family:sans-serif; font-size:11px; font-weight:600">(${station_lines})</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_entries).format('0,0')} entries</div>
            <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_entries}% change from ${months[window['month']-2]}</div>
          `;
        };

        //fix the position of the popup as the position of the circle:
        popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent).addTo(map);
        //create and populate a feature with the properties of the hoveredFeature
        var hoveredFeature_data = {
          'type': 'Feature',
          'geometry': hoveredFeature.geometry,
          'properties': {
            'entries': num_entries,
            'line_color': hoveredFeature.properties.line_color
          },
        };
        // set this circle's geometry and properties as the data for the highlight source
        map.getSource('highlight-feature-entries').setData(hoveredFeature_data);

      } else if (hoveredFeature.layer.id === 'exits-layer') {
          var num_exits = hoveredFeature.properties.exits;
          var perc_change_exits = hoveredFeature.properties.perc_change_exits
          if (window['month'] == 1) {
            window['popupContent2'] = `
              <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
              <div style = "font-family:sans-serif; font-size:11px; font-weight:600">(${station_lines})</div>
              <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_exits).format('0,0')} exits</div>
            `;
          } else {
            window['popupContent2'] = `
              <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
              <div style = "font-family:sans-serif; font-size:11px; font-weight:600">(${station_lines})</div>
              <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_exits).format('0,0')} exits</div>
              <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_exits}% change from ${months[window['month']-2]}</div>
            `;
          }

          //fix the position of the popup as the position of the circle:
          popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent2).addTo(map);

          //create and populate a feature with the properties of the hoveredFeature
          var hoveredFeature_data = {
            'type': 'Feature',
            'geometry': hoveredFeature.geometry,
            'properties': {
              'exits': num_exits,
              'line_color': hoveredFeature.properties.line_color
            },
          };
          // set this circle's geometry and properties as the data for the highlight source
          map.getSource('highlight-feature-exits').setData(hoveredFeature_data);
        }

    } else { //if len(features) <1
        // remove the Popup and change back to default cursor
        popup.remove();
        map.getCanvas().style.cursor = '';
        map.getSource('highlight-feature-entries').setData({
          'type': 'FeatureCollection',
          'features': []
        });
        map.getSource('highlight-feature-exits').setData({
          'type': 'FeatureCollection',
          'features': []
        });
      }
  });

  // Create a popup for the click action, but don't add it to the map yet.
  window['popup_click'] = new mapboxgl.Popup({
    closeOnClick: false
  });

  map.on('click', 'entries-layer', function(e) {
    closeNav(); //having both sidenav and linechart open at the same time would be too cluttered

    // get the clicked station's complex_id by querying the rendered features
    var features = map.queryRenderedFeatures(e.point, {
        layers: ['entries-layer'],
    });
    var clickedFeature = features[0]
    var clickedStation = clickedFeature.properties.stop_name
    // then get all clicked station's data by querying the source features for all months' data for that complex_id
    var clickedFeature_queryResults = map.querySourceFeatures('activity-data', {
      filter: ['==', ['number', ['get', 'complex_id']], clickedFeature.properties.complex_id]
    });
    // querysourcefeatures sometimes returns dupes because of tile set characteristics, so take the first 12 to get each month only once:
    var clickedFeature_data = clickedFeature_queryResults.slice(0,12)

    // subwayactivitydata.geojson is sorted by complex_id asc then month ascending
    // checked: every complex id has 12 months (12 entries in the data) and every month has 426 complex ids, so data valid for this graphing
    // querysourcefeatures seems to always return the features in the order that they appear in the data source
    // so we can assume that the first feature in clickedFeature_data is for month 1, etc.

    // Create an array with the average number of entries per month for all stations and clicked station's entries per month:
    var avg_entries = [
      ['Month', 'All', 'This'],
      ['Jan', 324129, clickedFeature_data[0].properties.entries],
      ['Feb', 303832, clickedFeature_data[1].properties.entries],
      ['Mar', 172456, clickedFeature_data[2].properties.entries],
      ['Apr', 28642, clickedFeature_data[3].properties.entries],
      ['May', 36865, clickedFeature_data[4].properties.entries],
      ['Jun', 56228, clickedFeature_data[5].properties.entries],
      ['Jul', 74855, clickedFeature_data[6].properties.entries],
      ['Aug', 79574, clickedFeature_data[7].properties.entries],
      ['Sep', 95799, clickedFeature_data[8].properties.entries],
      ['Oct', 106166, clickedFeature_data[9].properties.entries],
      ['Nov', 95193, clickedFeature_data[10].properties.entries],
      ['Dec', 77912, clickedFeature_data[11].properties.entries]
    ]

    google.charts.setOnLoadCallback(drawChart);

    // Draw the chart
    function drawChart() {
      var data = google.visualization.arrayToDataTable(avg_entries);

      // Optional; add a title and set the width and height of the chart
      var options = {
        'title': `Average Entries (All Stations), Total Entries (${clickedStation})`,
        'titleTextStyle': {
            'color': 'white'
        },
        'width':600,
        'height':'35%',
        'backgroundColor': '#585858', //'#F5F5F5', //'transparent',
        'vAxis': {
          'gridlines': {
                'color': 'black'
          },
          'textStyle': {
            'color': 'white'
          }
        },
        'hAxis': {
          'textStyle': {
            'color': 'white'
          }
        },
        'series': {
          0: {color: 'white', lineWidth: 4},
          1: {color: 'white', lineDashStyle: [10, 2]}
        },
        'legend': {
          'textStyle': {
            'color': 'white'
          }
        }
      };

      // Display the chart inside the div element with id='line-chart'
      var chart = new google.visualization.LineChart(document.getElementById('line-chart'));
      chart.draw(data, options);
    }

    // Show the line chart here:
    document.getElementById("line-chart-div").style.width = "600px";

    popup_click.setLngLat(clickedFeature.geometry.coordinates).setHTML(window['popupContent']).addTo(map)

  });



})
