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

    // Delegated listener for accordions (works on dynamically added content)
    topicContent.addEventListener('click', (e) => {
        const header = e.target.closest('.accordion-header');
        if (header) {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.accordion-icon');
            if (content && icon) {
                content.classList.toggle('open');
                icon.classList.toggle('open');
            }
        }
    });

    let currentAirline = '';
    let currentTopic = '';
    
    // --- USER DATABASE ---
    const users = [
        { pin: '5559', name: 'Jan Kowalski', role: 'Lider' },
        { pin: '1234', name: 'Anna Nowak', role: 'Kierownik' },
        { pin: '9876', name: 'Piotr Skwarek', role: 'Agent Lotniskowy' },
        { pin: '4321', name: 'Maria Wójcik', role: 'Agent Lotniskowy' },
        { pin: '5678', name: 'Krzysztof Kaczmarek', role: 'Lider' },
        { pin: '8765', name: 'Magdalena Zielińska', role: 'Kierownik' },
        { pin: '4557', name: 'Nicole Pietrzak', role: 'Agent Lotniskowy'}
    ];
    
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

    const ssrWizzCodes = [
        { code: 'ACFS', desc: 'Opłata lotniskowa (prowizja)' },
        { code: 'APCI', desc: 'Darmowa odprawa na lotnisku' },
        { code: 'ATFA', desc: 'Transfer lotniskowy – z lotniska' },
        { code: 'ATTA', desc: 'Transfer lotniskowy – na lotnisko' },
        { code: 'AUCI', desc: 'Automatyczna odprawa' },
        { code: 'BAPT', desc: 'Opłata za bagaż rejestrowany 20kg/32kg na check-in/gate na lotnisku' },
        { code: 'BEXC', desc: 'Opłata za nadbagaż na lotnisku' },
        { code: 'BLND', desc: 'Pasażer niewidzący/niedowidzący' },
        { code: 'BONE', desc: 'Bagaż 20 kg x1' },
        { code: 'BTWO', desc: 'Bagaż 20 kg x2' },
        { code: 'BTHR', desc: 'Bagaż 20 kg x3' },
        { code: 'BFOU', desc: 'Bagaż 20 kg x4' },
        { code: 'BFIV', desc: 'Bagaż 20 kg x5' },
        { code: 'BSIX', desc: 'Bagaż 20 kg x6' },
        { code: 'BRB', desc: 'Śledzenie bagażu Blue Ribbon (usługa ubezpieczenia/śledzenia)' },
        { code: 'CABC', desc: 'Opłata za 10kg bagażu rejestrowanego na check-in' },
        { code: 'CABG', desc: 'Opłata za 10kg bagażu rejestrowanego na gate' },
        { code: 'CARR', desc: 'Wykupiona usługa wynajmu samochodu' },
        { code: 'CHKA', desc: 'Opłata za odprawę na lotnisku' },
        { code: 'CHKS', desc: 'Odprawa rozpoczęta (niezakończona)' },
        { code: 'DAA', desc: 'Odbiór przy samolocie (dotyczy np. wózków dziecięcych)' },
        { code: 'DBCR', desc: 'Otrzymane odszkodowanie za odmowę przyjęcia na pokład' },
        { code: 'DBRD', desc: 'Odmowa przyjęcia na pokład (Overbooking / Denied boarding)' },
        { code: 'DEAF', desc: 'Pasażer z dysfunkcją słuchu' },
        { code: 'DEPA', desc: 'Deportowany z eskortą' },
        { code: 'DEPU', desc: 'Deportowany bez eskorty' },
        { code: 'DISR', desc: 'Pasażer agresywny / zakłócający porządek' },
        { code: 'DMBR', desc: 'Fikcyjna/testowa karta pokładowa' },
        { code: 'DPNA', desc: 'Pasażer z niepełnosprawnością intelektualną lub rozwojową wymagający pomocy' },
        { code: 'DUTY', desc: 'Podróż służbowa pracownika' },
        { code: 'EXST', desc: 'Dodatkowe miejsce siedzące (Extra seat)' },
        { code: 'EXTL', desc: 'Dodatkowe miejsce na nogi' },
        { code: 'FAKE', desc: 'Pasażer posługujący się fałszywym dokumentem' },
        { code: 'FARL', desc: 'Blokada ceny biletu (Fare lock)' },
        { code: 'FGCC', desc: 'Wymuszone akceptowanie Ogólnych Warunków Przewozu' },
        { code: 'FRRS', desc: 'Rezerwacja miejsca' },
        { code: 'FSEC', desc: 'Fast track' },
        { code: 'FSTR', desc: 'Fast track' },
        { code: 'GOTW', desc: 'Taryfa Go fare' },
        { code: 'GRSN', desc: 'Rezerwacja grupowa – senior' },
        { code: 'GRST', desc: 'Rezerwacja grupowa – student' },
        { code: 'HAJJ', desc: 'Pasażer posiadający wizę Hadżdż (pielgrzymka do Mekki)' },
        { code: 'HLUG', desc: 'Serwis dotyczący bagażu podręcznego (do nadania za darmo)' },
        { code: 'HNST', desc: 'Ukryte miejsce (na stronie internetowej, w aplikacji)' },
        { code: 'HVBD', desc: 'Deklaracja bagażu o wysokiej wartości' },
        { code: 'IMPS', desc: 'Podszywanie się pod inną osobę (pasażer posługujący się autentycznym dokumentem podróży innej osoby)' },
        { code: 'INAD', desc: 'Pasażer z zakazem wjazdu / nieuprawniony do przekroczenia granicy' },
        { code: 'INFT', desc: 'Niemowlę (infant)' },
        { code: 'LCBG', desc: 'Nadwymiarowy bagaż podręczny' },
        { code: 'LONE', desc: 'Bagaż 23 kg x1' },
        { code: 'LTWO', desc: 'Bagaż 23 kg x2' },
        { code: 'LTHR', desc: 'Bagaż 23 kg x3' },
        { code: 'LFOU', desc: 'Bagaż 23 kg x4' },
        { code: 'LFIV', desc: 'Bagaż 23 kg x5' },
        { code: 'LSIX', desc: 'Bagaż 23 kg x6' },
        { code: 'LNGE', desc: 'Dostęp do saloniku lotniskowego (Lounge)' },
        { code: 'LONG', desc: 'Dostęp do saloniku lotniskowego (Lounge)' },
        { code: 'MAAS', desc: 'Asysta i pomoc dla pasażera (Meet and assist)' },
        { code: 'MASK', desc: 'Zwolniony z obowiązku noszenia maseczki na pokładzie' },
        { code: 'MDDL', desc: 'Dodatkowa przestrzeń Wizz (Wizz Xtra Space)' },
        { code: 'MEQP', desc: 'Sprzęt medyczny' },
        { code: 'MOCI', desc: 'Odprawa mobilna' },
        { code: 'MONE', desc: 'Bagaż 26 kg x1' },
        { code: 'MTWO', desc: 'Bagaż 26 kg x2' },
        { code: 'MTHR', desc: 'Bagaż 26 kg x3' },
        { code: 'MFOU', desc: 'Bagaż 26 kg x4' },
        { code: 'MFIV', desc: 'Bagaż 26 kg x5' },
        { code: 'MSIX', desc: 'Bagaż 26 kg x6' },
        { code: 'NCFI', desc: 'Bezpłatna zmiana danych/nazwiska dla niemowlęcia' },
        { code: 'NCFR', desc: 'Dokonano bezpłatnej zmiany danych/nazwiska' },
        { code: 'NOFL', desc: 'Pasażer objęty zakazem lotów – pasażer wpisany na firmową listę osób z zakazem latania' },
        { code: 'OXY', desc: 'Tlen medyczny' },
        { code: 'OLCI', desc: 'Odprawa online' },
        { code: 'PASS', desc: 'Pierwszeństwo wejścia na pokład' },
        { code: 'PNULL', desc: 'Bagaż 32 kg x0' },
        { code: 'PONE', desc: 'Bagaż 32 kg x1' },
        { code: 'PTWO', desc: 'Bagaż 32 kg x2' },
        { code: 'PTHR', desc: 'Bagaż 32 kg x3' },
        { code: 'PFOU', desc: 'Bagaż 32 kg x4' },
        { code: 'PFIV', desc: 'Bagaż 32 kg x5' },
        { code: 'PSIX', desc: 'Bagaż 32 kg x6' },
        { code: 'PLF', desc: 'Formularz lokalizacji pasażera (Passenger Locator Form)' },
        { code: 'PLFA', desc: 'Taryfa rodzinna Plus' },
        { code: 'PLUS', desc: 'Taryfa / pakiet Plus' },
        { code: 'PNUL', desc: 'Brak bagażu' },
        { code: 'POSN', desc: 'Załoga pozycjonowana (przebazowanie personelu)' },
        { code: 'PRB', desc: 'Pierwszeństwo wejścia na pokład' },
        { code: 'PRBA', desc: 'Pierwszeństwo wejścia na pokład wykupione na lotnisku' },
        { code: 'PRK', desc: 'Parking lotniskowy' },
        { code: 'PRMC', desc: 'Zgoda RODO dotycząca pasażerów o ograniczonej sprawności ruchowej' },
        { code: 'PRST', desc: 'Miejsce Premium (Premium seat)' },
        { code: 'SIXT', desc: 'Wykupiony wynajem samochodu w wypożyczalni Sixt' },
        { code: 'SMAR', desc: 'Taryfa / pakiet Smart' },
        { code: 'SMCB', desc: 'Mały bagaż podręczny' },
        { code: 'SMFA', desc: 'Rodzinna taryfa / pakiet Smart' },
        { code: 'SPEA', desc: 'Sprzęt sportowy opłacony na lotnisku' },
        { code: 'SPEQ', desc: 'Sprzęt sportowy' },
        { code: 'SRVA', desc: 'Zwierzę asystujące' },
        { code: 'STAF', desc: 'Pracownik / personel linii' },
        { code: 'STFA', desc: 'Standardowa taryfa rodzinna / pakiet' },
        { code: 'STND', desc: 'Standardowy typ bagażu w systemie GoNow' },
        { code: 'STRD', desc: 'Taryfa / pakiet Wizz Go' },
        { code: 'STRL', desc: 'Typ bagażu: wózek dziecięcy' },
        { code: 'STTG', desc: 'Gwarancja miejsc obok siebie' },
        { code: 'TDFI', desc: 'Bezpłatna zmiana dokumentu podróży niemowlęcia' },
        { code: 'TDFR', desc: 'Bezpłatna zmiana dokumentu podróży pasażera' },
        { code: 'TDNO', desc: 'Weryfikacja dokumentu podróży negatywna' },
        { code: 'TDOK', desc: 'Weryfikacja dokumentu podróży pozytywna' },
        { code: 'TONE', desc: 'Bagaż 10 kg x1' },
        { code: 'TWFA', desc: 'Rodzinna taryfa / pakiet' },
        { code: 'VLTR', desc: 'Ochotnik rezygnujący z lotu w przypadku overbookingu' },
        { code: 'WCBD', desc: 'Wózek inwalidzki non spillable battery' },
        { code: 'WCHC', desc: 'Wózek inwalidzki – pasażer całkowicie unieruchomiony (wymaga wniesienia na miejsce w kabinie)' },
        { code: 'WCHR', desc: 'Wózek inwalidzki – pasażer może chodzić samodzielnie po płycie lotniska' },
        { code: 'WCHS', desc: 'Wózek inwalidzki – pasażer nie może poruszać się po schodach' },
        { code: 'WCMP', desc: 'Wózek inwalidzki manualny' },
        { code: 'WCON', desc: 'Lot bez pokładowego wózka inwalidzkiego - NIE' },
        { code: 'WCOY', desc: 'Lot bez pokładowego wózka inwalidzkiego - TAK' },
        { code: 'WCPB', desc: 'Taryfa / pakiet Wizz Class Plus' },
        { code: 'WCSB', desc: 'Taryfa / pakiet Wizz Class Smart' },
        { code: 'WCIO', desc: 'Blokada odprawy internetowej' },
        { code: 'WDCP', desc: 'Wizz Discount Club Premium' },
        { code: 'WDCL', desc: 'Wizz Discount Club Premium Plus' },
        { code: 'WIZT', desc: 'Pasażer Wizz Tours' },
        { code: 'WTBF', desc: 'Pakiet Wizz Tours' }
        ];
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
    
    const operationalDataRyanair = [
        { title: 'Check-in opens', desc: '2h STD' },
        { title: 'Check-in closes', desc: '40 min STD' },
        { title: 'Boarding starts', desc: '50-51 min STD', note: 'skanujemy pierwsze 15 osób z priorytetem jeśli na rejsie jest więcej niż 30 osób z PS' },
        { title: 'Boarding closes', desc: '15 min STD' }
    ];
    
    const operationalDataRyanairSun = [
        { title: 'Check-in opens', desc: '2h STD' },
        { title: 'Check-in closes', desc: '40 min STD' },
        { title: 'Boarding starts', desc: '50-51 min STD' },
        { title: 'Boarding closes', desc: '15 min STD' }
    ];
    
    const operationalDataWizzAir = [
        { title: 'Check-in opens', desc: '2h STD' },
        { title: 'Check-in closes', desc: '40 min STD' },
        { title: 'Boarding starts', desc: '50 min STD / 1h STD' },
        { title: 'Boarding closes', desc: '14 min STD' }
    ];
    
    const operationalDataRyanairBuzz = [...operationalDataRyanair]; // Same as Ryanair
    const operationalDataEnterAir = [
        { title: 'Check-in opens', desc: '2h STD' },
        { title: 'Check-in closes', desc: '45 min STD' },
        { title: 'Gate Opens', desc: '45 min STD'},
        { title: 'Boarding starts', desc: '30 min STD' },
        { title: 'Boarding closes', desc: '10 min STD' }
    ];
    const operationalDataOmega = [
        { title: 'Check-in opens', desc: '3h STD' },
        { title: 'Check-in closes', desc: '1h STD' },
        { title: 'Boarding starts', desc: '1h STD' }
    ];

    // KAFELKI W KAŻDEJ LINI LOTNICZEJ

    const ryanairTiles = [
        { action: 'topic', topic: 'TARYFY', label: 'TARYFY' },
        { action: 'topic', topic: 'KATEGORIE WIEKOWE', label: 'KATEGORIE WIEKOWE' },
        { action: 'topic', topic: 'ILE NA REJS', label: 'ILE NA REJS' },
        { action: 'topic', topic: 'OVERBOOKING', label: 'OVERBOOKING' },
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'EXTRA SEAT', label: 'EXTRA SEAT' },
        { action: 'topic', topic: 'KOBIETY W CIĄŻY', label: 'KOBIETY W CIĄŻY' },
        { action: 'topic', topic: 'ODWOŁADNIE', label: 'ODWOŁADNIE' },
        { action: 'topic', topic: 'LRB', label: 'LRB' },
        { action: 'topic', topic: 'PIES ASYSTUJĄCY', label: 'PIES ASYSTUJĄCY' },
        { action: 'ssr', label: 'SSR' }
    ];

    const ryanairBuzzTiles = [...ryanairTiles]; // Same as Ryanair
    
    const enterAirTiles = [
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'KOBIETY W CIĄŻY', label: 'KOBIETY W CIĄŻY' },
        { action: 'topic', topic: 'PRZEDZIAŁY WIEKOWE', label: 'PRZEDZIAŁY WIEKOWE'},
        { action: 'topic', topic: 'UMNR', label: 'UMNR'},
        { action: 'topic', topic: 'ZWIERZĘTA', label: 'ZWIERZĘTA'},
        { action: 'topic', topic: 'BAGAŻE', label: 'BAGAŻE'},
    ];
    const omegaTiles = [
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'BAGAŻE', label: 'BAGAŻE' },
        { action: 'topic', topic: 'KOBIETA W CIĄŻY', label: 'KOBIETA W CIĄŻY' },
        { action: 'topic', topic: 'UMNR', label: 'UMNR' }
    ];

    const wizzAirTiles = [
        { action: 'topic', topic: 'Kobiety w ciąży', label: 'KOBIETY W CIĄŻY' },
        { action: 'topic', topic: 'Przedziały wiekowe', label: 'PRZEDZIAŁY WIEKOWE' },
        { action: 'topic', topic: 'Pies asystujący', label: 'PIES ASYSTUJĄCY' },
        { action: 'topic', topic: 'Overbooking', label: 'OVERBOOKING' },
        { action: 'topic', topic: 'EMEX', label: 'EMEX' },
        { action: 'topic', topic: 'EXTRA SEAT', label: 'EXTRA SEAT' },
        { action: 'ssr', label: 'SSR' }
    ];

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
        
        if (topic === 'BAGAŻE' && currentAirline === 'Omega (Mavigok)') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">BAGAŻE</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Bagaż rejestrowany</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Na jednego pasażera przysługuje jedna sztuka bagażu rejestrowanego 20kg</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Infant bagaż rejestrowany</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>10kg + wózek/fotelik</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Bagaż podręczny</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Maksymalnie 8kg 55x40x20 cm</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>Poolowanie bagażu</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jeżeli jeden bagaż ma więcej kilogramów niż drugi to dodajemy te dwie wartości do siebie, jednak waga nie może przekroczyć łącznie 40 kg za dwa bagaże i jeden bagaż nie może być cięższy niż 32kg (jest możliwe w obrębie jednej rezerwacji jeżeli jest to rodzina).</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="5">
                        <span>Bagaże sportowe</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>GOLF, BIKE, DIVE, SKI - jeżeli bagaże wcześniej nie zostały opłacone, to pasażer musi opłacić w PPO.</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="6">
                        <span>Bagaż przekraczający 32kg</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Musi być wcześniej zgłoszony i zaakceptowany przez przewoźnika.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (topic === 'KOBIETA W CIĄŻY' && currentAirline === 'Omega (Mavigok)') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">KOBIETA W CIĄŻY</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Ciąża pojedyncza</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Linia MGA nie zaleca podróży po 28 tygodniu ciąży, natomiast przyjmie z zaświadczeniem lekarskim od początku 28 tygodnia ciąży do 36 tygodnia, po 37 tygodniu pasażerka nie może zostać przyjęta na pokład, nawet jeśli posiada zaświadczenie lekarskie.</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Ciąża bliźniacza</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jeśli pasażerka spodziewa się bliźniąt, nie może zostać wpuszczona na pokład po 32 tygodniu ciąży</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Zaświadczenie lekarskie</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>MGA musi otrzymać kopię zaświadczenia lekarskiego przed lotem.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jeśli ciąża przebiega w sposób inny niż prawidłowy, bez względu na czas jej trwania, wymagane będzie zaświadczenie lekarskie stwierdzające, że pasażerka jest zdolna do podróży.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Ważne: Zaświadczenie lekarskie uznaje się za ważne przez 10 dni przed lotem i musi być ono sporządzone w języku angielskim.</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>Po porodzie</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Nie zaleca się podróżowania kobietom w ciągu 7 dni od porodu. W wyjątkowych okolicznościach mogą one zostać przyjęte na podróż, ale tylko w towarzystwie osoby z kwalifikacjami medycznymi.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Do potwierdzenia zdolności do lotu wymagane jest upoważnienie medyczne (medical clearance).</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Ważne: Zaświadczenie lekarskie uznaje się za ważne przez 10 dni przed lotem i musi być ono sporządzone w języku angielskim.</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (topic === 'UMNR' && currentAirline === 'Omega (Mavigok)') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">UMNR</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Dziecko 6-12 lat</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dziecko może podróżować samo w wieku 6-12 lat, natomiast musi być jako UM</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Nie może siedzieć w wyjściu awaryjnym</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Na rejsach MGA UM dozwolone tylko, jeżeli przydzielony jest specjalny personel podkładowy dla UM</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Młodzi pasażerowie 12-18 lat</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Młodzi pasażerowie 12-18 lat mogą podróżować samodzielnie lub na żądanie jako UMNR</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (topic === 'EMEX') {
            if (currentAirline === 'Omega (Mavigok)') {
                topicContent.innerHTML = `
                    <div class="accordion-top-title">EMEX</div>
                    
                    <div class="accordion-item mb-3">
                        <div class="accordion-header" data-accordion="1">
                            <span>W rzędzie ewakuacyjnym nie mogą siedzieć:</span>
                            <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner">
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Infanty</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby poniżej 15 r.ż</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Kobiety w ciąży</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>PRM</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerowie z ograniczoną mobilnością ze względu na większą posturę, chorobę, wiek</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerowie cierpiący psychicznie, którzy mogą mieć problemy z szybkim poruszaniem, kiedy zostaną o to poproszeni</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby deportowane</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerowie podróżujący ze zwierzętami</div>
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
            } else if (currentAirline === 'Wizz Air') {
                topicContent.innerHTML = `
                    <div class="accordion-top-title">EMEX</div>
                    
                    <div class="accordion-item mb-3">
                        <div class="accordion-header" data-accordion="1">
                            <span>W rzędzie ewakuacyjnym nie mogą siedzieć:</span>
                            <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                        <div class="accordion-content">
                            <div class="accordion-content-inner">
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>INF (do 2 r.ż)</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Dzieci</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby poniżej 16 r.ż</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Kobiety w ciąży</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby niepełnosprawne</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>UMNR</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów z ograniczoną mobilnością ze względu na większą posturę, chorobę czy wiek</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów cierpiących na choroby psychiczne, którzy mogą mieć problemy z szybkim przemieszczaniem się, gdy zostaną o to poproszeni</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Osoby deportowane</div>
                                </div>
                                <div class="accordion-list-item">
                                    <div class="accordion-bullet"></div>
                                    <div>Pasażerów podróżujących ze zwierzętami</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            } else if (currentAirline === 'Enter Air') {
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
        } else if (topic === 'EMEX' && (currentAirline === 'Ryanair' || currentAirline === 'Ryanair Buzz')) {
            topicContent.innerHTML = `
                <div class="accordion-top-title">EMEX</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>W rzędzie ewakuacyjnym nie mogą siedzieć:</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>INF (do 2 r.ż)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dzieci</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Osoby poniżej 16 r.ż</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Kobiety w ciąży</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Osoby niepełnosprawne</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>UMNR</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerów z ograniczoną mobilnością ze względu na większą posturę, chorobę czy wiek</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerów cierpiących na choroby psychiczne, którzy mogą mieć problemy z szybkim przemieszczaniem się, gdy zostaną o to poproszeni</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Osoby deportowane</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pasażerów podróżujących ze zwierzętami</div>
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
        } else if (topic === 'KATEGORIE WIEKOWE' && (currentAirline === 'Ryanair' || currentAirline === 'Ryanair Buzz')) {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Kategorie wiekowe</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>INFANT</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>0-7 dni nie może podróżować</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>8 dni-2 lata</div>
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
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>TEEN</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>12-16 lat (od 16 lat może podróżować samodzielnie)</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>ADULT</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Powyżej 16 lat</div>
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
        } else if (topic === 'ODWOŁADNIE' && (currentAirline === 'Ryanair' || currentAirline === 'Ryanair Buzz')) {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Procedura w przypadku odwołania lotu</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Za obsługę pasażerów w przypadku odwołania lotu odpowiada PPO, w zakresie:</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>przebukowania pasażerów na najbliższe dostępne połączenia</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Przekazanie miejsca noclegu oraz transportu (organizuje lider)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>wydawania informacji o prawach pasażera</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Agenci Check-in mogą wspierać PPO poprzez:</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>wydawania informacji o noclegu, transporcie</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Informowanie pasażerów o postępach przebukowania</div>
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
        } else if (topic === 'LRB' && (currentAirline === 'Ryanair' || currentAirline === 'Ryanair Buzz')) {
            topicContent.innerHTML = `
                <div class="accordion-top-title">LRB - Limited Release</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Limited Release (LR) to procedura stosowana podczas przyjęcia bagażu rejestrowanego podczas odprawy, gdy:</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż jest już uszkodzony, lub</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>bagaż/opakowanie nie spełnia standardu (np. słabe, niestabilne, nieodpowiednie zabezpieczenie)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>a pasażer mimo poinformowania o ryzyku decyduje się nadać bagaż</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Kiedy STOSUJEMY Limited Release (typowe przypadki):</span>
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
                            <div class="accordion-sub-section">
                                <div class="accordion-sub-title">Bagaż już uszkodzony:</div>
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
                            <div class="accordion-sub-section">
                                <div class="accordion-sub-title">Niewłaściwe opakowanie / zabezpieczenie:</div>
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
                            <div class="accordion-sub-section">
                                <div class="accordion-sub-title">Przedmioty „specjalne” w bagażu rejestrowanym (w zależności od zasad przewoźnika):</div>
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
                        <span>Kiedy NIE STOSUJEMY LR (odmowa przyjęcia / inne rozwiązanie):</span>
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
                        <span>Procedura w przypadku uszkodzonego bagażu:</span>
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
                                <div>w GoNow w rezerwacji pasażera dodajemy w services (f6) SSR Limited Release Bags (LRB), wpisujemy komentarz, gdzie opisujemy co jest uszkodzone oraz numer przywieszki bagażowej.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Wysyłamy do lidera/koordynatora maila z informacją o LRB: data, numer lotu, numer przywieszki bagażowej (Warto dopisać numer rezerwacji oraz co było uszkodzone).</div>
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
        } else if (topic === 'ZWIERZĘTA' && currentAirline === 'Enter Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Zwierzęta</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>PETC</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Tylko psy/koty</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Max 8kg z transporterem (48x33x25)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zwierzę musi swobodnie poruszać się w transporterze</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>AVIH</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zwierzę do łuku bagażowego</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Twardy transporter (max 32kg)</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zwierzę musi swobodnie poruszać się w transporterze</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Woda w środku</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>SVAN</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner"></div>
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
        } else if (topic === 'BAGAŻE' && currentAirline === 'Enter Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Bagaże</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Bagaż rejestrowany</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Na jednego pasażera przysługuje 20kg bagażu rejestrowanego (80x120) natomiast należy pamiętać, że dla niektórych destynacji np. ZNZ, SLL (16kg) obowiązują inne limity wagowe.</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Bagaż podręczny</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Na jednego pasażera przysługuje 1 bagaż podręczny 5kg (55x40x20)</div>
                            </div>
                            <div class="accordion-subsection">
                                <div class="accordion-subtitle">Dodatkowo można zabrać:</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>małą torbę podręczną</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Część ubioru</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zakupy z duty free</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Parasol</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jedzenie</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Laptop/kamera</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Bagaż infanta</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Bagaż podręczny 5kg + wózek/fotelik</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>Bagaż sportowy</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner"></div>
                    </div>
                </div>
                
                <div class="info-banner mb-3 flex items-center justify-center gap-3 text-center">
                    <div class="text-amber-400 text-2xl">⚠️</div>
                    <p class="text-white">Nieopłacone bagaże (niepotwierdzone przez linię lotniczą) wysyłamy do opłacenia do PPO.</p>
                </div>
                
                <div class="procedure-step text-white/90">Bagaż przekraczający 32kg potrzebuje wcześniejszej zgody przewoźnika.</div>
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

        } else if (topic === 'Kobiety w ciąży' && currentAirline === 'Wizz Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Kobiety w ciąży</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Podróż po 28. tygodniu ciąży</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="procedure-step text-white/90">
                                Pasażerki po ukończeniu 28. tygodnia ciąży mogą podróżować rejsami Wizz Air wyłącznie po okazaniu zaświadczenia lekarskiego potwierdzającego brak przeciwwskazań do podróży lotniczej. Dokument musi zostać wystawiony nie wcześniej niż 6 dni przed planowaną datą lotu.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Brak zaświadczenia lekarskiego</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="procedure-step text-white/90">
                                W przypadku braku wymaganego zaświadczenia lekarskiego (np. z powodu jego zagubienia, pozostawienia w domu) lub niemożności jego zweryfikowania (np. dokument jest nieczytelny lub sporządzony w języku obcym), pasażerka zobowiązana jest do podpisania Formularza Zrzeczenia się Odpowiedzialności (Disclaimer Form). Podpisanie formularza oznacza przyjęcie do wiadomości, że Wizz Air nie ponosi odpowiedzialności za jakiekolwiek późniejsze problemy zdrowotne pasażerki lub nienarodzonego dziecka związane z podróżą lotniczą. Formularz znajduje się w Załączniku Z i po podpisaniu powinien zostać przesłany za pośrednictwem strony internetowej WHA.
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>Ograniczenia wieku ciąży</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="procedure-step text-white/90">
                                Ze względów bezpieczeństwa kobiety po ukończeniu 34. tygodnia ciąży nie są przyjmowane na pokład samolotów Wizz Air. W przypadku ciąży mnogiej (bliźniaczej lub wielopłodowej) ograniczenie to obowiązuje od ukończenia 32. tygodnia ciąży.
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
        } else if (topic === 'Przedziały wiekowe' && currentAirline === 'Wizz Air') {
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
                                <div>14 dni - 2 lata</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>15 INF na rejs</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Z INF może podróżować osoba mająca 16 lat, dwa infanty, musi być osoba pełnoletnia, nie może siedzieć w rzędzie ewakuacyjnym, rząd przed ani rząd za nim</div>
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
                                <div>2 - 12 lat</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="procedure-step text-white/90">Osoba 16 lat może zabrać ze sobą grupę 10 osób mających 14 lat</div>
                <div class="procedure-step text-white/90">Osoba mająca 14 lat może podróżować samodzielnie</div>
                <div class="procedure-step text-white/90">Fotelik samochodowy jest możliwy do wzięcia na pokład jeśli zostało wykupione dodatkowe miejsce (montowany tyłem do kierunku jazdy)</div>
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
        } else if (topic === 'Pies asystujący' && currentAirline === 'Wizz Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Pies asystujący</div>
                
                <div class="procedure-step text-white/90 mb-3">WizzAir akceptuje wyłącznie certyfikowane psy asystujące osobom z niepełnosprawnościami jako pies przewodnik.</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Zwierzęta asystujące SVAN muszą:</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Być wyłącznie psami.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Na jeden lot może zostać przyjęty tylko jeden pies.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Być zarezerwowane z kodem SSR SRVA.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Być przez cały czas w samolocie w uprzęży, na smyczy lub uwiązane.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Być przeszkolone do właściwego zachowania i znajdować się pod kontrolą swojego przewodnika.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Certyfikat potwierdzający, że pies jest certyfikowanym psem asystującym.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Wszelkie odpowiednie dokumenty określone w przepisach krajów, których dotyczy przewóz.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Posiadać całą niezbędną dokumentację, szczepienia i badania wymagane przez każdy kraj wylotu, przylotu oraz kraje tranzytowe.</div>
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
        } else if (topic === 'Overbooking' && currentAirline === 'Wizz Air') {
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
                                <div>Osoby niepełnosprawne</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Starsze osoby</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Rodziny z dziećmi, infanty</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Młode osoby podróżujące samodzielnie</div>
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
                            <div class="procedure-step text-white/90">W przypadku, gdy liczba odprawionych pasażerów przekracza liczbę dostępnych miejsc w samolocie:</div>
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
                                <div>Przygotowujemy prawa pasażera.</div>
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
                            <div class="procedure-step text-white/90">Jeśli istnieje ryzyko, że pasażer nie poleci, a nadaje bagaż rejestrowany:</div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Informujemy pasażera o zaistniałej sytuacji,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Do przywieszki bagażowej doklejamy oznaczenie „STANDBY”,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zgłaszamy do sortowni informację o bagażu „STANDBY”</div>
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
                                <div>Pasażerów bez miejsca zgłaszających się do podczas boardingu informujemy o overbookingu i prosimy o oczekiwanie do zakończenia boardingu.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Czekamy do końca boardingu, aby upewnić się, że wszyscy pasażerowie mieli możliwość zgłoszenia się do wejścia na pokład.</div>
                            </div>
                            <div class="procedure-step text-white/90">Jeśli wszyscy pasażerowie z listy przyszli do gate:</div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Przed zamknięciem systemu weryfikujemy na pokładzie, czy wszystkie miejsca są faktycznie zajęte,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Jeśli któreś miejsce pozostaje wolne, potwierdzamy, że przypisany do niego pasażer nie znajduje się na pokładzie.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Wolne miejsca przydzielamy pasażerom zgodnie z kolejnością na liście oczekujących (numer sequence odprawy).</div>
                            </div>
                            <div class="procedure-step text-white/90">Pasażerów, którzy nie zostali przyjęci na pokład:</div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Kierujemy do PPO w celu przebukowania na najbliższy dostępny rejs,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>W miarę możliwości osobiście odprowadzamy pasażera lub przekazujemy osobie w PPO informację ile osób i kto przyjdzie,</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dbamy o to, aby pasażer czuł się odpowiednio zaopiekowany i otrzymał niezbędne wsparcie oraz informacje dotyczące dalszej podróży.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Zamykamy system i przekazujemy rampie informacje o ilości pasażerów na pokładzie.</div>
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

        } else if (topic === 'EXTRA SEAT' && currentAirline === 'Wizz Air') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">EXTRA SEAT</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>Przyczyny wykupienia dodatkowego miejsca</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Medycznych</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dla komfortu</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Z powodu przewozu np. Instrumentu</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dla infanta</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>Zasady rezerwacji</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="procedure-step text-white/90">Oba miejsca muszą zostać zarezerwowane w ramach jednej rezerwacji.</div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Pierwsze miejsce należy zarezerwować na dane pasażera, dodając kod SSR EXST.</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Drugie miejsce należy wprowadzić w następujący sposób:</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>Nazwisko: nazwisko pasażera</div>
                            </div>
                            <div class="accordion-list-item" style="margin-left: 2rem;">
                                <div class="accordion-bullet"></div>
                                <div>Imię: EXST</div>
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
        } else if (topic === 'TARYFY' && currentAirline === 'Ryanair') {
            topicContent.innerHTML = `
                <div class="accordion-top-title">Taryfy</div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="1">
                        <span>BASIC</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 mały bagaż podręczny w wymiarach 40x30x20</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="2">
                        <span>REGULAR (SSR - REGU)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 mały bagaż podręczny</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 bagaż kabinowy w wymiarach 55x40x20</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Priorytetowe wejście</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Miejsca w określonych rzędach</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="3">
                        <span>PLUS (SSR - SURE)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 mały bagaż podręczny</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Bagaż rejestrowany 20kg na pasażera</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Darmowa odprawa na lotnisku</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="4">
                        <span>FLEXI PLUS (SSR - PLUS)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 mały bagaż podręczny</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>1 bagaż kabinowy</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Priorytetowe wejście</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Fast track</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Dowolne wybrane miejsce</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Darmowa odprawa na lotnisku</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="accordion-item mb-3">
                    <div class="accordion-header" data-accordion="5">
                        <span>FAMILY PLUS (SSR - FAMI)</span>
                        <svg class="accordion-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="accordion-content">
                        <div class="accordion-content-inner">
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Bagaż rejestrowany 20kg</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Bagaż rejestrowany 10kg na pasażera</div>
                            </div>
                            <div class="accordion-list-item">
                                <div class="accordion-bullet"></div>
                                <div>Bezpłatne miejsca dla dzieci</div>
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

    // --- Dniówka logic ---
    function formatDateKey(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
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
        const todayDate = getDate(0);
        const tomorrowDate = getDate(1);
        if (todayBtn) todayBtn.innerHTML = `Dzisiaj<br><span class="text-xs text-white/60">${formatDateLabel(todayDate)}</span>`;
        if (tomorrowBtn) tomorrowBtn.innerHTML = `Jutro<br><span class="text-xs text-white/60">${formatDateLabel(tomorrowDate)}</span>`;

        // Setup date button listeners
        [todayBtn, tomorrowBtn].forEach(btn => {
            if (btn) {
                btn.addEventListener('click', (e) => {
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
                            currentDniowkaData = dniowkaStorage[dateKey];
                        } else {
                            currentDniowkaData = null;
                        }
                        renderTopInfo();
                        renderUploadSection();
                        renderFlightList();
                    }
                });
            }
        });
        
        // Try to load the saved dniówka for current selected date
        const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
        const dateKey = formatDateKey(selectedDate);
        if (dniowkaStorage[dateKey]) {
            currentDniowkaData = dniowkaStorage[dateKey];
        }
        
        renderTopInfo();
        renderUploadSection();
        renderFlightList();
        setupTabListeners();
    }

    function renderTopInfo() {
        const container = document.getElementById('dniowka-top-info');
        if (!container) return;

        if (currentDniowkaData && currentDniowkaData.topInfo) {
            let html = '';
            if (currentDniowkaData.topInfo.coordinator || currentDniowkaData.topInfo.phone) {
                html += `<div>Koordynator CKI ${currentDniowkaData.topInfo.coordinator || ''} ${currentDniowkaData.topInfo.phone ? 'Tel: ' + currentDniowkaData.topInfo.phone : ''}</div>`;
            }
            if (currentDniowkaData.topInfo.kuwety) {
                html += `<div>KUWETY: ${currentDniowkaData.topInfo.kuwety}</div>`;
            }
            if (currentDniowkaData.topInfo.ppo) {
                html += `<div>${currentDniowkaData.topInfo.ppo}</div>`;
            }
            
            if (html !== '') {
                container.innerHTML = `<div class="text-sm space-y-1">${html}</div>`;
                container.classList.remove('hidden');
            } else {
                container.innerHTML = `<div class="text-center text-white/60">Brak wczytanej dniówki.</div>`;
            }
        } else {
            container.innerHTML = `<div class="text-center text-white/60">Brak wczytanej dniówki.</div>`;
        }
    }

    function renderUploadSection() {
        const container = document.getElementById('dniowka-upload');
        if (!container) return;

        if (currentUser && (currentUser.role === 'Lider' || currentUser.role === 'Kierownik')) {
            container.style.display = 'block';
            container.innerHTML = `
                <div class="file-upload-container">
                    <div class="text-sm font-bold mb-2">Wybierz datę:</div>
                    <div class="date-selector">
                        <button class="date-btn ${currentDateSelection === 'today' ? 'active' : ''}" data-date="today">Dzisiaj</button>
                        <button class="date-btn ${currentDateSelection === 'tomorrow' ? 'active' : ''}" data-date="tomorrow">Jutro</button>
                    </div>
                    <input type="file" id="excel-upload" accept=".xlsx,.xls" style="display:none;">
                    <label for="excel-upload" class="file-upload-label">Wgraj plik Excel</label>
                    ${currentDniowkaData ? `
                        <button id="delete-dniowka" class="file-upload-label" style="background: rgba(255,0,0,0.2); border-image: linear-gradient(135deg, #ff4444, #ff6666) 1;">Usuń dniówkę</button>
                    ` : ''}
                </div>
            `;
            
            // Add listeners
            document.querySelectorAll('.date-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    currentDateSelection = btn.dataset.date;
                    const selectedDate = currentDateSelection === 'today' ? getDate(0) : getDate(1);
                    const key = formatDateKey(selectedDate);
                    if (dniowkaStorage[key]) {
                        currentDniowkaData = dniowkaStorage[key];
                    } else {
                        currentDniowkaData = null;
                    }
                    renderUploadSection();
                    renderTopInfo();
                    renderFlightList();
                });
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
                if (rowText.toLowerCase().includes('tel:')) {
                    const parts = rowText.split(/Tel\./i);
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
                time: String(row[2] || ''),         // GODZ WYLOTU
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
                        ${isUserFlight(flight) ? '<span class="user-flight-dot"></span>' : ''}
                        ${flight.number} ${flight.direction ? '✈️ ' + flight.direction : ''}
                    </div>
                    <div class="flight-time">${flight.time}</div>
                </div>
                <div class="flight-card-content">
                    ${flight.checkin ? `<div class="flight-detail"><span class="flight-detail-label">Odprawa:</span><span class="flight-detail-value">${flight.checkin}</span></div>` : ''}
                    ${flight.boarding ? `<div class="flight-detail"><span class="flight-detail-label">Boardowanie:</span><span class="flight-detail-value">${flight.boarding}</span></div>` : ''}
                    ${flight.care ? `<div class="flight-detail"><span class="flight-detail-label">Opieka:</span><span class="flight-detail-value">${flight.care}</span></div>` : ''}
                    ${flight.nrCki ? `<div class="flight-detail"><span class="flight-detail-label">NR CKI:</span><span class="flight-detail-value">${flight.nrCki}</span></div>` : ''}
                    ${flight.gate ? `<div class="flight-detail"><span class="flight-detail-label">NR GATE:</span><span class="flight-detail-value">${flight.gate}</span></div>` : ''}
                    ${flight.pax ? `<div class="flight-detail"><span class="flight-detail-label">PAX:</span><span class="flight-detail-value">${flight.pax}</span></div>` : ''}
                    ${flight.remarks ? `<div class="flight-detail"><span class="flight-detail-label">Uwagi:</span><span class="flight-detail-value">${flight.remarks}</span></div>` : ''}
                    ${flight.pps ? `<div class="flight-detail"><span class="flight-detail-label">PPS:</span><span class="flight-detail-value">${flight.pps}</span></div>` : ''}
                    ${flight.znaki ? `<div class="flight-detail"><span class="flight-detail-label">Znaki:</span><span class="flight-detail-value">${flight.znaki}</span></div>` : ''}
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

    airlineInfoContainer.addEventListener('click', (e) => {
        const tile = e.target.closest('[data-action]');
        if (!tile) return;

        const action = tile.getAttribute('data-action');
        if (action === 'ssr') {
            renderSSRCodes('');
            showView('view-ssr');
            // Add search listener
            const ssrSearchInput = document.getElementById('ssr-search-input');
            if (ssrSearchInput) {
                ssrSearchInput.value = '';
                ssrSearchInput.addEventListener('input', (e) => {
                    renderSSRCodes(e.target.value);
                });
            }
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
