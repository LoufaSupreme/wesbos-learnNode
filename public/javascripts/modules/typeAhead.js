import axios from 'axios';
// to prevent HTML injection hacks
import dompurify from 'dompurify';

// create an anchor element for each store that comes up in search results
function searchResultsHTML(stores) {
    return stores.map(store => {
        return `
            <a href="/store/${store.slug}" class="search__result">
                <strong>${store.name}</strong>
            </a>
        `
    }).join('');
}

// everytime the user types into the search box, query the db for matching text via our searchStores API route
// then take the results and display them as a dropdown menu under the search box
function typeAhead(search) {
    if (!search) return;
    
    const searchInput = search.querySelector('input[name="search"]');
    const searchResults = search.querySelector('.search__results');

    // on is shortcut for addEventListener from bling.js
    searchInput.on('input', function() {
        if (!this.value) {
            searchResults.style.display = 'none';
            return;
        }

        // show search results and wipe any existing results
        searchResults.style.display = 'block';
        searchResults.innerHTML = "";

        // get search results by fetching our searchStores API route
        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {
                if(res.data.length) {
                    console.log('There are search results to show!');
                    const html = searchResultsHTML(res.data);
                    searchResults.innerHTML = dompurify.sanitize(html);
                }
                else {
                    searchResults.innerHTML = dompurify.sanitize(`<div class="search__result">There are no results for ${this.value}.</div>`);
                }
            })
            .catch(err => {
                console.error(err);
            });
    });

    // handle keyboard inputs (arrow keys to navigate search results dropdown menu)
    searchInput.on('keyup', (e) => {
        // if they aren't pressing up, down or enter, skip:
        if (![38, 40, 13].includes(e.keyCode)) {
            return;
        }

        // find all the search results shown:
        const items = search.querySelectorAll('.search__result');

        // find the search result that is currently active (i.e. hovered over)
        const activeClass = 'search__result--active';
        const current = search.querySelector(`.${activeClass}`);

        // set the next search result to be highlighted based on what key is pressed
        let next;
        // if user pressed down and there is already a highlighted (a.k.a. active) result:
        if (e.keyCode === 40 && current) {
            next = current.nextElementSibling || items[0];  // the or statement lets us loop back to the top if we were already at the bottom result
        }
        // if down but no current active result, set it to the top result
        else if (e.keyCode === 40) {
            next = items[0];
        }
        // if up and active
        else if (e.keyCode === 38 && current) {
            next = current.previousElementSibling || items[items.length - 1];
        }
        // if up and no current
        else if (e.keyCode === 38) {
            next = items[items.length - 1];
        }
        // if ENTER
        else if (e.keyCode === 13 && current.href) {
            window.location = current.href;
            return;
        }

        if (current) {
            current.classList.remove(activeClass);
        }
        next.classList.add(activeClass);
    })
}

export default typeAhead;