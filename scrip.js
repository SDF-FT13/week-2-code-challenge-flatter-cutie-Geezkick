const API_URL = 'http://localhost:3000/characters';

// DOM Elements
const DOM = {
    characterBar: document.getElementById('character-bar'),
    nameDisplay: document.getElementById('name-display'),
    image: document.getElementById('image'),
    voteCount: document.getElementById('vote-count'),
    votesForm: document.getElementById('votes-form'),
    votesInput: document.getElementById('votes'),
    resetBtn: document.getElementById('reset-btn'),
    characterForm: document.getElementById('character-form'),
    newName: document.getElementById('new-name'),
    imageUrl: document.getElementById('image-url'),
};

// State
let state = {
    characters: [],
    currentCharacterId: null,
};

// API Functions
async function fetchCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch characters');
        state.characters = await response.json();
        console.log('Fetched characters:', state.characters);
    } catch (error) {
        console.error('Fetch error:', error);
        DOM.nameDisplay.textContent = 'Error loading characters';
        state.characters = [];
    }
}

async function syncVotes(characterId, votes) {
    try {
        console.log(`Syncing votes for ID ${characterId} to ${votes}`);
        const response = await fetch(`${API_URL}/${characterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votes }),
        });
        if (!response.ok) throw new Error('Failed to sync votes');
        const updatedCharacter = await response.json();
        console.log('Server updated:', updatedCharacter);
        return true;
    } catch (error) {
        console.error('Sync error:', error);
        return false;
    }
}

async function addCharacterToServer(name, image) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, image, votes: 0 }),
        });
        if (!response.ok) throw new Error('Failed to add character');
        const newCharacter = await response.json();
        console.log('Added to server:', newCharacter);
        return newCharacter;
    } catch (error) {
        console.error('Post error:', error);
        return null;
    }
}

// DOM Manipulation
function renderCharacterBar() {
    DOM.characterBar.innerHTML = '';
    state.characters.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.name;
        span.addEventListener('click', () => {
            state.currentCharacterId = character.id;
            renderDetails();
        });
        DOM.characterBar.appendChild(span);
    });
}

function renderDetails() {
    const character = state.characters.find(c => c.id === state.currentCharacterId);
    if (!character) {
        DOM.nameDisplay.textContent = 'Select a character';
        DOM.image.src = 'assets/dummy.gif';
        DOM.voteCount.textContent = '0';
        return;
    }
    DOM.nameDisplay.textContent = character.name;
    DOM.image.src = character.image;
    DOM.image.alt = character.name;
    DOM.voteCount.textContent = character.votes;
    console.log('Rendered details:', character);
}

// Event Handlers
function handleVoteSubmit(e) {
    e.preventDefault();
    const votesToAdd = parseInt(DOM.votesInput.value, 10);
    if (!state.currentCharacterId || isNaN(votesToAdd) || votesToAdd <= 0) {
        console.log('Invalid vote input:', votesToAdd, state.currentCharacterId);
        DOM.votesInput.value = '';
        return;
    }

    const character = state.characters.find(c => c.id === state.currentCharacterId);
    if (!character) {
        console.error('Character not found:', state.currentCharacterId);
        return;
    }
    character.votes = (character.votes || 0) + votesToAdd;
    console.log(`Votes added: ${votesToAdd}, new total: ${character.votes}`);
    renderDetails(); // Update UI immediately
    syncVotes(character.id, character.votes); // Sync with server
    DOM.votesInput.value = '';
}

function handleReset() {
    if (!state.currentCharacterId) {
        console.log('No character selected for reset');
        return;
    }
    const character = state.characters.find(c => c.id === state.currentCharacterId);
    if (!character) {
        console.error('Character not found:', state.currentCharacterId);
        return;
    }
    character.votes = 0;
    console.log('Votes reset to 0');
    renderDetails(); // Update UI immediately
    syncVotes(character.id, 0); // Sync with server
}

function handleNewCharacter(e) {
    e.preventDefault();
    const name = DOM.newName.value.trim();
    const image = DOM.imageUrl.value.trim();
    if (!name || !image) {
        console.log('Invalid input for new character:', name, image);
        return;
    }

    addCharacterToServer(name, image).then(newCharacter => {
        if (newCharacter) {
            state.characters.push(newCharacter);
            renderCharacterBar();
            state.currentCharacterId = newCharacter.id;
            renderDetails();
            DOM.characterForm.reset();
        }
    });
}

// Initialization
async function init() {
    DOM.votesForm.addEventListener('submit', handleVoteSubmit);
    DOM.resetBtn.addEventListener('click', handleReset);
    DOM.characterForm.addEventListener('submit', handleNewCharacter);

    await fetchCharacters();
    if (state.characters.length) {
        renderCharacterBar();
        state.currentCharacterId = state.characters[0].id;
        renderDetails();
    }
}

init();