document.getElementById("year").textContent = new Date().getFullYear();

        // Get elements
        const filterButtons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.card');
        const stayCountElement = document.getElementById('stayCount');
        const searchInput = document.querySelector('.search__btn input');

        let currentFilter = 'all'; // Track current filter
        let currentSearch = ''; // Track current search

        // Function to update card visibility based on filter and search
        function updateCardVisibility() {
            let visibleCount = 0;

            cards.forEach(card => {
                const cardFilter = card.getAttribute('data-filter');
                
                // Check filter condition
                const filterMatch = currentFilter === 'all' || cardFilter === currentFilter;
                
                // Check search condition
                let searchMatch = true;
                if (currentSearch.trim() !== '') {
                    const locationText = card.querySelector('.card__location')?.textContent || '';
                    const descriptionText = card.querySelector('.text--sm')?.textContent || '';
                    const combinedText = (locationText + ' ' + descriptionText).toLowerCase();
                    searchMatch = combinedText.includes(currentSearch.toLowerCase());
                }
                
                // Show card only if both conditions match
                if (filterMatch && searchMatch) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // Update the stays count
            stayCountElement.textContent = visibleCount;
        }

        // Filter button functionality
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                // Update current filter
                currentFilter = button.getAttribute('data-filter');
                updateCardVisibility();
            });
        });

        // Search input functionality
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            updateCardVisibility();
        });