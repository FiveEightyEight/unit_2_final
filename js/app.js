// ---------------------> Storage --------------------->
class Storage {
    constructor(key) {
        this.key = key;
    }
    getStorage() {
        const data = window.localStorage.getItem(this.key);
        if (data) {
            return JSON.parse(data);
        }
        return data;
    }
    save(data) {
        window.localStorage.setItem(this.key, JSON.stringify(data))
    }
}


// --------------------->  Global Variables --------------------->

const deck = new Storage('deck');
const deckStatus = document.querySelector('.js-deck-status');
const cards = document.querySelector('.js-cards');

// ---------------------> API Call --------------------->


// creates a new deck
const getNewDeck = () => {
    const url = 'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1';

    cards.innerHTML = '';
    state.success = false;
    state.cards = [];
    render(state);
    deck.save(state)


    GETRequest(url, cb => {
        state.deck_id = cb.deck_id;
        state.success = cb.success;
        state.remaining = cb.remaining;
        render(state);
        deck.save(state)


        // state.success = cb.success; 
    });


}

// draws a deck card from deck, passed through callback
const drawCard = (deckID) => {
    let url = `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`;
    GETRequest(url, cb => {
        state.success = cb.success;
        state.remaining = cb.remaining;
        state.cards.unshift(cb.cards[0]);
        state.cards[0]['bottom'] = true;
        render(state);
        deck.save(state);
    })
}

// https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1







// ---------------------> Helper Functions --------------------->

const GETRequest = (url, cb) => {
    let request = new XMLHttpRequest();
    request.open('GET', url);
    request.addEventListener('load', response => {
        const data = JSON.parse(response.currentTarget.response);

        cb(data);
    });
    request.send();
};

const cardDisplay = (index) => {
    if (state.cards[index].bottom) {
        state.cards[index].bottom = false;
        render(state);
        deck.save(state);
    } else {
        state.cards[index].bottom = true;
        render(state);
        deck.save(state);
    }

}

// ---------------------> Events --------------------->

deckStatus.addEventListener('click', e => {
    console.log('HERE')
    if (e.target.matches('.js-new-deck')) {
        // api call to reset deck
        console.log(`new-deck`)
        getNewDeck();
    } else if (e.target.matches('.js-draw-card')) {
        if (state.remaining === 0) {
            alert(`UNABLE TO DRAW MORE CARDS`);
            return;
        }
        console.log(`draw-card`)
        drawCard(state.deck_id);
    }
});

cards.addEventListener('click', e => {
    if (e.target.matches('.js-card')) {
        const index = e.target.getAttribute('data-index');
        cardDisplay(index);
    }
})






// ---------------------> State --------------------->

let state = {
    success: false,
    deck_id: '',
    cards: [],
    remaining: 0,
}


// ---------------------> Render --------------------->

const render = (state) => {

    if (!state.success) {
        // let innerHtml = '';
        deckStatus.innerHTML = `<a class="btn btn-danger btn-lg js-new-deck" href="#" role="button">New Deck</a>`;
    } else if (state.success) {
        deckStatus.innerHTML = `
        <a class="btn btn-success btn-lg js-draw-card" href="#" role="button">Draw Card</a> <a class="btn btn-danger btn-lg js-new-deck" href="#" role="button">New Deck</a>
        <p class='pt-4 h6 font-weight-bold'>Deck ID: ${state.deck_id}</p>
        <p class='h5 font-weight-bold'>Cards Left in Deck: ${state.remaining}</p>`

        if (!state.cards.length <= 0) {
            let innerHtml = '';
            for (let i = 0; i < state.cards.length; i++) {
                const card = state.cards[i];

                if (card.bottom) {
                    innerHtml += `
                <div class='col-3 text-center py-1'>
                <img src='${card.image}' class='js-card col-12' data-index=${i}>
                <span class='font-weight-bold col-12'>${card.value} ${card.suit}</span>
                </div>
                `;
                } else {
                    innerHtml += `
                    <div class='col-3 text-center py-1'>
                    <span class='font-weight-bold col-12'>${card.value} ${card.suit}</span>
                    <img src='${card.image}' class='js-card col-12' data-index=${i}>
                    </div>
                    `;
                }
            }
            cards.innerHTML = innerHtml;
        }

    } else {
        deckStatus.innerHTML = `<h1 class='text-danger'>ERROR 404</h1>`
    }


}

if (deck.getStorage()) {
    console.log(`in storage`);
    console.log(state);;
    state = deck.getStorage();
}

render(state);

// getNewDeck(e => {
// console.log(e);
// })