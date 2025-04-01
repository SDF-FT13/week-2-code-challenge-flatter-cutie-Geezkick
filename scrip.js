const API_URL = 'http://localhost:3000/characters';

// DOM Elements
const elements = {
    characterBar: document.getElementById('character-bar'),
    nameDisplay: document.getElementById('name-display'),
    image: document.getElementById('image'),
    voteCount: document.getElementById('vote-count'),
    votesForm: document.getElementById('votes-form'),
    votesInput: document.getElementById('votes'),
    resetBtn: document.getElementById('reset-btn'),
    characterForm: document.getElementById('character-form'),
    newNameInput: document.getElementById('new-name'),
    imageUrlInput: document.getElementById('image-url'),
};

// State
let characters = [];
let currentCharacterId = null;

// API Functions
async function fetchCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        characters = await response.json();
        return characters;
    } catch (error) {
        console.error('Fetch characters error:', error);
        elements.nameDisplay.textContent = 'Error loading characters';
        return [];
    }
}

async function updateVotes(characterId, votes) {
    try {
        const response = await fetch(`${API_URL}/${characterId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votes }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const updatedCharacter = await response.json();
        // Update local state
        const index = characters.findIndex(c => c.id === characterId);
        if (index !== -1) characters[index] = updatedCharacter;
        return updatedCharacter;
    } catch (error) {
        console.error('Update votes error:', error);
        elements.voteCount.textContent = 'Error';
        return null;
    }
}

async function addNewCharacter(name, image) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, image, votes: 0 }),
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const newCharacter = await response.json();
        characters.push(newCharacter);
        return newCharacter;
    } catch (error) {
        console.error('Add character error:', error);
        elements.nameDisplay.textContent = 'Error adding character';
        return null;
    }
}

// DOM Manipulation Functions
function renderCharacterBar() {
    elements.characterBar.innerHTML = '';
    characters.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.name;
        span.addEventListener('click', () => showCharacterDetails(character.id));
        elements.characterBar.appendChild(span);
    });
}

function showCharacterDetails(characterId) {
    const character = characters.find(c => c.id === characterId);
    if (!character) return;
    currentCharacterId = characterId;
    elements.nameDisplay.textContent = character.name;
    elements.image.src = character.image;
    elements.image.alt = character.name;
    elements.voteCount.textContent = character.votes;
}

// Event Handlers
function handleVoteSubmit(event) {
    event.preventDefault();
    const votesToAdd = parseInt(elements.votesInput.value, 10);
    if (!currentCharacterId || isNaN(votesToAdd) || votesToAdd <= 0) {
        elements.votesInput.value = '';
        return;
    }

    const character = characters.find(c => c.id === currentCharacterId);
    const newVotes = character.votes + votesToAdd;
    updateVotes(currentCharacterId, newVotes).then(updatedCharacter => {
        if (updatedCharacter) {
            showCharacterDetails(currentCharacterId); // Refresh UI
            elements.votesInput.value = '';
        }
    });
}

function handleReset() {
    if (!currentCharacterId) return;
    updateVotes(currentCharacterId, 0).then(updatedCharacter => {
        if (updatedCharacter) {
            showCharacterDetails(currentCharacterId); // Refresh UI
        }
    });
}

function handleNewCharacter(event) {
    event.preventDefault();
    const name = elements.newNameInput.value.trim();
    const image = elements.imageUrlInput.value.trim();
    if (!name || !image) return;

    addNewCharacter(name, image).then(newCharacter => {
        if (newCharacter) {
            renderCharacterBar();
            showCharacterDetails(newCharacter.id);
            elements.characterForm.reset();
        }
    });
}

// Initialize
function init() {
    elements.votesForm.addEventListener('submit', handleVoteSubmit);
    elements.resetBtn.addEventListener('click', handleReset);
    elements.characterForm.addEventListener('submit', handleNewCharacter);

    fetchCharacters().then(data => {
        if (data.length) {
            renderCharacterBar();
            showCharacterDetails(data[0].id);
        }
    });
}

init();