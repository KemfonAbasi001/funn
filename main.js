document.getElementById("year").textContent = new Date().getFullYear();

// ===== EXPLORE PAGE FUNCTIONALITY (Search & Filter) =====
const searchInput = document.querySelector('.search__btn input');
if (searchInput) {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const stayCountElement = document.getElementById('stayCount');

    let currentFilter = 'all';
    let currentSearch = '';

    function updateCardVisibility() {
        let visibleCount = 0;

        cards.forEach(card => {
            const cardFilter = card.getAttribute('data-filter');
            const filterMatch = currentFilter === 'all' || cardFilter === currentFilter;
            
            let searchMatch = true;
            if (currentSearch.trim() !== '') {
                const locationText = card.querySelector('.card__location')?.textContent || '';
                const descriptionText = card.querySelector('.text--sm')?.textContent || '';
                const combinedText = (locationText + ' ' + descriptionText).toLowerCase();
                searchMatch = combinedText.includes(currentSearch.toLowerCase());
            }
            
            if (filterMatch && searchMatch) {
                card.style.display = '';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        stayCountElement.textContent = visibleCount;
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilter = button.getAttribute('data-filter');
            updateCardVisibility();
        });
    });

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        updateCardVisibility();
    });
}

// ===== PROPERTIES PAGE FUNCTIONALITY (Booking Card) =====
const checkInInput = document.getElementById('checkInDate');
if (checkInInput) {
    const checkOutInput = document.getElementById('checkOutDate');
    const guestCountDisplay = document.getElementById('guestCount');
    const minusBtn = document.getElementById('minusBtn');
    const plusBtn = document.getElementById('plusBtn');
    const nightsLabel = document.getElementById('nightsLabel');
    const subtotalDisplay = document.getElementById('subtotal');
    const totalDisplay = document.getElementById('totalPrice');

    const pricePerNight = 420;
    const cleaningFee = 85;
    const serviceFee = 168;
    let guests = 1;

    function calculateNights() {
        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        
        if (!checkIn || !checkOut) {
            return null;
        }
        
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        const timeDiff = checkOutDate - checkInDate;
        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        return Math.max(1, nights);
    }

    function updateCalculations() {
        const nights = calculateNights();
        
        if (nights === null) {
            nightsLabel.textContent = 'Select dates to calculate';
            subtotalDisplay.textContent = '$0';
            totalDisplay.textContent = '$0';
            return;
        }
        
        const subtotal = pricePerNight * nights;
        const total = subtotal + cleaningFee + serviceFee;
        
        nightsLabel.textContent = `$${pricePerNight} × ${nights} night${nights !== 1 ? 's' : ''}`;
        subtotalDisplay.textContent = `$${subtotal.toLocaleString()}`;
        totalDisplay.textContent = `$${total.toLocaleString()}`;
    }

    function updateGuestCount() {
        guestCountDisplay.textContent = guests + ' guest' + (guests !== 1 ? 's' : '');
    }

    minusBtn.addEventListener('click', () => {
        if (guests > 1) {
            guests--;
            updateGuestCount();
        }
    });

    plusBtn.addEventListener('click', () => {
        if (guests < 10) {
            guests++;
            updateGuestCount();
        }
    });

    checkInInput.addEventListener('change', updateCalculations);
    checkOutInput.addEventListener('change', updateCalculations);

    updateCalculations();
}