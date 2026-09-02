// "关于"页内容：照搬懒人工具介绍下的 5 个小标题（作占位初稿）。
// ⚠️ 上线前请改写为原创文案，避免与参考站雷同影响 SEO / 版权。
// 品牌名已统一替换为「在线工具箱」。

export const aboutSections = [
  {
    zh: {
      h: '在线工具箱是个什么样的网站？',
      p: '在线工具箱是一款集成数百种实用功能的综合性在线工具平台，致力于为用户提供一站式数据处理与工作效率提升解决方案。平台坚持简洁易用、安全稳定的产品体验，以"让复杂变简单"为核心理念，覆盖办公、学习、生活等多元场景，让每个人无需专业技能即可快速上手，轻松高效完成各类任务。',
    },
    en: {
      h: 'What is Online Toolbox?',
      p: 'Online Toolbox is a comprehensive platform that bundles hundreds of handy utilities, providing one-stop solutions for data processing and productivity. We keep the experience simple, secure and stable, with the philosophy of "making the complex simple" — covering work, study and daily life so anyone can get things done quickly without special skills.',
    },
  },
  {
    zh: {
      h: '在线工具箱包含哪些实用功能？',
      p: '在线工具箱提供图像编辑、文字转换、编码解码、格式转换、编程调试、教学辅助、生活工具、理财计算等多种功能模块，覆盖开发者、设计师、教师、学生、办公人员等多个使用人群的常见需求。无论是文档处理、图片优化、代码格式化，还是日常计算与单位换算，都能在这里找到合适的工具。',
    },
    en: {
      h: 'What tools does it include?',
      p: 'We offer modules for image editing, text conversion, encoding/decoding, format conversion, developer debugging, teaching aids, everyday utilities and finance calculation — serving developers, designers, teachers, students and office workers alike. Whether it is document processing, image optimization, code formatting, or daily calculation and unit conversion, you will find the right tool here.',
    },
  },
  {
    zh: {
      h: '在线工具箱适合哪些用户使用？',
      p: '在线工具箱适用于广大学生、办公人员、程序员、设计师、教师、自媒体创作者及日常有实用工具需求的各类用户。无论你是在校学生完成作业、整理资料，职场人士处理文档、提升效率，还是开发人员调试代码、设计师快速处理素材，在线工具箱都能一站式满足需求，为你提供稳定、安全、便捷高效的在线服务。',
    },
    en: {
      h: 'Who is it for?',
      p: 'Online Toolbox is for students, office workers, programmers, designers, teachers, content creators and anyone who needs practical tools in daily life. Whether you are a student finishing homework, a professional handling documents, a developer debugging code, or a designer processing assets, we provide a stable, secure and efficient one-stop service.',
    },
  },
  {
    zh: {
      h: '使用在线工具箱，有哪些优势？',
      p: '所有工具均支持在线使用，电脑与手机端均可流畅访问，无需下载安装，操作简单易懂，界面清爽无冗余。功能覆盖全面、更新及时，响应速度快，是工作学习的高效实用助手。所有数据仅在浏览器本地处理，不上传服务器，充分保障用户隐私与数据安全。',
    },
    en: {
      h: 'Why use it?',
      p: 'Every tool runs online — smooth on both desktop and mobile, no install needed, with a clean and intuitive interface. We cover a wide range of functions, update often and respond fast. All data is processed locally in your browser and never uploaded, fully protecting your privacy and security.',
    },
  },
  {
    zh: {
      h: '选择在线工具箱的理由是什么？',
      p: '在线工具箱将复杂操作简单化，让您专注于核心工作，节省宝贵时间。无论是专业需求还是日常使用，我们都能提供贴心的解决方案。平台持续优化更新，欢迎提出宝贵建议或定制需求，我们将不断完善工具功能，提升您的使用体验。选择在线工具箱，就是选择高效、便捷的工作生活方式。',
    },
    en: {
      h: 'Why choose us?',
      p: 'We turn complex operations into simple ones so you can focus on what matters and save time. From professional needs to daily use, we offer thoughtful solutions. The platform is continuously improved — your suggestions and custom requests are always welcome. Choosing Online Toolbox means choosing an efficient, convenient way to work and live.',
    },
  },
];

export function aboutI18n(lang) {
  const pick = (s) => (lang !== 'zh' && s.en && s.en.h ? s.en : s.zh);
  return aboutSections.map(pick);
}
