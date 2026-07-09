import AuthService from './auth-service.js';

class UIService {
    constructor() {
        this.controlPanel = null;
        this.panelContainer = null;
        this.panelOpenBtn = null;
        this.panelCloseBtn = null;
        this.isDM = false;
        this.searchResults = null;
        this.searchInput = null;
        this.isPanelOpen = true;
        this.isMobile = false;
    }

    initialize() {
        this.controlPanel = document.getElementById('control-panel');
        this.panelContainer = document.querySelector('.control-panel-container');
        this.panelOpenBtn = document.getElementById('panel-open-btn');
        this.panelCloseBtn = document.getElementById('panel-close-btn');
        this.searchInput = document.getElementById('search');
        this.searchResults = document.getElementById('search-results');
        
        // Определяем мобильное устройство
        this.isMobile = window.innerWidth <= 768;
        
        // Проверяем роль пользователя
        this.isDM = AuthService.isDM();
        
        // Применяем соответствующий класс в зависимости от роли
        if (this.panelContainer) {
            if (this.isDM) {
                this.panelContainer.classList.add('dm-panel');
                this.panelContainer.classList.remove('player-panel');
                // Показываем кнопку открытия для DM
                if (this.panelOpenBtn) {
                    this.panelOpenBtn.classList.add('visible');
                }
                console.log('👑 DM panel style applied (full height, 25% width)');
            } else {
                this.panelContainer.classList.add('player-panel');
                this.panelContainer.classList.remove('dm-panel');
                // Скрываем кнопки для игроков
                if (this.panelOpenBtn) {
                    this.panelOpenBtn.classList.remove('visible');
                }
                console.log('🎮 Player panel style applied (standard)');
            }
        }
        
        console.log('UIService is initialized:', {
            controlPanel: !!this.controlPanel,
            panelContainer: !!this.panelContainer,
            panelOpenBtn: !!this.panelOpenBtn,
            panelCloseBtn: !!this.panelCloseBtn,
            isDM: this.isDM,
            isMobile: this.isMobile
        });
        
        this.setupEventListeners();
        this.bindControlButtons();
        this.setupSearchResultsPosition();
        
        // НОВОЕ: Для DM на мобильных устройствах панель скрыта по умолчанию
        if (this.isDM && this.isMobile) {
            this.isPanelOpen = false;
            this.panelContainer.classList.add('hidden');
            if (this.panelOpenBtn) {
                this.panelOpenBtn.classList.add('visible');
            }
            console.log('📱 Mobile DM: Panel is hidden by default');
        } else {
            // По умолчанию панель открыта (для десктопа или игроков)
            this.isPanelOpen = true;
        }
        
        // ДОБАВЛЕНО: Слушатель изменения размера окна для адаптивности
        window.addEventListener('resize', () => {
            const wasMobile = this.isMobile;
            this.isMobile = window.innerWidth <= 768;
            
            // Если изменилось состояние мобильности и это DM
            if (this.isDM && wasMobile !== this.isMobile) {
                if (this.isMobile) {
                    // При переходе на мобильный - сворачиваем панель
                    this.isPanelOpen = false;
                    this.panelContainer.classList.add('hidden');
                    if (this.panelOpenBtn) {
                        this.panelOpenBtn.classList.add('visible');
                    }
                    console.log('📱 Switched to mobile: Panel hidden');
                } else {
                    // При переходе на десктоп - показываем панель
                    this.isPanelOpen = true;
                    this.panelContainer.classList.remove('hidden');
                    if (this.panelOpenBtn) {
                        this.panelOpenBtn.classList.remove('visible');
                    }
                    console.log('💻 Switched to desktop: Panel shown');
                }
            }
        });
        
        return this;
    }

    setupSearchResultsPosition() {
        // Для DM - результаты поиска позиционируются абсолютно над панелью
        if (this.isDM && this.searchResults) {
            this.searchResults.classList.add('dm-search-results');
        }
    }

    setupEventListeners() {
        // Кнопка закрытия (крестик)
        if (this.panelCloseBtn) {
            this.panelCloseBtn.addEventListener('click', () => {
                console.log('Panel close button clicked');
                this.hideControlPanel();
            });
        }
        
        // Кнопка открытия (фильтр)
        if (this.panelOpenBtn) {
            this.panelOpenBtn.addEventListener('click', () => {
                console.log('Panel open button clicked');
                this.showControlPanel();
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
        
        // Закрытие по Escape (только для DM)
        if (this.isDM) {
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isPanelOpen) {
                    this.hideControlPanel();
                }
            });
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
            this.panelContainer.classList.add('hidden');
            this.isPanelOpen = false;
        }
        if (this.panelOpenBtn && this.isDM) {
            this.panelOpenBtn.classList.add('visible');
        }
        
        console.log('Panel is hidden');
    }

    showControlPanel() {
        if (this.panelContainer) {
            this.panelContainer.classList.remove('hidden');
            this.isPanelOpen = true;
        }
        if (this.panelOpenBtn && this.isDM) {
            this.panelOpenBtn.classList.remove('visible');
        }
        
        // Фокусируемся на поиске при открытии
        if (this.searchInput) {
            setTimeout(() => {
                this.searchInput.focus();
            }, 300);
        }
        
        console.log('Panel is shown');
    }

    toggleControlPanel() {
        if (this.isPanelOpen) {
            this.hideControlPanel();
        } else {
            this.showControlPanel();
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