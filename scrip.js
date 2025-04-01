const API_URL = 'http://localhost:3000/characters';

// DOM Elements
const characterBar = document.getElementById('character-bar');
const nameDisplay = document.getElementById('name');
const imageDisplay = document.getElementById('image');
const voteCountDisplay = document.getElementById('vote-count');
const votesForm = document.getElementById('votes-form');
const votesInput = document.getElementById('votes');
const resetBtn = document.getElementById('reset-btn');
const characterForm = document.getElementById('character-form');

let currentCharacter = null;

// Fetch characters (GET /characters)
async function fetchCharacters() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch characters');
        const characters = await response.json();
        renderCharacterBar(characters);
        if (characters.length) showCharacterDetails(characters[0]); // Default to first
    } catch (error) {
        console.error('Fetch error:', error);
        nameDisplay.textContent = 'Error loading characters';
    }
}

// Render character names in the bar
function renderCharacterBar(characters) {
    characterBar.innerHTML = '';
    characters.forEach(character => {
        const span = document.createElement('span');
        span.textContent = character.name;
        span.addEventListener('click', () => showCharacterDetails(character));
        characterBar.appendChild(span);
    });
}

// Show character details
function showCharacterDetails(character) {
    currentCharacter = character;
    nameDisplay.textContent = character.name;
    imageDisplay.src = character.image;
    imageDisplay.alt = character.name;
    voteCountDisplay.textContent = character.votes;
}

// Add votes (PATCH /characters/:id)
async function addVotes(votes) {
    try {
        const newVotes = parseInt(currentCharacter.votes, 10) + parseInt(votes, 10);
        const response = await fetch(`${API_URL}/${currentCharacter.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votes: newVotes }),
        });
        if (!response.ok) throw new Error('Failed to update votes');
        const updatedCharacter = await response.json();
        currentCharacter.votes = updatedCharacter.votes;
        voteCountDisplay.textContent = updatedCharacter.votes;
    } catch (error) {
        console.error('PATCH error:', error);
        voteCountDisplay.textContent = 'Error updating votes';
    }
}

// Reset votes (PATCH /characters/:id)
async function resetVotes() {
    try {
        const response = await fetch(`${API_URL}/${currentCharacter.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ votes: 0 }),
        });
        if (!response.ok) throw new Error('Failed to reset votes');
        const updatedCharacter = await response.json();
        currentCharacter.votes = updatedCharacter.votes;
        voteCountDisplay.textContent = updatedCharacter.votes;
    } catch (error) {
        console.error('PATCH error:', error);
        voteCountDisplay.textContent = 'Error resetting votes';
    }
}

// Add new character (POST /characters)
async function addNewCharacter(name, imageUrl) {
    const newCharacter = { name, image: imageUrl, votes: 0 };
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCharacter),
        });
        if (!response.ok) throw new Error('Failed to add character');
        const savedCharacter = await response.json();
        const span = document.createElement('span');
        span.textContent = savedCharacter.name;
        span.addEventListener('click', () => showCharacterDetails(savedCharacter));
        characterBar.appendChild(span);
        showCharacterDetails(savedCharacter); // Show immediately
    } catch (error) {
        console.error('POST error:', error);
        nameDisplay.textContent = 'Error adding character';
    }
}

// Event Handlers
function handleVoteSubmit(event) {
    event.preventDefault();
    const votes = votesInput.value.trim();
    if (votes && !isNaN(votes) && currentCharacter) {
        addVotes(votes);
        votesInput.value = '';
    }
}

function handleReset() {
    if (currentCharacter) resetVotes();
}

function handleNewCharacter(event) {
    event.preventDefault();
    const name = document.getElementById('name').value.trim();
    const imageUrl = document.getElementById('image-url').value.trim();
    if (name && imageUrl) {
        addNewCharacter(name, imageUrl);
        event.target.reset();
    }
}

// Initialize
function init() {
    votesForm.addEventListener('submit', handleVoteSubmit);
    resetBtn.addEventListener('click', handleReset);
    characterForm.addEventListener('submit', handleNewCharacter);
    fetchCharacters();
}

init();