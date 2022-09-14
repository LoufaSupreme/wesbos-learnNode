
// google API autocomplete address input
function autocomplete(input, latInput, lngInput) {
    if(!input) return // skip if theres no address
    const dropdown = new google.maps.places.Autocomplete(input);  // uses google api which is linked in a script tag on layout.pug

    dropdown.addListener('place_changed', () => {
        const place = dropdown.getPlace();
        latInput.value = place.geometry.location.lat();
        lngInput.value = place.geometry.location.lng();
    })

    // if someone hits enter on address field, don't submit the form
    // the below is shorthand for addEventListener, b/c we have the "bling" module
    input.on('keydown', (e) => {
        if(e.keyCode === 13) e.preventDefault();
    })
}

export default autocomplete