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
                'data/forts.json',
                'data/secrets.json',
                'data/settlements.json',
                'data/cities.json',
                'data/feyspires.json',
                'data/dungeons.json',
                'data/poi.json',
                'data/ruins.json',
                'data/shrines.json'
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
        const lowerQuery = query.toLowerCase().trim();
        
        if (!lowerQuery) {
            return [];
        }

        const results = [];

        this.allLocations.forEach(location => {
            const nameLower = location.name.toLowerCase();
            const aliasLower = (location.alias || '').toLowerCase();
            
            const nameIndex = nameLower.indexOf(lowerQuery);
            const aliasIndex = aliasLower.indexOf(lowerQuery);
            
            let matchType = null;
            let matchPosition = Infinity;
            
            if (nameIndex !== -1) {
                matchType = 'name';
                matchPosition = nameIndex;
            } else if (aliasIndex !== -1) {
                matchType = 'alias';
                matchPosition = aliasIndex;
            }
            
            if (matchType) {
                results.push({
                    location: location,
                    matchType: matchType,
                    matchPosition: matchPosition,
                    sortKey: `${matchType === 'name' ? '0' : '1'}_${String(matchPosition).padStart(10, '0')}`
                });
            }
        });

        results.sort((a, b) => {
            if (a.matchType !== b.matchType) {
                return a.matchType === 'name' ? -1 : 1;
            }
            
            return a.matchPosition - b.matchPosition;
        });

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
