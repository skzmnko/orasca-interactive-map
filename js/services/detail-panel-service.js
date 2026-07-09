import AuthService from './auth-service.js';

// Сервис для управления детальной панелью
class DetailPanelService {
    constructor() {
        this.panel = null;
        this.panelContent = null;
        this.isOpen = false;
        this.currentLocation = null;
        this.isDM = false;
    }

    initialize() {
        // Проверяем роль пользователя
        this.isDM = AuthService.isDM();
        
        this.createPanel();
        this.bindEvents();
        console.log(`✅ Detail panel initialized for ${this.isDM ? 'DM' : 'Player'}`);
    }

    createPanel() {
        // Создаем контейнер панели
        this.panel = document.createElement('div');
        this.panel.id = 'detail-panel';
        this.panel.className = 'detail-panel hidden';
        
        // Добавляем класс для роли
        if (this.isDM) {
            this.panel.classList.add('detail-panel-dm');
        } else {
            this.panel.classList.add('detail-panel-player');
        }
        
        // Создаем содержимое панели
        this.panel.innerHTML = `
            <div class="detail-panel-header">
                <h3>${this.isDM ? '📜 Location Details' : '📜 Location Info'}</h3>
                <button class="detail-panel-close" title="Close panel">✕</button>
            </div>
            <div class="detail-panel-content">
                <div class="detail-panel-loading">Select a location to view details</div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
        this.panelContent = this.panel.querySelector('.detail-panel-content');
        
        // Кнопка закрытия
        const closeBtn = this.panel.querySelector('.detail-panel-close');
        closeBtn.addEventListener('click', () => this.close());
    }

    bindEvents() {
        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // Закрытие при клике вне панели
        document.addEventListener('click', (e) => {
            if (this.isOpen && this.panel && !this.panel.contains(e.target)) {
                // Проверяем, что клик не по маркеру
                if (!e.target.closest('.leaflet-marker-icon') && !e.target.closest('.leaflet-popup')) {
                    this.close();
                }
            }
        });
    }

    showLocation(location) {
        if (!location) {
            console.warn('⚠️ No location provided');
            return;
        }
        
        this.currentLocation = location;
        this.isOpen = true;
        
        // Показываем панель с анимацией
        this.panel.classList.remove('hidden');
        this.panel.classList.add('visible');
        
        // Обновляем содержимое
        this.renderLocationDetails(location);
        
        console.log(`📖 Showing details for: ${location.name} (${this.isDM ? 'DM' : 'Player'})`);
    }

    renderLocationDetails(location) {
        if (!location) {
            this.panelContent.innerHTML = '<div class="detail-panel-loading">Location not found</div>';
            return;
        }

        if (this.isDM) {
            // Полная версия для DM
            this.renderDMDetails(location);
        } else {
            // Упрощенная версия для игроков
            this.renderPlayerDetails(location);
        }
    }

    renderDMDetails(location) {
        this.panelContent.innerHTML = `
            <div class="detail-panel-item">
                <div class="detail-panel-name">${this.escapeHtml(location.name)}</div>
                ${location.alias ? `<div class="detail-panel-alias">${this.escapeHtml(location.alias)}</div>` : ''}
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Type</div>
                    <div class="detail-panel-value">${this.getTypeDisplayName(location.type)}</div>
                </div>
                
                ${location.region ? `
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Region</div>
                    <div class="detail-panel-value">${this.escapeHtml(location.region)}</div>
                </div>
                ` : ''}
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Description</div>
                    <div class="detail-panel-description">${this.escapeHtml(location.description)}</div>
                </div>
                
                ${location.family ? `
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Family / Ruling House</div>
                    <div class="detail-panel-value">${this.escapeHtml(location.family)}</div>
                </div>
                ` : ''}
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Visibility</div>
                    <div class="detail-panel-value ${location.known ? 'status-known' : 'status-hidden'}">
                        ${location.known ? '👁️ Visible to players' : '🔒 Hidden from players'}
                    </div>
                </div>
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Coordinates</div>
                    <div class="detail-panel-value detail-panel-coords">
                        ${location.coords ? `${location.coords[0].toFixed(2)}%, ${location.coords[1].toFixed(2)}%` : 'N/A'}
                    </div>
                </div>
                
                ${location.image ? `
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Image</div>
                    <div class="detail-panel-image">
                        <img src="${location.image}" alt="${location.name}" loading="lazy" onerror="this.style.display='none'">
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">ID</div>
                    <div class="detail-panel-value detail-panel-id">#${location.id}</div>
                </div>
                
                ${location.createdAt ? `
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Created</div>
                    <div class="detail-panel-value detail-panel-id">${new Date(location.createdAt).toLocaleDateString()}</div>
                </div>
                ` : ''}
            </div>
        `;
    }

    renderPlayerDetails(location) {
        this.panelContent.innerHTML = `
            <div class="detail-panel-item detail-panel-item-player">
                <div class="detail-panel-name">${this.escapeHtml(location.name)}</div>
                ${location.alias ? `<div class="detail-panel-alias">${this.escapeHtml(location.alias)}</div>` : ''}
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Type</div>
                    <div class="detail-panel-value">${this.getTypeDisplayName(location.type)}</div>
                </div>
                
                <div class="detail-panel-section">
                    <div class="detail-panel-label">Description</div>
                    <div class="detail-panel-description detail-panel-description-player">${this.escapeHtml(location.description)}</div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTypeDisplayName(type) {
        const typeNames = {
            capitals: 'Capital City',
            feyspires: 'Elven Castle',
            towns: 'Town',
            settlements: 'Settlement',
            ruins: 'Ruins',
            elder_ruins: 'Elder Ruins',
            town_ruins: 'Town Ruins',
            dungeons: 'Dungeon',
            tombs: 'Tomb',
            caves: 'Cave',
            inns: 'Inn',
            forts: 'Fort',
            fortresses: 'Fortress',
            castles: 'Castle',
            temples: 'Temple',
            landmarks: 'Point of Interest',
            forests: 'Forest',
            mountains: 'Mountains',
            rivers: 'River',
            seas: 'Sea'
        };
        return typeNames[type] || type;
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.panel.classList.remove('visible');
        this.panel.classList.add('hidden');
        
        // Закрываем попап маркера, если он открыт
        if (this.currentLocation && this.currentLocation.marker) {
            try {
                this.currentLocation.marker.closePopup();
            } catch (e) {
                // Игнорируем ошибки закрытия попапа
            }
        }
        
        this.currentLocation = null;
        console.log('📖 Detail panel closed');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            // Если есть текущая локация, показываем её
            if (this.currentLocation) {
                this.showLocation(this.currentLocation);
            }
        }
    }

    isOpenPanel() {
        return this.isOpen;
    }
}

export default new DetailPanelService();