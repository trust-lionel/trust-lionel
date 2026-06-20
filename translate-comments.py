import re

# ============================================================
# src/components/base/Head.astro
# ============================================================
with open('src/components/base/Head.astro', 'r') as f:
    c = f.read()

c = c.replace('<!-- 传递主题动画配置到全局 -->', '<!-- Pass theme animation config to global scope -->')
c = c.replace('<!-- 页面内SEO  On-Page SEO -->', '<!-- On-Page SEO -->')
c = c.replace('<!-- 预加载 -->', '<!-- Preload critical assets -->')
c = c.replace('<!-- 中文字体启用 -->', '<!-- Optional: enable custom font -->')
c = c.replace('<!-- 标准链接  Canonical URL -->', '<!-- Canonical URL -->')

with open('src/components/base/Head.astro', 'w') as f:
    f.write(c)
print("Head.astro done")

# ============================================================
# src/lib/utils.ts
# ============================================================
with open('src/lib/utils.ts', 'r') as f:
    c = f.read()

c = c.replace('// 文章按时间排序', '// Sort posts by date')
c = c.replace('// 日期格式化类型', '// Date format type')
c = c.replace('// 日期格式化函数', '// Date formatting function')
c = c.replace('// Mar 3, 2020 格式', '// Short format: Mar 3, 2020')
c = c.replace('// 2020-03-03 格式', '// ISO format: 2020-03-03')
c = c.replace('// 2020年3月3日 格式', '// Legacy format (unused)')
c = c.replace('// March 3, 2020 格式（默认）', '// Default format: March 3, 2020')

with open('src/lib/utils.ts', 'w') as f:
    f.write(c)
print("utils.ts done")

# ============================================================
# src/lib/data.ts
# ============================================================
with open('src/lib/data.ts', 'r') as f:
    c = f.read()

c = c.replace('// 文章按时间排序', '// Sort posts by date')
c = c.replace('// 获取所有非草稿文章，按时间排序', '// Get all non-draft posts sorted by date')
c = c.replace('// 获取所有置顶文章', '// Get all pinned posts')
c = c.replace('// 获取最新的固定数量的文章', '// Get the latest N posts')
c = c.replace('// 获取标签', '// Get tags')
c = c.replace('// 获取project', '// Get projects')

with open('src/lib/data.ts', 'w') as f:
    f.write(c)
print("data.ts done")

# ============================================================
# src/lib/feed.ts
# ============================================================
with open('src/lib/feed.ts', 'r') as f:
    c = f.read()

c = c.replace('// 站点配置', '// Site configuration')
c = c.replace('// XML转义函数', '// XML escape function')
c = c.replace('// 去除 ANSI 颜色序列与非法 XML 控制字符', '// Strip ANSI color sequences and invalid XML control characters')
c = c.replace('// 允许的 C0 控制符只有 \\t \\n \\r，其他需要去掉', '// Only allow \\t \\n \\r from C0 control characters; strip all others')
c = c.replace('// 获取所有图片资源 - 修正类型', '// Get all image assets - corrected types')
c = c.replace('// 清理HTML内容，回归markdown本质', '// Clean HTML content back to markdown essentials')
c = c.replace('// 1. 去掉标题中的锚点链接（包含h1-h6字样的）', '// 1. Remove anchor links from headings (h1-h6)')
c = c.replace('// 2. 处理增强语法的链接，转换为普通链接（去掉图标）', '// 2. Convert enhanced syntax links to plain links (strip icons)')
c = c.replace('// :link[文本]{id=url} -> <a href="url">文本</a>', '// :link[text]{id=url} -> <a href="url">text</a>')
c = c.replace('// 3. 去掉所有icon.horse的图标', '// 3. Remove all icon.horse icons')
c = c.replace('// 4. 清理链接中多余的图标和空白', '// 4. Clean up extra icons and whitespace from links')
c = c.replace('// 5. 处理figure中的双图片，只保留img-light或第一张', '// 5. Handle dual images in figures — keep img-light or first image')
c = c.replace('// 查找所有图片', '// Find all images')
c = c.replace('// 优先选择img-light，否则选择第一张', '// Prefer img-light; fall back to first image')
c = c.replace('// 提取figcaption', '// Extract figcaption')
c = c.replace('// 处理图片路径，将相对路径转换为 Astro 优化后的路径', '// Process image paths — convert relative paths to Astro-optimized paths')
c = c.replace('// 跳过已经是绝对路径的图片', '// Skip images that are already absolute paths')
c = c.replace('// 处理相对路径图片', '// Handle relative path images')
c = c.replace('// 使用 imageModule.default 获取 ImageMetadata', '// Use imageModule.default to get ImageMetadata')
c = c.replace('// 回退到基本的绝对路径', '// Fall back to basic absolute path')
c = c.replace('// 添加封面图到文章开头', '// Add cover image to the top of the post')
c = c.replace('// 共享的文章处理逻辑', '// Shared post processing logic')
c = c.replace('// 创建与项目相同配置的 markdown 处理器', '// Create a markdown processor matching the project config')
c = c.replace('syntaxHighlight: false, // 与 astro.config.ts 保持一致', 'syntaxHighlight: false, // Match astro.config.ts setting')
c = c.replace('// 处理所有文章', '// Process all posts')
c = c.replace('// 使用 Astro 的 markdown 处理器', '// Use Astro markdown processor')
c = c.replace('// 净化 HTML 内容', '// Sanitize HTML content')
c = c.replace("a: ['href', 'target', 'rel'], // 允许链接属性", "a: ['href', 'target', 'rel'], // Allow link attributes")
c = c.replace("img: ['src', 'alt', 'width', 'height', 'class', 'style'], // 允许图片属性", "img: ['src', 'alt', 'width', 'height', 'class', 'style'], // Allow image attributes")
c = c.replace('// 清理HTML，回归markdown本质', '// Clean HTML back to markdown essentials')
c = c.replace('// 处理图片路径', '// Process image paths')
c = c.replace('// 添加封面图', '// Add cover image')

