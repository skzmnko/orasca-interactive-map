import LocationFactory from '../core/location-factory.js';

class DataService {
    constructor() {
        this.allLocations = [];
        this.loaded = false;
        this.locationCounts = {};
    }

    async loadAllLocations() {
        if (this.loaded) return this.allLocations;

        try {
            const dataFiles = [
                'data/factions/enclaves.json',
                'data/factions/gold_dragon.json',
                'data/factions/malacoth.json',
                'data/factions/sapphire.json',
                'data/locations/forts.json',
                'data/locations/secrets.json',
                'data/locations/settlements.json',
                'data/locations/cities.json',
                'data/locations/feyspires.json',
                'data/locations/dungeons.json',
                'data/locations/poi.json',
                'data/locations/ruins.json',
                'data/locations/shrines.json'
            ];

            const promises = dataFiles.map(file => this.loadJSON(file));
            const results = await Promise.allSettled(promises);
            
            this.allLocations = [];
            this.locationCounts = {};
            
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const locations = LocationFactory.createLocations(result.value);
                    this.allLocations.push(...locations);
                    
                    locations.forEach(location => {
                        this.locationCounts[location.type] = (this.locationCounts[location.type] || 0) + 1;
                    });
                    
                    console.log(`✅ ${locations.length} locations uploaded from ${dataFiles[index]}`);
                } else {
                    console.warn(`❌ Download error ${dataFiles[index]}:`, result.reason);
                }
            });

            this.loaded = true;
            console.log(`🎯 A total of ${this.allLocations.length} locations have been uploaded`);
            console.log('📊 Distribution by types:', this.locationCounts);
            return this.allLocations;
            
        } catch (error) {
            console.error('❌ Data uploading error:', error);
            throw error;
        }
    }

    async loadJSON(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return await response.json();
    }

    getLocationsByType(type) {
        return this.allLocations.filter(location => location.type === type);
    }

    /**
     * Поиск локаций с приоритетом:
     * 1. Сначала локации, где строка найдена в названии
     * 2. Затем локации, где строка найдена только в алиасе
     * 3. Внутри каждой группы - сортировка по позиции найденного совпадения
     */
    searchLocations(query) {
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) {
            return [];
        }

        const results = [];

        this.allLocations.forEach(location => {
            const nameLower = location.name.toLowerCase();
            const aliasLower = (location.alias || '').toLowerCase();
            
            // Проверяем наличие в названии
            const nameIndex = nameLower.indexOf(lowerQuery);
            const aliasIndex = aliasLower.indexOf(lowerQuery);
            
            // Определяем тип совпадения и позицию
            let matchType = null;
            let matchPosition = Infinity;
            
            if (nameIndex !== -1) {
                matchType = 'name';
                matchPosition = nameIndex;
            } else if (aliasIndex !== -1) {
                matchType = 'alias';
                matchPosition = aliasIndex;
            }
            
            // Если строка найдена, добавляем в результаты
            if (matchType) {
                results.push({
                    location: location,
                    matchType: matchType,
                    matchPosition: matchPosition,
                    // Для сортировки внутри группы по позиции
                    sortKey: `${matchType === 'name' ? '0' : '1'}_${String(matchPosition).padStart(10, '0')}`
                });
            }
        });

        // Сортировка результатов
        results.sort((a, b) => {
            // Сначала сортируем по типу совпадения (name > alias)
            if (a.matchType !== b.matchType) {
                return a.matchType === 'name' ? -1 : 1;
            }
            
            // Затем по позиции совпадения (чем раньше, тем выше)
            return a.matchPosition - b.matchPosition;
        });

        // Возвращаем только объекты локаций
        return results.map(item => item.location);
    }

    getLocationById(id) {
        return this.allLocations.find(loc => loc.id === id);
    }

    getLocationCount(type) {
        return this.locationCounts[type] || 0;
    }

    getAllLocationCounts() {
        return { ...this.locationCounts };
    }
}

export default new DataService();