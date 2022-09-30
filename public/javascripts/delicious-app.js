import '../sass/style.scss';

// shortcuts for document.querySelector and addEventListener
import { $, $$ } from './modules/bling';

// autocompletes lat/lng from an address
import autocomplete from './modules/autocomplete';

// for generating a search bar dropdown menu
import typeAhead from './modules/typeAhead';

// for making a google map
import makeMap from './modules/map';

autocomplete( $('#address'), $('#lat'), $('#lng') );

typeAhead( $('.search') );

makeMap( $('#map') );