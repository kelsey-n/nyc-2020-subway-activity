// Set mapbox gl access token:
mapboxgl.accessToken = 'pk.eyJ1Ijoia25hbmFuIiwiYSI6ImNrbDlsMXNmNjI3MnEyb25yYjNremFwYXQifQ.l6loLOR-pOL_U2kzWBSQNQ';

// Load google charts
google.charts.load('current', {'packages':['corechart']});

// This function will open the side navigation menu when user clicks on any of the floating menu buttons
// and populate the menu with text relevant to the button that was clicked
function openNav() {
  // Set the width of the side navigation to be viewable at 250px and move the sidenav buttons over 250px:
  document.getElementById("sidenav-menu").style.width = "250px";
  document.getElementById("sidenav-buttons").style.left = "250px";
  // Depending on which sidenav button was clicked, populate the menu with the relevant text
  $('.sidenav-button').click(function() {
    $('.sidenav-button').removeClass('sidenav-button-active'); //remove styling from any previously selected button
    var button_id = $(this).attr('id') //pull out the id name of the clicked sidenav button
    var menu_text = $(`#${button_id}-text`).html(); //get the menu text and styling for the clicked button
    $(".sidenav-menu-text").html(menu_text); //populate the sidenav menu with the appropriate html
    // style the clicked button:
    $(`#${button_id}`).addClass('sidenav-button-active');
  });
  document.getElementById("line-chart-div").style.width = "0"; //having both sidenav and linechart open at same time would be too cluttered
}

// Function to close the side navigaion
// Set the width of the side navigation to 0 and the left margin of the page content to 0
function closeNav() {
  document.getElementById("sidenav-menu").style.width = "0";
  document.getElementById("sidenav-buttons").style.left = "0px";
  $('.sidenav-button').removeClass('sidenav-button-active');
}

