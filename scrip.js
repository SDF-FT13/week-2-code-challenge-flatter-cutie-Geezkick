document.addEventListener("DOMContentLoaded", () => {
    const dogsGallery = document.getElementById("dogs-gallery");
    const searchBar = document.getElementById("searchBar");
    let currentPage = 1;
    let loading = false;

    // Function to fetch dog data
    function fetchDogData() {
        if (loading) return;
        loading = true;

        fetch(`https://dog.ceo/api/breeds/image/random/6`)
            .then(response => response.json())
            .then(data => {
                renderDogs(data.message);
                loading = false;
            })
            .catch(error => {
                console.error('Error fetching dog data:', error);
                loading = false;
            });
    }

    // Function to extract breed name from the image URL
    function getBreedName(imageUrl) {
        const breed = imageUrl.split('/')[4];  // Extract breed name from the URL
        return breed.charAt(0).toUpperCase() + breed.slice(1);  // Capitalize the first letter
    }

    // Function to render dog images along with breed names
    function renderDogs(dogs) {
        dogs.forEach(dog => {
            const dogCard = document.createElement("div");
            dogCard.classList.add("dog-card");

            const dogImage = document.createElement("img");
            dogImage.src = dog;
            dogImage.alt = "Cute Dog";

            const breedName = getBreedName(dog);  // Get breed name from the image URL

            // Create breed name element
            const breedElement = document.createElement("h3");
            breedElement.textContent = breedName;
            breedElement.classList.add("dog-breed");

            const likeContainer = document.createElement("div");
            likeContainer.classList.add("like-container");

            const likeButton = document.createElement("button");
            likeButton.classList.add("like-btn");
            likeButton.textContent = "❤️ 0";
            likeButton.addEventListener("click", () => {
                let count = parseInt(likeButton.textContent.split(" ")[1]) + 1;
                likeButton.textContent = `❤️ ${count}`;
            });

            const deleteButton = document.createElement("button");
            deleteButton.classList.add("delete-btn");
            deleteButton.textContent = "🗑️";
            deleteButton.addEventListener("click", () => {
                dogCard.remove();
            });

            likeContainer.appendChild(likeButton);
            likeContainer.appendChild(deleteButton);

            dogCard.appendChild(dogImage);
            dogCard.appendChild(breedElement);  // Append breed name
            dogCard.appendChild(likeContainer);
            dogsGallery.appendChild(dogCard);
        });
    }

    // Event listener for search functionality
    searchBar.addEventListener("input", (e) => {
        const searchValue = e.target.value.toLowerCase();
        document.querySelectorAll(".dog-card").forEach(card => {
            const breedName = card.querySelector(".dog-breed").textContent.toLowerCase();
            card.style.display = breedName.includes(searchValue) ? "block" : "none";
        });
    });

    // Event listener for scroll to load more content
    window.addEventListener("scroll", () => {
        const scrollPosition = window.scrollY + window.innerHeight;
        const pageHeight = document.documentElement.scrollHeight;

        // If scrolled to the bottom, load more dogs
        if (scrollPosition >= pageHeight - 200) {
            fetchDogData();
        }
    });

    // Auto-scroll to the bottom when new dogs are added
    function scrollToBottom() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth' // Smooth scroll to the bottom
        });
    }

    // Initial dog data fetch and scrolling
    fetchDogData();

    // Call scrollToBottom after dogs are rendered
    function onDogsRendered() {
        scrollToBottom();
    }

    // Override renderDogs to include auto-scroll
    function renderDogsWithScroll(dogs) {
        renderDogs(dogs);
        onDogsRendered();
    }

    // Override fetchDogData to use the new render function
    function fetchDogDataWithScroll() {
        if (loading) return;
        loading = true;

        fetch(`https://dog.ceo/api/breeds/image/random/6`)
            .then(response => response.json())
            .then(data => {
                renderDogsWithScroll(data.message);
                loading = false;
            })
            .catch(error => {
                console.error('Error fetching dog data:', error);
                loading = false;
            });
    }

    // Replace the old fetchDogData function with the new one
    fetchDogData = fetchDogDataWithScroll;
});
