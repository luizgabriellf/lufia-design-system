/**
 * Builds the component manifest from the TypeScript types, the MDX docs and the story files.
 *
 * Run through `tsx` (see `npm run build:ai-docs`) because it reads `src/docs/taxonomy.ts` directly, so the category,
 * summary and WAI-ARIA pattern of a component have exactly one source. The output is deterministic: no timestamps and no
 * package version, so the committed copy only changes when a component changes.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { ENTRIES, docsIdFor } from "../../src/docs/taxonomy.ts";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const PACKAGE_NAME = "@lufia/design-system";

const read = (file) => readFileSync(path.join(ROOT, file), "utf8");

/** Directory names exported by `export * from "./<dir>/<Name>"` lines of src/index.ts, in file order. */
function indexExports() {
  const names = [];
  for (const match of read("src/index.ts").matchAll(
    /export \* from "\.\/(components|motion)(?:\/([^"]+))?";/g,
  )) {
    names.push(match[2] ? { dir: match[1], name: match[2] } : { dir: match[1], name: null });
  }
  return names;
}

/** Every component directory that src/index.ts re-exports, directly or through src/motion/index.ts. */
export function exportedComponentDirs() {
  const result = [];
  for (const { dir, name } of indexExports()) {
    if (name) {
      result.push({ dir, name });
      continue;
    }
    for (const m of read(`src/${dir}/index.ts`).matchAll(/export \* from "\.\/([^"]+)";/g)) {
      result.push({ dir, name: m[1] });
    }
  }
  return result;
}

function createProgram(entryFiles) {
  const configPath = path.join(ROOT, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, ROOT);
  const extra = [path.join(ROOT, "src/css-modules.d.ts")].filter(existsSync);
  return ts.createProgram({
    rootNames: [...entryFiles, ...extra],
    options: { ...parsed.options, noEmit: true },
  });
}

const FORMAT = ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;
const inNodeModules = (decl) => decl.getSourceFile().fileName.includes("/node_modules/");
/** True when one pair of parentheses wraps all of `text`, as in `(() => void)`. */
const wrapped = (text) => {
  if (!text.startsWith("(") || !text.endsWith(")")) return false;
  let depth = 0;
  for (let i = 0; i < text.length - 1; i += 1) {
    if (text[i] === "(") depth += 1;
    else if (text[i] === ")") depth -= 1;
    if (depth === 0) return false;
  }
  return true;
};
/** Drops a trailing `| undefined`, and the parentheses TypeScript adds around a function type before a union. */
const stripUndefined = (text) => {
  if (!/ \| undefined$/.test(text)) return text;
  const rest = text.replace(/ \| undefined$/, "");
  return wrapped(rest) ? rest.slice(1, -1) : rest;
};
const oneLine = (text) => text.replace(/\s+/g, " ").trim();

/** Defaults written as `name = value` in the props destructuring of a component or hook. */
function destructuredDefaults(declaration) {
  const defaults = new Map();
  const fn = ts.isVariableDeclaration(declaration) ? declaration.initializer : declaration;
  if (!fn || !(ts.isFunctionDeclaration(fn) || ts.isArrowFunction(fn) || ts.isFunctionExpression(fn)))
    return defaults;
  const collect = (pattern) => {
    for (const element of pattern.elements) {
      if (element.initializer && ts.isIdentifier(element.name)) {
        const key =
          element.propertyName && ts.isIdentifier(element.propertyName)
            ? element.propertyName.text
            : element.name.text;
        defaults.set(key, oneLine(element.initializer.getText()));
      }
    }
  };
  const first = fn.parameters[0];
  if (!first) return defaults;
  if (ts.isObjectBindingPattern(first.name)) collect(first.name);
  if (fn.body && ts.isBlock(fn.body) && ts.isIdentifier(first.name)) {
    for (const statement of fn.body.statements) {
      if (!ts.isVariableStatement(statement)) continue;
      for (const d of statement.declarationList.declarations) {
        if (
          ts.isObjectBindingPattern(d.name) &&
          d.initializer &&
          ts.isIdentifier(d.initializer) &&
          d.initializer.text === first.name.text
        ) {
          collect(d.name);
        }
      }
    }
  }
  return defaults;
}

