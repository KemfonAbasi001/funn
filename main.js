document.getElementById("year").textContent = new Date().getFullYear();

// ===== FAVORITES/SAVED STAYS SYSTEM =====
class FavoritesManager {
    constructor() {
        this.storageKey = 'avenoir_favorites';
        this.favorites = this.loadFavorites();
    }

    loadFavorites() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveFavorites() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.favorites));
    }

    isFavorite(cardId) {
        return this.favorites.some(fav => fav.id === cardId);
    }

    addFavorite(cardData) {
        if (!this.isFavorite(cardData.id)) {
            this.favorites.push(cardData);
            this.saveFavorites();
            return true;
        }
        return false;
    }

    removeFavorite(cardId) {
        this.favorites = this.favorites.filter(fav => fav.id !== cardId);
        this.saveFavorites();
    }

    getFavorites() {
        return this.favorites;
    }

    clear() {
        this.favorites = [];
        this.saveFavorites();
    }
}

const favManager = new FavoritesManager();

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, action = null) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--active';
    toast.innerHTML = `
        <div class="toast__content">
            <span class="toast__message">${message}</span>
            ${action ? `<button class="toast__action">${action.text}</button>` : ''}
        </div>
    `;

    document.body.appendChild(toast);

    if (action) {
        toast.querySelector('.toast__action').addEventListener('click', action.callback);
    }

    setTimeout(() => {
        toast.classList.remove('toast--active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ===== LOVE/FAVORITE BUTTON FUNCTIONALITY =====
function initializeLoveButtons() {
    const loveButtons = document.querySelectorAll('.love-btn, .love_btn');
    
    loveButtons.forEach(btn => {
        const card = btn.closest('.card');
        if (!card) return;

        const cardId = card.getAttribute('data-id') || Math.random().toString(36).substr(2, 9);
        card.setAttribute('data-id', cardId);

        // Update button state on page load
        updateLoveButtonState(btn, cardId);

        // Remove existing event listeners to prevent duplicates
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);

        // Add click event listener to the new button
        newBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isFavorited = favManager.isFavorite(cardId);

            if (!isFavorited) {
                // Add to favorites
                const cardData = {
                    id: cardId,
                    location: card.querySelector('.card__location')?.textContent || 'Untitled',
                    description: card.querySelector('.text--sm')?.textContent || '',
                    price: card.querySelector('.card__price')?.textContent || '$0',
                    rating: card.querySelector('.card__rating span')?.textContent || '0',
                    image: card.querySelector('img')?.src || '',
                    timestamp: new Date().toISOString()
                };

                favManager.addFavorite(cardData);
                newBtn.classList.add('love-btn--active', 'love_btn--active');
                
                showToast('❤️ Added to saved stays', {
                    text: 'View',
                    callback: () => window.location.href = 'dash.html'
                });
            } else {
                // Remove from favorites
                favManager.removeFavorite(cardId);
                newBtn.classList.remove('love-btn--active', 'love_btn--active');
                
                // If on dashboard, refresh saved stays section
                if (window.location.pathname.includes('dash')) {
                    populateSavedStays();
                }
                
                showToast('❤️ Removed from saved stays');
            }
        });
    });
}

// Helper function to update button state
function updateLoveButtonState(btn, cardId) {
    if (favManager.isFavorite(cardId)) {
        btn.classList.add('love-btn--active', 'love_btn--active');
    } else {
        btn.classList.remove('love-btn--active', 'love_btn--active');
    }
}

// ===== EXPLORE PAGE FUNCTIONALITY (Search & Filter) =====
const searchInput = document.querySelector('.search__btn input, .search-btn input');
if (searchInput) {
    const filterButtons = document.querySelectorAll('.filter-btn, .filter__btn');
    const cards = document.querySelectorAll('.card');
    const stayCountElement = document.getElementById('stayCount') || document.querySelector('[data-stay-count]');

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

        if (stayCountElement) {
            stayCountElement.textContent = visibleCount;
        }
    }

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active', 'filter__btn--active'));
            button.classList.add('active', 'filter__btn--active');
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

// ===== DASHBOARD SAVED STAYS =====
function populateSavedStays() {
    const savedContainer = document.querySelector('.savedd, [data-saved-container]');
    const favorites = favManager.getFavorites();

    if (savedContainer) {
        // Clear existing content
        savedContainer.innerHTML = '';

        if (favorites.length === 0) {
            // Show empty state message
            savedContainer.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: rgb(103, 111, 126);">
                    <p style="font-size: 16px; margin-bottom: 10px;">No saved stays yet</p>
                    <p style="font-size: 14px;">Click the heart icon on any property to save it</p>
                </div>
            `;
            return;
        }

        favorites.forEach(fav => {
            const card = document.createElement('a');
            card.href = '#';
            card.className = 'card';
            card.setAttribute('data-filter', 'saved');
            card.setAttribute('data-id', fav.id);
            card.innerHTML = `
                <div class="card__image-wrapper">
                    <img src="${fav.image}" alt="${fav.location}">
                    <button class="love-btn love_btn love-btn--active love_btn--active" type="button">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                    </button>
                </div>
                <div class="card__details">
                    <div class="card__details-row">
                        <p class="card__location">${fav.location}</p>
                        <div class="card__rating">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                                <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"></path>
                            </svg>
                            <span class="text--sm">4.89</span>
                        </div>
                    </div>
                    <p class="card__price">${fav.price}</p>
                </div>
            `;
            savedContainer.appendChild(card);
        });

        // Re-initialize love buttons for saved stays
        initializeLoveButtons();
    }
}

// ===== INITIALIZE ALL =====
document.addEventListener('DOMContentLoaded', () => {
    initializeLoveButtons();
    populateSavedStays();
});






























const navbar = document.querySelector(".nav-header");

window.addEventListener("scroll", function () {
    if (window.scrollY > 0) {
        navbar.classList.add("nav-header--scrolled");
    } else {
        navbar.classList.remove("nav-header--scrolled");
    }
});

function myFunction() {
  // Declare variables
  var input, filter, ul, li, a, i;
  input = document.getElementById("mySearch");
  filter = input.value.toUpperCase();
  ul = document.getElementById("myMenu");
  li = ul.getElementsByTagName("li");

  // Loop through all list items, and hide those who don't match the search query
  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    if (a.innerHTML.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }
  }
}
