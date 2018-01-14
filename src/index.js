import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from 'mapbox-gl-geocoder';
import turf from 'turf';
import turf_circle from '@turf/circle';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
// import * as d3 from 'd3';
// import circleSelector from "./selector.js";
import Circle from './circle.js';
import turf_inside from '@turf/inside';
import turf_helpers from '@turf/helpers';
import turf_truncate from '@turf/truncate';
import turf_distance from '@turf/distance';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// for list and filtered list
var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');

// Holds visible restaurant features for filtering
var restaurants = [];

// Create a popup, but don't add it to the map yet.
var popup = new mapboxgl.Popup({
  closeButton: false
});


class Application extends React.Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      lng: -77.034084142948,
      lat: 38.909671288923,
      zoom: 1.5
    };
  }



  componentDidMount() {
    const { lng, lat, zoom } = this.state;
    // read restaurant info from geojson file
    var res = require('./restaurants1.json');
    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [lng, lat],
      zoom: 13
    });
    addGeocoder();
    addDrawTools();
    /** start circle exp */
// Setup our svg layer that we can manipulate with d3
    // var container = map.getCanvasContainer()
    // var svg = d3.select(container).append("svg")

    // var active = true;
    // var circleControl = new circleSelector(svg)
    //   .projection(project)
    //   .inverseProjection(function(a) {
    //     return map.unproject({x: a[0], y: a[1]});
    //   })
    //   .activate(active);
    
    // d3.select("#circle").on("click", function() {
    //   active = !active;
    //   circleControl.activate(active)
    //   if(active) {
    //     map.dragPan.disable();
    //   } else {
    //     map.dragPan.enable();
    //   }
    //   d3.select(this).classed("active", active)
    // })
    
    // // Add zoom and rotation controls to the map.
    // map.addControl(new mapboxgl.Navigation());
    
    // function project(d) {
    //   return map.project(getLL(d));
    // }
    // function getLL(d) {
    //   return new mapboxgl.LngLat(+d.lng, +d.lat)
    // }
  
    // d3.csv("dots.csv", function(err, data) {
    //   //console.log(data[0], getLL(data[0]), project(data[0]))
    //   var dots = svg.selectAll("circle.dot")
    //     .data(data)
      
    //   dots.enter().append("circle").classed("dot", true)
    //   .attr("r", 1)
    //   .style({
    //     fill: "#0082a3",
    //     "fill-opacity": 0.6,
    //     stroke: "#004d60",
    //     "stroke-width": 1
    //   })
    //   .transition().duration(1000)
    //   .attr("r", 6)

    //   circleControl.on("update", function() {
    //     svg.selectAll("circle.dot").style({
    //       fill: function(d) {
    //         var thisDist = circleControl.distance(d);
    //         var circleDist = circleControl.distance()
    //         if(thisDist < circleDist) {
    //           return "#ff8eec";
    //         } else {
    //           return "#0082a3"
    //         }
    //       }
    //     })
    //   })
    //   circleControl.on("clear", function() {
    //     svg.selectAll("circle.dot").style("fill", "#0082a3")
    //   })
      
    //   function render() {
    //     dots.attr({
    //       cx: function(d) { 
    //         var x = project(d).x;
    //         return x
    //       },
    //       cy: function(d) { 
    //         var y = project(d).y;
    //         return y
    //       },
    //     })
        
    //     circleControl.update(svg)
    //   }

    //   // re-render our visualization whenever the view changes
    //   map.on("viewreset", function() {
    //     render()
    //   })
    //   map.on("move", function() {
    //     render()
    //   })

    //   // render our initial visualization
    //   render()
    // })

    /** end circle exp */

    map.on('load', function () {

      map.addLayer({
        "id": "res1",
        "type": "symbol",
        "source": res,
        "layout": {
          "icon-image": "{icon}-15",
          "text-field": "{name}",
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [0, 0.6],
          "text-anchor": "top"
        }
      });

      /** add circle layers */

          /** start circle test */
    // Circle Setup

    // var center = [lng, lat];
    // var radius = 3;
    // var units = 'kilometers';
    // var properties = { foo: 'bar' };
    // var mapzoom = 12;

    // var myCircle = new Circle(center, radius, {
    //     units: units,
    //     zoom: mapzoom,
    //     properties: properties
    // });


    //   map.addSource('circle-1', {
    //           type: "geojson",
    //           data: myCircle.asGeojson(),
    //           buffer: 1
    //       });

    //       map.addLayer({
    //           id: "circle-line",
    //           type: "line",
    //           source: "circle-1",
    //           paint: {
    //               "line-color": "#fb6a4a",
    //               "line-width": {
    //                   stops: [
    //                       [0, 0.1],
    //                       [16, 5]
    //                   ]
    //               }
    //           },
    //           filter: ["==", "$type", "Polygon"]
    //       }, 'waterway-label')

    //       map.addLayer({
    //           id: "circle-fill",
    //           type: "fill",
    //           source: "circle-1",
    //           paint: {
    //               "fill-color": "#fb6a4a",
    //               "fill-opacity": 0.5
    //           },
    //           filter: ["==", "$type", "Polygon"]
    //       }, 'waterway-label');

    //       map.addLayer({
    //           id: "circle-control-points",
    //           type: "circle",
    //           source: "circle-1",
    //           paint: {
    //               "circle-color": "white",
    //               "circle-radius": {
    //                   stops: [
    //                       [0, 6],
    //                       [4, 10],
    //                       [18, 12]
    //                   ]
    //               },
    //               "circle-stroke-color": "black",
    //               "circle-stroke-width": {
    //                   stops: [
    //                       [0, 0.1],
    //                       [8,1],
    //                       [16,4]
    //                   ]
    //               }
    //           },
    //           filter: ["all", ["==", "$type", "Point"],
    //               ["!=", "type", "center"]
    //           ]
    //       });

    //       map.addLayer({
    //           id: "circle-center-point",
    //           type: "circle",
    //           source: "circle-1",
    //           paint: {
    //               "circle-color": "#fb6a4a",
    //               "circle-radius": {
    //                   stops: [
    //                       [0, 6],
    //                       [4, 10],
    //                       [18, 12]
    //                   ]
    //               },
    //               "circle-stroke-color": "black",
    //               "circle-stroke-width": {
    //                   stops: [
    //                       [0, 0.1],
    //                       [8,1],
    //                       [16,4]
    //                   ]
    //               }
    //           },
    //           filter: ["all", ["==", "$type", "Point"],
    //               ["==", "type", "center"]
    //           ]
    //       });


      /** end adding circle layers */
      
      /** circle test2 */

      // by default disable pan so circle drawing is on 
      map.dragPan.disable();
      map.scrollZoom.disable();

      //addToMap
      map.addSource('circle-2', {
              type: "geojson",
              data: null,   // no data in the beginning
              buffer: 1
          });

      map.addLayer({
          id: "circle-line1",
          type: "line",
          source: "circle-2",
          paint: {
              "line-color": "#fb6a4a"
          }
      });

      map.addLayer({
          id: "circle-fill1",
          type: "fill",
          source: "circle-2",
          paint: {
              "fill-color": "#fb6a4a",
              "fill-opacity": 0.5
          }
      });

      /** end circle test 2 */

      filterEl.addEventListener('keyup', function (e) {
        var value = normalize(e.target.value);

        // Filter visible features that don't match the input value.
        var filtered = restaurants.filter(function (feature) {
          var name = normalize(feature.properties.name);
          var code = normalize(feature.properties.address1);
          return name.indexOf(value) > -1 || code.indexOf(value) > -1;
        });

        // Populate the sidebar with filtered results
        renderListings(filtered);

        // Set the filter to populate features into the layer.
        map.setFilter('res1', ['in', 'address1'].concat(filtered.map(function (feature) {
          return feature.properties.name;
        })));
      });
      // Call this function on initialization
      // pass json data and render all points
      if (res && res.data)
        renderListings(res.data.features);
    });

    map.on('click', function (e) {
      // alert(e.lngLat.lat);

      // set bbox as 5px reactangle area around clicked point
      var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
      // var features = map.queryRenderedFeatures(bbox, { layers: ['restaurants'] });

      var center = [e.lngLat.lng, e.lngLat.lat];
      var radius = 2;
      var options = {steps: 60, units: 'kilometers', properties: {foo: 'bar'}};
      var circle = turf_circle(center, radius, options);

      //addToMap
      var addToMap = [turf.point(center), circle];
      map.getSource('circle-2').setData(turf.featureCollection(addToMap));
      // map.addSource('circle-2', {
      //         type: "geojson",
      //         data: null, //turf.featureCollection(addToMap),
      //         buffer: 1
      //     });
    });

    /**
     * Add markers to the map at all points
     */
    res.data.features.forEach(function (marker, i) {
      var el = document.createElement('div'); // Create an img element for the marker
      el.id = 'marker-' + i;
      el.className = 'marker';

      new mapboxgl.Marker(el, { offset: [-28, -46] })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);

      el.addEventListener('click', function (e) {
        flyToStore(marker); // Fly to the point
        createPopUp(marker); // Close all other popups and display popup for clicked store
        var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)

        e.stopPropagation();
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }

        // var listing = document.getElementById('listing-' + i);
        // listing.classList.add('active');
      });
    });

    function addGeocoder() {
      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        bbox: [-77.210763, 38.803367, -76.853675, 39.052643]
      });

      map.addControl(geocoder, 'top-left');
    }


    function addDrawTools() {
      var Draw = new MapboxDraw();
      map.addControl(Draw);
    }

    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15
      });
    }

    function createPopUp(currentFeature) {
      var popUps = document.getElementsByClassName('mapboxgl-popup');
      if (popUps[0]) popUps[0].remove();

      var popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h3>' + currentFeature.properties.name + '</h3>' +
        '<h4>' + currentFeature.properties.address1 + '</h4>')
        .addTo(map);
    }

    /**
     * populate restaurant list in the bottom right section
     * @param {*} features 
     */
    function renderListings(features) {
      // Clear any existing listings
      listingEl.innerHTML = '';
      if (features.length) {
        features.forEach(function (feature, i) {
          var prop = feature.properties;
          var item = document.createElement('a');
          item.href = '#';
          item.textContent = prop.name + ' (' + prop.address1 + ')';
          item.dataPosition = i;
          item.addEventListener('mouseover', function () {
            // Highlight corresponding feature on the map
            popup.setLngLat(feature.geometry.coordinates)
              .setText(feature.properties.name + ' (' + feature.properties.address1 + ')')
              .addTo(map);
          });
          item.addEventListener('click', function (e) {
            var clickedListing = features[this.dataPosition]; // Update the currentFeature to the store associated with the clicked link
            flyToStore(clickedListing); // Fly to the point
            createPopUp(clickedListing); // Close all other popups and display popup for clicked store
            var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)
            if (activeItem[0]) {
              activeItem[0].classList.remove('active');
            }
            this.parentNode.classList.add('active');
          });
          listingEl.appendChild(item);
        });

        // Show the filter input
        filterEl.parentNode.style.display = 'block';
      } else {
        var empty = document.createElement('p');
        empty.textContent = 'Drag the map to populate results';
        listingEl.appendChild(empty);

        // Hide the filter input
        filterEl.parentNode.style.display = 'none';

        // remove features filter
        map.setFilter('res1', ['has', 'name']);
      }
    }

    function normalize(string) {
      return string.trim().toLowerCase();
    }

    function getUniqueFeatures(array, comparatorProperty) {
      var existingFeatureKeys = {};
      // Because features come from tiled vector data, feature geometries may be split
      // or duplicated across tile boundaries and, as a result, features may appear
      // multiple times in query results.
      var uniqueFeatures = array.filter(function (el) {
        if (existingFeatureKeys[el.properties[comparatorProperty]]) {
          return false;
        } else {
          existingFeatureKeys[el.properties[comparatorProperty]] = true;
          return true;
        }
      });

      return uniqueFeatures;
    }

    function getFeaturesFromLayer(lyrName) {
      var features = map.queryRenderedFeatures({ layers: [lyrName] });

      if (features) {
          var uniqueFeatures = getUniqueFeatures(features, "address1");
          // Populate features for the listing overlay.
          renderListings(uniqueFeatures);

          // Clear the input container
          filterEl.value = '';

          // Store the current features in sn `res1` variable to
          // later use for filtering on `keyup`.
          restaurants = uniqueFeatures;
      }
    }

    map.on('moveend', function () {
      getFeaturesFromLayer('res1');
    });

    map.on('move', () => {
      const { lng, lat } = map.getCenter();

      this.setState({
        lng: lng.toFixed(4),
        lat: lat.toFixed(4),
        zoom: map.getZoom().toFixed(2)
      });
    });
  }



  render() {
    const { lng, lat, zoom } = this.state;

    return (
      <div>
        {/*<div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>*/}
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />

      </div>
    );
  }
}





ReactDOM.render(<Application />, document.getElementById('app'));
