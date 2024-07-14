declare module "@citation-js/core" {
  type logLevel = string;

  type OutputOptions = {
    /**
     * Output format (datatype).
     * @default 'real'
     */
    format?: "real" | "string";
    /**
     * Output type (media type)
     * @default 'json'
     */
    type?: "json" | "html" | "string";
    /**
     * Output style (structure). One of 'csl', 'bibtex', 'bibtxt', and 'citation-*' where * is a CSL Template name
     * @default 'csl'
     */
    style?: string;
    /** Output language */
    lang?: string;
    /**  */
    prepend?: string | ((entry: any) => string);
    /**  */
    append?: string | ((entry: any) => string);
  };

  type InputOptions = {
    /** Default Output Options, used when calling {@link Cite#get()} */
    output?: OutputOptions;
    /** Max number of parsing iterations used when parsing. Defaults to 10. */
    maxChainLength?: number;
    /** Generate a parsing chain graph. Holds info on how an entry was parsed. Defaults to true. */
    generateGraph?: boolean;
    /** Force parsing as a certain Input Formats, if the type checking methods fail (or are slow, and you already know what the input type is, etc.). */
    forceType?: any;
  };

  type CiteEntry = {
    "container-title"?: string;
    author?: { given: string; family: string }[];
    editor?: string;
    DOI?: string;
    type?: string;
    id: string;
    "citation-key"?: string;
    ISSN?: string;
    issued?: { "date-parts": number[] };
    publisher?: string;
    title?: string;
    URL?: string;
    volume?: string;
    _graph: { type: string; data?: string }[];
  };

  const version: string;

  class Cite {
    constructor(data?: any, options?: any);
    /** Async constructor, recommended for Wikidata, URL, and DOI input */
    async(data: any, options: any): Promise<Cite>;
    /** Add data */
    add(data: any, options?: Object, log?: boolean): Cite;
    /** Add data */
    addAsync(data: any, options?: Object, log?: boolean): Promise<Cite>;
    /** Remove all data and options */
    reset();
    /** Replace all data with new data */
    set(data: any, options?: Object | boolean, log?: boolean): Cite;
    /** Replace all data with new data */
    setAsync(
      data: any,
      options?: Object | boolean,
      log?: boolean,
    ): Promise<Cite>;
    /** Get current version number */
    currentVersion(): number;
    /** Retrieve a certain version of the object */
    retrieveVersion(version: number);
    /** Retrieve the last saved version of the object */
    retrieveLastVersion();
    /** Restore the n to last version (default: 1) */
    undo(count?: number);
    /** Save the current object */
    save();
    /** Change default options */
    options(options: OutputOptions);
    /**
     * Sort all entries on basis of their BibTeX label
     *
     * This function sorts the entries, either by:
     *
     * - a custom callback function {@link Cite.sort}
     * - a list of CSL-JSON props to compare
     * - a label based on the last name of the first author, the year and the first non-noise word
     */
    sort(filter: ((entryA: any, entryB: any) => number) | string[] | string);
    /** Format data in a Cite instance */
    format(kind: string, format?: any): any;
    /** @deprecated Use {@link Cite.format} instead */
    get(what: any): any;
    /** @deprecated Use {@link Cite.format} instead */
    getAsync(what: any): Promise<any>;
    protected data: CiteEntry[];
  }

  namespace plugins {
    type PluginRef = string;
    type Plugins = {
      input: { [key: Format]: Parser };
      output: { [key: FormatterName]: Formatter };
      dict: { [DictName: Dict] };
      config: Object;
    };
    function add(ref: PluginRef, plugins?: Plugins);
    function remove(ref: PluginRef);
    function has(ref: PluginRef): boolean;
    function list(): PluginRef[];
    namespace input {
      utils = {}; // TODO
      type Format = string;
      namespace util {
        // dataType
        function typeOf(thing: any): string;
        function dataTypeOf(thing: any): plugins.input.DataType;
        // graph {
        function applyGraph(entry: CSL, graph: Object[]): CSL;
        function removeGraph(entry: CSL): CSL;
        // parser {
        class TypeParser {
          static validDataTypes: string[];
          constructor(data: Object);
          validateDataType();
          validateParseType();
          validateTokenList();
          validatePropertyConstraint();
          validateElementConstraint();
          validateExtends();
          validate();
          parseTokenList();
          parsePropertyConstraint();
          parseElementConstraint();
          parseElementConstraint();
          getCombinedPredicate();
          getDataType();
          readonly dataType: plugins.input.DataType; // TODO: add type
          readonly predicate: plugins.input.Predicate; // TODO: add type
          readonly extends: plugins.input.Format;
        }
        class DataParser {
          constructor(parser: any, options?: { async?: boolean });
          validate();
        }
        class FormatParser {
          constructor(parser: any, options?: { async?: boolean });
          validateFormat();
          validate();
        }
        // csl {
        function clean(data: CSL[], bestGuessConversions?: boolean): CSL[];
      }
      // From register.js
      function add(
        format: plugins.input.Format,
        parsers: plugins.input.Parsers,
      );
      function get(format: plugins.input.Format): Object;
      function remove(format: plugins.input.Format);
      function has(format: plugins.input.Format): boolean;
      function list(): plugins.input.Format[];
      // From chain.js
      function chain(input: InputData, options: InputOptions): CSL;
      function chainAsync(
        input: InputData,
        options: InputOptions,
      ): Promise<CSL>;
      function chainLink(input: InputData): InputData;
      function chainLink(input: InputData): Promise<InputData>;
      // From type.js
      function type(input: InputData): plugins.input.Format;
      function addTypeParser(
        format: plugins.input.Format,
        typeParser: plugins.input.util.TypeParser,
      );
      function hasTypeParser(type: plugins.input.Format): boolean;
      function removeTypeParser(type: plugins.input.Format);
      function listTypeParser(): plugins.input.Format[];
      function treeTypeParser(): Object;
      const typeMatcher: RegExp;
      // From data.js
      function data(input: InputData, type: plugins.input.Format): any;
      function dataAsync(
        input: InputData,
        type: plugins.input.Format,
      ): Promise<any>;
      function addDataParser(
        format: plugins.input.Format,
        options: {
          parser: plugins.input.parse | plugins.input.parseAsync;
          async?: boolean;
        },
      );
      function hasDataParser(
        type: plugins.input.Format,
        async?: boolean,
      ): boolean;
      function removeDataParser(type: plugins.input.Format, async?: boolean);
      function listDataParser(async?: boolean): plugins.input.Format[];
    }
    namespace output {
      type FormatterName = string;
      // TODO: type Formatter
      const register: util.Register;
      function add(
        name: plugins.output.FormatterName,
        formatter: plugins.output.Formatter,
      );
      function remove(name: plugins.output.FormatterName);
      function has(name: plugins.output.FormatterName): boolean;
      function list(): string[];
      function format(
        name: plugins.output.FormatterName,
        data: CSL,
        ...options: any
      ): any;
    }
    namespace dict {
      type DictName = string;
      type Dict = { [key: plugins.dict.EntryName]: plugins.dict.DictEntry };
      type EntryName = string;
      type DictEntry = string[];
      const register: util.Register;
      function add(name: plugins.dict.DictName, dict: plugins.dict.Dict);
      function remove(name: plugins.dict.DictName);
      function has(name: plugins.dict.DictName): boolean;
      function get(name: plugins.dict.DictName): plugins.dict.Dict;
      /** @deprecated Use the new formatting dicts: {@link module:@citation-js/core.plugins.dict} */
      const htmlDict = {
        wr_start: string,
        wr_end: string,
        en_start: string,
        en_end: string,
        ul_start: string,
        ul_end: string,
        li_start: string,
        li_end: string,
      };
      /** @deprecated Use the new formatting dicts: {@link module:@citation-js/core.plugins.dict} */
      const textDict = htmlDict;
    }
    namespace config {
      function add(ref: PluginRef, config: Object);
      function get(ref: PluginRef): any;
      function has(ref: PluginRef): boolean;
      function remove(ref: PluginRef);
      function list(): PluginRef[];
    }
  }

  namespace util {
    // csl.js
    function upgradeCsl<T>(item: T): T;
    function downgradeCsl<T>(item: T): T;
    // deepCopy.js
    function deepCopy<T>(value: T, seen: Set): T$;
    // fetchFile.js
    type fetchFileOptions = {
      checkContentType?: boolean;
      headers?: Object;
      body?: string | Object;
    };
    function fetchFile(url: string, opts: util.Options): string;
    function fetchFileAsync(url: string, opts: util.Options): Promise<string>;
    function setUserAgent(newUserAgent: string);
    // fetchId.js
    function fetchId(list: string[], prefix: string): string;
    // stack.js
    type TokenStackPattern =
      | string
      | RegExp
      | util.TokenStackMatch
      | (string | RegExp | util.TokenStackMatch)[];
    type TokenStackSequence = string | TokenStackPattern[];
    type TokenStackMatch = (
      token: string,
      index: number,
      stack: string[],
    ) => boolean;
    type TokenStackTokenMap = (token: string) => string;
    type TokenStackTokenFilter = (token: string) => boolean;
    class TokenStack {
      constructor(array: string[]);
      static getPatternText(pattern: string | RegExp): string;
      static getMatchCallback(
        pattern: util.TokenStackPattern,
      ): util.TokenStackMatch;
      tokensLeft(): number;
      matches(pattern: util.TokenStackPattern): boolean;
      matchesSequence(pattern: util.TokenStackSequence): boolean;
      consumeToken(
        pattern: string,
        options?: { inverse: boolean; spaced: boolean },
      ): string;
      consumeWhitespace(
        pattern: string,
        options?: { optional?: boolean },
      ): string;
      consumeN(length: number): string;
      consumeSequence(sequence: util.TokenStackSequence): string;
      consume(
        pattern: string,
        options?: {
          min?: number;
          max?: number;
          inverse?: boolean;
          tokenMap: TokenStackTokenMap;
          tokenFilter: TokenStackTokenFilter;
        },
      ): string;
    }
    // register.js
    class Register {
      constructor(data?: Object);
      set(key: string, value: any): void;
      add(key: string, value: any): Register;
      delete(key: string): Register;
      remove(key: string): Register;
      get(key: string): any;
      has(key: string): boolean;
      list(): string[];
    }
    // grammar.js
    type GrammarRuleName = string;
    type GrammarRule = (this: util.Grammar) => void;
    class Grammar {
      constructor(rules: util.GrammarRule, state);
      parse(iterator: any, mainRule: any): any;
      matchEndOfFile(): boolean;
      matchToken(type: string): boolean;
      consumeToken(type: string, optional?: boolean): Object;
      consumeRule(rule: string): any;
    }
    // translator.js
    type TranslatorConvert = (input: Object) => Object;
    class Translator {
      constructor(props: TranslatorConvert);
      static CONVERT_TO_SOURCE = symbol;
      static CONVERT_TO_TARGET = symbol;
    }
    const logger: {
      _output: () => void;
      _console: Console;
      _log: string[];
      _levels: ["http", "debug", "unmapped", "info", "warn", "error", "silent"];
      level: logLevel[];
      http: (scope: string, ...msg: any) => void;
      debug: (scope: string, ...msg: any) => void;
      unmapped: (scope: string, ...msg: any) => void;
      info: (scope: string, ...msg: any) => void;
      warn: (scope: string, ...msg: any) => void;
      error: (scope: string, ...msg: any) => void;
      silent: (scope: string, ...msg: any) => void;
    };
  }
}