function propsOf(checker, parameter, defaults) {
  const declaration = parameter.valueDeclaration ?? parameter.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(parameter, declaration);
  const members = type.isUnion() ? type.types : [type];
  const merged = new Map();
  let nativeProps = false;
  for (const member of members) {
    for (const prop of checker.getPropertiesOfType(member)) {
      const decls = prop.declarations ?? [];
      if (decls.length > 0 && decls.every(inNodeModules)) {
        nativeProps = true;
        continue;
      }
      const entry = merged.get(prop.name);
      const required = !(prop.flags & ts.SymbolFlags.Optional);
      const typeText = resolvedTypeText(
        checker,
        checker.getTypeOfSymbolAtLocation(prop, decls[0] ?? declaration),
      );
      const description = oneLine(ts.displayPartsToString(prop.getDocumentationComment(checker)));
      if (entry) {
        entry.required = entry.required && required;
        entry.seen += 1;
        if (!entry.types.includes(typeText)) entry.types.push(typeText);
        if (!entry.description) entry.description = description;
        continue;
      }
      const tags = prop.getJsDocTags(checker);
      const tagged = tags.find((tag) => tag.name === "default")?.text;
      merged.set(prop.name, {
        name: prop.name,
        types: [typeText],
        required,
        default: tagged ? oneLine(ts.displayPartsToString(tagged)) : (defaults.get(prop.name) ?? null),
        description,
        seen: 1,
      });
    }
  }
  const props = [...merged.values()].map(({ seen, types, ...rest }) => {
    const shown = types.length > 1 ? types.filter((t) => t !== "undefined") : types;
    return {
      name: rest.name,
      type: shown.join(" | "),
      required: rest.required && seen === members.length,
      default: rest.default,
      description: rest.description,
    };
  });
  const variants = members.length > 1 ? variantsOf(checker, members, declaration) : null;
  return { props, nativeProps, variants };
}

/** Name of a union branch: its alias, looking through `Omit`/`Pick` wrappers; null for an anonymous object type. */
function branchName(type) {
  const alias = type.aliasSymbol?.name;
  if (alias && !/^(Omit|Pick|Exclude|Extract)$/.test(alias)) return alias;
  const inner = type.aliasTypeArguments?.[0];
  if (alias && inner) return branchName(inner);
  const symbol = type.symbol?.name;
  return symbol && !symbol.startsWith("__") ? symbol : null;
}

/**
 * The branches of a discriminated union of props. A branch lists only the props that set it apart from the others:
 * missing from one, or typed or required differently. A prop with the same type and requirement in every branch is not
 * repeated; one that is native in a branch and declared in another is listed (marked `native`) only when it differs, and
 * a prop present in every branch that differs only in its type is marked `onlyTypeDiffers`. Native attributes that every
 * branch inherits are skipped, and `nativeTypesDiffer` records that their element type differs between branches (event
 * handlers, for instance). The discriminant is the distinguishing prop whose type is `undefined` in one branch or a
 * literal in all of them.
 */
