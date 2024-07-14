import { PathLike, PathOrFileDescriptor, StatSyncFn } from "fs";

interface SyncFS {
  readFileSync: (
    path: PathOrFileDescriptor,
    options:
      | {
          encoding: BufferEncoding;
          flag?: string | undefined;
        }
      | BufferEncoding,
  ) => string;
  existsSync: (path: PathLike) => boolean;
  readdirSync: (
    path: PathLike,
    options?:
      | {
          encoding: BufferEncoding | null;
          withFileTypes?: false | undefined;
          recursive?: boolean | undefined;
        }
      | BufferEncoding
      | null,
  ) => string[];
  statSync: StatSyncFn;
}

const set_fs_not_called =
  "The filesystem must be set manually in non-server contexts. Call set_fs on before registering @ayowel/asciidoctor-bibtex-js";

const context: { fs: SyncFS } = {
  fs: {
    readFileSync: function () {
      throw set_fs_not_called;
    },
    existsSync: function () {
      throw set_fs_not_called;
    },
    readdirSync: function () {
      throw set_fs_not_called;
    },
    statSync: function () {
      throw set_fs_not_called;
    },
  },
};

function set_fs(fs: SyncFS) {
  context.fs = fs;
}

export default context;
export { set_fs };
