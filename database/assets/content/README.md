# 公共内容配图

本目录保存 CloudBase 公共健身内容的仓库源图片：

- `actions/`：80 张动作图
- `equipment/`：20 张器材图
- `foods/`：200 张食物图
- `manifest.json`：种子 URI、本地路径、稳定云路径与 SHA-256 映射

## 文件约束

- 格式与尺寸：640 × 400 PNG
- 文件名：必须与对应种子的 `_id` 完全一致
- 种子 URI：`asset://content/{collection}/{_id}.png`
- 云端路径：`content/{collection}/{_id}.png`
- 完整性：实际文件 SHA-256 必须与 `manifest.json` 一致

这些图片是项目生成的 PeakMeet 品牌风格原创卡片，不包含外部版权素材，也不会打进小程序主包。

## 生成与校验

在仓库根目录运行：

```bash
pnpm db:generate-seeds
pnpm db:generate-images
pnpm db:validate-assets
```

`db:generate-images` 会覆盖生成图片和 manifest。手动替换单张图片后，必须同步更新对应 SHA-256，并再次运行 `db:validate-assets`。

## 上传

```bash
pnpm db:sync
```

同步流程会上传图片，并在导入数据库前将种子中的 `asset://content/...` 转换为目标环境的 `cloud://...` fileID。环境变量、Upsert 行为和降级方式见[数据库总指南](../../README.md)。

缺省图源位于 [`../images/content-placeholder.png`](../images/content-placeholder.png)，小程序运行时副本位于 [`packages/miniprogram/assets/images/content-placeholder.png`](../../../packages/miniprogram/assets/images/content-placeholder.png)。
