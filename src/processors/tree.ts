import {
  AbstractBlock,
  Block,
  Document,
  Extensions,
  List,
} from "@asciidoctor/core";
import context from "../compat/utils";
import { bibliographyMacroPlaceholder } from "./bibliography";
import { TreeProcessor } from "./utils/treeprocessor";

/**
 * Breadth-first search a directory for a bibtex file
 * @param base_path The directory to use to start the search
 * @returns The path to the bibtex file found (if any)
 */
function search_bibtex_file(base_path: string): string | undefined {
  const dirlist = [base_path];
  while (dirlist.length > 0) {
    const dir = dirlist.shift() as string;
    const dirNodes = context.fs.readdirSync(dir);
    for (const node of dirNodes) {
      const realpath = `${dir}/${node}`;
      let realpath_stat;
      try {
        // This may fail if on a symlink that points nowhere
        realpath_stat = context.fs.statSync(realpath);
      } catch {
        continue;
      }
      if (realpath_stat.isDirectory()) {
        dirlist.push(realpath);
      } else if (realpath_stat.isFile() && node.endsWith(".bib")) {
        return realpath;
      }
    }
  }
  return;
}

/**
 * Load bibliography information and applies citations and bibliography macros updates to the document
 * @param this The document's root AST node
 */
function citationUpdater(this: Extensions.TreeProcessorDsl) {
  this.process(function (document: Document) {
    let bibtex_file = document.getAttribute("bibtex-file");
    const bibtex_style = document.getAttribute("bibtex-style");
    const bibtex_locale = document.getAttribute("bibtex-locale");
    const bibtex_order = document.getAttribute("bibtex-order");
    const bibtex_format = document.getAttribute("bibtex-format");
    const bibtex_throw = document.getAttribute("bibtex-throw", "false");
    const bibtex_citation_template =
      document.getAttribute("bibtex-citation-template") || "[$id]";
    if (bibtex_file) {
      const relative_bibtex_path = `${document.getBaseDir()}/${bibtex_file}`;
      if (context.fs.existsSync(relative_bibtex_path)) {
        bibtex_file = relative_bibtex_path;
      }
    }
    // Unlike Ruby bibtex, we DO NOT want to search from the current working
    // directory or in the user's Documents directory as this introduces contextual variability
    // that might be hard to understand/debug by the end user
    if (!bibtex_file) {
      bibtex_file = search_bibtex_file(document.getBaseDir());
    }
    if (!bibtex_file) {
      console.warn(
        "Error: bibtex-file is not set and automatic search failed, all bibtex updates will be skipped",
      );
      return document;
    }

    const prose_blocks = document.findBy(
      { traverse_documents: true },
      (b: AbstractBlock) => {
        return (
          ["list_item", "table_cell", "ulist"].includes(b.getContext()) ||
          (b.getContentModel && b.getContentModel() === "simple") ||
          (!b.getContentModel && (b as Block).getSourceLines) ||
          !!b.getTitle()
        );
      },
    );
    if (prose_blocks.length == 0) {
      return;
    }
    const processor = new TreeProcessor(
      bibtex_file,
      true,
      bibtex_style,
      bibtex_locale,
      bibtex_order === "appearance",
      bibtex_format,
      bibtex_throw === "true",
      bibtex_citation_template,
    );

    // Discover used citations and bibliography location
    /** List of blocks where bibliography should be injected */
    const bibliography_blocks: List[] = [];
    /** List of blocks that contain cite/citenp/bibitem inline macros */
    const macro_blocks: AbstractBlock[] = [];

    // Discover and index all macros
    prose_blocks.forEach((block: AbstractBlock) => {
      if (["list_item", "table_cell"].includes(block.getContext())) {
        const block_repr = block as unknown as { text: string };
        if (processor.search_and_flag_inline_macros(block_repr.text)) {
          macro_blocks.push(block);
        }
      } else if (block.getContext() === "ulist") {
        if (block.getTitle() === bibliographyMacroPlaceholder) {
          bibliography_blocks.push(block as List);
        }
      } else if (
        (block.getContentModel && block.getContentModel() == "simple") ||
        (!block.getContentModel && (block as Block).getSourceLines)
      ) {
        for (const line of (block as Block).getSourceLines()) {
          if (processor.search_and_flag_inline_macros(line)) {
            macro_blocks.push(block);
            break;
          }
        }
      } else {
        const title = block.getTitle();
        if (title && processor.search_and_flag_inline_macros(title)) {
          macro_blocks.push(block);
        }
      }
    });

    // TODO: sort processor.citations array here
    processor.reorder_bibliography();

    // Update citation/bibligraphy items in text
    macro_blocks.forEach((block: AbstractBlock) => {
      if (["list_item", "table_cell"].includes(block.getContext())) {
        // NOTE: we access the instance variable @text for raw text.
        // Otherwise the footnotes in the text will be pre-processed and
        // ghost footnotes will be inserted (as of asciidoctor 2.0.10).
        const block_repr = block as unknown as { text: string };
        block_repr.text = processor.process_inline_macros(block_repr.text);
      } else if (
        (block.getContentModel && block.getContentModel() == "simple") ||
        (!block.getContentModel && (block as Block).getSourceLines)
      ) {
        const block_repr = block as Block;
        const lines = block_repr.getSourceLines();
        // Directly update the lines array as there is no way to update them via the API
        for (let i = 0; i < lines.length; i += 1) {
          lines[i] = processor.process_inline_macros(lines[i]);
        }
      } else {
        const title = block.getTitle();
        if (title) {
          block.setTitle(processor.process_inline_macros(title));
        }
      }
    });

    let biblio;
    if (["latex", "bibtex"].includes(bibtex_format)) {
      biblio = [
        `+++\\bibliography{${bibtex_file}}{}+++`,
        `+++\\bibliographystyle{${bibtex_style}}+++`,
      ];
    } else if ("biblatex" == bibtex_format) {
      biblio = ["+++\\printbibliography+++"];
    } else {
      biblio = processor.build_bibliography_list();
    }

    // Inject bibliography paragraph
    bibliography_blocks.forEach((list) => {
      list.setTitle(undefined);
      const children = (list as unknown as { blocks: AbstractBlock[] }).blocks;
      biblio.forEach((entry) =>
        children.push(this.createListItem(list, entry)),
      );
    });
    return document;
  });
}

export { citationUpdater };
