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
let characters = [];
let currentCharacterId = null;

// API Functions
async function fetchCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch characters');
        characters = await response.json();
        console.log('Fetched characters:', characters);
        return characters;
    } catch (error) {
        console.error('Fetch error:', error);
        DOM.nameDisplay.textContent = 'Error loading characters';
        return [];
    }
}

async function patchVotes(characterId, votes) {
    try {
        console.log('Patching votes for ID:', characterId, 'to:', votes);
        const response = await fetch(`${API_URL}/${characterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votes }),
        });
        if (!response.ok) throw new Error('Failed to update votes');
        const updatedCharacter = await response.json();
        console.log('Server response:', updatedCharacter);
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) {
            characters[index] = updatedCharacter;
            console.log('Updated local characters:', characters);
        }
        return updatedCharacter;
    } catch (error) {
        console.error('Patch error:', error);
        DOM.voteCount.textContent = 'Error';
        return null;
    }
}

async function postCharacter(name, image) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, image, votes: 0 }),
        });
        if (!response.ok) throw new Error('Failed to add character');
        const newCharacter = await response.json();
        console.log('New character added:', newCharacter);
        characters.push(newCharacter);
        return newCharacter;
    } catch (error) {
        console.error('Post error:', error);
        DOM.nameDisplay.textContent = 'Error adding character';
        return null;
    }
}

// DOM Manipulation
function renderCharacterBar() {
    DOM.characterBar.innerHTML = '';
    characters.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.name;
        span.addEventListener('click', () => {
            currentCharacterId = character.id;
            displayCharacterDetails(character.id);
        });
        DOM.characterBar.appendChild(span);
    });
}

function displayCharacterDetails(characterId) {
    const character = characters.find(c => c.id === characterId);
    if (!character) {
        console.error('Character not found for ID:', characterId);
        DOM.nameDisplay.textContent = 'Character not found';
        return;
    }
    DOM.nameDisplay.textContent = character.name;
    DOM.image.src = character.image;
    DOM.image.alt = character.name;
    DOM.voteCount.textContent = character.votes;
    console.log('Displayed character:', character);
}

// Event Handlers
function handleVoteSubmit(e) {
    e.preventDefault();
    const votesToAdd = parseInt(DOM.votesInput.value, 10);
    if (!currentCharacterId || isNaN(votesToAdd) || votesToAdd <= 0) {
        console.log('Invalid vote input or no character selected:', votesToAdd, currentCharacterId);
        DOM.votesInput.value = '';
        return;
    }

    const character = characters.find(c => c.id === currentCharacterId);
    if (!character) {
        console.error('No character found for ID:', currentCharacterId);
        return;
    }
    const newVotes = character.votes + votesToAdd;
    console.log(`Adding ${votesToAdd} votes to ${character.votes}, new total: ${newVotes}`);
    patchVotes(currentCharacterId, newVotes).then(updatedCharacter => {
        if (updatedCharacter) {
            displayCharacterDetails(currentCharacterId);
            DOM.votesInput.value = '';
        }
    });
}

function handleReset() {
    if (!currentCharacterId) {
        console.log('No character selected for reset');
        return;
    }
    console.log('Resetting votes for ID:', currentCharacterId);
    patchVotes(currentCharacterId, 0).then(updatedCharacter => {
        if (updatedCharacter) {
            displayCharacterDetails(currentCharacterId);
        }
    });
}

function handleNewCharacter(e) {
    e.preventDefault();
    const name = DOM.newName.value.trim();
    const image = DOM.imageUrl.value.trim();
    if (!name || !image) {
        console.log('Invalid new character input:', name, image);
        return;
    }
    postCharacter(name, image).then(newCharacter => {
        if (newCharacter) {
            renderCharacterBar();
            currentCharacterId = newCharacter.id;
            displayCharacterDetails(newCharacter.id);
            DOM.characterForm.reset();
        }
    });
}

// Initialization
function init() {
    DOM.votesForm.addEventListener('submit', handleVoteSubmit);
    DOM.resetBtn.addEventListener('click', handleReset);
    DOM.characterForm.addEventListener('submit', handleNewCharacter);

    fetchCharacters().then(data => {
        if (data.length) {
            renderCharacterBar();
            currentCharacterId = data[0].id;
            displayCharacterDetails(data[0].id);
        } else {
            console.log('No characters available');
        }
    });
}

init();