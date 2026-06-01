
        document.getElementById("year").textContent = new Date().getFullYear();

        // Filter functionality
        const filterButtons = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.card');
        const stayCountElement = document.getElementById('stayCount');

        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                button.classList.add('active');

                const filterValue = button.getAttribute('data-filter');
                let visibleCount = 0;

                // Filter cards
                cards.forEach(card => {
                    if (filterValue === 'all') {
                        card.style.display = '';
                        visibleCount++;
                    } else {
                        const cardFilter = card.getAttribute('data-filter');
                        if (cardFilter === filterValue) {
                            card.style.display = '';
                            visibleCount++;
                        } else {
                            card.style.display = 'none';
                        }
                    }
                });

                // Update the stays count
                stayCountElement.textContent = visibleCount;
            });
        });


        document.getElementById("year").textContent = new Date().getFullYear();