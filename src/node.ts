import { register, set_fs, set_locales, set_styles } from "./core";
import fs from "fs";

set_fs(fs);
// Try to load optional peerDependencies
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const style_collection = require("@citation/csl-style-all").default;
  set_styles(style_collection);
} catch {
  undefined;
}
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const locale_collection_resolved = require("@citation/csl-locale-all");
  set_locales({
    mappings: locale_collection_resolved.mappings,
    locales: locale_collection_resolved.default,
  });
} catch {
  undefined;
}

export { register, set_fs, set_locales, set_styles };
