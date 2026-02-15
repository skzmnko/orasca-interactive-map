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
                'data/geography/forests.json',
                'data/geography/mountains.json',
                'data/geography/rivers.json',
                'data/geography/seas.json',
                'data/settlements/fortresses.json',
                'data/settlements/inns.json',
                'data/settlements/settlements.json',
                'data/settlements/cities.json',
                'data/dungeons/dungeons.json',
                'data/dungeons/landmarks.json',
                'data/dungeons/ruins.json',
                'data/dungeons/temples.json'
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