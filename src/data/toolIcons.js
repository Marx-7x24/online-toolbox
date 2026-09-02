// 工具 → 懒人工具箱对应图标的映射（从 https://www.lanren-tools.com/static/images/ 下载）。
// key 为 tools.js 中的 slug，value 为 public/icons/lanren/ 下的文件名。
// 未映射的工具回退到 CategoryIcon。
export const toolIconMap = {
  'json-format': 'logo-json.svg',
  'timestamp': 'logo-timestamp.svg',
  'base64': 'logo-base64.svg',
  'qrcode': 'logo-qrcode.svg',
  'image-join': 'logo-long-image.svg',
  'image-watermark': 'logo-watermark-bulk.svg',
  'id-photo': 'logo-id-photo-layout.svg',
  'seal-extract': 'logo-seal-extractor.svg',
  'social-crop': 'logo-social-crop.svg',
  'signature-extract': 'logo-signature-extractor.svg',
  'pdf-stamp': 'logo-pdf-stamp.svg',
  'house-loan': 'logo-loan-calculator.svg',
  'date-diff': 'logo-day-calculator.svg',
  'json2csv': 'logo-json-csv.svg',
  'flex-generator': 'logo-flex-generator.svg',
  'grid-generator': 'logo-grid-generator.svg',
  'json-sort': 'logo-json-sort.svg',
  'pomodoro': 'logo-alarm-clock.svg',
  'qr-decode': 'logo-qrcode.svg',
  'image-base64': 'logo-base64.svg',
  'qr-batch': 'logo-qrcode.svg',
  'timestamp-batch': 'logo-timestamp.svg',
  'image-compress': 'logo-images-resizer.svg',
  'image-convert': 'logo-images-jpg.svg',
  'img2pdf': 'logo-image-pdf.svg',
  'idcard': 'logo-idcard-extract.svg',
};

export function getToolIcon(slug) {
  return toolIconMap[slug] || null;
}
