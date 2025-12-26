/**
 * Data format converter utility functions
 * PRIVACY-CRITICAL: All conversions are done locally
 */

import yaml from 'js-yaml';
import Papa from 'papaparse';

export interface ConversionResult {
  success: boolean;
  output: string;
  error: string | null;
}

export function jsonToYaml(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = JSON.parse(input);
    const output = yaml.dump(parsed, {
      indent,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
    });
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'JSON parse error',
    };
  }
}

export function yamlToJson(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = yaml.load(input);
    const output = JSON.stringify(parsed, null, indent);
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'YAML parse error',
    };
  }
}

export function csvToJson(
  input: string,
  delimiter: string = ',',
  hasHeader: boolean = true
): ConversionResult {
  try {
    const parsed = Papa.parse(input, {
      delimiter: delimiter || ',',
      header: hasHeader,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parsed.errors.length > 0) {
      const firstError = parsed.errors[0];
      return {
        success: false,
        output: '',
        error: `Row ${firstError.row}: ${firstError.message}`,
      };
    }

    const output = JSON.stringify(parsed.data, null, 2);
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'CSV parse error',
    };
  }
}

export function jsonToCsv(
  input: string,
  delimiter: string = ',',
  includeHeader: boolean = true
): ConversionResult {
  try {
    const data = JSON.parse(input);

    if (!Array.isArray(data)) {
      return { success: false, output: '', error: 'JSON must be an array of objects or arrays' };
    }

    if (data.length === 0) {
      return { success: true, output: '', error: null };
    }

    const firstItem = data[0];
    const isObjectArray = typeof firstItem === 'object' && firstItem !== null && !Array.isArray(firstItem);

    const output = Papa.unparse(data, {
      delimiter: delimiter || ',',
      header: includeHeader && isObjectArray,
    });

    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'JSON parse error',
    };
  }
}

export function prettifyJson(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed, null, indent);
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'JSON parse error',
    };
  }
}

export function minifyJson(input: string): ConversionResult {
  try {
    const parsed = JSON.parse(input);
    const output = JSON.stringify(parsed);
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'JSON parse error',
    };
  }
}

export function prettifyYaml(input: string, indent: number = 2): ConversionResult {
  try {
    const parsed = yaml.load(input);
    const output = yaml.dump(parsed, { indent, lineWidth: -1 });
    return { success: true, output, error: null };
  } catch (err) {
    return {
      success: false,
      output: '',
      error: err instanceof Error ? err.message : 'YAML parse error',
    };
  }
}
