document.addEventListener("DOMContentLoaded", () => {
    const dogsGallery = document.getElementById("dogs-gallery");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    
    let dogData = [];

    // Fetch data from server (fake API or you can replace it with any real API)
    function fetchDogData() {
        fetch('https://dog.ceo/api/breeds/image/random/6')
            .then(response => response.json())
            .then(data => {
                dogData = data.message;
                renderDogs(dogData);
            })
            .catch(error => console.error('Error fetching dog data:', error));
    }

    // Render dog cards to the DOM
    function renderDogs(dogs) {
        dogs.forEach(dog => {
            const dogCard = document.createElement("div");
            dogCard.classList.add("dog-card");

            const dogImage = document.createElement("img");
            dogImage.src = dog;
            dogImage.alt = "Dog Image";

            dogCard.appendChild(dogImage);
            dogsGallery.appendChild(dogCard);
        });
    }

    // Event Listener to load more dogs
    loadMoreBtn.addEventListener("click", () => {
        fetchDogData();
    });

    // Initial load
    fetchDogData();
});