function variantsOf(checker, members, declaration) {
  const branches = members.map((member, index) => {
    const props = new Map();
    for (const prop of checker.getPropertiesOfType(member)) {
      const decls = prop.declarations ?? [];
      const native = decls.length > 0 && decls.every(inNodeModules);
      props.set(prop.name, {
        name: prop.name,
        type: resolvedTypeText(checker, checker.getTypeOfSymbolAtLocation(prop, decls[0] ?? declaration)),
        required: !(prop.flags & ts.SymbolFlags.Optional),
        description: native ? "" : oneLine(ts.displayPartsToString(prop.getDocumentationComment(checker))),
        native,
      });
    }
    return { name: branchName(member), index, props };
  });
  const names = [...new Set(branches.flatMap((branch) => [...branch.props.keys()]))].sort(compareText);
  const sameEverywhere = (name, compare) => {
    const first = branches[0].props.get(name);
    return branches.every((branch) => {
      const prop = branch.props.get(name);
      return prop && first && compare(prop, first);
    });
  };
  const identical = (name) =>
    sameEverywhere(name, (prop, first) => prop.type === first.type && prop.required === first.required);
  const nativeEverywhere = (name) => sameEverywhere(name, (prop) => prop.native);
  const present = (name) => sameEverywhere(name, () => true);
  const distinguishing = names.filter((name) => !identical(name) && !nativeEverywhere(name));
  const nativeTypesDiffer = names.some((name) => nativeEverywhere(name) && !identical(name));
  if (distinguishing.length === 0) return null;
  const isLiteral = (text) => /^(".*"|-?\d+|true|false|undefined)$/.test(text);
  const discriminant =
    distinguishing.find((name) => {
      const types = branches.map((branch) => branch.props.get(name)?.type);
      return (
        types.every((type) => type !== undefined) &&
        (types.includes("undefined") || types.every((type) => type.split(" | ").every(isLiteral)))
      );
    }) ?? null;
  const onlyTypeDiffers = (name) =>
    present(name) &&
    sameEverywhere(name, (prop, first) => prop.required === first.required) &&
    !identical(name);
  return {
    discriminant,
    nativeTypesDiffer,
    branches: branches.map((branch) => ({
      // An anonymous branch (an `Omit` of a named one) is named by what selects it, e.g. `href: string`.
      name:
        branch.name ??
        (discriminant
          ? `${discriminant}: ${branch.props.get(discriminant).type}`
          : `Variant${branch.index + 1}`),
      props: distinguishing
        .filter((name) => branch.props.has(name))
        .map((name) => {
          const { native, ...prop } = branch.props.get(name);
          return {
            ...prop,
            ...(native ? { native: true } : {}),
            ...(onlyTypeDiffers(name) ? { onlyTypeDiffers: true } : {}),
          };
        }),
    })),
  };
}

