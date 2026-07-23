# Contract: Cloud Function Placeholder

**Package**: `packages/cloudfunctions`  
**Audience**: 根 `pnpm build` / 后续微信云开发部署者

## Inventory

- Exactly **one** function: `hello`
- Source: TypeScript
- Behavior: no business logic（固定成功响应或固定字符串即可）

## Build

- Compile step MUST emit deployable JS entry expected by WeChat CloudBase function layout
- Invoked by root `pnpm build`
- MUST succeed without cloud credentials

## Forbidden in this feature

- Real data aggregation, auth checks, DB access
- Local emulator invocation requirement
- Additional functions beyond `hello`
