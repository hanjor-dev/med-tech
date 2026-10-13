/**
 * 清理搜索参数对象，移除空值、null、undefined和"null"字符串的属性
 * @param searchParam - 需要清理的搜索参数对象
 * @returns 返回清理后的新对象，只保留有效值
 */
export const cleanSearchParam = (searchParam: Record<string, any>) => {
  return Object.fromEntries(
    //@ts-ignore 忽略TypeScript类型检查，因为Object.entries的键值对可能是任意类型
    Object.entries(searchParam).filter(([key, value]) => {
      // 过滤掉空字符串、null、undefined和"null"字符串的属性
      return value !== "" && value !== null && value !== undefined && value !== "null";
    })
  );
};