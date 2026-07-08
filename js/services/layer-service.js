import MapService from './map-service.js';
import DataService from './data-service.js';
import AuthService from './auth-service.js';
import LocationVisibilityService from './location-visibility-service.js';

class LayerService {
    constructor() {
        this.layers = {};
        this.layerControls = {
            'cities-layer': ['capitals', 'feyspires', 'towns'],
            'settlements-layer': 'settlements',
            'ruins-layer': ['ruins', 'elder_ruins', 'town_ruins'],
            'dungeons-layer': ['dungeons', 'tombs', 'caves'],
            'inns-layer': 'inns',
            'forts-layer': ['forts', 'fortresses', 'castles'],
            'temples-layer': 'temples',
            'landmarks-layer': 'landmarks',
            'forests-layer': 'forests',
            'mountains-layer': 'mountains',
            'rivers-layer': 'rivers',
            'seas-layer': 'seas',
        };
        this.initializeLayers();
    }

    initializeLayers() {
        const layerTypes = [
            'capitals', 'feyspires', 'towns', 'settlements', 'ruins', 'elder_ruins', 'town_ruins', 
            'dungeons', 'tombs', 'caves', 'inns', 'forts', 'fortresses', 'castles', 'temples', 'landmarks', 
            'forests', 'mountains', 'rivers', 'seas'
        ];

        layerTypes.forEach(type => {
            this.layers[type] = L.layerGroup();
        });
    }

    addLayersToMap() {
        Object.values(this.layers).forEach(layer => {
            MapService.map.addLayer(layer);
        });
    }

    hideGeographicLayers() {
        if (MapService.map) {
            this.hideLayer('forests');
            this.hideLayer('mountains');
            this.hideLayer('rivers');
            this.hideLayer('seas');
            console.log('✅ Geographical layers are hidden by default');
        }
    }

    getLayer(type) {
        return this.layers[type];
    }

    showLayer(type) {
        const layer = this.layers[type];
        if (layer) {
            MapService.map.addLayer(layer);
        }
    }

    hideLayer(type) {
        const layer = this.layers[type];
        if (layer) {
            MapService.map.removeLayer(layer);
        }
    }

    toggleLayer(layerConfig, visible) {
        const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
        
        types.forEach(type => {
            if (visible) {
                this.showLayer(type);
            } else {
                this.hideLayer(type);
            }
        });
    }

    showAllLayers() {
        Object.keys(this.layers).forEach(type => {
            this.showLayer(type);
        });
        
        // Обновляем состояние чекбоксов
        Object.keys(this.layerControls).forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
    }

    hideAllLayers() {
        Object.keys(this.layers).forEach(type => {
            this.hideLayer(type);
        });
        
        // Обновляем состояние чекбоксов
        Object.keys(this.layerControls).forEach(checkboxId => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = false;
            }
        });
    }

    bindLayerControls() {
        Object.entries(this.layerControls).forEach(([checkboxId, layerConfig]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
                const shouldBeVisible = checkbox.checked;

                // Показываем/скрываем слои в соответствии с начальным состоянием чекбоксов
                this.toggleLayer(layerConfig, shouldBeVisible);

                checkbox.addEventListener('change', (e) => {
                    this.toggleLayer(layerConfig, e.target.checked);
                });
            }
        });

        this.updateLocationCounters();
    }

    updateLocationCounters() {
        Object.entries(this.layerControls).forEach(([checkboxId, layerConfig]) => {
            const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
        
            let visibleCount;
            let totalCount = this.getAllLocationsCountForTypes(layerConfig);
        
            if (AuthService.isDM()) {
                // Мастер видит все локации
                visibleCount = DataService.allLocations.filter(location => 
                    types.includes(location.type)
                ).length;
            } else {
                // Игроки видят только known=true
                visibleCount = DataService.allLocations.filter(location => 
                    types.includes(location.type) && 
                    LocationVisibilityService.shouldShowLocation(location)
                ).length;
            }
        
            this.updateCounterDisplay(checkboxId, layerConfig, visibleCount, totalCount);
        });
    }

    updateCounterDisplay(checkboxId, layerConfig, visibleCount, totalCount) {
        const checkbox = document.getElementById(checkboxId);
        if (!checkbox) return;

        const layerControl = checkbox.closest('.layer-control');
        if (!layerControl) return;

        let counterElement = layerControl.querySelector('.location-counter');
    
        if (!counterElement) {
            counterElement = document.createElement('span');
            counterElement.className = 'location-counter';
            const label = layerControl.querySelector('label');
            if (label) {
                label.appendChild(counterElement);
            }
        }

        if (AuthService.isDM()) {
            // Для мастера показываем общее количество
            counterElement.textContent = `(${totalCount})`;
            counterElement.style.color = 'var(--mg-text-secondary)';
            counterElement.title = `Всего ${totalCount} локаций`;
        } else {
            // Для игроков показываем доступное количество
            counterElement.textContent = `(${visibleCount})`;
            counterElement.style.color = 'var(--mg-text-accent)';
            counterElement.title = `Доступно игроку: ${visibleCount} из ${totalCount}`;
        }
    }

    getAllLocationsCountForTypes(layerConfig) {
        const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
        return types.reduce((sum, type) => {
            return sum + (DataService.getLocationCount(type) || 0);
        }, 0);
    }

    refreshCounters() {
        this.updateLocationCounters();
    }

    setLayerVisibility(layerConfig, visible) {
        const checkboxId = Object.keys(this.layerControls).find(
            key => this.layerControls[key] === layerConfig
        );
        
        if (checkboxId) {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.checked = visible;
                checkbox.dispatchEvent(new Event('change'));
            }
        }
    }
}

export default new LayerService();