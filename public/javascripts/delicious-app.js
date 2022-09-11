import '../sass/style.scss';

// shortcuts for document.querySelector and addEventListener
import { $, $$ } from './modules/bling';

// autocompletes lat/lng from an address
import autocomplete from './modules/autocomplete';

autocomplete( $('#address'), $('#lat'), $('#lng') );