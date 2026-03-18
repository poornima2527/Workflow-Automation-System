const fs = require('fs').promises;
const path = require('path');

class SimpleDB {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  async ensureDataDir() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  async readFile(filename) {
    try {
      const data = await fs.readFile(path.join(this.dataDir, filename), 'utf8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async writeFile(filename, data) {
    await this.ensureDataDir();
    await fs.writeFile(path.join(this.dataDir, filename), JSON.stringify(data, null, 2));
  }

  async getNextId(items) {
    if (items.length === 0) return '1';
    const maxId = Math.max(...items.map(item => parseInt(item.id || '0')));
    return (maxId + 1).toString();
  }
}

module.exports = new SimpleDB();
