import { describe, it, expect } from 'vitest';
import {
  jsonToYaml,
  yamlToJson,
  csvToJson,
  jsonToCsv,
  prettifyJson,
  minifyJson,
  prettifyYaml,
} from '../utils/converters';

describe('JSON to YAML Conversion', () => {
  it('should convert simple JSON to YAML', () => {
    const input = '{"name": "John", "age": 30}';
    const result = jsonToYaml(input);
    expect(result.success).toBe(true);
    expect(result.output).toContain('name: John');
    expect(result.output).toContain('age: 30');
  });

  it('should convert nested JSON to YAML', () => {
    const input = '{"person": {"name": "John", "address": {"city": "NYC"}}}';
    const result = jsonToYaml(input);
    expect(result.success).toBe(true);
    expect(result.output).toContain('person:');
    expect(result.output).toContain('address:');
    expect(result.output).toContain('city: NYC');
  });

  it('should convert arrays to YAML', () => {
    const input = '{"items": ["a", "b", "c"]}';
    const result = jsonToYaml(input);
    expect(result.success).toBe(true);
    expect(result.output).toContain('- a');
    expect(result.output).toContain('- b');
    expect(result.output).toContain('- c');
  });

  it('should return error for invalid JSON', () => {
    const result = jsonToYaml('not valid json');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle empty object', () => {
    const result = jsonToYaml('{}');
    expect(result.success).toBe(true);
    expect(result.output.trim()).toBe('{}');
  });
});

describe('YAML to JSON Conversion', () => {
  it('should convert simple YAML to JSON', () => {
    const input = 'name: John\nage: 30';
    const result = yamlToJson(input);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.name).toBe('John');
    expect(parsed.age).toBe(30);
  });

  it('should convert nested YAML to JSON', () => {
    const input = `
person:
  name: John
  address:
    city: NYC
`;
    const result = yamlToJson(input);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.person.name).toBe('John');
    expect(parsed.person.address.city).toBe('NYC');
  });

  it('should convert YAML arrays to JSON', () => {
    const input = `
items:
  - a
  - b
  - c
`;
    const result = yamlToJson(input);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed.items).toEqual(['a', 'b', 'c']);
  });

  it('should return error for invalid YAML', () => {
    const result = yamlToJson('  invalid:\nyaml: here');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('JSON/YAML Round-trip', () => {
  it('should preserve data through round-trip', () => {
    const original = {
      name: 'Test',
      count: 42,
      active: true,
      items: [1, 2, 3],
      nested: { key: 'value' },
    };
    const json = JSON.stringify(original);
    const yaml = jsonToYaml(json);
    expect(yaml.success).toBe(true);

    const backToJson = yamlToJson(yaml.output);
    expect(backToJson.success).toBe(true);

    const final = JSON.parse(backToJson.output);
    expect(final).toEqual(original);
  });
});

describe('CSV to JSON Conversion', () => {
  it('should convert CSV with headers to JSON array of objects', () => {
    const input = 'name,age,city\nAlice,30,NYC\nBob,25,LA';
    const result = csvToJson(input, ',', true);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual({ name: 'Alice', age: 30, city: 'NYC' });
    expect(parsed[1]).toEqual({ name: 'Bob', age: 25, city: 'LA' });
  });

  it('should convert CSV without headers to JSON array of arrays', () => {
    const input = 'Alice,30,NYC\nBob,25,LA';
    const result = csvToJson(input, ',', false);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed).toHaveLength(2);
    expect(parsed[0]).toEqual(['Alice', 30, 'NYC']);
  });

  it('should handle different delimiters', () => {
    const input = 'name;age\nAlice;30';
    const result = csvToJson(input, ';', true);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('should handle tab delimiter', () => {
    const input = 'name\tage\nAlice\t30';
    const result = csvToJson(input, '\t', true);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed[0]).toEqual({ name: 'Alice', age: 30 });
  });

  it('should handle quoted values with commas', () => {
    const input = 'name,description\nAlice,"Hello, World"';
    const result = csvToJson(input, ',', true);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed[0].description).toBe('Hello, World');
  });

  it('should parse numbers automatically', () => {
    const input = 'value\n42\n3.14\ntrue';
    const result = csvToJson(input, ',', true);
    expect(result.success).toBe(true);
    const parsed = JSON.parse(result.output);
    expect(parsed[0].value).toBe(42);
    expect(parsed[1].value).toBe(3.14);
    expect(parsed[2].value).toBe(true);
  });
});

describe('JSON to CSV Conversion', () => {
  it('should convert array of objects to CSV', () => {
    const input = '[{"name":"Alice","age":30},{"name":"Bob","age":25}]';
    const result = jsonToCsv(input, ',', true);
    expect(result.success).toBe(true);
    expect(result.output).toContain('name,age');
    expect(result.output).toContain('Alice,30');
    expect(result.output).toContain('Bob,25');
  });

  it('should convert array of arrays to CSV', () => {
    const input = '[["Alice",30],["Bob",25]]';
    const result = jsonToCsv(input, ',', false);
    expect(result.success).toBe(true);
    expect(result.output).toContain('Alice,30');
    expect(result.output).toContain('Bob,25');
  });

  it('should handle different delimiters', () => {
    const input = '[{"name":"Alice","age":30}]';
    const result = jsonToCsv(input, ';', true);
    expect(result.success).toBe(true);
    expect(result.output).toContain('name;age');
    expect(result.output).toContain('Alice;30');
  });

  it('should return error for non-array JSON', () => {
    const result = jsonToCsv('{"name": "Alice"}', ',', true);
    expect(result.success).toBe(false);
    expect(result.error).toContain('array');
  });

  it('should return error for invalid JSON', () => {
    const result = jsonToCsv('not json', ',', true);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should handle empty array', () => {
    const result = jsonToCsv('[]', ',', true);
    expect(result.success).toBe(true);
    expect(result.output).toBe('');
  });
});

describe('JSON Prettify/Minify', () => {
  it('should prettify minified JSON', () => {
    const input = '{"name":"John","age":30}';
    const result = prettifyJson(input, 2);
    expect(result.success).toBe(true);
    expect(result.output).toContain('\n');
    expect(result.output).toContain('  ');
  });

  it('should minify prettified JSON', () => {
    const input = `{
  "name": "John",
  "age": 30
}`;
    const result = minifyJson(input);
    expect(result.success).toBe(true);
    expect(result.output).not.toContain('\n');
    expect(result.output).not.toContain('  ');
    expect(result.output).toBe('{"name":"John","age":30}');
  });

  it('should use custom indent size', () => {
    const input = '{"key":"value"}';
    const result = prettifyJson(input, 4);
    expect(result.success).toBe(true);
    expect(result.output).toContain('    "key"');
  });

  it('should return error for invalid JSON', () => {
    const result = prettifyJson('not json');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('YAML Prettify', () => {
  it('should prettify YAML', () => {
    const input = 'name: John\nage: 30';
    const result = prettifyYaml(input, 2);
    expect(result.success).toBe(true);
    expect(result.output).toContain('name: John');
    expect(result.output).toContain('age: 30');
  });

  it('should return error for invalid YAML', () => {
    const result = prettifyYaml('  invalid:\nyaml');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
