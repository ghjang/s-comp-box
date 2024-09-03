<script lang="ts">
  import TreeView from "../TreeView/TreeView.svelte";
  import { type TreeNode, createTreeNode } from "../common/tree";

  export let jsonData: object | string | null = {};
  export let openChildren = false;

  // JSON 데이터를 트리 데이터 형식으로 변환하는 함수
  function convertJsonToTreeData(
    json: object | string | null | undefined,
    level: number = 1,
    parentId: string | null = null,
  ): TreeNode[] {
    if (level === 1) {
      if (!json) {
        return [];
      }

      if (typeof json === "string") {
        const _json = JSON.parse(json);
        return convertJsonToTreeData(_json, level, parentId);
      }
    }

    const _json = json as Record<string, unknown>;
    const result: TreeNode[] = [];
    const keys = Object.keys(_json);

    for (let index = 0; index < keys.length; index++) {
      const key = keys[index];
      const id = `${parentId ?? ""}[${level}-${index}]`;
      const value = _json[key];

      if (Array.isArray(value)) {
        result.push(
          createTreeNode({
            id: `${id}-bracket-open`,
            name: `${key}: [`,
            open: openChildren,
            children: value.flatMap((item, idx) =>
              convertJsonToTreeData(
                { [`${idx}`]: item },
                level + 1,
                `[${id}-${idx}]`,
              ),
            ),
          }),
        );
        result.push(createTreeNode({ id: `${id}-bracket-close`, name: "]" }));
      } else if (typeof value === "object" && value !== null) {
        result.push(
          createTreeNode({
            id: `${id}-bracket-open`,
            name: `${key}: {`,
            open: openChildren,
            children: convertJsonToTreeData(value, level + 1, id),
          }),
        );
        result.push(createTreeNode({ id: `${id}-bracket-close`, name: "}" }));
      } else if (typeof value === "string") {
        result.push(createTreeNode({ id, name: `${key}: "${value}"` }));
      } else {
        result.push(createTreeNode({ id, name: `${key}: ${value}` }));
      }
    }

    return result;
  }

  let treeData: TreeNode[] = [];

  $: if (jsonData) {
    const _treeData = convertJsonToTreeData(jsonData);
    const rootBracketOpenNode = createTreeNode({
      id: "root-bracket-open",
      name: "{",
      open: true,
      children: _treeData,
    });
    const rootBracketCloseNode = createTreeNode({
      id: "root-bracket-close",
      name: "}",
    });
    treeData = [rootBracketOpenNode, rootBracketCloseNode];
  }
</script>

<TreeView data={treeData} />