/** Code-point comparison: stable under every locale, unlike a bare `localeCompare`. */
const compareByName = (a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const compareText = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Type text with string and number literal unions written out, so `variant: ButtonVariant` reads
 * `"primary" | "secondary" | ...`. Other types print as TypeScript writes them.
 */
function resolvedTypeText(checker, type) {
  const parts = type.isUnion() ? type.types : [type];
  const rest = parts.filter((part) => !(part.flags & ts.TypeFlags.Undefined));
  if (rest.length > 1 && rest.every((part) => part.isStringLiteral() || part.isNumberLiteral())) {
    return literalUnion(rest.map((part) => part.value));
  }
  return oneLine(stripUndefined(checker.typeToString(type, undefined, FORMAT)));
}

/**
 * TypeScript orders union members by internal type id, which depends on what the program loaded first. The order the
 * author wrote is stable and reads better, so literal unions declared by an exported alias are remembered by their
 * value set and written in that order wherever the same set appears.
 */
const DECLARED_ORDER = new Map();
const orderKey = (values) => JSON.stringify(values.map(String).sort(compareText));
const literalUnion = (values) =>
  (DECLARED_ORDER.get(orderKey(values)) ?? values.map((v) => JSON.stringify(v))).join(" | ");

function declaredOrder(symbol) {
  const decl = symbol.declarations?.[0];
  if (!decl || !ts.isTypeAliasDeclaration(decl) || !ts.isUnionTypeNode(decl.type)) return null;
  const items = decl.type.types;
  if (
    !items.every(
      (node) =>
        ts.isLiteralTypeNode(node) && (ts.isStringLiteral(node.literal) || ts.isNumericLiteral(node.literal)),
    )
  )
    return null;
  return items.map((node) =>
    ts.isStringLiteral(node.literal) ? JSON.stringify(node.literal.text) : node.literal.text,
  );
}

const MAX_DEFINITION = 300;

/** What an exported type alias stands for, or null when it is an interface or too large to be useful inline. */
function describeType(checker, resolved) {
  const declared = checker.getDeclaredTypeOfSymbol(resolved);
  if (
    declared.isUnion() &&
    declared.types.every((part) => part.isStringLiteral() || part.isNumberLiteral())
  ) {
    const written = declaredOrder(resolved);
    const values = declared.types.map((part) => part.value);
    if (written) DECLARED_ORDER.set(orderKey(values), written);
    return literalUnion(values);
  }
  if (!(resolved.flags & ts.SymbolFlags.TypeAlias)) return null;
  const text = oneLine(checker.typeToString(declared, undefined, FORMAT | ts.TypeFormatFlags.InTypeAlias));
  return text.length <= MAX_DEFINITION ? text : null;
}

/**
 * Members of the object type a hook returns (`T` or `T | null`), with their types and JSDoc. Null for primitives,
 * functions, arrays and types declared only by a dependency, so a hook returning a ref or a boolean lists nothing.
 */
function returnMembersOf(checker, returnType, location) {
  const parts = (returnType.isUnion() ? returnType.types : [returnType]).filter(
    (part) => !(part.flags & (ts.TypeFlags.Null | ts.TypeFlags.Undefined)),
  );
  if (parts.length !== 1) return null;
  const [type] = parts;
  if (!(type.flags & ts.TypeFlags.Object) || type.getCallSignatures().length > 0 || checker.isArrayType(type))
    return null;
  const members = checker.getPropertiesOfType(type);
  if (members.length === 0 || members.every((prop) => (prop.declarations ?? []).every(inNodeModules)))
    return null;
  return members.map((prop) => {
    const memberType = checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration ?? location);
    const optional = Boolean(prop.flags & ts.SymbolFlags.Optional);
    // `| undefined` is only noise on an optional member; on a required one it is part of what the hook returns.
    const keepsUndefined =
      !optional &&
      memberType.isUnion() &&
      memberType.types.some((part) => part.flags & ts.TypeFlags.Undefined);
    return {
      name: prop.name,
      type: resolvedTypeText(checker, memberType) + (keepsUndefined ? " | undefined" : ""),
      required: !optional,
      description: oneLine(ts.displayPartsToString(prop.getDocumentationComment(checker))),
    };
  });
}

function describeExport(checker, sourceFile, symbol) {
  const name = symbol.name;
  const resolved = symbol.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(symbol) : symbol;
  if (!(resolved.flags & ts.SymbolFlags.Value))
    return {
      name,
      kind: "type",
      description: oneLine(ts.displayPartsToString(resolved.getDocumentationComment(checker))),
      definition: describeType(checker, resolved),
    };
  const declaration = resolved.valueDeclaration ?? resolved.declarations?.[0];
  const type = checker.getTypeOfSymbolAtLocation(resolved, declaration ?? sourceFile);
  const signatures = type.getCallSignatures();
  if (signatures.length === 0)
    return { name, kind: "constant", type: oneLine(checker.typeToString(type, undefined, FORMAT)) };
  const signature = signatures[0];
  const first = signature.getParameters()[0];
  const description = oneLine(ts.displayPartsToString(resolved.getDocumentationComment(checker)));
  if (/^use[A-Z]/.test(name)) {
    return {
      name,
      kind: "hook",
      description,
      signature: oneLine(checker.signatureToString(signature, undefined, FORMAT)),
      parameters: signature.getParameters().map((param) => {
        const decl = param.valueDeclaration;
        return {
          name: param.name,
          type: resolvedTypeText(checker, checker.getTypeOfSymbolAtLocation(param, decl)),
          required:
            !(param.flags & ts.SymbolFlags.Optional) &&
            !(decl && ts.isParameter(decl) && (decl.questionToken || decl.initializer)),
          description: oneLine(ts.displayPartsToString(param.getDocumentationComment(checker))),
        };
      }),
      returns: oneLine(checker.typeToString(signature.getReturnType(), undefined, FORMAT)),
      returnMembers: returnMembersOf(checker, signature.getReturnType(), declaration ?? sourceFile),
    };
  }
  if (/^[A-Z]/.test(name)) {
    const defaults = declaration ? destructuredDefaults(declaration) : new Map();
    const { props, nativeProps, variants } = first
      ? propsOf(checker, first, defaults)
      : { props: [], nativeProps: false, variants: null };
    return { name, kind: "component", description, props, nativeProps, ...(variants ? { variants } : {}) };
  }
  return {
    name,
    kind: "function",
    description,
    signature: oneLine(checker.signatureToString(signature, undefined, FORMAT)),
  };
}

