// Централизованный генератор уникальных ID
class LocationIdGenerator {
    constructor() {
        this.nextId = 1;
        this.usedIds = new Set();
    }

    // Основной метод генерации ID
    generateId() {
        // Ищем следующее свободное ID
        while (this.usedIds.has(this.nextId)) {
            this.nextId++;
        }
        
        const newId = this.nextId;
        this.usedIds.add(newId);
        this.nextId++; // Увеличиваем для следующей генерации
        
        return newId;
    }

    // Ручная регистрация ID (для особых случаев)
    registerId(id) {
        if (this.usedIds.has(id)) {
            console.warn(`ID ${id} уже зарегистрирован!`);
            return false;
        }
        
        this.usedIds.add(id);
        // Обновляем nextId если нужно
        if (id >= this.nextId) {
            this.nextId = id + 1;
        }
        return true;
    }

    // Получить статистику
    getStats() {
        return {
            nextId: this.nextId,
            totalUsed: this.usedIds.size
        };
    }
}

// Создаем глобальный экземпляр
const idGenerator = new LocationIdGenerator();

export default idGenerator;