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

    searchLocations(query) {
        const lowerQuery = query.toLowerCase();
        return this.allLocations.filter(loc => {
            const searchText = `${loc.name} ${loc.alias || ''}`.toLowerCase();
            return searchText.includes(lowerQuery);
        });
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