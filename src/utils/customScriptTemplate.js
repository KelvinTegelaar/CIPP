const parsePathSegments = (expression) => {
  if (!expression || !expression.startsWith("Result")) {
    return null;
  }

  const remainder = expression.slice("Result".length);
  const segments = [];
  let cursor = 0;

  while (cursor < remainder.length) {
    const char = remainder[cursor];
    if (char === ".") {
      const identifierMatch = /^\.([A-Za-z_][A-Za-z0-9_]*)/.exec(remainder.slice(cursor));
      if (!identifierMatch) {
        return null;
      }
      segments.push(identifierMatch[1]);
      cursor += identifierMatch[0].length;
      continue;
    }

    if (char === "[") {
      const bracketMatch = /^\[(\d+|\*)\]/.exec(remainder.slice(cursor));
      if (!bracketMatch) {
        return null;
      }
      segments.push(bracketMatch[1] === "*" ? "*" : Number.parseInt(bracketMatch[1], 10));
      cursor += bracketMatch[0].length;
      continue;
    }

    return null;
  }

  return segments;
};

const toEnumerable = (value) => {
  if (value == null || typeof value === "string") {
    return [];
  }
  if (Array.isArray(value)) {
    return value;
  }
  return [];
};

const resolvePath = (result, expression) => {
  if (expression === "Result") {
    return result;
  }

  const segments = parsePathSegments(expression);
  if (!segments) {
    return null;
  }

  let values = [result];

  for (const segment of segments) {
    const nextValues = [];
    for (const currentValue of values) {
      if (segment === "*") {
        nextValues.push(...toEnumerable(currentValue));
        continue;
      }

      if (typeof segment === "number") {
        if (Array.isArray(currentValue) && segment >= 0 && segment < currentValue.length) {
          nextValues.push(currentValue[segment]);
        }
        continue;
      }

      if (currentValue && typeof currentValue === "object" && segment in currentValue) {
        nextValues.push(currentValue[segment]);
      }
    }
    values = nextValues;
  }

  if (values.length === 0) {
    return null;
  }

  return values.length === 1 ? values[0] : values;
};

const valueToString = (value) => {
  if (value == null) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
};

const escapeMarkdownCell = (value) => {
  return valueToString(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
};

const decodeEscapedTemplateString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\\/g, "\\");
};

const parseQuotedFieldNames = (value) => {
  if (!value || typeof value !== "string") {
    return [];
  }

  const matches = value.matchAll(/(["'])(.*?)\1/g);
  return Array.from(matches, (match) => match[2]).filter(Boolean);
};

const resolveToken = (result, tokenExpression) => {
  const expression = tokenExpression.trim();

  if (expression === "ResultJson") {
    return `\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  }

  if (expression === "Result") {
    return JSON.stringify(result);
  }

  const fallbackMatch = /^(.*?)\s*\?\?\s*(["'])([\s\S]*)\2$/.exec(expression);
  if (fallbackMatch) {
    const baseValue = resolveToken(result, fallbackMatch[1]);
    return baseValue === "" ? decodeEscapedTemplateString(fallbackMatch[3]) : baseValue;
  }

  const joinMatch = /^join\((.+?),\s*(["'])([\s\S]*?)\2\)$/.exec(expression);
  if (joinMatch) {
    const joinedValue = resolvePath(result, joinMatch[1].trim());
    const values = Array.isArray(joinedValue) ? joinedValue : joinedValue == null ? [] : [joinedValue];
    return values.map((item) => valueToString(item)).join(decodeEscapedTemplateString(joinMatch[3]));
  }

  const countMatch = /^count\((.+)\)$/.exec(expression);
  if (countMatch) {
    const countedValue = resolvePath(result, countMatch[1].trim());
    if (Array.isArray(countedValue)) {
      return String(countedValue.length);
    }
    return countedValue == null ? "0" : "1";
  }

  const tableMatch = /^table\((.+?)\s*,\s*([\s\S]+)\)$/.exec(expression);
  if (tableMatch) {
    const arrayValue = resolvePath(result, tableMatch[1].trim());
    const fields = parseQuotedFieldNames(tableMatch[2]);

    if (!Array.isArray(arrayValue) || fields.length === 0) {
      return "";
    }

    const header = `| ${fields.join(" | ")} |`;
    const separator = `| ${fields.map(() => "---").join(" | ")} |`;
    const rows = arrayValue.map((item) => {
      const values = fields.map((field) => {
        if (item && typeof item === "object" && field in item) {
          return escapeMarkdownCell(item[field]);
        }
        return "";
      });

      return `| ${values.join(" | ")} |`;
    });

    return [header, separator, ...rows].join("\n");
  }

  return valueToString(resolvePath(result, expression));
};

export const renderCustomScriptMarkdownTemplate = (result, template) => {
  if (!template || template.trim().length === 0) {
    if (typeof result === "string" && result.trim().length > 0) {
      return result;
    }
    return `### Script Result\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\``;
  }

  return template.replace(/\{\{\s*([\s\S]*?)\s*\}\}/g, (_, token) =>
    resolveToken(result, token),
  );
};
