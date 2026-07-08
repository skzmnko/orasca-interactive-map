import DataService from './services/data-service.js';
import MapService from './services/map-service.js';
import LayerService from './services/layer-service.js';
import MarkerService from './services/marker-service.js';
import SearchService from './services/search-service.js';
import UIService from './services/ui-service.js';
import AuthService from './services/auth-service.js';
import LocationVisibilityService from './services/location-visibility-service.js';
import LoginPage from './utils/login-page.js';
// НОВЫЙ ИМПОРТ
import DetailPanelService from './services/detail-panel-service.js';

async function waitForLeaflet() {
    const maxWaitTime = 10000;
    const startTime = Date.now();
    
    while (typeof L === 'undefined') {
        if (Date.now() - startTime > maxWaitTime) {
            throw new Error('Leaflet did not load for 10 seconds');
        }
        await new Promise(resolve => setTimeout(resolve, 50));
    }
    console.log('✅ Leaflet downloaded');
}

class Application {
    constructor() {
        this.locations = [];
        this.filteredLocations = [];
        this.initialized = false;
        this.uiService = null;
        this.loginPage = null;
    }

    async initialize() {
        try {
            console.log('🚀 Application initialization...');
            
            this.uiService = new UIService();
            
            const isAuthenticated = AuthService.checkAuthStatus();
            
            if (!isAuthenticated) {
                this.showLoginPage();
                return;
            }

            await this.initializeApp();
            
        } catch (error) {
            console.error('❌ Application initialization error:', error);
        }
    }

    async initializeApp() {
        await waitForLeaflet();

        MapService.initialize('map');
        console.log('✅ The map has been initialized');

        this.uiService.showLoading();
        this.locations = await DataService.loadAllLocations();
        this.uiService.hideLoading();
        
        this.filteredLocations = LocationVisibilityService.filterLocationsByRole(this.locations);
        this.uiService.hideLoading();

        LayerService.initializeLayers();
        LayerService.addLayersToMap();
        MarkerService.initializeIcons();
        
        this.createMarkers();
        
        this.setupInteractions();
        
        this.initialized = true;
        console.log('🎉 The application is completely initialized');
        console.log(`👤 Current user: ${AuthService.getCurrentUser().displayName}`);
        console.log(`🎭 Role: ${AuthService.getCurrentUser().role}`);
        console.log(`📍 Locations shown: ${this.filteredLocations.length} из ${this.locations.length}`);
    }

    showLoginPage() {
        this.loginPage = new LoginPage();
        this.loginPage.initialize(() => {
            this.initializeApp();
        });
    }

    createMarkers() {
        this.filteredLocations.forEach(location => {
            const targetLayer = LayerService.getLayer(location.type);
            if (targetLayer) {
                MarkerService.addMarker(location, targetLayer);
                MarkerService.setupDescriptionHeight(location);
            }
        });
        
        MarkerService.setupZoomListener(this.filteredLocations);
    }

    setupInteractions() {
        this.uiService.initialize();
        LayerService.bindLayerControls();
        SearchService.initialize();
        this.addLogoutButton();

        LayerService.hideGeographicLayers();

        setTimeout(() => {
            LayerService.updateLocationCounters();
        }, 100);

        window.mapService = MapService;
        window.layerService = LayerService;
        window.dataService = DataService;
        window.authService = AuthService;
        
        // НОВОЕ: Экспортируем DetailPanelService в глобальную область для отладки
        window.detailPanelService = DetailPanelService;
    }

    addLogoutButton() {
        const mapControls = document.querySelector('.map-controls');
        if (mapControls) {
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'logout-btn';
            logoutBtn.textContent = `Logout (${AuthService.getCurrentUser().displayName})`;
            logoutBtn.style.marginTop = '10px';
            logoutBtn.style.background = 'rgba(220, 53, 69, 0.2)';
            logoutBtn.style.borderColor = 'rgba(220, 53, 69, 0.5)';
            
            logoutBtn.addEventListener('click', () => {
                AuthService.logout();
                location.reload();
            });
            
            mapControls.appendChild(logoutBtn);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const app = new Application();
    await app.initialize();
});