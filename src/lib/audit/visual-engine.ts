import type { VisualAuditResult, VisualAuditDetail } from "@/types";
import { v4 as uuid } from "uuid";

// ══════════════════════════════════════════════
// PERFORMANCE AUDIT
// ══════════════════════════════════════════════
export function runPerformanceAudit(): VisualAuditResult {
  const details: VisualAuditDetail[] = [];

  // Bundle analysis (check loaded scripts)
  if (typeof document !== "undefined") {
    const scripts = document.querySelectorAll("script[src]");
    details.push({
      check: "Script count",
      status: scripts.length <= 10 ? "pass" : scripts.length <= 20 ? "warn" : "fail",
      message: `${scripts.length} script tags loaded`,
      suggestion: scripts.length > 10 ? "Consider code splitting to reduce initial bundle" : undefined,
    });

    // DOM size
    const allElements = document.querySelectorAll("*");
    details.push({
      check: "DOM size",
      status: allElements.length < 800 ? "pass" : allElements.length < 1500 ? "warn" : "fail",
      message: `${allElements.length} DOM elements`,
      suggestion: allElements.length > 800 ? "Reduce DOM complexity for better performance" : undefined,
    });

    // Images without lazy loading
    const images = document.querySelectorAll("img:not([loading])");
    details.push({
      check: "Image lazy loading",
      status: images.length === 0 ? "pass" : "warn",
      message: images.length === 0
        ? "All images use lazy loading"
        : `${images.length} images without lazy loading`,
      suggestion: images.length > 0 ? "Add loading=\"lazy\" to below-the-fold images" : undefined,
    });

    // Font loading
    const fontLinks = document.querySelectorAll('link[href*="fonts"]');
    details.push({
      check: "Font loading",
      status: fontLinks.length <= 2 ? "pass" : "warn",
      message: `${fontLinks.length} font resources loaded`,
      suggestion: fontLinks.length > 2 ? "Reduce font variants or use font-display: swap" : undefined,
    });

    // Navigation timing
    if (performance.getEntriesByType) {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav) {
        const loadTime = nav.loadEventEnd - nav.startTime;
        details.push({
          check: "Page load time",
          status: loadTime < 2000 ? "pass" : loadTime < 4000 ? "warn" : "fail",
          message: `${Math.round(loadTime)}ms total load time`,
          suggestion: loadTime > 2000 ? "Optimize server response time and resource loading" : undefined,
        });

        const ttfb = nav.responseStart - nav.requestStart;
        details.push({
          check: "Time to First Byte",
          status: ttfb < 200 ? "pass" : ttfb < 600 ? "warn" : "fail",
          message: `${Math.round(ttfb)}ms TTFB`,
          suggestion: ttfb > 200 ? "Optimize server response time" : undefined,
        });
      }
    }

    // Inline styles (performance anti-pattern)
    const inlineStyled = document.querySelectorAll("[style]");
    details.push({
      check: "Inline styles",
      status: inlineStyled.length < 50 ? "pass" : inlineStyled.length < 100 ? "warn" : "fail",
      message: `${inlineStyled.length} elements with inline styles`,
      suggestion: inlineStyled.length >= 50 ? "Consider using CSS classes instead of inline styles" : undefined,
    });
  }

  const passCount = details.filter((d) => d.status === "pass").length;
  const score = Math.round((passCount / Math.max(details.length, 1)) * 100);

  return {
    id: uuid(),
    category: "performance",
    name: "Performance Audit",
    score,
    details,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════
// ACCESSIBILITY AUDIT
// ══════════════════════════════════════════════
export function runAccessibilityAudit(): VisualAuditResult {
  const details: VisualAuditDetail[] = [];

  if (typeof document !== "undefined") {
    // Images with alt text
    const imgs = document.querySelectorAll("img");
    const noAlt = Array.from(imgs).filter((img) => !img.alt);
    details.push({
      check: "Image alt text",
      status: noAlt.length === 0 ? "pass" : "fail",
      message: noAlt.length === 0
        ? "All images have alt text"
        : `${noAlt.length} images missing alt text`,
      element: noAlt[0]?.outerHTML?.slice(0, 80),
      suggestion: noAlt.length > 0 ? "Add descriptive alt text to all images" : undefined,
    });

    // ARIA labels on interactive elements
    const buttons = document.querySelectorAll("button:not([aria-label])");
    const emptyButtons = Array.from(buttons).filter(
      (b) => !b.textContent?.trim() && !b.querySelector("svg + span")
    );
    details.push({
      check: "Button labels",
      status: emptyButtons.length === 0 ? "pass" : emptyButtons.length <= 3 ? "warn" : "fail",
      message: emptyButtons.length === 0
        ? "All buttons have accessible labels"
        : `${emptyButtons.length} buttons without accessible text or aria-label`,
      suggestion: emptyButtons.length > 0 ? "Add aria-label to icon-only buttons" : undefined,
    });

    // Heading hierarchy
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    let hierarchyValid = true;
    let prevLevel = 0;
    headings.forEach((h) => {
      const level = parseInt(h.tagName[1]);
      if (prevLevel > 0 && level > prevLevel + 1) hierarchyValid = false;
      prevLevel = level;
    });
    details.push({
      check: "Heading hierarchy",
      status: hierarchyValid ? "pass" : "warn",
      message: hierarchyValid
        ? "Heading levels are properly sequential"
        : "Heading levels skip (e.g., h1 to h3)",
      suggestion: !hierarchyValid ? "Ensure headings follow sequential order (h1 → h2 → h3)" : undefined,
    });

    // Color contrast (simplified check)
    const lowContrastElements: string[] = [];
    const elements = document.querySelectorAll("p, span, a, h1, h2, h3, h4, li, label");
    elements.forEach((el) => {
      const style = window.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      if (color && bg && color === bg) {
        lowContrastElements.push(el.tagName.toLowerCase());
      }
    });
    details.push({
      check: "Color contrast",
      status: lowContrastElements.length === 0 ? "pass" : "fail",
      message: lowContrastElements.length === 0
        ? "No identical foreground/background colors detected"
        : `${lowContrastElements.length} elements with potential contrast issues`,
      suggestion: lowContrastElements.length > 0
        ? "Ensure text has sufficient contrast ratio (WCAG AA: 4.5:1)"
        : undefined,
    });

    // Focus indicators
    const focusable = document.querySelectorAll("a, button, input, select, textarea");
    details.push({
      check: "Focusable elements",
      status: focusable.length > 0 ? "pass" : "warn",
      message: `${focusable.length} focusable elements found`,
      suggestion: "Ensure all focusable elements have visible focus indicators",
    });

    // Language attribute
    const lang = document.documentElement.getAttribute("lang");
    details.push({
      check: "Document language",
      status: lang ? "pass" : "fail",
      message: lang ? `Document language set: ${lang}` : "Missing lang attribute on <html>",
      suggestion: !lang ? 'Add lang="en" (or appropriate language) to the <html> tag' : undefined,
    });

    // Skip navigation
    const skipLink = document.querySelector('a[href="#main"], a[href="#content"], [role="main"]');
    details.push({
      check: "Skip navigation",
      status: skipLink ? "pass" : "warn",
      message: skipLink ? "Skip navigation mechanism found" : "No skip navigation link found",
      suggestion: !skipLink ? 'Add a "Skip to content" link for keyboard users' : undefined,
    });
  }

  const passCount = details.filter((d) => d.status === "pass").length;
  const score = Math.round((passCount / Math.max(details.length, 1)) * 100);

  return {
    id: uuid(),
    category: "accessibility",
    name: "Accessibility Audit",
    score,
    details,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════
// SEO AUDIT
// ══════════════════════════════════════════════
export function runSEOAudit(): VisualAuditResult {
  const details: VisualAuditDetail[] = [];

  if (typeof document !== "undefined") {
    // Title tag
    const title = document.title;
    details.push({
      check: "Page title",
      status: title && title.length > 10 && title.length < 70 ? "pass" : title ? "warn" : "fail",
      message: title ? `Title: "${title}" (${title.length} chars)` : "No page title set",
      suggestion: !title ? "Add a descriptive <title> tag" : title.length > 70 ? "Keep title under 70 characters" : undefined,
    });

    // Meta description
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content");
    details.push({
      check: "Meta description",
      status: desc && desc.length > 50 && desc.length < 160 ? "pass" : desc ? "warn" : "fail",
      message: desc ? `Description: ${desc.length} chars` : "No meta description",
      suggestion: !desc ? "Add a meta description tag" : desc.length > 160 ? "Keep description under 160 characters" : undefined,
    });

    // Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogCount = [ogTitle, ogDesc, ogImage].filter(Boolean).length;
    details.push({
      check: "Open Graph tags",
      status: ogCount >= 3 ? "pass" : ogCount > 0 ? "warn" : "fail",
      message: `${ogCount}/3 Open Graph tags present`,
      suggestion: ogCount < 3 ? "Add og:title, og:description, and og:image meta tags" : undefined,
    });

    // Heading structure
    const h1s = document.querySelectorAll("h1");
    details.push({
      check: "H1 tag",
      status: h1s.length === 1 ? "pass" : h1s.length === 0 ? "fail" : "warn",
      message: `${h1s.length} H1 tags found`,
      suggestion: h1s.length === 0 ? "Add exactly one H1 tag per page" : h1s.length > 1 ? "Use only one H1 per page" : undefined,
    });

    // Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]');
    details.push({
      check: "Canonical URL",
      status: canonical ? "pass" : "warn",
      message: canonical ? "Canonical URL set" : "No canonical URL defined",
      suggestion: !canonical ? 'Add <link rel="canonical" href="..."> for SEO' : undefined,
    });

    // Viewport meta
    const viewport = document.querySelector('meta[name="viewport"]');
    details.push({
      check: "Viewport meta",
      status: viewport ? "pass" : "fail",
      message: viewport ? "Viewport meta tag present" : "Missing viewport meta tag",
      suggestion: !viewport ? 'Add <meta name="viewport" content="width=device-width, initial-scale=1">' : undefined,
    });
  }

  const passCount = details.filter((d) => d.status === "pass").length;
  const score = Math.round((passCount / Math.max(details.length, 1)) * 100);

  return {
    id: uuid(),
    category: "seo",
    name: "SEO Audit",
    score,
    details,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════
// RESPONSIVE AUDIT
// ══════════════════════════════════════════════
export function runResponsiveAudit(): VisualAuditResult {
  const details: VisualAuditDetail[] = [];

  if (typeof document !== "undefined") {
    // Horizontal overflow
    const body = document.body;
    const hasOverflow = body.scrollWidth > window.innerWidth;
    details.push({
      check: "Horizontal overflow",
      status: hasOverflow ? "fail" : "pass",
      message: hasOverflow
        ? `Page overflows by ${body.scrollWidth - window.innerWidth}px`
        : "No horizontal overflow detected",
      suggestion: hasOverflow ? "Fix elements causing horizontal scroll" : undefined,
    });

    // Touch target size
    const buttons = document.querySelectorAll("button, a, input, select");
    let smallTargets = 0;
    buttons.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        smallTargets++;
      }
    });
    details.push({
      check: "Touch targets",
      status: smallTargets === 0 ? "pass" : smallTargets <= 5 ? "warn" : "fail",
      message: smallTargets === 0
        ? "All interactive elements meet 44px minimum"
        : `${smallTargets} elements below 44px touch target size`,
      suggestion: smallTargets > 0 ? "Increase touch target size to at least 44×44px" : undefined,
    });

    // Font size check
    const textElements = document.querySelectorAll("p, span, a, li, td, label");
    let tinyText = 0;
    textElements.forEach((el) => {
      const size = parseFloat(window.getComputedStyle(el).fontSize);
      if (size > 0 && size < 12) tinyText++;
    });
    details.push({
      check: "Minimum font size",
      status: tinyText === 0 ? "pass" : tinyText <= 3 ? "warn" : "fail",
      message: tinyText === 0
        ? "All text meets 12px minimum"
        : `${tinyText} elements with font-size below 12px`,
      suggestion: tinyText > 0 ? "Increase small text to at least 12px for readability" : undefined,
    });

    // Viewport width usage
    const fixedWidth = document.querySelectorAll('[style*="width:"]');
    let hardFixed = 0;
    fixedWidth.forEach((el) => {
      const w = (el as HTMLElement).style.width;
      if (w && w.endsWith("px") && parseInt(w) > 500) hardFixed++;
    });
    details.push({
      check: "Fixed width elements",
      status: hardFixed === 0 ? "pass" : "warn",
      message: hardFixed === 0
        ? "No large fixed-width elements detected"
        : `${hardFixed} elements with fixed width > 500px`,
      suggestion: hardFixed > 0 ? "Use responsive units (%, vw, rem) instead of fixed px widths" : undefined,
    });
  }

  const passCount = details.filter((d) => d.status === "pass").length;
  const score = Math.round((passCount / Math.max(details.length, 1)) * 100);

  return {
    id: uuid(),
    category: "responsive",
    name: "Responsive Design Audit",
    score,
    details,
    timestamp: new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════
// COMBINED VISUAL AUDIT
// ══════════════════════════════════════════════
export function runFullVisualAudit(): VisualAuditResult[] {
  return [
    runPerformanceAudit(),
    runAccessibilityAudit(),
    runSEOAudit(),
    runResponsiveAudit(),
  ];
}
