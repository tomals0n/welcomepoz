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

    let currentAirline = '';
    let currentTopic = '';
    
    // PIN handling
    const pinMainInput = document.getElementById('pin-main-input');
    const pinDots = document.querySelectorAll('.pin-dot');
    const pinSubmit = document.getElementById('pin-submit');
    const pinError = document.getElementById('pin-error');
    const CORRECT_PIN = '5559';
    
    // Variables for splash animation (resetable)
    let duration;
    let startTime;
    
    // Focus main input when clicking on the container
    pinMainInput.parentElement.addEventListener('click', () => {
        pinMainInput.focus();
    });
    
    // Handle PIN input
    pinMainInput.addEventListener('input', (e) => {
        // Only allow digits
        if (!/^\d*$/.test(e.target.value)) {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
        }
        
        // Limit to 4 digits
        if (e.target.value.length > 4) {
            e.target.value = e.target.value.slice(0, 4);
        }
        
        // Update dots
        updatePinDots(e.target.value.length);
        
        // Hide error when typing
        pinError.classList.add('hidden');
    });
    
    // Handle backspace for better UX
    pinMainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            setTimeout(() => {
                updatePinDots(pinMainInput.value.length);
            }, 0);
        }
    });
    
    function updatePinDots(count) {
        pinDots.forEach((dot, index) => {
            if (index < count) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }
    
    // Handle submit button
    pinSubmit.addEventListener('click', checkPin);
    
    // Also submit when Enter is pressed
    pinMainInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkPin();
        }
    });
    
    function checkPin() {
        const enteredPin = pinMainInput.value;
        if (enteredPin.length === 4) {
            if (enteredPin === CORRECT_PIN) {
                // Correct PIN - show splash screen
                pinError.classList.add('hidden');
                pinScreen.style.opacity = '0';
                pinScreen.style.visibility = 'hidden';
                setTimeout(() => {
                    pinScreen.remove();
                }, 800);
                
                // Reset and start splash animation
                duration = 3000;
                startTime = performance.now();
                loaderBar.style.width = '0%'; // Reset progress bar
                splash.style.opacity = '1';
                splash.style.visibility = 'visible';
                requestAnimationFrame(animateSplash);
            } else {
                // Wrong PIN - show error and clear inputs
                pinError.classList.remove('hidden');
                pinMainInput.value = '';
                updatePinDots(0);
                pinMainInput.focus();
                // Hide error after 2 seconds
                setTimeout(() => {
                    pinError.classList.add('hidden');
                }, 2000);
            }
        }
    }

    // --- Dane krajów dla dokumentów wjazdowych ---
    const countriesData = [
        { name: 'Turcja', document: 'Paszport ważny co najmniej 5 miesięcy', api: true },
        { name: 'Egipt', document: 'Paszport ważny co najmniej 6 miesięcy', api: true },
        { name: 'Grecja', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: true },
        { name: 'Albania', document: 'Paszport ważny co najmniej 3 miesięcy', api: true },
        { name: 'Hiszpania', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: false },
        { name: 'Portugalia', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: false },
        { name: 'Maroko', document: 'Paszport ważny co najmniej 6 miesięcy', api: true },
        { name: 'Bułgaria', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: true },
        { name: 'Tunezja', document: 'Paszport ważny co najmniej 6 miesięcy', api: true },
        { name: 'Cypr', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: true },
        { name: 'Czarnogóra', document: 'Paszport ważny co najmniej 3 miesięcy', api: true },
        { name: 'Chorwacja', document: 'Paszport lub dowód tożsamości ważny co najmniej 3 miesięcy', api: true },
        { name: 'Tanzania', document: 'Paszport ważny co najmniej 6 miesięcy', api: true }
    ];
    
    // --- Dane kodów SSR ---
    const ssrCodes = [
        { code: 'AACI', desc: 'Bezpłatna odprawa na lotnisku' },
        { code: 'ABAG', desc: 'Bezpłatny bagaż przysługujący z powodów losowych/humanitarnych (np. śmierć bliskiego)' },
        { code: 'ACI', desc: 'Płatna odprawa na lotnisku' },
        { code: 'ADTM', desc: 'Posiłek dla osoby dorosłej.' },
        { code: 'AILC', desc: 'Wózek inwalidzki wąski (pokładowy, do przemieszczania się wzdłuż przejścia między fotelami)' },
        { code: 'ATO2', desc: 'Rezerwacja przez zewnętrznego pośrednika' },
        { code: 'BABY', desc: 'Dodatkowa sztuka wyposażenia dla niemowląt (ograniczenie do maks. 3 sztuk na pasażera)' },
        { code: 'BAFV', desc: 'Nieudana weryfikacja zniżki dla mieszkańców Balearów' },
        { code: 'BAN', desc: 'Odprawa zablokowana dla pasażera z zakazem lotów' },
        { code: 'BAPV', desc: 'Pomyślna weryfikacja zniżki dla mieszkańców Balearów' },
        { code: 'BBBG', desc: 'Bezpłatny bagaż rejestrowany 20 kg dla personelu (w ramach tzw. "Blue Ticket")' },
        { code: 'BBG', desc: 'Pasażer podróżujący z bagażem 20 kg (maksymalnie 3 sztuki na klienta w dowolnej kombinacji)' },
        { code: 'BDGR', desc: 'Podróż z psem przewodnikiem/asystującym – wymaga asysty pieszej (przy wylocie i przylocie) przez lotnisko aż do fotela w samolocie (miejsce dla osób o ograniczonej sprawności ruchowej)' },
        { code: 'BIKE', desc: 'Przewóz roweru przez klienta (waga do 30 kg, ograniczenie do 2 rowerów na pasażera)' },
        { code: 'BLDP', desc: 'Osoba niewidoma lub niedowidząca – podróżująca samotnie lub z widzącym towarzyszem – niewymagająca asysty lotniskowej' },
        { code: 'BLND', desc: 'Osoba niewidoma lub niedowidząca – wymagająca asysty pieszej' },
        { code: 'BPR', desc: 'Płatny ponowny wydruk karty pokładowej.' },
        { code: 'BREK', desc: 'Śniadanie na pokładzie' },
        { code: 'BSDI', desc: 'Specjalna deklaracja wartości bagażu (deklaracja interesu w dostawie)' },
        { code: 'BUGY', desc: 'Wózek dziecięcy / spacerówka / fotelik samochodowy / łóżeczko turystyczne.' },
        { code: 'BULK', desc: 'Duży sprzęt sportowy (opłata naliczana automatycznie): kajak, czółno lub deska surfingowa (do 20 kg). Ograniczenie do 2 sztuk na pasażera.' },
        { code: 'CABA', desc: 'Pasażer opłacił za duży bagaż przy bramce na locie wylotowym' },
        { code: 'CACI', desc: 'Bezpłatna/ulgowa odprawa na lotnisku z powodów losowych.' },
        { code: 'CARS', desc: 'Fotelik samochodowy zatwierdzony do użytku w samolocie - SSR nieużywany przez agentów odprawy i kas biletowych' },
        { code: 'CBAG', desc: 'Bagaż rejestrowany o 10 kg.' },
        { code: 'CHNG', desc: 'Bezpłatna zmiana lotu.' },
        { code: 'COFF', desc: 'Lavazza Coffee ➔ Kawa marki Lavazza' },
        { code: 'CPAP', desc: 'Podróż z aparatem CPAP (aparatem do leczenia bezdechu sennego)' },
        { code: 'DEAF', desc: 'Osoba głucha/głuchoniema – wymaga indywidualnego, osobnego instruktażu bezpieczeństwa' },
        { code: 'DEPA', desc: 'Osoba deportowana podróżująca pod eskortą' },
        { code: 'DEPU', desc: 'Osoba deportowana podróżująca bez eskorty' },
        { code: 'DFEA', desc: 'Dopasowanie taryfy (do użytku wewnętrznego)' },
        { code: 'DPNA', desc: 'Pasażer z niepełnosprawnością intelektualną, poznawczą lub inną niewidoczną niepełnosprawnością, wymagający asysty' },
        { code: 'DSC1', desc: 'Zniżka hiszpańska dla mieszkańców Balearów/Wysp Kanaryjskich wynosząca 75%.' },
        { code: 'DSC2', desc: 'Zniżka hiszpańska dla rodzin wielodzietnych (kategoria ogólna) wynosząca 5%' },
        { code: 'DSC3', desc: 'Zniżka hiszpańska dla rodzin wielodzietnych (kategoria specjalna) wynosząca 10%' },
        { code: 'DSC4', desc: 'Zniżka hiszpańska dla mieszkańców Balearów/Kanarów będących jednocześnie rodziną wielodzietną – 80%' },
        { code: 'DSC5', desc: 'Zniżka hiszpańska dla mieszkańców Balearów/Kanarów będących jednocześnie rodziną wielodzietną – 85%' },
        { code: 'DUTY', desc: 'Lot służbowy pracownika' },
        { code: 'ERAS', desc: 'Erasmus - Taryfa/zniżka dla studentów programu Erasmus.' },
        { code: 'EXPR', desc: 'Rezerwacje ekspresowe' },
        { code: 'EXV', desc: 'Ekspresowa weryfikacja rezerwacji dokonanych w kasie biletowej (ATO)' },
        { code: 'EXST', desc: 'Dodatkowe miejsce obok, np. na instrument lub INF' },
        { code: 'FAMI', desc: 'Taryfa Family Plus' },
        { code: 'FAST', desc: 'Szybsza kontrola bezpieczeństwa' },
        { code: 'GBAG', desc: 'Gate bag ➔ Opłata za zbyt dużą walizkę na GATE' },
        { code: 'GDS', desc: 'Rezerwacja dokonana przez agencję podróży (system GDS)' },
        { code: 'GOLF', desc: 'Sprzęt do gry w golfa' },
        { code: 'GOTO', desc: 'Usługa zagwarantowania miejsca (lub dedykowane krzesło transportowe dla niepełnosprawnych)' },
        { code: 'GRP', desc: 'Rezerwacja grupowa' },
        { code: 'HOLD', desc: 'Hold Fare ➔ Zamrożenie/zablokowanie ceny taryfy' },
        { code: 'HTAC', desc: 'Odwołanie lotu – zakwaterowanie w hotelu zapewnione przez linię' },
        { code: 'INAD', desc: 'Pasażer z odmową wjazdu do kraju docelowego (nieprzyjęty przez straż graniczną)' },
        { code: 'INF', desc: 'Infant - niemowlę (dziecko poniżej 2 roku życia podróżujące na kolanach)' },
        { code: 'ITG', desc: 'Przedmiot (np. wózek) do oddania przy samolocie' },
        { code: 'KIDM', desc: 'Posiłek dla dzieci' },
        { code: 'KITK', desc: 'Batonik Kit Kat (4 paluszki) zamówiony na pokład' },
        { code: 'LEGL', desc: 'Lewa noga w pełnym gipsie' },
        { code: 'LEGR', desc: 'Prawa noga w pełnym gipsie' },
        { code: 'LRB', desc: 'Bagaż przyjęty z ograniczoną odpowiedzialnością linii lotniczej (np. ze względu na wcześniejsze uszkodzenie)' },
        { code: 'MAAS', desc: 'Asysta lotniskowa „meet and assist”' },
        { code: 'MACI', desc: 'Opłata za odprawę na lotnisku naliczona w aplikacji mobilnej' },
        { code: 'MBAB', desc: 'Wyposażenie dla niemowląt dodane przez aplikację mobilną' },
        { code: 'MDO', desc: 'Urządzenie medyczne przewożone/używane na pokładzie' },
        { code: 'MMUS', desc: 'Sprzęt muzyczny dodany przez aplikację mobilną' },
        { code: 'MSPR', desc: 'Sprzęt sportowy dodany przez aplikację mobilną.' },
        { code: 'MUSC', desc: 'Instrument muzyczny (ograniczenie do 1 sztuki na pasażera)' },
        { code: 'NAMC', desc: 'Korekta imienia/nazwiska do 3 znaków' },
        { code: 'NAME', desc: 'Bezpłatna zmiana danych pasażera (imienia/nazwiska)' },
        { code: 'NPV', desc: 'Weryfikacja dokumentu tożsamości / paszportu' },
        { code: 'OEAC', desc: 'Odprawa na lotnisku dla linii Lauda' },
        { code: 'OVER', desc: 'Odmowa przyjęcia na pokład z powodu overbookingu' },
        { code: 'OXYG', desc: 'Wymagany tlen medyczny na pokładzie (rezerwacja wyłącznie przez infolinię ds. specjalnej asysty)' },
        { code: 'PBAG', desc: 'Płatny bagaż podręczny 10 kg dokupiony w gate/zbyt duży bagaż podręczny' },
        { code: 'PETC', desc: 'Pasażer podróżujący z psem przewodnikiem/asystującym w kabinie – niewymagający dodatkowej asysty lotniskowej (przypisane miejsce dla PRM)' },
        { code: 'PF', desc: 'Pierwszeństwo wejścia na pokład (Taryfa Flexi)' },
        { code: 'PLUS', desc: 'Taryfa Flexi Plus' },
        { code: 'POST', desc: 'Osoby o ograniczonej sprawności ruchowej (PRM) korzystające z zatwierdzonego aparatu podtrzymującego postawę' },
        { code: 'PRIN', desc: 'Chipsy Pringles Original zamówione na pokład' },
        { code: 'PS', desc: 'Pierwszeństwo wejścia na pokład (Priority Boarding)' },
        { code: 'PSHS', desc: 'Pasażerowie korzystający z własnych pasów bezpieczeństwa dla dzieci (system Amsafe CARES lub siedzisko Firefly GoTo)' },
        { code: 'PSIT', desc: 'Płatne (wykupione) miejsce w samolocie' },
        { code: 'RACI', desc: 'Bezpłatna odprawa na lotnisku dla linii partnerskich (w przypadku zakłóceń lotów)' },
        { code: 'RBAG', desc: 'Bezpłatny bagaż 20 kg linii partnerskiej' },
        { code: 'RBBG', desc: 'Bezpłatny bagaż 23 kg dla linii partnerskiej' },
        { code: 'RBP', desc: 'Ponowny bezpłatny wydruk karty pokładowej' },
        { code: 'REGU', desc: 'Taryfa regular' },
        { code: 'SDIW', desc: 'Specjalna deklaracja wartości/interesu dotycząca wózka inwalidzkiego' },
        { code: 'SERV', desc: 'Opłata serwisowa' },
        { code: 'SETA', desc: 'Obowiązkowa opłata za miejsce dla dorosłego podróżującego z dzieckiem poniżej 12 roku życia (w celu posadzenia ich razem)' },
        { code: 'SKI', desc: 'Sprzęt narciarski do 20 kg (maks. 2 zestawy na pasażera; pakiet obejmuje narty, kijki i buty narciarskie)' },
        { code: 'SMI', desc: 'Specjalny przedmiot/sprzęt medyczny' },
        { code: 'SMS', desc: 'Powiadomienie SMS na telefon komórkowy' },
        { code: 'SPRT', desc: 'Sprzęt sportowy do 20 kg (ograniczenie do 2 sztuk na pasażera)' },
        { code: 'STV', desc: 'Standardowa weryfikacja rezerwacji dokonanej w kasie lotniskowej (ATO)' },
        { code: 'SURE', desc: 'Taryfa Plus' },
        { code: 'TACI', desc: 'Bezpłatna odprawa na lotnisku dla pasażerów udających się na przeszczep / transportujących organy' },
        { code: 'TBAG', desc: 'Bezpłatny bagaż 20 kg związany z procedurą przeszczepu' },
        { code: 'TEAS', desc: 'Herbata z menu pokładowego Getaway Café' },
        { code: 'VMEA', desc: 'Posiłek wegetariański' },
        { code: 'VCF', desc: 'Przesłanie/weryfikacja wizy w systemie' },
        { code: 'WATE', desc: 'Woda niegazowana San Benedetto' },
        { code: 'WCBD', desc: 'Wózek inwalidzki lub skuter napędzany suchą baterią lub akumulatorem żelowym' },
        { code: 'WCHC', desc: 'Całkowity brak możliwości samodzielnego poruszania się – asysta wymagająca wniesienia pasażera na fotel samolotu (w tym użycie podnośnika/ambuliftu)' },
        { code: 'WCHR', desc: 'Pasażer potrzebuje wózka/asysty tylko do pokonania dużych odległości na lotnisku – potrafi samodzielnie wejść po schodach i dojść do fotela' },
        { code: 'WCHS', desc: 'Pasażer potrafi przejść kilka kroków na pokładzie, ale potrzebuje pomocy przy poruszaniu się po lotnisku oraz przy wchodzeniu/schodzeniu po schodach podstawionych do samolotu' },
        { code: 'WCLB', desc: 'Wózek lub skuter inwalidzki zasilany baterią litową' },
        { code: 'WCMP', desc: 'Pasażer podróżuje z własnym wózkiem inwalidzkim o napędzie ręcznym' },
        { code: 'BKG', desc: 'Opłata rezerwacyjna' },
        { code: 'EXB', desc: 'Opłata za nadbagaż' },
        { code: 'INFSP', desc: 'Opłata za rezygnację/zmianę w rezerwacji niemowlęcia' },
        { code: 'MDF', desc: 'Opłata za spóźnienie na samolot' },
        { code: 'LINK', desc: 'Opłata za powiązanie rezerwacji (dziecka z osobą dorosłą)' }
    ];

    // --- SPLASH ANIMATION ---

    function animateSplash(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const percentage = progress * 100;
        loaderBar.style.width = `${percentage}%`;

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
        const filtered = ssrCodes.filter(item => 
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

    // Main Triggers
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


    // ETD NA SAMEJ GÓRZE KAŻDEJ LINI LOTNICZEJ
    
    const operationalDataRyanair = [
        { title: 'Check-in opens', desc: '2h ETD' },
        { title: 'Check-in closes', desc: '40 min ETD' },
        { title: 'Boarding starts', desc: '50-51 min ETD', note: 'skanujemy pierwsze 15 osób z priorytetem jeśli na rejsie jest więcej niż 30 osób z PS' },
        { title: 'Boarding closes', desc: '15 min ETD' }
    ];
    
    const operationalDataRyanairSun = [
        { title: 'Check-in opens', desc: '2h ETD' },
        { title: 'Check-in closes', desc: '40 min ETD' },
        { title: 'Boarding starts', desc: '50-51 min ETD' },
        { title: 'Boarding closes', desc: '15 min ETD' }
    ];
    
    const operationalDataWizzAir = [
        { title: 'Check-in opens', desc: '2h ETD' },
        { title: 'Check-in closes', desc: '40 min ETD' },
        { title: 'Boarding starts', desc: '50 min ETD / 1h ETD' },
        { title: 'Boarding closes', desc: '14 min ETD' }
    ];
    
    const operationalDataEnterAir = [
        { title: 'Check-in opens', desc: '2h ETD' },
        { title: 'Check-in closes', desc: '45 min ETD' },
        { title: 'Boarding starts', desc: '45 min ETD' },
        { title: 'Boarding closes', desc: '10 min ETD' }
    ];

    // KAFELKI W KAŻDEJ LINI LOTNICZEJ

    const ryanairTiles = [
        { action: 'topic', topic: 'TARYFY', label: 'TARYFY' },
        { action: 'topic', topic: 'ILE NA REJS', label: 'ILE NA REJS' },
        { action: 'topic', topic: 'OVERBOOKING', label: 'OVERBOOKING' },
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'EXTRA SEAT', label: 'EXTRA SEAT' },
        { action: 'topic', topic: 'KOBIETY W CIĄŻY', label: 'KOBIETY W CIĄŻY' },
        { action: 'topic', topic: 'ODWOŁANIE', label: 'ODWOŁANIE' },
        { action: 'topic', topic: 'LRB', label: 'LRB' },
        { action: 'topic', topic: 'PIES ASYSTUJĄCY', label: 'PIES ASYSTUJĄCY' },
        { action: 'ssr', label: 'SSR' }
    ];
    
    const enterAirTiles = [
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'Kobiety w ciąży', label: 'Kobiety w ciąży' },
        { action: 'topic', topic: 'Przedziały wiekowe', label: 'Przedziały wiekowe'},
        { action: 'topic', topic: 'UMNR', label: 'UMNR'},
    ];

    function showAirlineDetail(airline) {
        currentAirline = airline;
        airlineDetailName.textContent = airline;
        airlineInfoContainer.innerHTML = '';

        if (airline === 'Ryanair') {
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
                        renderSearchResults(e.target.value, operationalDataRyanair, ryanairTiles);
                    });
                }
                renderSearchResults('', operationalDataRyanair, ryanairTiles);
                renderAirlineTiles('', ryanairTiles);
            }, 0);
        } else if (airline === 'Ryanair Sun') {
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
            `;
            renderOperationalBanner(operationalDataRyanairSun);
        } else if (airline === 'Wizz Air') {
            airlineInfoContainer.innerHTML = `
                <div class="mb-4">
                    <input type="text" id="search-input" placeholder="Wyszukiwarka"
                           class="w-full p-3 bg-white/10 border border-pink-300/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:border-pink-300">
                </div>
                <div id="search-results"></div>
                <div class="mini-card" data-action="ssr" style="margin-top: 1rem;">
                    <span class="font-bold">Kody SSR</span>
                </div>
            `;
            renderOperationalBanner(operationalDataWizzAir);
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
                    <p class="font-bold mb-2">ETD:</p>
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
    }

    function openTopic(topic) {
        currentTopic = topic;
        topicTitle.textContent = topic;
        
        if (topic === 'EMEX') {
            if (currentAirline === 'Enter Air') {
                topicContent.innerHTML = `
                    <div class="accordion-top-title">Emergency Seats</div>
                    
                    <div class="accordion-item mb-3">
                        <div class="accordion-header" data-accordion="1">
                            <span>Miejsca przy wyjściach awaryjnych nie mogą być zajmowane przez:</span>
                            <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner">
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów o ograniczonej sprawności ruchowej.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów wymagających szczególnej pomocy.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby niewidome, niedowidzące, niesłyszące lub niedosłyszące, które mogłyby z opóźnieniem zareagować na polecenie ewakuacji.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Kobiety w ciąży.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów podróżujących ze zwierzętami w kabinie.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby deportowane, pasażerów niewpuszczonych do kraju (INAD) oraz osoby zatrzymane/aresztowane.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów mających ograniczoną zdolność komunikowania się w języku załogi (polskim lub angielskim).</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Niemowlęta, dzieci, małoletnich do 16. roku życia oraz małoletnich podróżujących bez opieki (UMNR).</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów o znacznie większych lub mniejszych niż przeciętne gabarytach, wadze lub wzroście, pasażerów otyłych oraz osób, które z powodu wieku lub choroby mogą nie być zdolne do wykonania czynności wymaganych w sytuacji awaryjnej lub do stosowania się do poleceń załogi.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerowie siedzący bezpośrednio przy wyjściach awaryjnych muszą zostać sprawdzeni pod kątem zdolności komunikowania się w języku załogi (polskim lub angielskim), powinni sprawiać wrażenie osób w odpowiedniej kondycji fizycznej oraz być zdolne do udzielenia pomocy załodze podczas ewakuacji samolotu w sytuacji awaryjnej.</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Niemowlęta muszą być umieszczane w rzędzie, w którym dostępna jest dodatkowa maska tlenowa (maksymalnie jedno niemowlę w rzędzie).</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                // Ryanair's EMEX (or other airlines) - placeholder for now
                topicContent.innerHTML = `
                    <div class="procedure-step text-center py-10">
                        <p class="text-white/40 italic">Treść w przygotowaniu.</p>
                    </div>
                `;
            }
            
            setTimeout(() => {
                document.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        content.classList.toggle('open');
                        icon.classList.toggle('open');
                    });
                });
            }, 0);
        } else if (topic === 'Przedziały wiekowe' && currentAirline === 'Enter Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Przedziały wiekowe</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>INF</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>0-2 lat (pierwsze 7. dni życia musi być zaakceptowane przez lekarza)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>do 15 INF na rejs</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 sztuka bagażu podręcznego 5kg</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>CHILD</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>2-12 lat</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż rejestrowany (kilogramy w zależności od kierunku)</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>YOUNG PASSENGERS</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>12-16 lat</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż rejestrowany (kilogramy w zależności od kierunku)</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                document.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        content.classList.toggle('open');
                        icon.classList.toggle('open');
                    });
                });
            }, 0);
        } else if (topic === 'OVERBOOKING') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Postępowanie w przypadku overbookingu</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Kto musi lecieć?</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>PRM</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Rodziny z dziećmi na jednej rezerwacji</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Rezerwacje grupowe</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerowie z wykupionym miejscem</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerowie na powrotnej rezerwacji (Sprawdzamy w check in → advanced → wpisujemy cały numer rezerwacji → zaznaczamy coś tam nie pamiętam co tam jest napisane)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Przed rozpoczęciem odprawy (check-in)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">W przypadku, gdy liczba odprawionych pasażerów przekracza liczbę dostępnych miejsc w samolocie:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Sprawdzamy, ilu pasażerów nie ma przydzielonego miejsca w samolocie.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Weryfikujemy, którzy pasażerowie odprawili się jako ostatni (numer sequence).</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Ustalamy, czy dany pasażer musi podróżować (kto może lecieć, a kto nie).</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Sprawdzamy najbliższe dostępne połączenia alternatywne (w razie potrzeby można skonsultować się z PPO).</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Przygotowujemy informacje dotyczące praw pasażera w przypadku odmowy przyjęcia na pokład.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Podczas odprawy (check-in)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Ogłaszamy overbooking (podczas odprawy najlepiej 2-3 razy).</div>
                            </div>
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Jeśli istnieje ryzyko, że pasażer nie poleci, a nadaje bagaż rejestrowany:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Informujemy pasażera o zaistniałej sytuacji.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Do przywieszki bagażowej doklejamy oznaczenie "STANDBY".</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zgłaszamy do sortowni informację o bagażu "STANDBY".</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>Podczas boardingu</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerów bez miejsca zgłaszających się podczas boardingu informujemy o overbookingu i prosimy o oczekiwanie do zakończenia boardingu.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Czekamy do końca boardingu, aby upewnić się, że wszyscy pasażerowie mieli możliwość zgłoszenia się do wejścia na pokład.</div>
                            </div>
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Jeśli wszyscy pasażerowie z listy przyszli do gate:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Przed zamknięciem systemu weryfikujemy na pokładzie, czy wszystkie miejsca są faktycznie zajęte.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jeśli któreś miejsce pozostaje wolne, potwierdzamy, że przypisany do niego pasażer nie znajduje się na pokładzie.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Wolne miejsca przydzielamy pasażerom zgodnie z kolejnością na liście oczekujących (numer sequence odprawy).</div>
                            </div>
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Pasażerów, którzy nie zostali przyjęci na pokład:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Kierujemy do PPO w celu przebukowania na najbliższy dostępny rejs.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>W miarę możliwości osobiście odprowadzamy pasażera lub przekazujemy osobie w PPO informację ile osób i kto przyjdzie.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dbamy o to, aby pasażer czuł się odpowiednio zaopiekowany i otrzymał niezbędne wsparcie oraz informacje dotyczące dalszej podróży.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zamykamy system i przekazujemy rampie informację o ilości pasażerów na pokładzie.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                document.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        content.classList.toggle('open');
                        icon.classList.toggle('open');
                    });
                });
            }, 0);

        } else if (topic === 'LRB') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Limited Release Bags (LRB)</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Co to jest LRB?</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Limited Release (LR) to procedura stosowana podczas przyjęcia bagażu rejestrowanego podczas odprawy, gdy:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż jest już uszkodzony,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż/opakowanie nie spełnia standardu (np. słabe, niestabilne, nieodpowiednie zabezpieczenie),</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>a pasażer mimo poinformowania o ryzyku decyduje się nadać bagaż.</div>
                            </div>
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Cel LR:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Udokumentować stan i potwierdzić, że pasażer został poinformowany, a przewoźnik przyjmuje bagaż z zastrzeżeniem ograniczonej odpowiedzialności – pasażer nie będzie rościł odszkodowania za bagaż.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Kiedy STOSUJEMY Limited Release?</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Stosuj LR, gdy bagaż jest przyjmowany, ale występuje realne ryzyko dalszego uszkodzenia lub reklamacji wynikającej z jego stanu/opakowania.</div>
                            </div>
                            
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Bagaż już uszkodzony:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>pęknięta obudowa walizki, naderwana tkanina</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>uszkodzone kółka, rączka, zamki</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>pęknięte narożniki, wygięta rama</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>wcześniej oklejany/naprawiany „na szybko” (taśmy, opaski)</div>
                            </div>
                            
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Niewłaściwe opakowanie / zabezpieczenie:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>torby/plecaki bez sztywnych ścian, z luźnymi paskami</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>kartony, worki, reklamówki, foliowe torby (jeśli przewoźnik dopuszcza – zawsze LR)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>przeładowane walizki (rozchodzące się zamki, deformacje)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>brak możliwości stabilnego zamknięcia</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>wystające elementy, luźne paski/taśmy mogące wkręcić się w taśmociąg</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>przedmioty kruche/łamliwe w bagażu rejestrowanym (np. szkło), jeśli pasażer mimo sugestii nie przepakuje</div>
                            </div>

                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Przedmioty „specjalne” w bagażu rejestrowanym:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>sprzęt sportowy w niestandardowym futerale</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>instrument muzyczny w miękkim pokrowcu</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>wózek dziecięcy/elementy z widocznymi śladami eksploatacji (uwaga: tylko jeśli procedura przewoźnika to dopuszcza)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Kiedy NIE STOSUJEMY LR?</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>LR nie zastępuje zasad bezpieczeństwa i warunków przewozu. Nie przyjmujemy bagażu (lub wymagamy przepakowania), gdy:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż zagraża bezpieczeństwu (ostre elementy, wycieki, podejrzenie materiałów niebezpiecznych, zapach paliw/chemikaliów)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>nie da się go zamknąć / zawartość wypada / elementy odstają w sposób nieusuwalny</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż jest tak uszkodzony, że nie przejdzie procesu sortowania/transportu (np. brak dna, urwana większa część obudowy)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>przekroczenia limitów: waga/wymiary – tu obowiązuje standardowa procedura dopłat/odmowy, a nie LR</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>pasażer odmawia podpisu/akceptacji warunków LR (jeśli podpis jest wymagany w Waszym procesie)</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>Procedura w przypadku uszkodzonego bagażu</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Informujemy pasażera o uszkodzonym bagażu oraz potrzebie oznaczenia go specjalną limitką z podpisem.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Z tyłu wydrukowanej z GoNow przywieszki bagażowej zaznaczamy uszkodzony bagaż oraz przekazujemy pasażerowi do podpisu.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>W GoNow w rezerwacji pasażera dodajemy w services (f6) SSR Limited Release Bags (LRB), wpisujemy komentarz, gdzie opisujemy co jest uszkodzone oraz numer przywieszki bagażowej.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Wysyłamy do lidera/koordynatora maila z informacją o LRB:</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>data,</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>numer lotu,</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>numer przywieszki bagażowej</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>(Warto dopisać numer rezerwacji oraz co było uszkodzone).</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            setTimeout(() => {
                document.querySelectorAll('.accordion-header').forEach(header => {
                    header.addEventListener('click', () => {
                        const content = header.nextElementSibling;
                        const icon = header.querySelector('.accordion-icon');
                        content.classList.toggle('open');
                        icon.classList.toggle('open');
                    });
                });
            }, 0);

        } else {
            topicContent.innerHTML = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Treść w przygotowaniu.</p>
                </div>
            `;
        }
        
        showView('view-topic');
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

        // Filtruj kody SSR
        const filteredSSR = ssrCodes.filter(item => 
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
                    <p class="font-bold mb-2">Operational Times (ETD):</p>
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

    airlineInfoContainer.addEventListener('click', (e) => {
        const tile = e.target.closest('[data-action]');
        if (!tile) return;

        const action = tile.getAttribute('data-action');
        if (action === 'ssr') {
            renderSSRCodes('');
            showView('view-ssr');
            return;
        }

        if (action === 'topic') {
            const topic = tile.getAttribute('data-topic');
            if (topic) openTopic(topic);
        }
    });

    // Back Navigation
    backButtons.forEach(btn => btn.addEventListener('click', () => showView('view-main')));
    backButtonsPrm.forEach(btn => btn.addEventListener('click', () => showView('view-prm')));
    backButtonsAirlines.forEach(btn => btn.addEventListener('click', () => showView('view-airlines')));
    backButtonSsr.addEventListener('click', () => showAirlineDetail(currentAirline));
    backButtonTopic.addEventListener('click', () => showAirlineDetail(currentAirline));

    window.addEventListener('popstate', () => showView('view-main'));
});
