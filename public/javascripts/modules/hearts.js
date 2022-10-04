import axios from 'axios';
import { $ } from './bling';

// send data to the db via a fetch call and update the DOM
function ajaxHeart(e) {
    e.preventDefault();
    console.log('Heart that store!');
    axios
        .post(this.action) // this = the heart form of the store. this.action is the URL to POST to
        .then(res => {
            // toggle the class on the heart button
            const isHearted = this.heart.classList.toggle('heart__button--hearted') // the actual heart button.  Can use dot notation to access it b/c we put a name="heart" in the html
            
            // update the heart count:
            $('.heart-count').textContent = res.data.hearts.length;
            
            // add floating heart animation class:
            if (isHearted) {
                this.heart.classList.add('heart__button--float');
                setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);
            }
        })
        .catch(console.error)
}

export default ajaxHeart;