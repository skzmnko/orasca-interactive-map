import { iconUrls, typeTranslations } from '../core/constants.js';
import MapService from './map-service.js';

class MarkerService {
    constructor() {
        this.currentIcons = {};
        this.zoomTimeout = null;
    }

    initializeIcons() {
        Object.keys(iconUrls).forEach(type => {
            this.currentIcons[type] = this.createCustomIcon(type);
        });
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
                          object-fit:contain;">`,
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

            const popupContent = this.createPopupContent(location);
            marker.bindPopup(popupContent);
            
            return marker;
        } catch (error) {
            console.error(`Ошибка при добавлении маркера ${location.name}:`, error);
            return null;
        }
    }

    createPopupContent(location) {
        return `
            <div class="popup-content">
                <div class="popup-header">
                    <h3>${location.name}</h3>
                    ${location.alias ? `<div class="location-alias">${location.alias}</div>` : ''}
                </div>
                <div class="location-description" id="desc-${location.id}">${location.description}</div>
                ${location.family ? `<div class="location-family">${location.family}</div>` : ''}
            </div>
        `;
    }

    setupDescriptionHeight(location) {
        if (location.marker) {
            location.marker.on('popupopen', () => {
                setTimeout(() => {
                    const descElement = document.getElementById(`desc-${location.id}`);
                    if (descElement) {
                        if (descElement.scrollHeight > descElement.clientHeight) {
                            descElement.classList.add('has-scroll');
                        } else {
                            descElement.classList.remove('has-scroll');
                        }
                    }
                }, 50);
            });
        }
    }

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