import { Font } from '@react-pdf/renderer'

// Global @react-pdf font behaviour for every CIPP report.
//
// These registrations are process-wide, not per-document, which is exactly why they belong here.
// They used to be side effects of two individual reports: ShadowAIReportButton registered the
// hyphenation callback and ReportBuilder registered the emoji source. Because the executive report
// imports the Shadow AI pages, whatever Shadow AI chose silently became the rule for every other
// report — and any report loaded on its own got react-pdf's default instead.

/**
 * Never hyphenate.
 *
 * react-pdf's default English hyphenation turns "Detected" into "De-tected" in a narrow stat card,
 * and there is no such thing as a hyphen-free hyphenation break: @react-pdf/textkit's `breakLines`
 * inserts a literal `-` glyph at every penalty breakpoint. So the only way to have no hyphens in a
 * report is to do no hyphenation at all.
 *
 * A value too wide for its container is handled instead by putting a real line break in it, at a
 * measured position — see `wrapLongTokens` in measureText.js, which is how table cells wrap a GUID
 * or a long SKU without either a hyphen or an overflow.
 */
export const noHyphenation = (word) => [word]

Font.registerHyphenationCallback(noHyphenation)

// Helvetica has no emoji glyphs; react-pdf draws them as inline Twemoji images instead. Registered
// here rather than in the report builder so an emoji renders the same whichever report it lands in.
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
})
