import AuthService from './auth-service.js';

class UIService {
    constructor() {
        this.controlPanel = null;
        this.panelToggle = null;
        this.panelContainer = null;
        this.isDM = false;
        this.searchResults = null;
        this.searchInput = null;
    }

    initialize() {
        this.controlPanel = document.getElementById('control-panel');
        this.panelToggle = document.getElementById('panel-toggle');
        this.panelContainer = document.querySelector('.control-panel-container');
        this.searchInput = document.getElementById('search');
        this.searchResults = document.getElementById('search-results');
        
        // Проверяем роль пользователя
        this.isDM = AuthService.isDM();
        
        // Применяем соответствующий класс в зависимости от роли
        if (this.panelContainer) {
            if (this.isDM) {
                this.panelContainer.classList.add('dm-panel');
                this.panelContainer.classList.remove('player-panel');
                console.log('👑 DM panel style applied (full height, 25% width)');
            } else {
                this.panelContainer.classList.add('player-panel');
                this.panelContainer.classList.remove('dm-panel');
                console.log('🎮 Player panel style applied (standard)');
            }
        }
        
        console.log('UIService is initialized:', {
            controlPanel: !!this.controlPanel,
            panelToggle: !!this.panelToggle,
            panelContainer: !!this.panelContainer,
            isDM: this.isDM
        });
        
        this.setupEventListeners();
        this.bindControlButtons();
        this.setupSearchResultsPosition();
        
        return this;
    }

    setupSearchResultsPosition() {
        // Для DM - результаты поиска позиционируются абсолютно над панелью
        if (this.isDM && this.searchResults) {
            this.searchResults.classList.add('dm-search-results');
        }
    }

    setupEventListeners() {
        if (this.panelToggle) {
            this.panelToggle.addEventListener('click', () => {
                console.log('The panel switch button is pressed');
                this.toggleControlPanel();
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
        }
        if (this.panelToggle) {
            this.panelToggle.title = 'Show panel';
        }
        
        console.log('Panel is hidden');
    }

    showControlPanel() {
        if (this.panelContainer) {
            this.panelContainer.classList.remove('hidden');
        }
        if (this.panelToggle) {
            this.panelToggle.title = 'Hide panel';
        }
        
        console.log('Panel is shown');
    }

    toggleControlPanel() {
        if (this.panelContainer && this.panelContainer.classList.contains('hidden')) {
            this.showControlPanel();
        } else {
            this.hideControlPanel();
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