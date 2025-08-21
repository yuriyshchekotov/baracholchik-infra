import fs from 'fs';
import path from 'path';
import Filter from './Filter';

// Fix the path to point to the source data directory, not the dist directory
const DB_PATH = path.join(process.cwd(), 'data/filters.json');

interface FilterData {
  id: string;
  name: string;
  keywords: string[];
  regex: string[];
  conjunction: boolean;
}

interface AddFilterParams {
  name: string;
  keywords: string[];
  regex?: string[];
  conjunction?: boolean;
}

class FilterManager {
  private filters: Filter[] = [];

  constructor() {
    this.ensureFiltersFile();
    this.loadFilters();
  }

  private ensureFiltersFile(): void {
    if (!fs.existsSync(DB_PATH)) {
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, '[]', 'utf-8');
    }
  }

  private loadFilters(): void {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf-8');
      const rawFilters: FilterData[] = JSON.parse(data);
      this.filters = rawFilters.map(obj => new Filter(obj));
    } catch (error) {
      console.error('Error loading filters:', error);
      this.filters = [];
    }
  }

  private saveAll(): void {
    const plain: FilterData[] = this.filters.map(filter => ({
      id: filter.id,
      name: filter.name,
      keywords: filter.keywords,
      regex: filter.regex,
      conjunction: filter.conjunction
    }));
    fs.writeFileSync(DB_PATH, JSON.stringify(plain, null, 2), 'utf-8');
  }

  getAll(): Filter[] {
    return this.filters;
  }

  getById(id: string): Filter | undefined {
    return this.filters.find(f => f.id === id);
  }

  getMatching(messageText: string): Filter[] {
    return this.filters.filter(f => f.matches(messageText));
  }

  addFilter({ name, keywords, regex = [], conjunction = false }: AddFilterParams): Filter {
    const newId = this.filters.length > 0
      ? (Math.max(...this.filters.map(f => parseInt(f.id))) + 1).toString()
      : '1';

    const filter = new Filter({
      id: newId,
      name,
      keywords,
      regex,
      conjunction
    });

    this.filters.push(filter);
    this.saveAll();
    return filter;
  }
}

export default new FilterManager(); 