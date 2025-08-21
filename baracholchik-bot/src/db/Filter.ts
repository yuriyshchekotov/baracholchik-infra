interface FilterConstructor {
  id: string;
  name: string;
  keywords?: string[];
  regex?: string[];
  conjunction?: boolean;
}

class Filter {
  public id: string;
  public name: string;
  public keywords: string[];
  public regex: string[];
  public conjunction: boolean;

  constructor({ id, name, keywords, regex = [], conjunction = false }: FilterConstructor) {
    this.id = id;
    this.name = name;
    this.keywords = keywords || [];
    this.regex = regex;
    this.conjunction = conjunction;
  }

  matches(messageText: string): boolean {
    const lower = messageText.toLowerCase();

    const keywordMatch = this.conjunction
      ? this.keywords.every(kw => lower.includes(kw.toLowerCase()))
      : this.keywords.some(kw => lower.includes(kw.toLowerCase()));

    // Пока регулярки не используем (оставим структуру на будущее)
    // const regexMatch = this.regex.some(pattern => new RegExp(pattern).test(messageText));

    return keywordMatch;
  }
}

export default Filter; 