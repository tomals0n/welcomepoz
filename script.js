document.addEventListener('DOMContentLoaded', () => {
    const pinScreen = document.getElementById('pin-screen');
    const splash = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const loaderBar = document.getElementById('loader-bar');
    const views = document.querySelectorAll('.view');
    const backButtons = document.querySelectorAll('.back-button');
    const backButtonsPrm = document.querySelectorAll('.back-button-prm');
    const backButtonsAirlines = document.querySelectorAll('.back-button-airlines');
    
    const docsTrigger = document.getElementById('docs-trigger');
    const prmTrigger = document.getElementById('prm-trigger');
    const prmManualTrigger = document.getElementById('prm-manual-trigger');
    const prmElectricTrigger = document.getElementById('prm-electric-trigger');
    
    const airlinesTrigger = document.getElementById('airlines-trigger');
    const airlineList = document.getElementById('airline-list');
    const airlineDetailName = document.getElementById('detail-airline-name');
    const airlineInfoContainer = document.getElementById('airline-info-container');
    const backButtonSsr = document.getElementById('back-button-ssr');
    const ssrContainer = document.getElementById('ssr-container');
    const backButtonTopic = document.getElementById('back-button-topic');
    const topicTitle = document.getElementById('topic-title');
    const topicContent = document.getElementById('topic-content');

    function bindTopicAccordions() {
        topicContent.querySelectorAll('.accordion-header').forEach(header => {
            header.onclick = (e) => {
                e.preventDefault();
                e.stopImmediatePropagation();
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');
                if (content && icon) {
                    content.classList.toggle('open');
                    icon.classList.toggle('open');
                }
            };
        });
    }

    let currentAirline = '';
    let currentTopic = '';
    const appData = window.APP_DATA || {};
    const users = appData.users || [];
    const countriesData = appData.countriesData || [];
    const ssrCodes = appData.ssrCodes || [];
    const ssrWizzCodes = appData.ssrWizzCodes || [];
    const operationalData = appData.operationalData || {};
    const airlineTiles = appData.airlineTiles || {};
    
    let currentUser = null; // Will store the logged-in user object
    let originalPinScreen = null; // To restore pin screen on logout
    let originalSplashScreen = null; // To restore splash screen on re-login
    
    // --- DNIÓWKA DATA ---
    let currentDniowkaData = null; // { date: string, topInfo: {}, flights: [] }
    let dniowkaStorage = {}; // key: "DD-MMM-YYYY", value: dniowkaData
    let currentDateSelection = 'today';
    let currentTab = 'all';
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const monthsPL = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    // Variables for splash animation (resetable)
    let duration;
    let startTime;

    // Function to get current pin elements (since they're recreated on logout)
    function getPinElements() {
        return {
            screen: document.getElementById('pin-screen'),
            input: document.getElementById('pin-main-input'),
            dots: document.querySelectorAll('.pin-dot'),
            submit: document.getElementById('pin-submit'),
            error: document.getElementById('pin-error')
        };
    }

    // Update dots - accepts optional dot elements
    function updatePinDots(count, dotElements = null) {
        const dots = dotElements || getPinElements().dots;
        dots.forEach((dot, index) => {
            if (index < count) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // Initialize pin screen once on load
    function initializePinScreen() {
        const elements = getPinElements();
        if (!elements.screen) return;

        originalPinScreen = elements.screen.cloneNode(true);
        originalSplashScreen = document.getElementById('splash-screen').cloneNode(true);

        // Focus main input when clicking on the container
        elements.input?.parentElement?.addEventListener('click', () => {
            elements.input?.focus();
        });

        // Handle PIN input
        elements.input?.addEventListener('input', (e) => {
            // Only allow digits
            if (!/^\d*$/.test(e.target.value)) {
                e.target.value = e.target.value.replace(/[^\d]/g, '');
            }
            // Limit to 4 digits
            if (e.target.value.length > 4) {
                e.target.value = e.target.value.slice(0, 4);
            }
            // Update dots
            updatePinDots(e.target.value.length, elements.dots);
            // Hide error when typing
            elements.error?.classList.add('hidden');
        });

        // Handle backspace for better UX
        elements.input?.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace') {
                setTimeout(() => {
                    updatePinDots(elements.input.value.length, elements.dots);
                }, 0);
            } else if (e.key === 'Enter') {
                checkPin();
            }
        });

        // Handle submit button
        elements.submit?.addEventListener('click', checkPin);
    }
    initializePinScreen();

    function checkPin() {
        const elements = getPinElements();
        const enteredPin = elements.input?.value;
        if (enteredPin && enteredPin.length === 4) {
            const user = users.find(u => u.pin === enteredPin);
            if (user) {
                // Correct PIN - log user in!
                currentUser = user;
                elements.error?.classList.add('hidden');
                elements.screen.style.opacity = '0';
                elements.screen.style.visibility = 'hidden';
                setTimeout(() => {
                    elements.screen.remove();
                }, 800);
                
                // HIDE APP CONTAINER FIRST!
                appContainer.style.opacity = '0';
                appContainer.style.visibility = 'hidden';
                
                // Make sure splash screen is present (re-add from clone if needed)
                let currentSplash = document.getElementById('splash-screen');
                if (!currentSplash && originalSplashScreen) {
                    currentSplash = originalSplashScreen.cloneNode(true);
                    document.body.insertBefore(currentSplash, document.getElementById('app-container'));
                }
                
                // Reset and start splash animation
                duration = 3000;
                startTime = performance.now();
                const currentLoaderBar = document.getElementById('loader-bar');
                if (currentLoaderBar) currentLoaderBar.style.width = '0%'; // Reset progress bar
                if (currentSplash) {
                    currentSplash.style.opacity = '1';
                    currentSplash.style.visibility = 'visible';
                }
                requestAnimationFrame(animateSplash);
            } else {
                // Wrong PIN - show error and clear inputs
                elements.error?.classList.remove('hidden');
                elements.input.value = '';
                updatePinDots(0, elements.dots);
                elements.input.focus();
                // Hide error after 2 seconds
                setTimeout(() => {
                    elements.error?.classList.add('hidden');
                }, 2000);
            }
        }
    }

    // Logout functionality
    document.addEventListener('click', (e) => {
        if (e.target.closest('#logout-button')) {
            // Reset user
            currentUser = null;
            // Clear logged in info
            const infoDiv = document.getElementById('logged-in-info');
            if(infoDiv) infoDiv.innerHTML = '';
            // HIDE APP CONTAINER FIRST!
            appContainer.style.opacity = '0';
            appContainer.style.visibility = 'hidden';
            // Re-add pin screen
            document.body.appendChild(originalPinScreen.cloneNode(true));
            // Get the new elements
            const newElements = getPinElements();
            // Re-attach all event listeners to new elements
            newElements.input?.parentElement?.addEventListener('click', () => newElements.input?.focus());
            newElements.input?.addEventListener('input', (e) => {
                if (!/^\d*$/.test(e.target.value)) {
                    e.target.value = e.target.value.replace(/[^\d]/g, '');
                }
                if (e.target.value.length > 4) {
                    e.target.value = e.target.value.slice(0, 4);
                }
                updatePinDots(e.target.value.length, newElements.dots);
                newElements.error?.classList.add('hidden');
            });
            newElements.input?.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    setTimeout(() => {
                        updatePinDots(newElements.input.value.length, newElements.dots);
                    }, 0);
                } else if (e.key === 'Enter') {
                    checkPin();
                }
            });
            newElements.submit?.addEventListener('click', checkPin);
            
            // Show pin screen
            newElements.screen.style.opacity = '1';
            newElements.screen.style.visibility = 'visible';
            // Reset input
            newElements.input.value = '';
            updatePinDots(0, newElements.dots);
            newElements.input.focus();
        }
    });

    // --- SPLASH ANIMATION ---

    function animateSplash(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const percentage = progress * 100;
        // Find the current loader bar (could be original or re-added clone)
        const currentLoaderBar = document.getElementById('loader-bar');
        if (currentLoaderBar) currentLoaderBar.style.width = `${percentage}%`;

        if (progress < 1) {
            requestAnimationFrame(animateSplash);
        } else {
            setTimeout(() => {
                const currentSplash = document.getElementById('splash-screen');
                if (currentSplash) {
                    currentSplash.style.opacity = '0';
                    currentSplash.style.visibility = 'hidden';
                }
                
                appContainer.style.visibility = 'visible';
                appContainer.style.opacity = '1';
                showLoggedInUser();
                
                setTimeout(() => {
                    document.body.style.overflow = 'auto';
                }, 800);
            }, 500);
        }
    }

    // requestAnimationFrame(animateSplash); // Now started only after correct PIN

    // --- NAVIGATION ---
    function showView(viewId) {
        views.forEach(view => {
            view.classList.remove('active');
            if (view.id === viewId) {
                view.classList.add('active');
                window.scrollTo(0, 0);
            }
        });
    }

    // --- Funkcja renderowania kodów SSR ---
    function renderSSRCodes(filter = '') {
        // Wybierz odpowiednią tablicę kodów w zależności od linii lotniczej
        let codes = ssrCodes;
        if (currentAirline === 'Wizz Air') {
            codes = ssrWizzCodes;
        }

        const filtered = codes.filter(item => 
            item.code.toLowerCase().includes(filter.toLowerCase()) ||
            item.desc.toLowerCase().includes(filter.toLowerCase())
        );

        ssrContainer.innerHTML = filtered.map(item => `
            <div class="procedure-step flex justify-between items-start">
                <span class="font-bold text-pink-300 min-w-[80px]">${item.code}</span>
                <span class="text-sm text-white/80 flex-1 ml-4">${item.desc}</span>
            </div>
        `).join('');
    }

    function renderDocs(filter = '') {
        const container = document.getElementById('docs-content');
        if (!container) return;
        
        const lowerFilter = filter.toLowerCase();
        const filteredCountries = countriesData.filter(country => 
            country.name.toLowerCase().includes(lowerFilter)
        );
        
        if (filteredCountries.length === 0) {
            container.innerHTML = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Brak wyników dla "${filter}"</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = filteredCountries.map((country, idx) => `
            <div class="accordion-item mb-3">
                <div class="accordion-header" data-accordion="country-${idx}">
                    <span>${country.name}</span>
                    <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <div class="accordion-list-item">
                            <div class="accordion-bullet"></div>
                            <div>${country.document}</div>
                        </div>
                        <div class="accordion-list-item">
                            <div class="accordion-bullet"></div>
                            <div>
                                ${country.api ? '✅' : '❌'} 
                                API ${country.api ? 'potrzebne' : 'niepotrzebne'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Dodaj listenery dla accordionów
        container.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const icon = header.querySelector('.accordion-icon');
                content.classList.toggle('open');
                icon.classList.toggle('open');
            });
        });
    }

    // Load stored dniówka data
    const savedStorage = localStorage.getItem('dniowkaStorage');
    if (savedStorage) {
        dniowkaStorage = JSON.parse(savedStorage);
        Object.keys(dniowkaStorage).forEach(key => {
            dniowkaStorage[key] = normalizeStoredDniowkaData(dniowkaStorage[key]);
        });
    }
    
    // Main Triggers
    const dniowkaTrigger = document.getElementById('dniowka-trigger');
    if (dniowkaTrigger) {
        dniowkaTrigger.addEventListener('click', showDniowkaView);
    }
    docsTrigger.addEventListener('click', () => {
        showView('view-docs');
        renderDocs();
        
        const searchInput = document.getElementById('docs-search-input');
        if (searchInput) {
            searchInput.value = '';
            searchInput.addEventListener('input', (e) => renderDocs(e.target.value));
        }
    });
    prmTrigger.addEventListener('click', () => showView('view-prm'));
    airlinesTrigger.addEventListener('click', () => {
        showView('view-airlines');
        // Reset search input
        const searchInput = document.getElementById('airline-search-input');
        if (searchInput) {
            searchInput.value = '';
            // Show all airlines
            document.querySelectorAll('#airline-list .mini-card').forEach(card => {
                card.style.display = 'flex';
            });
        }
    });

    // Add airline search listener
    document.addEventListener('input', (e) => {
        if (e.target.id === 'airline-search-input') {
            const searchTerm = e.target.value.toLowerCase();
            document.querySelectorAll('#airline-list .mini-card').forEach(card => {
                const airlineName = card.getAttribute('data-airline').toLowerCase();
                if (airlineName.includes(searchTerm)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    });

    // PRM Sub-triggers
    prmManualTrigger.addEventListener('click', () => showView('view-prm-manual'));
    prmElectricTrigger.addEventListener('click', () => showView('view-prm-electric'));

    // Airline List Clicks
    airlineList.addEventListener('click', (e) => {
        const card = e.target.closest('.mini-card');
        if (card) {
            const airline = card.getAttribute('data-airline');
            showAirlineDetail(airline);
        }
    });


    // STD NA SAMEJ GÓRZE KAŻDEJ LINI LOTNICZEJ
    
    const operationalDataRyanair = operationalData.ryanair || [];
    const operationalDataRyanairSun = operationalData.ryanair || [];
    const operationalDataWizzAir = operationalData.wizzAir || [];
    const operationalDataRyanairBuzz = operationalData.ryanairBuzz || operationalDataRyanair;
    const operationalDataEnterAir = operationalData.enterAir || [];
    const operationalDataOmega = operationalData.omega || [];

    // KAFELKI W KAŻDEJ LINI LOTNICZEJ
    const ryanairTiles = airlineTiles.ryanair || [];
    const ryanairBuzzTiles = airlineTiles.ryanair || [];
    const enterAirTiles = airlineTiles.enterAir || [];
    const omegaTiles = airlineTiles.omega || [];
    const wizzAirTiles = airlineTiles.wizzAir || [];

    function showAirlineDetail(airline) {
        currentAirline = airline;
        airlineDetailName.textContent = airline;
        airlineInfoContainer.innerHTML = '';

        if (airline === 'Ryanair' || airline === 'Ryanair Buzz') {
            const tiles = airline === 'Ryanair' ? ryanairTiles : ryanairBuzzTiles;
            const data = airline === 'Ryanair' ? operationalDataRyanair : operationalDataRyanairBuzz;
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
                <div id="airline-tiles" class="airline-grid mt-4"></div>
            `;

            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        renderSearchResults(e.target.value, data, tiles);
                    });
                }
                renderSearchResults('', data, tiles);
                renderAirlineTiles('', tiles);
            }, 0);
        } else if (airline === 'Wizz Air') {
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
                <div id="airline-tiles" class="airline-grid mt-4"></div>
            `;

            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        renderSearchResults(e.target.value, operationalDataWizzAir, wizzAirTiles);
                    });
                }
                renderOperationalBanner(operationalDataWizzAir);
                renderAirlineTiles('', wizzAirTiles);
            }, 0);
        } else if (airline === 'Enter Air') {
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
                <div id="airline-tiles" class="airline-grid mt-4"></div>
            `;
            
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        renderSearchResults(e.target.value, operationalDataEnterAir, enterAirTiles);
                    });
                }
                renderSearchResults('', operationalDataEnterAir, enterAirTiles);
                
                // Add the warning box
                const searchResultsContainer = document.getElementById('search-results');
                if (searchResultsContainer) {
                    const warningBox = document.createElement('div');
                    warningBox.className = 'info-banner mt-4 flex items-center justify-center gap-3 text-center';
                    warningBox.innerHTML = `
                        <div class="text-amber-400 text-2xl">⚠️</div>
                        <p class="text-white">Zaznaczamy w kółko numer GATE na karcie pokładowej</p>
                    `;
                    searchResultsContainer.appendChild(warningBox);
                }
                
                renderAirlineTiles('', enterAirTiles);
            }, 0);
        } else if (airline === 'Omega (Mavigok)') {
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
                <div id="airline-tiles" class="airline-grid mt-4"></div>
            `;
            
            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        renderSearchResults(e.target.value, operationalDataOmega, omegaTiles);
                    });
                }
                renderSearchResults('', operationalDataOmega, omegaTiles);
                renderAirlineTiles('', omegaTiles);
            }, 0);
        } else {
            airlineInfoContainer.innerHTML = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Brak szczegółowych informacji czasowych dla tej linii.</p>
                </div>
            `;
        }

        showView('view-airline-detail');
    }

    function renderOperationalBanner(data) {
        const container = document.getElementById('search-results');
        if (container && data) {
            container.innerHTML = `
                <div class="info-banner mb-4">
                    <p class="font-bold mb-2">STD:</p>
                    <ul class="space-y-2 text-sm">
                        ${data.map(item => `
                            <li>
                                <div>• ${item.title}: <span class="text-pink-300">${item.desc}</span></div>
                                ${item.note ? `<div class="text-xs text-white/60 mt-1 leading-snug">(${item.note})</div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
    }

    function handleAirlineTileAction(tile) {
        if (!tile) return;

        const action = tile.getAttribute('data-action');
        if (action === 'ssr') {
            renderSSRCodes('');
            showView('view-ssr');

            const ssrSearchInput = document.getElementById('ssr-search-input');
            if (ssrSearchInput) {
                ssrSearchInput.value = '';
                ssrSearchInput.oninput = (e) => renderSSRCodes(e.target.value);
            }
            return;
        }

        if (action === 'topic') {
            const topic = tile.getAttribute('data-topic');
            if (topic) openTopic(topic);
        }
    }

    function renderAirlineTiles(filter = '', tiles) {
        const container = document.getElementById('airline-tiles');
        if (!container || !tiles) return;

        const q = filter.trim().toLowerCase();
        const filteredTiles = q
            ? tiles.filter(t => (t.label || '').toLowerCase().includes(q))
            : tiles;

        container.innerHTML = filteredTiles.map(t => {
            const dataTopic = t.topic ? ` data-topic="${t.topic}"` : '';
            return `<div class="mini-card" data-action="${t.action}"${dataTopic}>${t.label}</div>`;
        }).join('');

        container.querySelectorAll('[data-action]').forEach(tile => {
            tile.onclick = () => handleAirlineTileAction(tile);
        });
    }

    function openTopic(topic) {
        currentTopic = topic;

        if (typeof appData.openTopic === 'function') {
            appData.openTopic({
                topic,
                currentAirline,
                topicTitle,
                topicContent,
                showView,
                bindTopicAccordions
            });
            return;
        }

        topicTitle.textContent = topic;
        topicContent.innerHTML = `
            <div class="procedure-step text-center py-10">
                <p class="text-white/40 italic">Treść w przygotowaniu.</p>
            </div>
        `;
        bindTopicAccordions();
        showView('view-topic');
    }

    // --- Dniówka logic ---
    function formatDateKey(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }

    function normalizeFlightTime(value) {
        if (value === null || value === undefined || value === '') return '';

        const formatMinutes = (totalMinutes) => {
            const normalized = ((totalMinutes % 1440) + 1440) % 1440;
            const hours = String(Math.floor(normalized / 60)).padStart(2, '0');
            const minutes = String(normalized % 60).padStart(2, '0');
            return `${hours}:${minutes}`;
        };

        if (value instanceof Date && !Number.isNaN(value.getTime())) {
            return formatMinutes(value.getHours() * 60 + value.getMinutes());
        }

        if (typeof value === 'number' && Number.isFinite(value)) {
            const excelFraction = value >= 1 ? value % 1 : value;
            return formatMinutes(Math.round(excelFraction * 24 * 60));
        }

        const textValue = String(value).trim();
        if (!textValue) return '';

        const numericValue = Number(textValue.replace(',', '.'));
        if (!Number.isNaN(numericValue) && /^\d+(?:[.,]\d+)?$/.test(textValue)) {
            const excelFraction = numericValue >= 1 ? numericValue % 1 : numericValue;
            return formatMinutes(Math.round(excelFraction * 24 * 60));
        }

        const timeMatch = textValue.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
        if (timeMatch) {
            const hours = String(Number(timeMatch[1])).padStart(2, '0');
            const minutes = timeMatch[2];
            return `${hours}:${minutes}`;
        }

        return textValue;
    }

    function normalizeStoredDniowkaData(data) {
        if (!data || !Array.isArray(data.flights)) return data;

        data.flights = data.flights.map(flight => ({
            ...flight,
            time: normalizeFlightTime(flight.time)
        }));

        return data;
    }

    function getDate(offsetDays) {
        const date = new Date();
        date.setDate(date.getDate() + offsetDays);
        return date;
    }

    function showLoggedInUser() {
        const infoDiv = document.getElementById('logged-in-info');
        if (infoDiv && currentUser) {
            const shortName = currentUser.name.split(' ')[0] + ' ' + currentUser.name.split(' ')[1].charAt(0) + '.';
            infoDiv.innerHTML = `<strong>${shortName}</strong> (${currentUser.role})`;
        }
    }

    function formatDateLabel(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        return `${day} ${month}`;
    }

    function showDniowkaView() {
        showView('view-dniowka');
        
        // Update date button labels
        const todayBtn = document.getElementById('date-btn-today');
        const tomorrowBtn = document.getElementById('date-btn-tomorrow');
        const dateSelector = document.getElementById('dniowka-date-selector');
        const todayDate = getDate(0);
        const tomorrowDate = getDate(1);
        if (todayBtn) todayBtn.innerHTML = `Dzisiaj<br><span class="text-xs text-white/60">${formatDateLabel(todayDate)}</span>`;
        if (tomorrowBtn) tomorrowBtn.innerHTML = `Jutro<br><span class="text-xs text-white/60">${formatDateLabel(tomorrowDate)}</span>`;

        const isLeaderOrManager = currentUser && (currentUser.role === 'Lider' || currentUser.role === 'Kierownik');
        if (dateSelector) {
            dateSelector.style.display = isLeaderOrManager ? 'none' : 'flex';
        }

        // Setup date button listeners
        [todayBtn, tomorrowBtn].forEach(btn => {
            if (btn) {
                btn.onclick = (e) => {
                    const newSelection = e.target.closest('#date-btn-today') ? 'today' : 'tomorrow';
                    if (newSelection !== currentDateSelection) {
                        currentDateSelection = newSelection;
                        // Update active class
                        document.querySelectorAll('#dniowka-date-selector .date-btn').forEach(b => b.classList.remove('active'));
                        e.target.closest('.date-btn').classList.add('active');
                        // Load data for new date
                        const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
                        const dateKey = formatDateKey(selectedDate);
                        if (dniowkaStorage[dateKey]) {
                            currentDniowkaData = normalizeStoredDniowkaData(dniowkaStorage[dateKey]);
                        } else {
                            currentDniowkaData = null;
                        }
                        renderTopInfo();
                        renderUploadSection();
                        renderFlightList();
                    }
                };
            }
        });
        
        // Try to load the saved dniówka for current selected date
        const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
        const dateKey = formatDateKey(selectedDate);
        if (dniowkaStorage[dateKey]) {
            currentDniowkaData = normalizeStoredDniowkaData(dniowkaStorage[dateKey]);
        }
        
        renderTopInfo();
        renderUploadSection();
        renderFlightList();
        setupTabListeners();
    }

    function renderTopInfo() {
        const container = document.getElementById('dniowka-top-info');
        if (!container) return;

        if (!currentDniowkaData || !currentDniowkaData.topInfo) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        const topInfo = currentDniowkaData.topInfo;
        const infoItems = [
            { label: 'Koordynator CKI', value: topInfo.coordinator },
            { label: 'Telefon', value: topInfo.phone },
            {
                label: 'Informacje',
                value: [
                    topInfo.kuwety ? `Kuwety: ${topInfo.kuwety}` : '',
                    topInfo.ppo ? `PPO: ${topInfo.ppo}` : ''
                ].filter(Boolean).join('<br>')
            }
        ].filter(item => item.value && String(item.value).trim());

        if (!infoItems.length) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        container.style.display = 'block';
        container.innerHTML = `
            <div class="top-info-grid">
                ${infoItems.map(item => `
                    <div class="top-info-item ${item.label === 'Informacje' ? 'top-info-item-wide' : ''}">
                        <div class="top-info-label">${item.label}</div>
                        <div class="top-info-value">${item.value}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function renderUploadSection() {
        const container = document.getElementById('dniowka-upload');
        if (!container) return;

        if (currentUser && (currentUser.role === 'Lider' || currentUser.role === 'Kierownik')) {
            container.style.display = 'block';
            const todayDate = getDate(0);
            const tomorrowDate = getDate(1);
            container.innerHTML = `
                <div class="file-upload-container">
                    <div class="text-sm font-bold mb-2">Wybierz datę:</div>
                    <div class="date-selector upload-date-selector">
                        <button class="date-btn upload-date-btn ${currentDateSelection === 'today' ? 'active' : ''}" data-date="today">Dzisiaj<br><span class="text-xs text-white/60">${formatDateLabel(todayDate)}</span></button>
                        <button class="date-btn upload-date-btn ${currentDateSelection === 'tomorrow' ? 'active' : ''}" data-date="tomorrow">Jutro<br><span class="text-xs text-white/60">${formatDateLabel(tomorrowDate)}</span></button>
                    </div>
                    <input type="file" id="excel-upload" accept=".xlsx,.xls" style="display:none;">
                    <label for="excel-upload" class="file-upload-label">Wgraj plik Excel</label>
                    ${currentDniowkaData ? `
                        <button id="delete-dniowka" class="file-upload-label" style="background: rgba(255,0,0,0.2); border-image: linear-gradient(135deg, #ff4444, #ff6666) 1;">Usuń dniówkę</button>
                    ` : ''}
                </div>
            `;
            
            // Add listeners
            container.querySelectorAll('.upload-date-btn').forEach(btn => {
                btn.onclick = () => {
                    currentDateSelection = btn.dataset.date;
                    const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
                    const key = formatDateKey(selectedDate);
                    if (dniowkaStorage[key]) {
                        currentDniowkaData = normalizeStoredDniowkaData(dniowkaStorage[key]);
                    } else {
                        currentDniowkaData = null;
                    }
                    renderUploadSection();
                    renderTopInfo();
                    renderFlightList();
                };
            });
            
            document.getElementById('excel-upload').addEventListener('change', handleExcelUpload);
            
            if (document.getElementById('delete-dniowka')) {
                document.getElementById('delete-dniowka').addEventListener('click', () => {
                    const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
                    const key = formatDateKey(selectedDate);
                    delete dniowkaStorage[key];
                    currentDniowkaData = null;
                    renderUploadSection();
                    renderTopInfo();
                    renderFlightList();
                });
            }
        } else {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    }

    function handleExcelUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                parseDniowkaData(jsonData);
                
                // Show success
                alert('Dniówka wczytana pomyślnie!');
                
                renderTopInfo();
                renderFlightList();
                renderUploadSection();
            } catch (err) {
                console.error(err);
                alert('Błąd podczas wczytywania pliku!');
            }
        };
        reader.readAsArrayBuffer(file);
    }

    function parseDniowkaData(jsonData) {
        // First, let's try to extract top info from the first few rows
        let topInfo = {};
        let flightsStartIndex = 0;
        let topInfoRows = [];
        
        // Let's scan the data for the top info
        for (let i = 0; i < Math.min(15, jsonData.length); i++) {
            const row = jsonData[i];
            const rowStr = ((row || []).join(' ') || '').toLowerCase();
            const fullRowText = (row || []).join(' ') || '';
            
            if (fullRowText && fullRowText.trim() !== '') {
                topInfoRows.push(fullRowText.trim());
            }
            
            // Look for the header row that has "REJS" or "KIERUNEK" or "GODZ WYLOTU"
            if (rowStr.includes('rejs') || rowStr.includes('kierunek') || rowStr.includes('godz wylotu')) {
                flightsStartIndex = i + 1;
                break;
            }
        }
        
        // Now parse the top info rows exactly like your screenshot
        topInfo.coordinator = '';
        topInfo.phone = '';
        topInfo.kuwety = '';
        topInfo.ppo = '';
        
        topInfoRows.forEach(rowText => {
            if (!rowText) return;
            
            if (rowText.toLowerCase().includes('koordynator cki')) {
                // Split on "Tel:" to get coordinator and phone
                if (/tel[:.]/i.test(rowText)) {
                    const parts = rowText.split(/Tel[:.]/i);
                    topInfo.coordinator = (parts[0] || '').replace(/Koordynator CKI/i, '').trim();
                    topInfo.phone = (parts[1] || '').trim();
                } else {
                    topInfo.coordinator = (rowText || '').replace(/Koordynator CKI/i, '').trim();
                }
            } else if (rowText.toLowerCase().includes('kuwety:')) {
                topInfo.kuwety = (rowText || '').replace(/KUWETY:/i, '').trim();
            } else if (rowText.toLowerCase().includes('ppo')) {
                topInfo.ppo = (rowText || '').replace(/PPO/i, '').trim();
            }
        });
        
        topInfo.date = new Date().toLocaleDateString('pl-PL');
        
        // Now parse flights with your EXACT column order:
        // REJS, KIERUNEK, GODZ WYLOTU, ODPRAWA, BOARDING, OPIEKA, NR CKI, NR GATE, PAX, UWAGI, PPS, ZNAKI
        let flights = [];
        for (let i = flightsStartIndex; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0 || !row[0]) continue;
            
            const flight = {
                number: String(row[0] || ''),       // REJS
                direction: String(row[1] || ''),    // KIERUNEK
                time: normalizeFlightTime(row[2]),  // GODZ WYLOTU
                checkin: String(row[3] || ''),      // ODPRAWA
                boarding: String(row[4] || ''),     // BOARDING
                care: String(row[5] || ''),         // OPIEKA
                nrCki: String(row[6] || ''),        // NR CKI
                gate: String(row[7] || ''),         // NR GATE
                pax: String(row[8] || ''),          // PAX
                remarks: String(row[9] || ''),      // UWAGI
                pps: String(row[10] || ''),         // PPS
                znaki: String(row[11] || '')        // ZNAKI
            };
            
            // Skip if flight number is empty or just a header
            const flightNumLower = (flight.number || '').toLowerCase();
            if (flightNumLower.includes('rejs') || flightNumLower.includes('numer')) continue;
                
            flights.push(flight);
        }
        
        const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
        const dateKey = formatDateKey(selectedDate);
        
        currentDniowkaData = {
            date: dateKey,
            topInfo: topInfo,
            flights: flights
        };
        
        // Save to storage (in real app this would be to server, here we use localStorage)
        dniowkaStorage[dateKey] = currentDniowkaData;
        localStorage.setItem('dniowkaStorage', JSON.stringify(dniowkaStorage));
    }

    function isUserFlight(flight) {
        if (!currentUser) return false;
        const userName = currentUser.name.toLowerCase();
        const userLastName = currentUser.name.split(' ').pop().toLowerCase();
        const flightText = Object.values(flight).join(' ').toLowerCase();
        return flightText.includes(userName) || flightText.includes(userLastName);
    }

    function fieldHasCurrentUser(value) {
        if (!currentUser || !value) return false;

        const fieldText = String(value).toLowerCase();
        const userName = currentUser.name.toLowerCase();
        const userLastName = currentUser.name.split(' ').pop().toLowerCase();

        return fieldText.includes(userName) || fieldText.includes(userLastName);
    }

    function renderFlightDetail(label, value) {
        if (!value) return '';

        return `
            <div class="flight-detail">
                <span class="flight-detail-label">${label}:</span>
                <span class="flight-detail-value">
                    ${fieldHasCurrentUser(value) ? '<span class="user-flight-dot"></span>' : ''}
                    <span>${value}</span>
                </span>
            </div>
        `;
    }

    function renderFlightList() {
        const container = document.getElementById('flight-list');
        if (!container) return;
        
        if (!currentDniowkaData || !currentDniowkaData.flights || currentDniowkaData.flights.length === 0) {
            container.innerHTML = `<div class="text-center text-white/60 py-10">Brak lotów do wyświetlenia.</div>`;
            return;
        }
        
        let flightsToShow = currentDniowkaData.flights;
        
        if (currentTab === 'mine' && currentUser) {
            flightsToShow = currentDniowkaData.flights.filter(flight => isUserFlight(flight));
        }
        
        if (flightsToShow.length === 0) {
            container.innerHTML = `<div class="text-center text-white/60 py-10">${currentTab === 'mine' ? 'Brak przypisanych lotów.' : 'Brak lotów.'}</div>`;
            return;
        }
        
        container.innerHTML = flightsToShow.map((flight, index) => `
            <div class="flight-card" data-flight-index="${index}">
                <div class="flight-card-header">
                    <div class="flight-number">
                        ${flight.number} ${flight.direction ? '✈️ ' + flight.direction : ''}
                    </div>
                    <div class="flight-time">${normalizeFlightTime(flight.time)}</div>
                </div>
                <div class="flight-card-content">
                    ${renderFlightDetail('Check-in', flight.checkin)}
                    ${renderFlightDetail('Boarding', flight.boarding)}
                    ${renderFlightDetail('Opieka', flight.care)}
                    ${renderFlightDetail('NR CKI', flight.nrCki)}
                    ${renderFlightDetail('NR GATE', flight.gate)}
                    ${renderFlightDetail('PAX', flight.pax)}
                    ${renderFlightDetail('Uwagi', flight.remarks)}
                    ${renderFlightDetail('PPS', flight.pps)}
                    ${renderFlightDetail('Znaki', flight.znaki)}
                </div>
            </div>
        `).join('');
        
        // Add click listeners to expand cards
        container.querySelectorAll('.flight-card').forEach(card => {
            card.addEventListener('click', () => {
                card.classList.toggle('active');
            });
        });
    }

    function setupTabListeners() {
        const tabAll = document.getElementById('tab-all');
        const tabMine = document.getElementById('tab-mine');
        
        if (tabAll && tabMine) {
            tabAll.addEventListener('click', () => {
                currentTab = 'all';
                tabAll.classList.add('active');
                tabMine.classList.remove('active');
                renderFlightList();
            });
            
            tabMine.addEventListener('click', () => {
                currentTab = 'mine';
                tabMine.classList.add('active');
                tabAll.classList.remove('active');
                renderFlightList();
            });
        }
    }

    function renderSearchResults(filter = '', data, tiles = null) {
        const container = document.getElementById('search-results');
        if (!container) return;

        const lowerFilter = filter.toLowerCase();
        
        // Filtruj dane operacyjne
        const filteredOperational = data ? data.filter(item => 
            item.title.toLowerCase().includes(lowerFilter) ||
            item.desc.toLowerCase().includes(lowerFilter)
        ) : [];

        // Filtruj kody SSR w zależności od linii lotniczej
        let codes = ssrCodes;
        if (currentAirline === 'Wizz Air') {
            codes = ssrWizzCodes;
        }
        const filteredSSR = codes.filter(item => 
            item.code.toLowerCase().includes(lowerFilter) ||
            item.desc.toLowerCase().includes(lowerFilter)
        );

        const filteredTiles = tiles ? tiles.filter(t =>
            (t.label || '').toLowerCase().includes(lowerFilter)
        ) : [];

        let html = '';

        // Jeśli filtr pusty, pokaż banner
        if (!filter) {
            renderOperationalBanner(data);
            if (tiles) renderAirlineTiles('', tiles);
            return;
        }

        // Wygeneruj wyniki
        if (filteredOperational.length > 0) {
            html += `
                <div class="info-banner mb-4">
                    <p class="font-bold mb-2">Operational Times (STD):</p>
                    <ul class="space-y-2 text-sm">
                        ${filteredOperational.map(item => `
                            <li>
                                <div>• ${item.title}: <span class="text-pink-300">${item.desc}</span></div>
                                ${item.note ? `<div class="text-xs text-white/60 mt-1 leading-snug">(${item.note})</div>` : ''}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        if (filteredTiles.length > 0) {
            html += `
                <p class="font-bold mb-2">Kafelki:</p>
                <div class="airline-grid mb-4">
                    ${filteredTiles.map(t => {
                        const dataTopic = t.topic ? ` data-topic="${t.topic}"` : '';
                        return `<div class="mini-card" data-action="${t.action}"${dataTopic}>${t.label}</div>`;
                    }).join('')}
                </div>
            `;
        }

        if (filteredSSR.length > 0) {
            html += `
                <p class="font-bold mb-2">Kody SSR:</p>
                <div class="space-y-3">
                    ${filteredSSR.map(item => `
                        <div class="procedure-step flex justify-between items-start">
                            <span class="font-bold text-pink-300 min-w-[80px]">${item.code}</span>
                            <span class="text-sm text-white/80 flex-1 ml-4">${item.desc}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (!filteredOperational.length && !filteredSSR.length) {
            html = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Brak wyników dla "${filter}"</p>
                </div>
            `;
        }

        container.innerHTML = html;
        if (tiles) renderAirlineTiles(filter, tiles);
    }

    // Back Navigation
    backButtons.forEach(btn => btn.addEventListener('click', () => showView('view-main')));
    backButtonsPrm.forEach(btn => btn.addEventListener('click', () => showView('view-prm')));
    backButtonsAirlines.forEach(btn => btn.addEventListener('click', () => showView('view-airlines')));
    backButtonSsr.addEventListener('click', () => showAirlineDetail(currentAirline));
    backButtonTopic.addEventListener('click', () => showAirlineDetail(currentAirline));

    window.addEventListener('popstate', () => showView('view-main'));
});
