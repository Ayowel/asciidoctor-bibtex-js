/**
 * The structured data expected to be provided to {@link set_styles}
 */
type StylesCollection = Record<
  string,
  { short_parent?: string; content: unknown }
>;
/**
 * The structured data expected to be provided to {@link set_locales}
 */
interface LocalesCollection {
  mappings: Record<string, string>;
  locales: Record<string, unknown>;
}

let style_collection: null | StylesCollection = null;

let locale_collection: null | LocalesCollection = null;

/**
 * Get the preloaded styles representation
 * @returns The styles
 */
function get_styles(): null | StylesCollection {
  return style_collection;
}

/**
 * Get the preloaded locales representation
 * @returns The locales
 */
function get_locales(): null | LocalesCollection {
  return locale_collection;
}

/**
 * Preloaded styles representation
 * @param styles The styles
 */
function set_styles(styles: StylesCollection) {
  style_collection = styles;
}

/**
 * Preloaded locales representation
 * @param styles The locales
 */
function set_locales(locales: LocalesCollection) {
  locale_collection = locales;
}

export { get_styles, get_locales, set_styles, set_locales };
