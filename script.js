document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const loaderBar = document.getElementById('loader-bar');
    const airplane = document.getElementById('airplane-emoji');
    const views = document.querySelectorAll('.view');
    const backButtons = document.querySelectorAll('.back-button');
    const backButtonsPrm = document.querySelectorAll('.back-button-prm');
    const backButtonsAirlines = document.querySelectorAll('.back-button-airlines');
    
    const prmTrigger = document.getElementById('prm-trigger');
    const prmManualTrigger = document.getElementById('prm-manual-trigger');
    const prmElectricTrigger = document.getElementById('prm-electric-trigger');
    
    const airlinesTrigger = document.getElementById('airlines-trigger');
    const airlineList = document.getElementById('airline-list');
    const airlineDetailName = document.getElementById('detail-airline-name');
    const airlineInfoContainer = document.getElementById('airline-info-container');
    const backButtonSsr = document.getElementById('back-button-ssr');

    let currentAirline = '';

    // --- SPLASH ANIMATION ---
    const duration = 3000;
    const startTime = performance.now();

    function animateSplash(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const percentage = progress * 100;
        loaderBar.style.width = `${percentage}%`;
        airplane.style.left = `${percentage}%`;

        if (progress < 1) {
            requestAnimationFrame(animateSplash);
        } else {
            setTimeout(() => {
                splash.style.opacity = '0';
                splash.style.visibility = 'hidden';
                
                appContainer.style.visibility = 'visible';
                appContainer.style.opacity = '1';
                
                setTimeout(() => {
                    splash.remove();
                    document.body.style.overflow = 'auto';
                }, 800);
            }, 500);
        }
    }

    requestAnimationFrame(animateSplash);

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

    // Main Triggers
    prmTrigger.addEventListener('click', () => showView('view-prm'));
    airlinesTrigger.addEventListener('click', () => showView('view-airlines'));

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

    function showAirlineDetail(airline) {
        currentAirline = airline;
        airlineDetailName.textContent = airline;
        airlineInfoContainer.innerHTML = '';

        if (airline === 'Ryanair' || airline === 'Ryanair Sun') {
            airlineInfoContainer.innerHTML = `
                <div class="info-banner">
                    <p class="font-bold mb-2">Operational Times (ETD):</p>
                    <ul class="space-y-2 text-sm">
                        <li>• Check-in opens: <span class="text-pink-300">2h before</span></li>
                        <li>• Check-in closes: <span class="text-pink-300">40 min before</span></li>
                        <li>• Boarding starts: <span class="text-pink-300">50-51 min before</span> (15 PS)</li>
                        <li>• Boarding closes: <span class="text-pink-300">15 min before</span></li>
                    </ul>
                </div>
            `;
            
           
            if (airline === 'Ryanair') {
                airlineInfoContainer.innerHTML += `
                    <div id="ssr-trigger" class="mini-card mt-4">
                        <span class="font-bold">SSR</span>
                    </div>
                `;
            }
        } else if (airline === 'Wizz Air') {
            airlineInfoContainer.innerHTML = `
                <div id="ssr-trigger" class="mini-card">
                    <span class="font-bold">SSR</span>
                </div>
                <div class="procedure-step text-center mt-4">
                    <p class="text-white/40 italic">Dodatkowe informacje wkrótce...</p>
                </div>
            `;
        } else {
            airlineInfoContainer.innerHTML = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Brak szczegółowych informacji czasowych dla tej linii.</p>
                </div>
            `;
        }

        // Add event listener for dynamic SSR trigger
        const ssrTrigger = document.getElementById('ssr-trigger');
        if (ssrTrigger) {
            ssrTrigger.addEventListener('click', () => showView('view-ssr-detail'));
        }

        showView('view-airline-detail');
    }

    // Back Navigation
    backButtons.forEach(btn => btn.addEventListener('click', () => showView('view-main')));
    backButtonsPrm.forEach(btn => btn.addEventListener('click', () => showView('view-prm')));
    backButtonsAirlines.forEach(btn => btn.addEventListener('click', () => showView('view-airlines')));
    backButtonSsr.addEventListener('click', () => showAirlineDetail(currentAirline));

    window.addEventListener('popstate', () => showView('view-main'));
});
