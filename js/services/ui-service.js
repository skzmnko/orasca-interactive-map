class UIService {
    constructor() {
        this.controlPanel = null;
        this.panelToggle = null;
        this.panelContainer = null;
    }

    initialize() {
        this.controlPanel = document.getElementById('control-panel');
        this.panelToggle = document.getElementById('panel-toggle');
        this.panelContainer = document.querySelector('.control-panel-container');
        
        console.log('UIService инициализирован:', {
            controlPanel: !!this.controlPanel,
            panelToggle: !!this.panelToggle,
            panelContainer: !!this.panelContainer
        });
        
        this.setupEventListeners();
        this.bindControlButtons();
        
        return this;
    }

    setupEventListeners() {
        if (this.panelToggle) {
            this.panelToggle.addEventListener('click', () => {
                console.log('Кнопка переключения панели нажата');
                this.toggleControlPanel();
            });
        }
    }

    bindControlButtons() {
        // Кнопка сброса вида
        const resetViewBtn = document.getElementById('reset-view');
        if (resetViewBtn) {
            resetViewBtn.addEventListener('click', () => {
                if (window.mapService) {
                    window.mapService.resetView();
                }
            });
        }

        // Кнопки управления всеми слоями
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
            this.panelToggle.title = 'Показать панель';
        }
        
        console.log('Панель скрыта');
    }

    showControlPanel() {
        if (this.panelContainer) {
            this.panelContainer.classList.remove('hidden');
        }
        if (this.panelToggle) {
            this.panelToggle.title = 'Скрыть панель';
        }
        
        console.log('Панель показана');
    }

    toggleControlPanel() {
        if (this.panelContainer && this.panelContainer.classList.contains('hidden')) {
            this.showControlPanel();
        } else {
            this.hideControlPanel();
        }
    }

    showLoading() {
        console.log('🔄 Загрузка данных...');
    }

    hideLoading() {
        console.log('✅ Данные загружены');
    }
}

// Экспортируем класс, а не экземпляр
export default UIService;