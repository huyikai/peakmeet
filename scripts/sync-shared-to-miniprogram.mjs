import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = join(root, 'packages/shared/dist-cjs');
const dtsSource = join(root, 'packages/shared/dist');
const target = join(root, 'packages/miniprogram/utils/shared');

if (!existsSync(source)) {
  console.error('[sync:shared] Missing packages/shared/dist-cjs. Run shared build first.');
  process.exit(1);
}

if (!existsSync(dtsSource)) {
  console.error(
    '[sync:shared] Missing packages/shared/dist (declarations). Run shared build first.',
  );
  process.exit(1);
}

mkdirSync(dirname(target), { recursive: true });
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });

/** Copy only .d.ts / .d.ts.map from ESM dist into the CJS sync target. */
function copyDeclarations(fromDir, toDir) {
  for (const name of readdirSync(fromDir)) {
    const from = join(fromDir, name);
    const to = join(toDir, name);
    const st = statSync(from);
    if (st.isDirectory()) {
      mkdirSync(to, { recursive: true });
      copyDeclarations(from, to);
      continue;
    }
    if (name.endsWith('.d.ts') || name.endsWith('.d.ts.map')) {
      cpSync(from, to);
    }
  }
}

copyDeclarations(dtsSource, target);

/**
 * WeChat miniprogram require() does NOT resolve directory packages to index.js
 * (Node-style). Rewrite `require("./foo")` → `require("./foo/index")` when
 * `foo/index.js` exists and `foo.js` does not.
 */
function rewriteDirectoryRequires(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      rewriteDirectoryRequires(full);
      continue;
    }
    if (!name.endsWith('.js') || name.endsWith('.map.js')) continue;

    const original = readFileSync(full, 'utf8');
    const updated = original.replace(
      /require\((["'])(\.\/[^'"]+)\1\)/g,
      (match, quote, reqPath) => {
        if (reqPath.endsWith('.js') || reqPath.endsWith('/index')) {
          return match;
        }
        const absBase = join(dirname(full), reqPath);
        const asFile = `${absBase}.js`;
        const asIndex = join(absBase, 'index.js');
        if (!existsSync(asFile) && existsSync(asIndex)) {
          return `require(${quote}${reqPath}/index${quote})`;
        }
        return match;
      },
    );

    if (updated !== original) {
      writeFileSync(full, updated);
    }
  }
}

rewriteDirectoryRequires(target);

const indexDts = join(target, 'index.d.ts');
if (!existsSync(indexDts)) {
  console.error('[sync:shared] Missing index.d.ts after copy.');
  process.exit(1);
}

writeFileSync(
  join(target, 'README.md'),
  [
    '# 小程序共享逻辑（自动生成）',
    '',
    '> 由仓库根目录 `pnpm sync:shared` 从 `packages/shared` 生成，禁止手动编辑本目录。',
    '',
    '同步内容包括：',
    '',
    '- `dist-cjs/` 的 CommonJS 运行时代码',
    '- `dist/` 的 TypeScript 声明文件',
    '- 为兼容微信运行时而重写为显式 `/index` 的目录级 `require`',
    '',
    '请在 `packages/shared/src/` 修改源代码并重新运行同步命令。',
    '',
  ].join('\n'),
);

const indexJs = readFileSync(join(target, 'index.js'), 'utf8');
if (!indexJs.includes('getPeakMeetPing') || indexJs.includes('export {')) {
  console.error('[sync:shared] Unexpected index.js (expect CJS with getPeakMeetPing).');
  process.exit(1);
}
if (indexJs.includes('require("./calc")') && !indexJs.includes('require("./calc/index")')) {
  console.error('[sync:shared] WeChat-incompatible require("./calc") still present.');
  process.exit(1);
}

console.log(`[sync:shared] Copied ${source} + declarations from ${dtsSource} -> ${target}`);