with open('src/lib/feed.ts', 'w') as f:
    f.write(c)
print("feed.ts done")

# ============================================================
# src/styles/global.css
# ============================================================
with open('src/styles/global.css', 'r') as f:
    c = f.read()

replacements_css = [
    ('/* ===== 导入依赖 ===== */', '/* ===== Imports ===== */'),
    ('/* ===== 暗色模式配置 ===== */', '/* ===== Dark Mode Configuration ===== */'),
    ('/* ===== 主题变量 ===== */', '/* ===== Theme Variables ===== */'),
    ('/* 字体系统 */', '/* Font system */'),
    ('/* 颜色系统 */', '/* Color system */'),
    ('/* ===== 字体配置 ===== */', '/* ===== Font Configuration ===== */'),
    ('/* Roboto 字体 */', '/* Roboto font */'),
    ('/* Geist 字体 */', '/* Geist font */'),
    ('/* 标题字体 */', '/* Heading font */'),
    ('/* 等宽字体 */', '/* Monospace font */'),
    ('/* ===== 颜色变量 ===== */', '/* ===== Color Variables ===== */'),
    ('/* 字体族 */', '/* Font families */'),
    ('/* 基础色调 */', '/* Base tones */'),
    ('/* 交互状态 */', '/* Interactive states */'),
    ('/* 主要强调色 */', '/* Primary accent color */'),
    ('/* 弱化元素 */', '/* Muted elements */'),
    ('/* 标签系统 */', '/* Tag system */'),
    ('/* 滚动条 */', '/* Scrollbar */'),
    ('/* 布局宽度变量 */', '/* Layout width variables */'),
    ('/* 全局布局宽度工具类 */', '/* Global layout width utility class */'),
    ('/* 暗色模式变量 */', '/* Dark mode variables */'),
    ('/* ===== 基础样式 ===== */', '/* ===== Base Styles ===== */'),
    ('/* 标题样式 */', '/* Heading styles */'),
    ('/* 链接样式 */', '/* Link styles */'),
    ('/* 工具类 */', '/* Utility classes */'),
    ('/* ===== 动画效果 ===== */', '/* ===== Animations ===== */'),
    ('/* 淡入上升动画 */', '/* Fade-in rise animation */'),
    ('/* 主题切换动画 */', '/* Theme toggle animation */'),
    ('/* 针对 Safari 隐藏底部遮罩 */', '/* Hide bottom overlay in Safari */'),
    ('/* 变成深色（黑色从上往下压） */', '/* Transition to dark mode (black overlay top-down) */'),
    ('/* 变成浅色（白色从下往上盖，即黑幕拉起） */', '/* Transition to light mode (white overlay bottom-up) */'),
    ('/* ===== 滚动条样式 ===== */', '/* ===== Scrollbar Styles ===== */'),
    ('/* 1. Firefox (标准属性) */', '/* 1. Firefox (standard property) */'),
    ('width: 8px; /* 纵向滚动条宽度 */', 'width: 8px; /* Vertical scrollbar width */'),
    ('height: 8px; /* 横向滚动条高度 */', 'height: 8px; /* Horizontal scrollbar height */'),
    ('background: transparent; /* 轨道背景建议透明，保持简洁 */', 'background: transparent; /* Transparent track for clean appearance */'),
    ('background-color: hsl(var(--scrollbar) / 0.4); /* 默认半透明，不突兀 */', 'background-color: hsl(var(--scrollbar) / 0.4); /* Semi-transparent by default */'),
    ('border-radius: 20px; /* 超大圆角 */', 'border-radius: 20px; /* Pill-shaped thumb */'),
    ('border: 2px solid transparent; /* 关键：透明边框制造滑块内缩的"悬浮"感 */', 'border: 2px solid transparent; /* Transparent border creates floating inset effect */'),
    ('background-clip: content-box; /* 配合透明边框，让滑块缩在中间 */', 'background-clip: content-box; /* Combined with transparent border to inset thumb */'),
    ('background-color: hsl(var(--scrollbar) / 0.8); /* 悬浮时加深颜色 */', 'background-color: hsl(var(--scrollbar) / 0.8); /* Darken on hover */'),
    ('/* 针对深色代码块的特殊处理 - 确保对比度 */', '/* Special handling for dark code blocks — ensure contrast */'),
    ('/* ===== 搜索样式 ===== */', '/* ===== Search Styles ===== */'),
    ('/* 隐藏搜索框清除按钮 */', '/* Hide search input clear button */'),
    ('/* 搜索结果容器与条目样式（优化） */', '/* Search results container and item styles */'),
    ('/* 连续主结果之间增加轻微的垂直间距 */', '/* Add slight vertical spacing between consecutive main results */'),
    ('/* 子结果结束到下一个主结果的过渡间距 */', '/* Spacing between end of sub-results and next main result */'),
    ('/* 搜索面板动画 */', '/* Search panel animation */'),
    ('/* ===== 工具类 ===== */', '/* ===== Utility Classes ===== */'),
    ('/* 时间线滑入动画 */', '/* Timeline slide-in animation */'),
]

