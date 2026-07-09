import { iconUrls, typeTranslations } from '../core/constants.js';
import MapService from './map-service.js';
import DetailPanelService from './detail-panel-service.js';
import AuthService from './auth-service.js';

class MarkerService {
    constructor() {
        this.currentIcons = {};
        this.zoomTimeout = null;
        this.isDM = false;
    }

    initializeIcons() {
        // Проверяем роль при инициализации
        this.isDM = AuthService.isDM();
        
        Object.keys(iconUrls).forEach(type => {
            this.currentIcons[type] = this.createCustomIcon(type);
        });
        
        // Инициализируем панель деталей для ВСЕХ пользователей
        DetailPanelService.initialize();
        
        console.log(`✅ Маркеры инициализированы для роли: ${this.isDM ? 'DM' : 'Player'}`);
    }

    createCustomIcon(type) {
        const currentZoom = MapService.getCurrentZoom();
        let baseSize;
        
        if (currentZoom <= 0) baseSize = 16;
        else if (currentZoom === 1) baseSize = 20;
        else if (currentZoom === 2) baseSize = 24;
        else if (currentZoom === 3) baseSize = 28;
        else baseSize = 32;

        return L.divIcon({
            className: `custom-icon custom-icon-${type}`,
            html: `<img src="${iconUrls[type]}" alt="${type}" 
                   style="width:${baseSize}px; height:${baseSize}px; 
                          object-fit:contain; 
                          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));">`,
            iconSize: [baseSize, baseSize],
            iconAnchor: [baseSize/2, baseSize/2],
            popupAnchor: [0, -baseSize/2]
        });
    }

    addMarker(location, targetLayer) {
        try {
            const latLng = MapService.percentToLatLng(location.coords);
            
            const marker = L.marker(latLng, {
                icon: this.currentIcons[location.type]
            }).addTo(targetLayer);
            
            location.marker = marker;
            location.latLng = latLng;

            // Единое поведение для всех пользователей - открываем детальную панель
            marker.on('click', (e) => {
                // Отключаем стандартный попап
                if (marker.getPopup()) {
                    marker.closePopup();
                }
                // Показываем детальную панель
                DetailPanelService.showLocation(location);
            });

            return marker;
        } catch (error) {
            console.error(`Error when adding a marker ${location.name}:`, error);
            return null;
        }
    }

    // Удаляем метод createPopupContent, так как он больше не нужен

    // Удаляем метод setupDescriptionHeight, так как попапов больше нет

    updateMarkersSize(locations) {
        const currentZoom = MapService.getCurrentZoom();
        
        Object.keys(iconUrls).forEach(type => {
            const newIcon = this.createCustomIcon(type);
            
            if (!this.currentIcons[type] || 
                this.currentIcons[type].options.iconSize[0] !== newIcon.options.iconSize[0]) {
                
                this.currentIcons[type] = newIcon;
                
                locations.forEach(location => {
                    if (location.marker && location.type === type) {
                        location.marker.setIcon(newIcon);
                    }
                });
            }
        });
    }

    setupZoomListener(locations) {
        MapService.onZoomEnd(() => {
            clearTimeout(this.zoomTimeout);
            this.zoomTimeout = setTimeout(() => {
                this.updateMarkersSize(locations);
            }, 50);
        });
    }
}

export default new MarkerService();