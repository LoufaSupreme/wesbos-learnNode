import '../sass/style.scss';

// shortcuts for document.querySelector and addEventListener
import { $, $$ } from './modules/bling';

// autocompletes lat/lng from an address
import autocomplete from './modules/autocomplete';

// for generating a search bar dropdown menu
import typeAhead from './modules/typeAhead';

// for making a google map
import makeMap from './modules/map';

// for hearting stores
import ajaxHeart from './modules/hearts'

autocomplete( $('#address'), $('#lat'), $('#lng') );

typeAhead( $('.search') );

makeMap( $('#map') );

// $$ is document.querySelectorAll from bling.js
const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);