for old, new in replacements_css:
    c = c.replace(old, new)

with open('src/styles/global.css', 'w') as f:
    f.write(c)
print("global.css done")

# ============================================================
# src/styles/markdown.css
# ============================================================
with open('src/styles/markdown.css', 'r') as f:
    c = f.read()

replacements_md = [
    ('/* ===== CSS自定义属性 (现代化设计) ===== */', '/* ===== CSS Custom Properties (Modern Design) ===== */'),
    ('/* 颜色系统 - 使用 light-dark() 函数 */', '/* Color system — using light-dark() function */'),
    ('/* 背景颜色 */', '/* Background colors */'),
    ('/* 边框颜色 */', '/* Border colors */'),
    ('/* 阴影 */', '/* Shadows */'),
    ('/* 字体 */', '/* Typography */'),
    ('/* 间距系统 */', '/* Spacing system */'),
    ('/* 圆角 */', '/* Border radius */'),
    ('/* 动画 */', '/* Animations */'),
    ('/* ===== 基础样式重置 ===== */', '/* ===== Base Style Reset ===== */'),
    ('/* 现代文本换行 */', '/* Modern text wrapping */'),
    ('/* 移除默认边距 */', '/* Remove default margins */'),
    ('/* ===== 标题样式 (使用逻辑属性) ===== */', '/* ===== Heading Styles (using logical properties) ===== */'),
    ('/* 统一的标题锚点样式 */', '/* Unified heading anchor styles */'),
    ('/* 连续标题间距优化 */', '/* Optimize spacing between consecutive headings */'),
    ('/* 层级递进标题（更紧密） */', '/* Hierarchical headings (tighter) */'),
    ('/* 同级标题（稍宽松） */', '/* Same-level headings (slightly looser) */'),
    ('/* ===== 文本内容样式 ===== */', '/* ===== Text Content Styles ===== */'),
    ('/* 链接样式 */', '/* Link styles */'),
    ('/* 代码链接 */', '/* Code links */'),
    ('/* ===== 列表样式 (现代化伪元素) ===== */', '/* ===== List Styles (modern pseudo-elements) ===== */'),
    ('/* 有序列表 */', '/* Ordered lists */'),
    ('/* 无序列表 */', '/* Unordered lists */'),
    ('/* 嵌套列表 */', '/* Nested lists */'),
    ('/* ===== 任务列表 ===== */', '/* ===== Task Lists ===== */'),
    ('/* ===== 引用块样式 ===== */', '/* ===== Blockquote Styles ===== */'),
    ('/* ===== 代码样式 ===== */', '/* ===== Code Styles ===== */'),
    ('/* 行内代码 */', '/* Inline code */'),
    ('/* 代码块 */', '/* Code blocks */'),
    ('/* ===== 图片和媒体样式 ===== */', '/* ===== Image and Media Styles ===== */'),
    ('/* Medium Zoom 图片过渡 */', '/* Medium Zoom image transition */'),
    ('/* 暗色主题滤镜（基础为明亮模式，暗色在下方 .dark 覆盖） */', '/* Dark theme filter (base is light mode; dark overrides below) */'),
    ('/* hover时临时移除滤镜 */', '/* Temporarily remove filter on hover */'),
    ('/* ===== 表格样式 ===== */', '/* ===== Table Styles ===== */'),
    ('/* ===== 拍立得风格图片 (自定义元素) ===== */', '/* ===== Polaroid-style Images (custom elements) ===== */'),
    ('/* ===== 分割线样式 ===== */', '/* ===== Horizontal Rule Styles ===== */'),
    ('/* ===== 锚点链接样式 ===== */', '/* ===== Anchor Link Styles ===== */'),
    ('/* ===== 脚注样式 ===== */', '/* ===== Footnote Styles ===== */'),
    ('/* ===== 详情/摘要样式 ===== */', '/* ===== Details/Summary Styles ===== */'),
    ('/* ===== 特殊组件样式 ===== */', '/* ===== Special Component Styles ===== */'),
    ('/* ===== 响应式设计 ===== */', '/* ===== Responsive Design ===== */'),
    ('/* ===== 容器查询 (现代CSS) ===== */', '/* ===== Container Queries (modern CSS) ===== */'),
    ('/* ===== 主题切换支持 ===== */', '/* ===== Theme Toggle Support ===== */'),
    ('/* ===== KaTeX 数学公式适配 ===== */', '/* ===== KaTeX Math Formula Styles ===== */'),
    ('/* ===== 外部链接样式 ===== */', '/* ===== External Link Styles ===== */'),
    ('/* ===== 徽章样式 ===== */', '/* ===== Badge Styles ===== */'),
    ('/* ===== 链接图标样式 ===== */', '/* ===== Link Icon Styles ===== */'),
    ('/* ===== 视频样式 ===== */', '/* ===== Video Styles ===== */'),
    ('/* ===== 减少动画偏好设置 ===== */', '/* ===== Reduced Motion Preferences ===== */'),
    ('/* 文章正文里的链接自动换行 */', '/* Auto word-break for links inside post body */'),
    ('/* 如果链接出现在代码块或内联代码里 */', '/* If link appears inside a code block or inline code */'),
]

