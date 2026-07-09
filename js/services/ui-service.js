import AuthService from './auth-service.js';
import SearchService from './search-service.js';

class UIService {
    constructor() {
        this.controlPanel = null;
        this.panelContainer = null;
        this.panelHeader = null;
        this.panelOpenBtn = null;
        this.panelCloseBtn = null;
        this.mobileFilterBtn = null;
        this.mobileSearchBtn = null;
        this.mobileTopPanel = null;
        this.searchResults = null;
        this.searchInput = null;
        this.isPanelOpen = true;
        this.isMobile = false;
    }

    initialize() {
        this.controlPanel = document.getElementById('control-panel');
        this.panelContainer = document.getElementById('control-panel-container');
        this.panelHeader = document.getElementById('panel-header');
        this.panelOpenBtn = document.getElementById('panel-open-btn');
        this.panelCloseBtn = document.getElementById('panel-close-btn');
        this.mobileFilterBtn = document.getElementById('mobile-filter-btn');
        this.mobileSearchBtn = document.getElementById('mobile-search-btn');
        this.mobileTopPanel = document.getElementById('mobile-top-panel');
        this.searchInput = document.getElementById('search');
        this.searchResults = document.getElementById('search-results');
        
        // Определяем мобильное устройство
        this.isMobile = window.innerWidth <= 768;
        
        // Убираем разделение на DM/Player классы - используем единый стиль
        if (this.panelContainer) {
            this.panelContainer.classList.remove('dm-panel', 'player-panel');
            this.panelContainer.classList.add('unified-panel');
            
            // На мобильных панель скрыта по умолчанию (уезжает вверх)
            if (this.isMobile) {
                this.isPanelOpen = false;
                this.panelContainer.classList.add('hidden');
                this.panelContainer.classList.remove('mobile-open');
                // Скрываем заголовок на мобильных
                if (this.panelHeader) {
                    this.panelHeader.style.display = 'none';
                }
                console.log('📱 Mobile: Panel is hidden by default (slide up)');
            } else {
                // На десктопе панель открыта
                this.isPanelOpen = true;
                this.panelContainer.classList.remove('hidden');
                if (this.panelOpenBtn) {
                    this.panelOpenBtn.classList.add('visible');
                }
                // Показываем заголовок на десктопе
                if (this.panelHeader) {
                    this.panelHeader.style.display = 'flex';
                }
            }
        }
        
        console.log('UIService is initialized:', {
            controlPanel: !!this.controlPanel,
            panelContainer: !!this.panelContainer,
            panelHeader: !!this.panelHeader,
            panelOpenBtn: !!this.panelOpenBtn,
            panelCloseBtn: !!this.panelCloseBtn,
            mobileFilterBtn: !!this.mobileFilterBtn,
            mobileSearchBtn: !!this.mobileSearchBtn,
            isMobile: this.isMobile,
            isPanelOpen: this.isPanelOpen
        });
        
        this.setupEventListeners();
        this.bindControlButtons();
        this.setupSearchResultsPosition();
        
        // Слушатель изменения размера окна для адаптивности
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            if (wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    // При переходе на мобильный - сворачиваем панель (вверх)
                    this.isPanelOpen = false;
                    this.panelContainer.classList.add('hidden');
                    this.panelContainer.classList.remove('mobile-open');
                    if (this.panelHeader) {
                        this.panelHeader.style.display = 'none';
                    }
                    if (this.mobileFilterBtn) {
                        this.mobileFilterBtn.classList.remove('active');
                    }
                    // Закрываем поиск
                    if (SearchService) {
                        SearchService.closeMobileSearch();
                    }
                    console.log('📱 Switched to mobile: Panel hidden (slide up)');
                } else {
                    // При переходе на десктоп - показываем панель
                    this.isPanelOpen = true;
                    this.panelContainer.classList.remove('hidden');
                    this.panelContainer.classList.remove('mobile-open');
                    if (this.panelHeader) {
                        this.panelHeader.style.display = 'flex';
                    }
                    if (this.panelOpenBtn) {
                        this.panelOpenBtn.classList.add('visible');
                    }
                    if (this.mobileFilterBtn) {
                        this.mobileFilterBtn.classList.remove('active');
                    }
                    // Закрываем мобильную панель поиска при переходе на десктоп
                    if (SearchService) {
                        SearchService.closeMobileSearch();
                    }
                    console.log('💻 Switched to desktop: Panel shown');
                }
            }
        });
        
        return this;
    }

    setupSearchResultsPosition() {
        if (this.searchResults) {
            this.searchResults.classList.add('unified-search-results');
        }
    }

    setupEventListeners() {
        // Кнопка закрытия (крестик) - работает только на десктопе
        if (this.panelCloseBtn) {
            this.panelCloseBtn.addEventListener('click', () => {
                console.log('Panel close button clicked');
                this.hideControlPanel();
            });
        }
        
        // Кнопка открытия панели - только для десктопа
        if (this.panelOpenBtn) {
            this.panelOpenBtn.addEventListener('click', () => {
                console.log('Panel open button clicked');
                this.showControlPanel();
            });
        }
        
        // Мобильная кнопка фильтра - переключает панель (анимация вверх/вниз)
        if (this.mobileFilterBtn) {
            this.mobileFilterBtn.addEventListener('click', () => {
                console.log('Mobile filter button clicked');
                // Закрываем поиск, если он открыт
                if (SearchService) {
                    SearchService.closeMobileSearch();
                }
                this.toggleMobilePanel();
            });
        }
        
        // Мобильная кнопка поиска - переключает панель поиска
        if (this.mobileSearchBtn) {
            this.mobileSearchBtn.addEventListener('click', () => {
                console.log('Mobile search button clicked');
                this.toggleMobileSearch();
            });
        }
        
        // Закрываем результаты поиска при клике вне их
        document.addEventListener('click', (e) => {
            if (this.searchResults && this.searchInput) {
                if (!this.searchResults.contains(e.target) && !this.searchInput.contains(e.target)) {
                    this.searchResults.classList.remove('has-results');
                }
            }
        });
        
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.isMobile) {
                    // Закрываем поиск, если он открыт
                    if (SearchService) {
                        SearchService.closeMobileSearch();
                    }
                    // Закрываем панель, если она открыта
                    if (this.isPanelOpen) {
                        this.toggleMobilePanel();
                    }
                } else if (!this.isMobile && this.isPanelOpen) {
                    this.hideControlPanel();
                }
            }
        });
    }

    toggleMobileSearch() {
        // Переключаем панель поиска через SearchService
        if (SearchService) {
            SearchService.toggleMobileSearch();
        }
        
        // Если панель фильтрации открыта, закрываем её
        if (this.isPanelOpen) {
            this.toggleMobilePanel();
        }
    }

    toggleMobilePanel() {
        if (this.isPanelOpen) {
            // Закрываем панель (уезжает вверх)
            this.panelContainer.classList.add('hidden');
            this.panelContainer.classList.remove('mobile-open');
            this.isPanelOpen = false;
            if (this.mobileFilterBtn) {
                this.mobileFilterBtn.classList.remove('active');
            }
            console.log('📱 Mobile panel closed (slide up)');
        } else {
            // Открываем панель (приезжает снизу)
            this.panelContainer.classList.remove('hidden');
            this.panelContainer.classList.add('mobile-open');
            this.isPanelOpen = true;
            if (this.mobileFilterBtn) {
                this.mobileFilterBtn.classList.add('active');
            }
            
            console.log('📱 Mobile panel opened (slide down)');
        }
    }

    bindControlButtons() {
        const resetViewBtn = document.getElementById('reset-view');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                if (window.mapService) {
                    window.mapService.resetView();
                }
            });
        }

        const showAllBtn = document.getElementById('show-all-layers');
        const hideAllBtn = document.getElementById('hide-all-layers');
        
        if (showAllBtn) {
            showAllBtn.addEventListener('click', () => {
                if (window.layerService) {
                    window.layerService.showAllLayers();
                    this.checkAllCheckboxes(true);
                }
            });
        }
        
        if (hideAllBtn) {
            hideAllBtn.addEventListener('click', () => {
                if (window.layerService) {
                    window.layerService.hideAllLayers();
                    this.checkAllCheckboxes(false);
                }
            });
        }
    }

    checkAllCheckboxes(checked) {
        const checkboxes = document.querySelectorAll('.layers-section input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            checkbox.dispatchEvent(new Event('change'));
        });
    }

    hideControlPanel() {
        if (this.panelContainer) {
            if (this.isMobile) {
                this.panelContainer.classList.add('hidden');
                this.panelContainer.classList.remove('mobile-open');
                if (this.mobileFilterBtn) {
                    this.mobileFilterBtn.classList.remove('active');
                }
            } else {
                this.panelContainer.classList.add('hidden');
            }
            this.isPanelOpen = false;
        }
        if (this.panelOpenBtn && !this.isMobile) {
            this.panelOpenBtn.classList.add('visible');
        }
        console.log('Panel is hidden');
    }

    showControlPanel() {
        if (this.panelContainer) {
            if (this.isMobile) {
                this.panelContainer.classList.remove('hidden');
                this.panelContainer.classList.add('mobile-open');
                if (this.mobileFilterBtn) {
                    this.mobileFilterBtn.classList.add('active');
                }
            } else {
                this.panelContainer.classList.remove('hidden');
            }
            this.isPanelOpen = true;
        }
        if (this.panelOpenBtn && !this.isMobile) {
            this.panelOpenBtn.classList.remove('visible');
        }
        
        console.log('Panel is shown');
    }

    toggleControlPanel() {
        if (this.isMobile) {
            this.toggleMobilePanel();
        } else {
            if (this.isPanelOpen) {
                this.hideControlPanel();
            } else {
                this.showControlPanel();
            }
        }
    }

    showLoading() {
        console.log('🔄 Uploading data...');
    }

    hideLoading() {
        console.log('✅ The data is uploaded');
    }
}

export default UIService;