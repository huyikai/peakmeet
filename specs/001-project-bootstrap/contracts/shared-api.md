# Contract: `@peakmeet/shared` Public API (Bootstrap)

**Package**: `packages/shared`  
**Audience**: web（workspace）、miniprogram（via sync copy）、Vitest

## Package rules

- **Runtime dependencies**: none
- **Build outputs**:
  - `dist/` — ESM + `.d.ts`（Web / Vitest / package `exports`）
  - `dist-cjs/` — CommonJS（供 `pnpm sync:shared` 拷贝至小程序 `utils/shared/`）
- **Platform APIs**: forbidden (`wx`, DOM, Node-only APIs that break browser/miniprogram pure logic)

## Smoke export

| Export            | Signature (conceptual) | Semantics                                                   |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| `getPeakMeetPing` | `() => string`         | 纯函数；返回稳定非空字符串（如 `"peakmeet"`），用于双端冒烟 |

实现阶段可等价命名，但 **web、单测、小程序同步引用 MUST 使用同一导出名**，并在本文件或包 README 中写死最终名。

## Tests

- Path: `packages/shared/__tests__/*.test.ts`
- MUST assert smoke export 正常返回
- Covered by root `pnpm test`

## Versioning (bootstrap)

- `0.0.0` 或 `0.1.0` 私有包即可；不发布 npm registry
