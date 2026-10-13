/**
 * 格式化工具函数
 */

/**
 * 格式化日期时间
 * @param dateTime - 日期时间字符串或 Date 对象
 * @param format - 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期时间字符串
 */
export const formatDateTime = (
  dateTime: string | Date | number | null | undefined,
  format: string = "YYYY-MM-DD HH:mm:ss"
): string => {
  if (!dateTime) return "";

  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
};

/**
 * 格式化日期
 * @param dateTime - 日期时间字符串或 Date 对象
 * @returns 格式化后的日期字符串 YYYY-MM-DD
 */
export const formatDate = (
  dateTime: string | Date | number | null | undefined
): string => {
  return formatDateTime(dateTime, "YYYY-MM-DD");
};

/**
 * 格式化时间
 * @param dateTime - 日期时间字符串或 Date 对象
 * @returns 格式化后的时间字符串 HH:mm:ss
 */
export const formatTime = (
  dateTime: string | Date | number | null | undefined
): string => {
  return formatDateTime(dateTime, "HH:mm:ss");
};
