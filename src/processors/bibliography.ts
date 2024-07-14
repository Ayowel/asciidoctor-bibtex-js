// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Extensions, Registry } from "@asciidoctor/core";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { TreeProcessor } from "./utils/treeprocessor";

const bibliographyMacroPlaceholder = "%(a5d42deb-3cfc-4293-b96a-fcb47316ce56)";

/**
 * Transforms a bibliography macro into a paragraph that will later be turned
 * into an actual bibliography by the {@link TreeProcessor}
 * @param this The processor DSL bound by asciidoctor when calling {@link Registry.blockMacro}
 */
function bibliographyMacro(this: Extensions.BlockMacroProcessorDsl) {
  this.named("bibliography");
  this.positionalAttributes("style", "locale");
  this.process(function (
    parent: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    target: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    attributes: Record<string, string>,
  ) {
    if (target && !parent.getDocument().hasAttribute("bibtex-file")) {
      parent.getDocument().setAttribute("bibtex-file", target);
    }
    if (
      "style" in attributes &&
      !parent.getDocument().hasAttribute("bibtex-style")
    ) {
      parent.getDocument().setAttribute("bibtex-style", attributes["style"]);
    }
    if (
      "locale" in attributes &&
      !parent.getDocument().hasAttribute("bibtex-locale")
    ) {
      parent.getDocument().setAttribute("bibtex-locale", attributes["locale"]);
    }
    return this.createList(parent, "ulist", {
      title: bibliographyMacroPlaceholder,
    });
  });
}

export { bibliographyMacroPlaceholder, bibliographyMacro };
