import axios from "axios";
import { $ } from './bling';

const mapOptions = {
    center: { lat: 43.2, lng: -79.8},
    zoom: 11,
}

function loadPlaces(map, lat=43.2, lng=-79.8) {
    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if (!places.length) return alert('no places found!');
            

            // initialize boundaries for the map, so that it zooms in but shows all the markers:
            // these bounds need to be adjusted whenever we add a marker
            const bounds = new google.maps.LatLngBounds();

            // initialize an info box for each marker
            const infoWindow = new google.maps.InfoWindow();

            // create invidiual markers for each store and plot it on the google map:
            const markers = places.map(place => {
                const [placeLng, placeLat] = place.location.coordinates;
                const position = { lat: placeLat, lng: placeLng };
                bounds.extend(position);
                const marker = new google.maps.Marker({
                    map: map,
                    position: position,
                });
                marker.place = place;
                return marker;
            });

            // show infoWindow when someone clicks on a marker:
            // .addListener is google maps API version of addEventListener
            markers.forEach(marker => marker.addListener('click', function() {
                const html = `
                    <div class="popup">
                        <a href="/store/${this.place.slug}">
                            <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
                            <p>${this.place.name} - ${this.place.location.address}</p>
                        </a>
                    </div>
                `;
                infoWindow.close();
                infoWindow.setContent(html);
                infoWindow.open(map, this);
            }));

            // then zoom the map to fit all the markers
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);
        });
}

function makeMap(mapDiv) {
    if(!mapDiv) return;

    //make map
    const map = new google.maps.Map(mapDiv, mapOptions);
    loadPlaces(map)
    const input = $('[name="geolocate"]');
    const autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        loadPlaces(map, place.geometry.location.lat(), place.geometry.location.lng() );
    });
}

export default makeMap;