for old, new in replacements_md:
    c = c.replace(old, new)

with open('src/styles/markdown.css', 'w') as f:
    f.write(c)
print("markdown.css done")

# ============================================================
# src/types.ts — strip Chinese from bilingual comments
# ============================================================
with open('src/types.ts', 'r') as f:
    c = f.read()

# Remove the Chinese half from bilingual comments like "站点基础信息类型 / Site basic information type"
# Keep only the English portion after the slash
import re

def keep_english(match):
    full = match.group(0)
    if '/' in full:
        parts = full.split('/')
        # Find the part without Chinese characters
        for part in parts:
            if not re.search(r'[\u4e00-\u9fff]', part):
                return part.strip()
    return full

# Replace inline bilingual comments - keep English after slash
c = re.sub(r'[\u4e00-\u9fff][^/\n]*/\s*([^\n*]+)', lambda m: m.group(1).rstrip(), c)

# Remove any remaining Chinese-only comment lines or fragments
c = re.sub(r'[\u4e00-\u9fff]+', '', c)

# Fix specific known remaining issues
c = c.replace('fallback?: string // ', 'fallback?: string // Fallback display value')
c = c.replace(' * - 1x1: ', ' * - 1x1: Square aspect ratio')
c = c.replace(' * - 4x5: ', ' * - 4x5: Standard Polaroid aspect ratio')
c = c.replace(' * - 4x3: ', ' * - 4x3: Landscape aspect ratio')
c = c.replace(' * - 3x4: ', ' * - 3x4: Portrait aspect ratio')
c = c.replace(' * - 9x16: ', ' * - 9x16: Tall portrait aspect ratio')
c = c.replace(' * @description ', ' * @description ')

with open('src/types.ts', 'w') as f:
    f.write(c)
print("types.ts done")

# ============================================================
# src/components/theme/ThemeToggle.tsx
# ============================================================
with open('src/components/theme/ThemeToggle.tsx', 'r') as f:
    c = f.read()
c = c.replace('aria-label="切换主题"', 'aria-label="Toggle theme"')
with open('src/components/theme/ThemeToggle.tsx', 'w') as f:
    f.write(c)
print("ThemeToggle.tsx done")

# ============================================================
# src/components/photos/PhotoGalleryModal.tsx
# ============================================================
with open('src/components/photos/PhotoGalleryModal.tsx', 'r') as f:
    c = f.read()
c = c.replace('aria-label="上一张"', 'aria-label="Previous photo"')
c = c.replace('aria-label="下一张"', 'aria-label="Next photo"')
with open('src/components/photos/PhotoGalleryModal.tsx', 'w') as f:
    f.write(c)
print("PhotoGalleryModal.tsx done")

print("\nAll translations complete.")
