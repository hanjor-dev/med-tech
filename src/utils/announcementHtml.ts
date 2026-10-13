const allowedTags = new Set([
  'A', 'B', 'BR', 'BLOCKQUOTE', 'CODE', 'DIV', 'EM', 'H1', 'H2', 'H3', 'H4',
  'IMG', 'LI', 'OL', 'P', 'PRE', 'SPAN', 'STRONG', 'TABLE', 'TBODY', 'TD',
  'TH', 'THEAD', 'TR', 'UL',
])

const allowedAttributes = new Set(['href', 'src', 'alt', 'title', 'target', 'colspan', 'rowspan'])

function isSafeUrl(value: string) {
  if (value.startsWith('/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** 前端二次清洗，后端白名单清洗仍是最终安全边界。 */
export function sanitizeAnnouncementHtml(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html')
  document.body.querySelectorAll('*').forEach((element) => {
    if (!allowedTags.has(element.tagName)) {
      element.replaceWith(...Array.from(element.childNodes))
      return
    }
    Array.from(element.attributes).forEach((attribute) => {
      const name = attribute.name.toLowerCase()
      if (!allowedAttributes.has(name) || name.startsWith('on')) element.removeAttribute(attribute.name)
    })
    if (element.tagName === 'A' && element.hasAttribute('href') && !isSafeUrl(element.getAttribute('href') || '')) {
      element.removeAttribute('href')
    }
    if (element.tagName === 'IMG' && element.hasAttribute('src') && !isSafeUrl(element.getAttribute('src') || '')) {
      element.removeAttribute('src')
    }
    if (element.tagName === 'A' && element.hasAttribute('href')) {
      // 公告正文中的链接统一新标签页打开，避免离开当前业务页面。
      element.setAttribute('target', '_blank')
      element.setAttribute('rel', 'noopener noreferrer')
    }
  })
  return document.body.innerHTML
}
