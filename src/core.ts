// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Extensions, Registry } from "@asciidoctor/core";
import { bibliographyMacro } from "./processors/bibliography";
import { citationUpdater } from "./processors/tree";
import { set_fs } from "./compat/utils";
import { set_locales, set_styles } from "./compat/data";
// Explicitly import citation-js plugins so that they register themselves inly @citation-js/core
import "@citation-js/plugin-bibtex";
import "@citation-js/plugin-csl";
import { plugins } from "@citation-js/core";

/**
 * Initialize module configuration
 */
function init_citation_js() {
  plugins.config.get("@bibtex").format.useIdAsLabel = true;
}

/**
 * Delegate function called by {@link Extensions.register} to register the extension
 * @param this The base {@link Registry} instance to register to.
 */
function registryRegister(this: Registry) {
  init_citation_js();
  this.treeProcessor(citationUpdater);
  this.blockMacro(bibliographyMacro);
}

/**
 * Standard registration function used to autoload Asciidoctor extensions. It handles the compatibility accross major Asciidoctor.js version
 * @param registry This may either be a reference to the {@link Extensions} namespace with Asciidoctor 3.X or a {@link Registry} in earlier versions
 * @returns The {@param registry} received as a parameter
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function register(registry: any) {
  if (typeof registry.register === "function") {
    registry.register(registryRegister);
  } else if (typeof registry.block === "function") {
    registryRegister.bind(registry as Registry)();
  }
  return registry;
}

export { register, set_fs, set_locales, set_styles };
