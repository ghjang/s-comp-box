import type { TreeNode } from "../common/tree";

export type NodeStylerFunction = (
  node: HTMLElement,
  params: { treeNodeData: TreeNode; nodeOpen: boolean }
) => void;