/** Splits an MDX file into `### Heading` sections with the JSX lines removed, keeping code fences untouched. */
function parseMdx(source) {
  const lines = source.split("\n");
  const sections = new Map();
  let current = null;
  let fenced = false;
  let inTag = false;
  const intro = { lines: [], open: false, done: false };
  for (const line of lines) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    if (!fenced && !/^\s*```/.test(line)) {
      if (inTag) {
        if (/\/?>\s*$/.test(line)) inTag = false;
        continue;
      }
      if (/^\s*<\/?[A-Za-z]/.test(line)) {
        if (/<Section id="overview"/.test(line)) intro.open = true;
        else if (intro.open) intro.done = true;
        if (!/\/?>\s*$/.test(line)) inTag = true;
        if (/^\s*<\/Section>/.test(line)) current = null;
        continue;
      }
    }
    const heading = !fenced && /^###\s+(.+?)\s*$/.exec(line);
    if (heading) {
      intro.done = true;
      current = heading[1];
      sections.set(current, []);
      continue;
    }
    if (current) sections.get(current).push(line);
    else if (intro.open && !intro.done && !/^import |^export /.test(line)) intro.lines.push(line);
  }

  const body = (heading) => {
    const found = sections.get(heading);
    return found ? found.join("\n").trim() : null;
  };
  return { overview: intro.lines.join("\n").trim(), body, headings: [...sections.keys()] };
}

const bullets = (text) =>
  text
    ? text
        .split("\n")
        .filter((line) => /^\s*[-*] /.test(line))
        .map((line) => line.replace(/^\s*[-*] /, "").trim())
    : [];

function tableRows(text) {
  if (!text) return [];
  const rows = text.split("\n").filter((line) => /^\s*\|/.test(line));
  return rows
    .slice(2)
    .map((line) =>
      line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim()),
    )
    .filter((cells) => cells.length >= 2)
    .map((cells) => ({ keys: cells[0], action: cells.slice(1).join(" | ") }));
}

function firstCodeFence(text) {
  const match = text ? /```(\w+)?\n([\s\S]*?)```/.exec(text) : null;
  return match ? { language: match[1] ?? "tsx", code: match[2].trimEnd() } : null;
}

const kebab = (name) =>
  name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .replace(/([A-Za-z])(\d)/g, "$1-$2")
    .replace(/(\d)([A-Za-z])/g, "$1-$2")
    .toLowerCase();

function storyExports(file) {
  if (!existsSync(file)) return [];
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
  const names = [];
  for (const statement of source.statements) {
    if (
      !ts.isVariableStatement(statement) ||
      !statement.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword)
    )
      continue;
    for (const d of statement.declarationList.declarations)
      if (ts.isIdentifier(d.name)) names.push(d.name.text);
  }
  return names;
}

function tokensUsed(dir, name) {
  const file = path.join(ROOT, dir, `${name}.module.css`);
  if (!existsSync(file)) return [];
  return [
    ...new Set([...readFileSync(file, "utf8").matchAll(/--lufia-[a-z0-9-]+/g)].map((m) => m[0])),
  ].sort();
}

function reducedMotion(dir, name) {
  const file = path.join(ROOT, dir, `${name}.module.css`);
  return existsSync(file) && /prefers-reduced-motion/.test(readFileSync(file, "utf8"));
}

/** Returns the manifest object. Throws when a component exported by src/index.ts cannot be described. */
export function buildManifest() {
  const exported = exportedComponentDirs();
  const byName = new Map(ENTRIES.map((entry) => [entry.name, entry]));
  const dirs = new Map();
  for (const item of exported) dirs.set(item.name, item.dir);

  const files = [...dirs].map(([name, dir]) => path.join(ROOT, "src", dir, name, "index.ts"));
  const program = createProgram(files);
  const checker = program.getTypeChecker();

  // First pass: learn the declared order of every exported literal union before any prop type is written.
  for (const file of files) {
    const source = program.getSourceFile(file);
    const symbol = source && checker.getSymbolAtLocation(source);
    for (const exported of symbol ? checker.getExportsOfModule(symbol) : []) {
      const target = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      if (!(target.flags & ts.SymbolFlags.Value)) describeType(checker, target);
    }
  }

  const components = [];
  for (const [name, dir] of [...dirs].sort(([a], [b]) => compareText(a, b))) {
    const entry = byName.get(name);
    const indexPath = path.join(ROOT, "src", dir, name, "index.ts");
    const sourceFile = program.getSourceFile(indexPath);
    const moduleSymbol = sourceFile && checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) throw new Error(`Cannot read the exports of src/${dir}/${name}/index.ts`);
    const exports = checker
      .getExportsOfModule(moduleSymbol)
      .map((symbol) => describeExport(checker, sourceFile, symbol))
      .sort(compareByName);

    const dirRel = `src/${dir}/${name}`;
    const mdxPath = `${dirRel}/${name}.mdx`;
    const mdx = existsSync(path.join(ROOT, mdxPath)) ? parseMdx(read(mdxPath)) : null;
    // A directory with no docs page (types only) is labelled like the rest of the pre-1.0 package.
    const status = mdx
      ? (/status="(alpha|beta|stable|deprecated)"/.exec(read(mdxPath))?.[1] ?? null)
      : "beta";
    const category = entry?.category ?? "Utilities";
    const docsId = entry ? docsIdFor(name) : null;
    const stories = storyExports(path.join(ROOT, dirRel, `${name}.stories.tsx`));
    const importPath = dir === "motion" ? `${PACKAGE_NAME}/motion` : `${PACKAGE_NAME}/components/${name}`;
    const keyboardText = mdx?.body("Keyboard") ?? mdx?.body("Keyboard and accessibility") ?? null;
    const motionHeading = mdx?.headings.find((h) => /^(Motion|Reduced motion|Timing)$/i.test(h));

    components.push({
      name,
      category,
      summary: entry?.summary ?? exports.find((e) => e.description)?.description ?? "",
      status,
      source: dirRel,
      entry: { subpath: importPath, root: PACKAGE_NAME },
      exports,
      aliases: Object.fromEntries(
        exports.filter((e) => e.kind === "type" && e.definition).map((e) => [e.name, e.definition]),
      ),
      story: docsId
        ? {
            docsId: `${docsId}--docs`,
            stories: stories.map((story) => ({ export: story, id: `${docsId}--${kebab(story)}` })),
          }
        : null,
      docs: mdx
        ? {
            mdx: mdxPath,
            overview: mdx.overview,
            usage: firstCodeFence(mdx.body("Usage")),
            whenToUse: bullets(mdx.body("When to use")),
            whenNotToUse: bullets(mdx.body("When not to use")),
            contentGuidelines: mdx.body("Content guidelines"),
          }
        : null,
      a11y: {
        pattern: entry?.apg ? { label: entry.apg.label, url: entry.apg.path } : null,
        keyboard: tableRows(keyboardText),
        keyboardNotes: keyboardText && tableRows(keyboardText).length === 0 ? keyboardText : null,
        notes: bullets(mdx?.body("Accessibility") ?? null),
      },
      motion: {
        respectsReducedMotion: reducedMotion(dirRel, name),
        notes: motionHeading ? mdx.body(motionHeading) : null,
      },
      tokens: tokensUsed(dirRel, name),
    });
  }
  return { schema: 1, package: PACKAGE_NAME, components };
}
