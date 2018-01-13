import mapboxgl from 'mapbox-gl';
import React from 'react';
import ReactDOM from 'react-dom';

mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

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
    // var restaurants = require('./restaurants.json');

    const map = new mapboxgl.Map({
      container: this.mapContainer,
      style: 'mapbox://styles/mapbox/streets-v9',
      center: [lng, lat],
      zoom: 13
      // data: restaurants
    });
  
  // restaurants.features.forEach(function(marker, i) {
  //   var el = document.createElement('div'); // Create an img element for the marker
  //   el.id = 'marker-' + i;
  //   el.className = 'marker';
  //   // Add markers to the map at all points
  //   new mapboxgl.Marker(el, { offset: [-28, -46] })
  //     .setLngLat(marker.geometry.coordinates)
  //     .addTo(map);

  //   // el.addEventListener('click', function(e) {
  //   //   flyToStore(marker); // Fly to the point
  //   //   createPopUp(marker); // Close all other popups and display popup for clicked store
  //   //   var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)

  //   //   e.stopPropagation();
  //   //   if (activeItem[0]) {
  //   //     activeItem[0].classList.remove('active');
  //   //   }

  //   //   var listing = document.getElementById('listing-' + i);
  //   //   listing.classList.add('active');
  //   // });
  // });

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
      .setHTML('<h3>Sweetgreen</h3>' +
        '<h4>' + currentFeature.propertiesaddress + '</h4>')
      .addTo(map);
  }
    // buildLocationList(restaurants); // Initialize the list

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
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>
        <div ref={el => this.mapContainer = el} className="absolute top right left bottom" />
      </div>
    );
  }
}

// function buildLocationList(data) {
//     for (i = 0; i < data.features.length; i++) {
//       var currentFeature = data.features[i];
//       var prop = currentFeature.properties;

//       var listings = document.getElementById('listings');
//       var listing = listings.appendChild(document.createElement('div'));
//       listing.className = 'item';
//       listing.id = 'listing-' + i;

//       var link = listing.appendChild(document.createElement('a'));
//       link.href = '#';
//       link.className = 'title';
//       link.dataPosition = i;
//       link.innerHTML = propaddress;

//       var details = listing.appendChild(document.createElement('div'));
//       details.innerHTML = propcity;
//       if (prop.phone) {
//         details.innerHTML += ' &middot; ' + propphoneFormatted;
//       }

//       // Add rounded distance here

//       link.addEventListener('click', function(e) {
//         var clickedListing = data.features[this.dataPosition]; // Update the currentFeature to the store associated with the clicked link
//         flyToStore(clickedListing); // Fly to the point
//         createPopUp(clickedListing); // Close all other popups and display popup for clicked store
//         var activeItem = document.getElementsByClassName('active'); // Highlight listing in sidebar (and remove highlight for all other listings)
//         if (activeItem[0]) {
//           activeItem[0].classList.remove('active');
//         }
//         this.parentNode.classList.add('active');
//       });
//     }
//   }



ReactDOM.render(<Application />, document.getElementById('app'));
