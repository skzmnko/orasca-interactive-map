import MapService from './map-service.js';
import DataService from './data-service.js';
import AuthService from './auth-service.js';
import LocationVisibilityService from './location-visibility-service.js';

class LayerService {
    constructor() {
        this.layers = {};
        this.layerControls = {
            'cities-layer': ['capitals', 'elven_castles', 'towns'],
            'settlements-layer': ['settlements', 'elvenwood_settlements'],
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
            'capitals', 'elven_castles', 'towns', 'settlements', 'elvenwood_settlements', 'ruins', 'elder_ruins', 'town_ruins', 
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

    // ИЗМЕНЕНО: добавлен метод для скрытия географических слоев после инициализации карты
    hideGeographicLayers() {
        if (MapService.map) {
            this.hideLayer('forests');
            this.hideLayer('mountains');
            this.hideLayer('rivers');
            this.hideLayer('seas');
            console.log('✅ Географические слои скрыты по умолчанию');
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
    }

    hideAllLayers() {
        Object.keys(this.layers).forEach(type => {
            this.hideLayer(type);
        });
    }

    bindLayerControls() {
        Object.entries(this.layerControls).forEach(([checkboxId, layerConfig]) => {
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
                const shouldBeVisible = checkbox.checked;

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
            // Для DM: visibleCount = количество локаций с known:true (то что видят игроки)
                visibleCount = DataService.allLocations.filter(location => 
                    types.includes(location.type) && 
                    location.known === true
                ).length;
            } else {
            // Для игроков: visibleCount = количество доступных локаций
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

    // Для DM показываем "видимые игрокам / всего"
        if (AuthService.isDM()) {
            if (totalCount > visibleCount) {
                // Есть скрытые локации - показываем формат "7/12"
                counterElement.textContent = `(${visibleCount}/${totalCount})`;
                counterElement.style.color = 'var(--mg-text-muted)';
                counterElement.title = `Игроки видят ${visibleCount} из ${totalCount} локаций`;
            } else {
                // Все локации видны игрокам - показываем просто число
                counterElement.textContent = `(${visibleCount})`;
                counterElement.style.color = 'var(--mg-text-secondary)';
                counterElement.title = `Все ${visibleCount} локаций видны игрокам`;
            }
        } else {
            // Для игроков показываем только количество доступных локаций
            counterElement.textContent = `(${visibleCount})`;
            counterElement.style.color = 'var(--mg-text-accent)';
            counterElement.title = `Локаций доступно вашему персонажу: ${visibleCount}`;
        }
    }

    // Вспомогательный метод для получения общего количества локаций по типам
    getAllLocationsCountForTypes(layerConfig) {
        const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
        return types.reduce((sum, type) => {
            return sum + (DataService.getLocationCount(type) || 0);
        }, 0);
    }

    // Метод для принудительного обновления счетчиков (например, после изменения видимости)
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