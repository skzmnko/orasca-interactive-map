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
        
        console.log('UIService is initialized:', {
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
                console.log('The panel switch button is pressed');
                this.toggleControlPanel();
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