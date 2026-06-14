document.addEventListener('DOMContentLoaded', () => {
    const splash = document.getElementById('splash-screen');
    const appContainer = document.getElementById('app-container');
    const loaderBar = document.getElementById('loader-bar');
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
    const ssrContainer = document.getElementById('ssr-container');
    const backButtonTopic = document.getElementById('back-button-topic');
    const topicTitle = document.getElementById('topic-title');
    const topicContent = document.getElementById('topic-content');

    let currentAirline = '';
    let currentTopic = '';

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
    const duration = 1500;
    const startTime = performance.now();

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

    const operationalData = [
        { title: 'Check-in opens', desc: '2h ETD' },
        { title: 'Check-in closes', desc: '40 min ETD' },
        { title: 'Boarding starts', desc: '50-51 min ETD', note: 'skanujemy pierwsze 15 osób z priorytetem jeśli na rejsie jest więcej niż 30 osób z PS' },
        { title: 'Boarding closes', desc: '15 min ETD' }
    ];

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
                <div id="ryanair-tiles" class="airline-grid mt-4"></div>
            `;

            setTimeout(() => {
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    searchInput.addEventListener('input', (e) => {
                        renderSearchResults(e.target.value);
                    });
                }
                renderSearchResults('');
                renderRyanairTiles('');
            }, 0);
        } else if (airline === 'Ryanair Sun') {
            airlineInfoContainer.innerHTML = `<div id="search-results"></div>`;
            renderOperationalBanner();
        } else if (airline === 'Wizz Air') {
            airlineInfoContainer.innerHTML = `
                <div class="mini-card" data-action="ssr">
                    <span class="font-bold">Kody SSR</span>
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

        showView('view-airline-detail');
    }

    function renderOperationalBanner() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = `
                <div class="info-banner mb-4">
                    <p class="font-bold mb-2">ETD:</p>
                    <ul class="space-y-2 text-sm">
                        ${operationalData.map(item => `
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

    function renderRyanairTiles(filter = '') {
        const container = document.getElementById('ryanair-tiles');
        if (!container) return;

        const q = filter.trim().toLowerCase();
        const tiles = q
            ? ryanairTiles.filter(t => (t.label || '').toLowerCase().includes(q))
            : ryanairTiles;

        container.innerHTML = tiles.map(t => {
            const dataTopic = t.topic ? ` data-topic="${t.topic}"` : '';
            return `<div class="mini-card" data-action="${t.action}"${dataTopic}>${t.label}</div>`;
        }).join('');
    }

    function openTopic(topic) {
        currentTopic = topic;
        topicTitle.textContent = topic;
        
        if (topic === 'OVERBOOKING') {
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
                                <div>Pasażerowie na powrotnej rezerwacji</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Sprawdzamy w check in → advanced → wpisujemy cały numer rezerwacji → zaznaczamy coś tam nie pamiętam co tam jest napisane</div>
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

        } else {
            topicContent.innerHTML = `
                <div class="procedure-step text-center py-10">
                    <p class="text-white/40 italic">Treść w przygotowaniu.</p>
                </div>
            `;
        }
        
        showView('view-topic');
    }

    function renderSearchResults(filter = '') {
        const container = document.getElementById('search-results');
        if (!container) return;

        const lowerFilter = filter.toLowerCase();
        
        // Filtruj dane operacyjne
        const filteredOperational = operationalData.filter(item => 
            item.title.toLowerCase().includes(lowerFilter) ||
            item.desc.toLowerCase().includes(lowerFilter)
        );

        // Filtruj kody SSR
        const filteredSSR = ssrCodes.filter(item => 
            item.code.toLowerCase().includes(lowerFilter) ||
            item.desc.toLowerCase().includes(lowerFilter)
        );

        const filteredTiles = ryanairTiles.filter(t =>
            (t.label || '').toLowerCase().includes(lowerFilter)
        );

        let html = '';

        // Jeśli filtr pusty, pokaż banner
        if (!filter) {
            renderOperationalBanner();
            renderRyanairTiles('');
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
        renderRyanairTiles(filter);
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
