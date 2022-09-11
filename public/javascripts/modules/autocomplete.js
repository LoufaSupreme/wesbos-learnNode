function autocomplete(input, latInput, lngInput) {
    if(!input) return // skip if theres no address
    const dropdown = new google.maps.places.Autocomplete(input);  // uses google api which is linked in a script tag on layout.pug

    dropdown.addListeners('place_changed', () => {
        const place = dropdown.getPlace();
        console.log(place);
    })
}

export default autocomplete