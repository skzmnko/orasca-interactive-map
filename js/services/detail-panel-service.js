import AuthService from './auth-service.js';

class DetailPanelService {
    constructor() {
        this.panel = null;
        this.panelContent = null;
        this.isOpen = false;
        this.currentLocation = null;
        this.isDM = false;
        this.descriptionExpanded = false;
    }

    initialize() {
        this.isDM = AuthService.isDM();
        
        this.createPanel();
        this.bindEvents();
        console.log(`✅ Detail panel initialized for ${this.isDM ? 'DM' : 'Player'}`);
    }

    createPanel() {
        this.panel = document.createElement('div');
        this.panel.id = 'detail-panel';
        this.panel.className = 'detail-panel hidden';
        
        if (this.isDM) {
            this.panel.classList.add('detail-panel-dm');
        } else {
            this.panel.classList.add('detail-panel-player');
        }
        
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
        
        const closeBtn = this.panel.querySelector('.detail-panel-close');
        closeBtn.addEventListener('click', () => this.close());
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        document.addEventListener('click', (e) => {
            if (this.isOpen && this.panel && !this.panel.contains(e.target)) {
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
        this.descriptionExpanded = false;
        
        this.panel.classList.remove('hidden');
        this.panel.classList.add('visible');
        
        this.renderLocationDetails(location);
        
        console.log(`📖 Showing details for: ${location.name} (${this.isDM ? 'DM' : 'Player'})`);
    }

    renderLocationDetails(location) {
        if (!location) {
            this.panelContent.innerHTML = '<div class="detail-panel-loading">Location not found</div>';
            return;
        }

        if (this.isDM) {
            this.renderDMDetails(location);
        } else {
            this.renderPlayerDetails(location);
        }
    }

    renderDMDetails(location) {
        const descriptionHtml = location.description
            ? location.description
                .split('\n')
                .map(line => line.trim())
                .join('\n')
            : '';
        
        // Check if TYPE should be shown (hide for POI)
        const showType = location.type !== 'poi';
        
        // Get ruler or owner value
        let rulerOwnerValue = null;
        let rulerOwnerLabel = null;
        
        if (location.ruler && location.ruler.trim() !== '') {
            rulerOwnerValue = location.ruler;
            rulerOwnerLabel = 'RULER';
        } else if (location.owner && location.owner.trim() !== '') {
            rulerOwnerValue = location.owner;
            rulerOwnerLabel = 'OWNER';
        } else if (location.family && location.family.trim() !== '') {
            // Backward compatibility: if family exists and no ruler/owner
            rulerOwnerValue = location.family;
            rulerOwnerLabel = 'RULER / OWNER';
        }
        
        this.panelContent.innerHTML = `
            <div class="detail-panel-item">
                <div class="detail-panel-name">${this.escapeHtml(location.name)}</div>
                ${location.alias ? `<div class="detail-panel-alias">${this.escapeHtml(location.alias)}</div>` : ''}
                
                ${showType ? `
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">TYPE</span>
                    <span class="detail-panel-value-inline">${this.getTypeDisplayName(location.type)}</span>
                </div>
                ` : ''}
                
                ${location.region ? `
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">REGION</span>
                    <span class="detail-panel-value-inline">${this.escapeHtml(location.region)}</span>
                </div>
                ` : ''}
                
                <div class="detail-panel-section detail-panel-section-description">
                    <span class="detail-panel-label">DESCRIPTION</span>
                    <div class="detail-panel-description-wrapper">
                        <div class="detail-panel-description-text" id="description-text">${descriptionHtml}</div>
                        <button class="detail-panel-description-toggle" id="description-toggle">Read more</button>
                    </div>
                </div>
                
                ${rulerOwnerValue ? `
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">${rulerOwnerLabel}</span>
                    <span class="detail-panel-value-inline">${this.escapeHtml(rulerOwnerValue)}</span>
                </div>
                ` : ''}
                
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">VISIBILITY</span>
                    <span class="detail-panel-value-inline ${location.known ? 'status-known' : 'status-hidden'}">
                        ${location.known ? '👁️ Visible' : '🔒 Hidden'}
                    </span>
                </div>
                
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">COORDINATES</span>
                    <span class="detail-panel-value-inline detail-panel-coords">
                        ${location.coords ? `${location.coords[0].toFixed(2)}%, ${location.coords[1].toFixed(2)}%` : 'N/A'}
                    </span>
                </div>
                
                ${location.image ? `
                <div class="detail-panel-section">
                    <span class="detail-panel-label">IMAGE</span>
                    <div class="detail-panel-image">
                        <img src="${location.image}" alt="${location.name}" loading="lazy" onerror="this.style.display='none'">
                    </div>
                </div>
                ` : ''}
                
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">ID</span>
                    <span class="detail-panel-value-inline detail-panel-id">#${location.id}</span>
                </div>
                
                ${location.createdAt ? `
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">CREATED</span>
                    <span class="detail-panel-value-inline detail-panel-id">${new Date(location.createdAt).toLocaleDateString()}</span>
                </div>
                ` : ''}
            </div>
        `;

        this.bindDescriptionToggle();
    }

    renderPlayerDetails(location) {
        const descriptionHtml = location.description
            ? location.description
                .split('\n')
                .map(line => line.trim())
                .join('\n')
            : '';
        
        // Check if TYPE should be shown (hide for POI)
        const showType = location.type !== 'poi';
        
        this.panelContent.innerHTML = `
            <div class="detail-panel-item detail-panel-item-player">
                <div class="detail-panel-name">${this.escapeHtml(location.name)}</div>
                ${location.alias ? `<div class="detail-panel-alias">${this.escapeHtml(location.alias)}</div>` : ''}
                
                ${showType ? `
                <div class="detail-panel-section detail-panel-section-inline">
                    <span class="detail-panel-label">TYPE</span>
                    <span class="detail-panel-value-inline">${this.getTypeDisplayName(location.type)}</span>
                </div>
                ` : ''}
                
                <div class="detail-panel-section detail-panel-section-description">
                    <span class="detail-panel-label">DESCRIPTION</span>
                    <div class="detail-panel-description-wrapper">
                        <div class="detail-panel-description-text" id="description-text">${descriptionHtml}</div>
                        <button class="detail-panel-description-toggle" id="description-toggle">Read more</button>
                    </div>
                </div>
            </div>
        `;

        this.bindDescriptionToggle();
    }

    bindDescriptionToggle() {
        const toggleBtn = document.getElementById('description-toggle');
        const descriptionText = document.getElementById('description-text');
        const wrapper = descriptionText?.closest('.detail-panel-description-wrapper');
        const section = wrapper?.closest('.detail-panel-section-description');
        
        if (!toggleBtn || !descriptionText || !wrapper || !section) return;
        
        const newToggleBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);
        
        newToggleBtn.addEventListener('click', () => {
            this.toggleDescription(descriptionText, newToggleBtn, wrapper, section);
        });
        
        this.checkDescriptionHeight(descriptionText, newToggleBtn);
    }

    checkDescriptionHeight(descriptionText, toggleBtn) {
        const lineHeight = parseInt(getComputedStyle(descriptionText).lineHeight) || 18;
        const maxHeight = lineHeight * 4;
        
        descriptionText.style.webkitLineClamp = 'unset';
        descriptionText.style.maxHeight = 'none';
        const fullHeight = descriptionText.scrollHeight;
        
        descriptionText.style.webkitLineClamp = '4';
        descriptionText.style.maxHeight = `${maxHeight}px`;
        
        if (fullHeight <= maxHeight + 2) {
            toggleBtn.style.display = 'none';
        } else {
            toggleBtn.style.display = 'inline-block';
        }
    }

    toggleDescription(descriptionText, toggleBtn, wrapper, section) {
        this.descriptionExpanded = !this.descriptionExpanded;
        
        if (this.descriptionExpanded) {
            descriptionText.classList.add('expanded');
            toggleBtn.textContent = 'Show less';
            wrapper.classList.add('expanded');
            section.classList.add('expanded');
        } else {
            descriptionText.classList.remove('expanded');
            toggleBtn.textContent = 'Read more';
            wrapper.classList.remove('expanded');
            section.classList.remove('expanded');
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getTypeDisplayName(type) {
        const typeNames = {
            cities: 'Город',
            feyspires: 'Фейский Шпиль',
            settlements: 'Поселение',
            farms: 'Ферма',
            ruins: 'Руины',
            dungeons: 'Подземелье',
            caves: 'Пещера',
            secrets: 'Секрет',
            forts: 'Форт',
            shrines: 'Храм',
            poi: 'Точка интереса',
            enclaves: 'Анклав Драконьего дома',
        };
        return typeNames[type] || type;
    }

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.descriptionExpanded = false;
        this.panel.classList.remove('visible');
        this.panel.classList.add('hidden');
        
        if (this.currentLocation && this.currentLocation.marker) {
            try {
                this.currentLocation.marker.closePopup();
            } catch (e) {
            }
        }
        
        this.currentLocation = null;
        console.log('📖 Detail panel closed');
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
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