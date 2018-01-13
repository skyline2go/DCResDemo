import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from 'mapbox-gl-geocoder';
import Turf from 'turf';
import MapboxDraw from '@mapbox/mapbox-gl-draw';


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
    buildLocationList(res.data); // Initialize the list
    addGeocoder();
    addDrawTools();
    
    

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

  filterEl.addEventListener('keyup', function(e) {
        var value = normalize(e.target.value);

        // Filter visible features that don't match the input value.
        var filtered = restaurants.filter(function(feature) {
            var name = normalize(feature.properties.name);
            var code = normalize(feature.properties.address1);
            return name.indexOf(value) > -1 || code.indexOf(value) > -1;
        });

        // Populate the sidebar with filtered results
        renderListings(filtered);

        // Set the filter to populate features into the layer.
        map.setFilter('res1', ['in', 'address1'].concat(filtered.map(function(feature) {
            return feature.properties.name;
        })));
    });
    // Call this function on initialization
    // passing an empty array to render an empty state
    renderListings([]);
  });
    
  map.on('click', function(e) {
    // alert(e.lngLat.lat);

     // set bbox as 5px reactangle area around clicked point
    var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
    // var features = map.queryRenderedFeatures(bbox, { layers: ['restaurants'] });

  });

  /**
   * Add markers to the map at all points
   */ 
  res.data.features.forEach(function(marker, i) {
    var el = document.createElement('div'); // Create an img element for the marker
    el.id = 'marker-' + i;
    el.className = 'marker';
    
    new mapboxgl.Marker(el, { offset: [-28, -46] })
      .setLngLat(marker.geometry.coordinates)
      .addTo(map);

    el.addEventListener('click', function(e) {
      flyToStore(marker); // Fly to the point
      createPopUp(marker); // Close all other popups and display popup for clicked store
      var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)

      e.stopPropagation();
      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }

      var listing = document.getElementById('listing-' + i);
      listing.classList.add('active');
    });
  });

  function addGeocoder () {
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
      .setHTML('<h3>'+ currentFeature.properties.name +'</h3>' +
        '<h4>' + currentFeature.properties.address1 + '</h4>')
      .addTo(map);
  }

/**
 * populate location list in the section below
 * @param {*} data 
 */
  function buildLocationList(data) {
    for (let i = 0; i < data.features.length; i++) {
      var currentFeature = data.features[i];
      var prop = currentFeature.properties;

      var listings = document.getElementById('listings');
      var listing = listings.appendChild(document.createElement('div'));
      listing.className = 'item';
      listing.id = 'listing-' + i;

      var link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.dataPosition = i;
      link.innerHTML = 'propaddress';

      var details = listing.appendChild(document.createElement('div'));
      details.innerHTML = 'propcity';
      if (prop.phone) {
        details.innerHTML += ' &middot; ' + 'propphoneFormatted';
      }

      // Add rounded distance here

      link.addEventListener('click', function(e) {
        var clickedListing = data.features[this.dataPosition]; // Update the currentFeature to the store associated with the clicked link
        flyToStore(clickedListing); // Fly to the point
        createPopUp(clickedListing); // Close all other popups and display popup for clicked store
        var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        this.parentNode.classList.add('active');
      });
    }
  }
   
  /**
   * populate restaurant list in the bottom right section
   * @param {*} features 
   */
  function renderListings(features) {
    // Clear any existing listings
    listingEl.innerHTML = '';
    if (features.length) {
        features.forEach(function(feature, i) {
            var prop = feature.properties;
            var item = document.createElement('a');
            item.href = '#';
            item.textContent = prop.name + ' (' + prop.address1 + ')';
            item.dataPosition = i;
            item.addEventListener('mouseover', function() {
                // Highlight corresponding feature on the map
                popup.setLngLat(feature.geometry.coordinates)
                    .setText(feature.properties.name + ' (' + feature.properties.address1 + ')')
                    .addTo(map);
            });
            item.addEventListener('click', function(e) {
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
      var uniqueFeatures = array.filter(function(el) {
          if (existingFeatureKeys[el.properties[comparatorProperty]]) {
              return false;
          } else {
              existingFeatureKeys[el.properties[comparatorProperty]] = true;
              return true;
          }
      });

      return uniqueFeatures;
  }

    map.on('moveend', function() {
      var features = map.queryRenderedFeatures({layers:['res1']});

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