// Function to close the line chart
function closeChart() {
  document.getElementById("line-chart-div").style.width = "0";
  popup_click.remove();
  // clear the data source for clicked features
  map.getSource('highlight-clickedfeature-entries').setData({
    'type': 'FeatureCollection',
    'features': []
  });
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
  showZoom: false
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

  // add layers by iterating over the styles in the array defined in subway-layer-styles.js
  subwayLayerStyles.forEach((style) => {
    map.addLayer(style, "settlement-subdivision-label")
  })

  // add geojson source for ridership data:
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
      'circle-radius': [ //style circle radius based on number of entries at that station
          'interpolate', ['linear'],
          ['get', 'entries'],
          20000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      'circle-color': [ //color circle based on its subway lines going
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
    'filter': ['==', ['number', ['get', 'month']], 1] //default filter on map load is for month 1 (Jan)
  }, "settlement-subdivision-label");

  // add an empty data source, which we will use to highlight the station that the user is hovering over
  map.addSource('highlight-feature-entries', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the hovered station
  map.addLayer({
    id: 'highlight-station-entries',
    type: 'circle',
    source: 'highlight-feature-entries',
    paint: {
      'circle-radius': [ //use same data styling as for original entries layer
          'interpolate', ['linear'],
          ['get', 'entries'],
          20000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      'circle-stroke-color': [ //add circle stroke so hovered station appears slightly larger than original circle
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
      'circle-color': [ //use same data styling as for original entries layer
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

  // add an empty data source, which we will use to highlight the station that the user has clicked on in the entries layer
  map.addSource('highlight-clickedfeature-entries', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: []
    }
  });

  // add a layer for the highlighted station in the entries layer
  map.addLayer({
    id: 'highlight-clickedstation-entries',
    type: 'circle',
    source: 'highlight-clickedfeature-entries',
    paint: {
      'circle-radius': [ //use same data styling as for original entries layer
          'interpolate', ['linear'],
          ['get', 'entries'],
          20000, 2,
          100000, 7,
          500000, 10,
          700000, 12,
          1000000, 15,
        ],
      'circle-stroke-color': 'black', //black circle outline to highlight clicked station
      'circle-color': [ //use same data styling as for original entries layer
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
      'circle-stroke-width': 2, //circle stroke highlights clicked station
    },
    'circle-opacity': 1
  });

  window['month'] = 1; //initial month value is 1 - January

  // Function to adjust the layer's filter based on month slider position
  $(function() {
    $( "#slider-month" ).slider({
      'min': 1,
      'max': 12,
      'slide': function(event,ui) {
        closeChart(); //close line chart, if open
        window['month'] = parseInt(ui.value); //get the month value from the slider
        map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]); //set layer filter for that month

        // Since sliding the month-slider automatically removes the range filter (if any), set button text to 'refresh timeline' and reset range limits:
        $('#refresh-button').text('Refresh Timeline');
        $('#lower-range-limit').text('-100%');
        $('#upper-range-limit').text('100%');

        // represent the month in text here using global months variable:
        document.getElementById('active-month').innerText = months[window['month']-1];
        // insert the previous month into the range slider:
        document.getElementById('previous-month').innerText = months[window['month']-2];

        if (window['month'] > 1) { //if month slider is not Jan: enable range slider and set initial values to -100% and 100%
          $( "#slider-perc-range" ).slider("enable");
          $( "#slider-perc-range" ).slider( "values", 0, -100 );
          $( "#slider-perc-range" ).slider( "values", 1, 100 );
          $('#range-filter-content').css('color', 'black'); //style enabled slider
        } else if (window['month'] === 1) { //if month slider is Jan: disable range slider because percentage change not valid for Jan
            $( "#slider-perc-range" ).slider("disable");
            document.getElementById('previous-month').innerText = '--';
            $('#range-filter-content').css('color', '#808080'); //style enabled slider
          }

      }
    });
  });

  // Function to adjust layer filter based on range slider's position
  $(function() {
    $( "#slider-perc-range" ).slider({
      'disabled': true, //disabled by default since default month is Jan
      'min': -100,
      'max': 100,
      'step': 1,
      'range': true,
      'values': [-100,100], //initial values for each handle of the range slider
      'slide': function(event,ui) {
        // set the current filter to include only those stations that fall within the slider handles' values
        map.setFilter('entries-layer', ['all',
                                        ['==', ['number', ['get', 'month']], window['month']],
                                        ['<=', ['number', ['get', 'perc_change_entries']], ui.values[1]],
                                        ['>=', ['number', ['get', 'perc_change_entries']], ui.values[0]]
                                      ]);

        closeChart(); //close line chart if sliding range filter
        $('#lower-range-limit').text(ui.values[0]+'%') //set text value of handle's position
        $('#upper-range-limit').text(ui.values[1]+'%') //set text value of handle's position

        //if range slider is used, set text in refresh button to 'Reset range filter':
        $('#refresh-button').text('Reset Range Filter')
      }
    });
  })

  // Function to reset the layer filter when user clicks reset/refresh button
  $('#refresh-button').click(function () {
    closeChart();
    if ($('#refresh-button').text() === 'Refresh Timeline') {
      $( "#slider-month" ).slider("value", 1); //reset the slider
      $( "#slider-perc-range" ).slider("disable");
      document.getElementById('active-month').innerText = 'January'; //reset text in map controls
      document.getElementById('previous-month').innerText = '--';
      window['month'] = 1; //to reset popup content
      map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], 1]); //reset filter on the map
      $('#range-filter-content').css('color', '#808080');
    } else if ($('#refresh-button').text() === 'Reset Range Filter') {
        $( "#slider-perc-range" ).slider( "values", 0, -100 ); //reset the slider
        $( "#slider-perc-range" ).slider( "values", 1, 100 );
        map.setFilter('entries-layer', ['==', ['number', ['get', 'month']], window['month']]); //reset filter on the map
        $('#lower-range-limit').text('-100%'); //reset text in map controls
        $('#upper-range-limit').text('100%');
        $('#refresh-button').text('Refresh Timeline')
      }
  })

  // Create a popup, but don't add it to the map yet. This will be the hover popup
  var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });

  // Function to query rendered features for the station the user is hovering over, then populate popup with that station's info
  map.on('mousemove', function(e) {
      //query for the features under the mouse:
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['entries-layer'],
      });

    // Check whether features exist
    if (features.length > 0) {
      map.getCanvas().style.cursor = 'pointer'; //change cursor to pointer if hovering over a circle/feature

      var hoveredFeature = features[0];
      //Extract necessary variables:
      var station_name = hoveredFeature.properties.stop_name;
      var station_lines = [hoveredFeature.properties.daytime_routes];
      var num_entries = hoveredFeature.properties.entries;
      var perc_change_entries = hoveredFeature.properties.perc_change_entries

      if (window['month'] == 1) { //popup for Jan should not include percentage change value
        //popup variable is global so we can access it in the click station function below
        window['popupContent'] = `
          <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
          <div style = "font-family:sans-serif; font-size:11px; font-weight:600">Lines: ${station_lines}</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_entries).format('0,0')} entries</div>
        `;
      } else { //months besides Jan should include perc change value
        // dynamically populate the percentage change string for the popup using arrows to indicate whether an increase/decrease happened from prev month
        if (perc_change_entries < 0) {
          var perc_change_entries_string = `<i class="fas fa-arrow-down"></i> ${perc_change_entries*-1}% from ${months[window['month']-2]}`
        } else if (perc_change_entries > 0) {
          var perc_change_entries_string = `<i class="fas fa-arrow-up"></i> ${perc_change_entries}% from ${months[window['month']-2]}`
        } else {
          var perc_change_entries_string = `No change from ${months[window['month']-2]}`
        }
        //popup variable is global so we can access it in the click station function below
        window['popupContent'] = `
          <div style = "font-family:sans-serif; font-size:14px; font-weight:bold">${station_name}</div>
          <div style = "font-family:sans-serif; font-size:11px; font-weight:600">Lines: ${station_lines}</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${numeral(num_entries).format('0,0')} entries</div>
          <div style = "font-family:sans-serif; font-size:12px; font-weight:600">${perc_change_entries_string}</div>
        `;
      };

      //fix the position of the popup as the position of the circle:
      popup.setLngLat(hoveredFeature.geometry.coordinates).setHTML(popupContent).addTo(map);
      //create and populate a feature with the properties of the hoveredFeature necessary for data-driven styling of the highlight layer
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

      } else { //if len(features) <1
        // remove the Popup, change back to default cursor and clear data from the highlight data source
        popup.remove();
        map.getCanvas().style.cursor = '';
        map.getSource('highlight-feature-entries').setData({
          'type': 'FeatureCollection',
          'features': []
        })
      }
  });

  // Create a popup for the click action, but don't add it to the map yet. Global var so we can close it in the closeChart() function
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
    // then get all clicked station's data by querying the source data for all months' data for that complex_id
    var clickedFeature_queryResults = map.querySourceFeatures('activity-data', {
      filter: ['==', ['number', ['get', 'complex_id']], clickedFeature.properties.complex_id]
    });
    // querysourcefeatures sometimes returns dupes because of tile set characteristics, so take the first 12 to get each month only once:
    var clickedFeature_data = clickedFeature_queryResults.slice(0,12)

    // Validation:
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

      // add chart formatting
      var options = {
        'title': `Average Entries (All Stations), Total Entries (This Station: ${clickedStation})`,
        'titleTextStyle': {
            'color': 'white'
        },
        'width':600,
        'height':250,
        'backgroundColor': '#585858',
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
          1: {color: 'yellow', lineDashStyle: [10, 2]}
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

    //create and populate a feature with the properties of the clickedFeature
    var clickedFeature_highlightData = {
      'type': 'Feature',
      'geometry': clickedFeature.geometry,
      'properties': {
        'entries': clickedFeature.properties.entries,
        'line_color': clickedFeature.properties.line_color
      },
    };
    // set this circle's geometry and properties as the data for the clicked highlight source
    map.getSource('highlight-clickedfeature-entries').setData(clickedFeature_highlightData);

    popup_click.setLngLat(clickedFeature.geometry.coordinates).setHTML(window['popupContent']).addTo(map)

  });

})
