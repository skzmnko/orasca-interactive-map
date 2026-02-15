import DataService from './data-service.js';
import MapService from './map-service.js';
import LayerService from './layer-service.js';
import AuthService from './auth-service.js';
import { typeTranslations } from '../core/constants.js';

class SearchService {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.initialize();
    }

    initialize() {
        this.searchInput = document.getElementById('search');
        this.searchResults = document.getElementById('search-results');
        
        if (this.searchInput && this.searchResults) {
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });

        document.addEventListener('click', (e) => {
            if (this.searchInput && this.searchResults && 
                !this.searchInput.contains(e.target) && !this.searchResults.contains(e.target)) {
                this.clearResults();
            }
        });
    }

    handleSearch(query) {
        const trimmedQuery = query.toLowerCase().trim();
        this.clearResults();
        if (trimmedQuery.length < 2) return;
        let results = DataService.searchLocations(trimmedQuery);
        results = this.filterResultsByRole(results);

        if (results.length === 0) {
            this.showNoResults();
            return;
        }

        this.displayResults(results);
    }

    filterResultsByRole(results) {
        if (AuthService.isDM()) {
            return results;
        } else {
            return results.filter(location => location.known === true);
        }
    }

    displayResults(results) {
        results.forEach(location => {
            const resultElement = this.createResultElement(location);
            this.searchResults.appendChild(resultElement);
        });
    }

    createResultElement(location) {
        const resultElement = document.createElement('div');
        resultElement.className = 'search-result-item';

        const isLayerVisible = this.isLocationLayerVisible(location);
        if (!isLayerVisible) {
            resultElement.classList.add('search-result-hidden');
        }

        if (location.alias) {
            resultElement.innerHTML = `
                <strong>${location.name}</strong>
                <div class="search-result-alias">${location.alias}</div>
            `;
        } else {
            resultElement.innerHTML = `
                <strong>${location.name}</strong>
            `;
        }
        
        resultElement.addEventListener('click', () => {
            this.selectLocation(location);
        });
        
        return resultElement;
    }

    isLocationLayerVisible(location) {
        const layerControls = LayerService.layerControls;
        
        for (const [checkboxId, layerConfig] of Object.entries(layerControls)) {
            const types = Array.isArray(layerConfig) ? layerConfig : [layerConfig];
            
            if (types.includes(location.type)) {
                const checkbox = document.getElementById(checkboxId);
                if (checkbox) {
                    return checkbox.checked;
                }
            }
        }
        
        return true;
    }

    selectLocation(location) {

        const isLayerVisible = this.isLocationLayerVisible(location);

        if (!isLayerVisible) {
            this.showLayerHiddenMessage(location);
            return;
        }

        if (location.marker && location.latLng) {
            MapService.flyTo(location.latLng, 5);
            location.marker.openPopup();
            this.clearSearch();
        }
    }

    showLayerHiddenMessage(location) {
        const message = document.createElement('div');
        message.className = 'search-hidden-message';
        message.innerHTML = `
            <div class="search-hidden-content">
                <div class="search-hidden-icon">🔒</div>
                <div class="search-hidden-text">
                    <strong>Локация "${location.name}" скрыта фильтром</strong>
                    <p>Включите соответствующий фильтр в панели управления</p>
                </div>
            </div>
        `;

        document.body.appendChild(message);
        
        setTimeout(() => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        }, 3000);
        
        message.addEventListener('click', () => {
            if (message.parentNode) {
                message.parentNode.removeChild(message);
            }
        });
        
        console.log(`⚠️ Локация "${location.name}" скрыта фильтром слоя`);
    }

    showNoResults() {
        const noResults = document.createElement('div');
        noResults.className = 'search-result-item';
        noResults.textContent = 'Ничего не найдено';
        noResults.style.color = '#a3a3a3';
        this.searchResults.appendChild(noResults);
    }

    clearResults() {
        if (this.searchResults) {
            this.searchResults.innerHTML = '';
        }
    }

    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
        }
        this.clearResults();
    }
}

export default new SearchService();