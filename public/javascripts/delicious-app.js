import '../sass/style.scss';

// shortcuts for document.querySelector and addEventListener
import { $, $$ } from './modules/bling';

// autocompletes lat/lng from an address
import autocomplete from './modules/autocomplete';

import typeAhead from './modules/typeAhead';

autocomplete( $('#address'), $('#lat'), $('#lng') );
typeAhead( $('.search') );