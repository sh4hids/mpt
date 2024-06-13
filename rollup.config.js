import terser from '@rollup/plugin-terser';
import { dts } from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { deleteAsync } from 'del';

const pkgName = 'prayertiming';

export function del(options = {}) {
  const {
    hook = 'buildStart',
    runOnce = false,
    targets = [],
    verbose = false,
    ...rest
  } = options;

  let deleted = false;

  return {
    name: 'del',
    [hook]: async () => {
      if (runOnce && deleted) {
        return;
      }

      const paths = await deleteAsync(targets, rest);

      if (verbose || rest.dryRun) {
        const message = rest.dryRun
          ? `Expected files and folders to be deleted: ${paths.length}`
          : `Deleted files and folders: ${paths.length}`;

        // eslint-disable-next-line no-undef
        console.log(message);

        for (const path of paths) {
          // eslint-disable-next-line no-undef
          console.log(path);
        }
      }

      deleted = true;
    },
  };
}

export default [
  {
    input: 'src/index.ts',
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: './tsconfig.json' }),
      terser(),
    ],
    output: {
      file: 'lib/index.js',
      format: 'umd',
      name: pkgName,
      esModule: false,
    },
  },
  {
    input: {
      index: 'src/index.ts',
    },
    output: [
      {
        dir: 'lib/esm',
        format: 'esm',
        preserveModules: true,
      },
      {
        dir: 'lib/cjs',
        format: 'cjs',
        preserveModules: true,
      },
    ],
    plugins: [typescript({ tsconfig: './tsconfig.rollup.json' })],
  },
  {
    input: 'lib/types/index.d.ts',
    output: [{ file: 'lib/index.d.ts', format: 'es' }],
    plugins: [dts(), del({ hook: 'buildEnd', targets: './lib/types' })],
  },
];
