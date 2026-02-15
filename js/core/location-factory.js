import idGenerator from './id-generator.js';

class LocationFactory {
    static createLocation(data) {
        const {
            name,
            type,
            coords,
            region,
            description,
            image,
            alias,
            family,
            known = false
        } = data;

        const locationId = idGenerator.generateId();
        
        const imagePath = image || fallbackLocationImage;

        return {
            id: locationId,
            name,
            type,
            coords,
            region,
            description,
            image: imagePath,
            alias: alias || '',
            family: family || '',
            known: known,
            createdAt: new Date().toISOString()
        };
    }

    static createLocations(locationsData) {
        return locationsData.map(data => this.createLocation(data));
    }
}

export default LocationFactory;