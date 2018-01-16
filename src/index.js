import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from 'mapbox-gl-geocoder';
import turf from 'turf';
import turf_circle from '@turf/circle';
import debounce from 'debounce';
import * as turf_extent from 'turf-extent';
import FilterList from './filterList';
import CircleTool from './circleTool';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';


const layerName = 'lyrRes'; // restaurant layer

var map;

// for list and filtered list
var filterEl = document.getElementById('feature-filter');
var listingEl = document.getElementById('feature-listing');

// Holds visible restaurant features for filtering
var restaurants = [];


class Application extends React.Component {

  constructor(props: Props) {
    super(props);
    this.state = {
      circleActive: true,
      circleCenter: null,
      error: false
    };
    this.handleMapUpdate = this.handleMapUpdate.bind(this);

  }


  componentDidMount() {

    // read restaurant info from geojson file
    var res = require('./restaurants1.json');
    map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9'
    });
    addGeocoder();
    addNavTool();

    map.on('load', function () {

      map.addLayer({
        "id": "lyrRes",
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

      /** end adding circle layer */

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
        if (map.getLayer(layerName)) {
          map.setFilter(layerName, ['in', 'address1'].concat(filtered.map(function (feature) {
            return feature.properties.name;
          })));
        }
      });

      if (res && res.data) {
        renderListings(res.data.features);
      }

      /** Add map event listeners */
      map.on('mousedown', onMouseDown);

      // create featureGroup based on all the markers and zoom to that bbox 
      var bbox = turf_extent(res.data);
      map.fitBounds(bbox, { padding: 70 });

    });

    var onMousemove = function (e) {
      if (this.state.circleCenter) {
        var currPnt = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": "Point",
            "coordinates": [e.lngLat.lng, e.lngLat.lat]
          }
        };

        var circleBuffer;

        var cir_dis = turf.distance(this.state.circleCenter, currPnt, 'kilometers');
        var options = { steps: 60, units: 'kilometers', properties: { foo: 'bar' } };
        if (cir_dis && cir_dis > 0) {
          circleBuffer = turf_circle(this.state.circleCenter, cir_dis, options);
          var addToMap = [turf.point(this.state.circleCenter.geometry.coordinates), circleBuffer];
          map.getSource('circle-2').setData(turf.featureCollection(addToMap));
        } else {
          console.log("0 distance to center");
          return;
        }
      }

      /** Start spatial search of restaurants within the circle */
      var resFeatures = map.queryRenderedFeatures({ layers: [layerName] });

      if (circleBuffer) {
        var resInCircle = resFeatures.filter(element => turf.inside(element, circleBuffer) === true);

        // update resaurant list for the restaurants in the current circle
        var uniqueFeatures = getUniqueFeatures(resInCircle, 'name');
        renderListings(uniqueFeatures);
        restaurants = uniqueFeatures;
      }
    }  // end onMousemove

    onMousemove = onMousemove.bind(this);

    var onMouseUp = function (e) {
      if (this.state.circleCenter) {
        this.state.circleCenter = null;
      }
      // set back cursor
      map.getCanvas().style.cursor = '';

    }

    onMouseUp = onMouseUp.bind(this);


    var onMouseDown = function (e) {

      if (this.state && !this.state.circleActive) {
        return;
      }

      var center = [e.lngLat.lng, e.lngLat.lat];
      var radius = 0.1;
      var options = { steps: 60, units: 'kilometers', properties: { foo: 'bar' } };
      var circleBuffer = turf_circle(center, radius, options);

      this.state.circleCenter = {
        "type": "Feature",
        "properties": {},
        "geometry": {
          "type": "Point",
          "coordinates": [e.lngLat.lng, e.lngLat.lat]
        }
      };
      //addToMap
      var addToMap = [turf.point(center), circleBuffer];
      map.getSource('circle-2').setData(turf.featureCollection(addToMap));


      map.on('mousemove', debounce(onMousemove, 16));
      map.once('mouseup', onMouseUp);

      // change pointer to crosshair
      map.getCanvas().style.cursor = 'crosshair';
    };

    onMouseDown = onMouseDown.bind(this);

    /**
     * Add markers to the map at all points
     */
    var markerArray = [];
    res.data.features.forEach(function (marker, i) {
      var el = document.createElement('div'); // Create an img element for the marker
      el.id = 'marker-' + i;
      el.className = 'marker';

      var resMarker = new mapboxgl.Marker(el, { offset: [0, 0] })
        .setLngLat(marker.geometry.coordinates)
        .addTo(map);

      // add marker to marker array
      markerArray.push(resMarker);

      el.addEventListener('click', function (e) {
        flyToStore(marker); // Fly to the point
        createPopUp(marker); // Close all other popups and display popup for clicked store
        var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)

        e.stopPropagation();
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }

      });
    });


    function addGeocoder() {
      var geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        bbox: [-77.210763, 38.803367, -76.853675, 39.052643]
      });

      map.addControl(geocoder, 'top-left');
    }

    function addNavTool() {
      var nav = new mapboxgl.NavigationControl();
      map.addControl(nav, 'top-right');
    }

    function flyToStore(currentFeature) {
      map.flyTo({
        center: currentFeature.geometry.coordinates,
        zoom: 15
      });
    }

    function createPopUp(currentFeature) {
      var popUps = document.getElementsByClassName('mapboxgl-popup');
      if (popUps && popUps[0]) popUps[0].remove();

      var popup = new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat(currentFeature.geometry.coordinates)
        .setHTML('<h4>' + currentFeature.properties.name + '</h4>' + '<br>' +
        '<h5>' + currentFeature.properties.address1 + '</h5>')
        .addTo(map);
    }

    var popup = new mapboxgl.Popup({
      closeButton: false
    });

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
          var item = document.createElement('div');
          // item.href = '#';
          item.className = 'col-lg-4 mb-4';
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

          var itemCard = document.createElement('div');
          itemCard.className = 'card h-100';

          var itemHeader = document.createElement('div');
          itemHeader.className = 'card-header d-flex justify-content-end';
          itemHeader.innerHTML = '<div class="mr-auto p-2"><h2>' + prop.name + '</h2></div>' + returnRating(prop.rating);
          itemCard.appendChild(itemHeader);

          var itemContent = document.createElement('div');
          itemContent.className = 'card-body';
          itemContent.innerHTML = '<h3>' + prop.address1 + '<br>' + prop.address2 + '<br>' + feature.geometry.coordinates[1] + ', ' + feature.geometry.coordinates[0] + '</h3>';
          itemCard.appendChild(itemContent);

          item.appendChild(itemCard);

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
        if (map.getLayer(layerName)) {
          map.setFilter(layerName, ['has', 'name']);
        }
      }
    }

    /**
     * Based on the rateNum return the star(s)
     * @param {*} rateNum 
     */
    function returnRating(rateNum) {
      // return <starRate {...rateNum} ></starRate>;
      var theRate = '<div class="p-2">';
      for (var i = 0; i < rateNum; i++) {
        theRate += '<Image src="img/star_16.png" />';
      }
      theRate += '</div>'
      return theRate;


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
        var uniqueFeatures = getUniqueFeatures(features, "name");
        // Populate features for the listing overlay.
        renderListings(uniqueFeatures);

        // Clear the input container
        filterEl.value = '';

        // Store the current features in sn `lyrRes` variable to
        // later use for filtering on `keyup`.
        restaurants = uniqueFeatures;
      }
    }

    map.on('moveend', function () {
      getFeaturesFromLayer(layerName);
    });
  }

  /** based on CURRENT circle active status, clear map or set data for circle drawing */
  handleMapUpdate(cirActive) {
    if (cirActive) {
      // change to unactivate
      // set source data as a null geojson object
      map.getSource('circle-2').setData({
        type: 'FeatureCollection',
        features:
        [{
          type: 'Feature',
          properties: {},
          geometry: null
        }]
      });

      map.dragPan.enable();
      map.scrollZoom.enable();
      this.state.circleActive = false;
    } else {
      // change to activate
      map.dragPan.disable();
      map.scrollZoom.disable();
      this.state.circleActive = true;
    }
  }

  /** clear the circle on map - if any */
  handleMapClear() {
    // set source data as a null geojson object
    map.getSource('circle-2').setData({
      type: 'FeatureCollection',
      features:
      [{
        type: 'Feature',
        properties: {},
        geometry: null
      }]
    });
  }

  unstable_handleError() {
    console("error occurs!")
    this.setState({ error: true })
  }

  render() {

    return (

      <div>
        <CircleTool map={map} updateMapByCir={this.handleMapUpdate} updateMapByClear={this.handleMapClear} ></CircleTool>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />

      </div>
    );
  }
}





ReactDOM.render(<Application />, document.getElementById('app'));
