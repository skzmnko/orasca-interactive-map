import idGenerator from './id-generator.js';

// Фабрика для создания локаций с автогенерацией ID
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

        // Генерируем ID
        const locationId = idGenerator.generateId();
        
        // Используем указанное изображение или fallback
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

    // Создать несколько локаций
    static createLocations(locationsData) {
        return locationsData.map(data => this.createLocation(data));
    }
}

export default LocationFactory;