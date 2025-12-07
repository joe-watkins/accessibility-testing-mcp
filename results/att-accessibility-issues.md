# Accessibility Issues Found: 8

**URL**: https://www.att.com/  
**Date Tested**: December 6, 2025  
**Operating System**: Windows  
**Browser**: Chrome  

---

## Issue 1: landmark-one-main

**Severity**: 3-Average  
**Priority**: Medium  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage
2. Run automated accessibility scan or inspect page structure

**[Element]**  
The html element located at `html`

**[What is the issue]**  
Ensure the document has a main landmark

Fix all of the following:
- Document does not have a main landmark

**[Why it is important]**  
Screen reader users rely on landmark regions to quickly navigate to the main content of a page. Without a `<main>` landmark, users must navigate through all page content sequentially, which is time-consuming and frustrating.

**[Code reference]**  
```html
<html lang="en" class="theme-att-2022 isPC isChrome isLandscape hydrated">
```

**[How to fix]**  
Wrap the primary content of the page in a `<main>` element or add `role="main"` to the container that holds the primary content.

**[Compliant code example]**  
```html
<body>
  <header>...</header>
  <nav>...</nav>
  <main>
    <!-- Primary page content here -->
  </main>
  <footer>...</footer>
</body>
```

**[How to test]**  
- Automated: Use axe, Lighthouse, or similar tools to scan for landmark-one-main violations
- Manual: Use a screen reader's landmark navigation (NVDA: D key, JAWS: Q key, VoiceOver: rotor) to verify a main landmark exists

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/main/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/landmark-one-main?application=axeAPI

**[WCAG]**  
Best Practice (supports 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver

---

## Issue 2: svg-img-alt (Desktop)

**Severity**: 2-Serious  
**Priority**: High  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage on desktop (1280x1024)
2. Locate SVG icons in the header/navigation area

**[Element]**  
SVG icon located at `svg[aria-hidden="false"][height="24"][width="24"]`

**[What is the issue]**  
The SVG element has `role="img"` but lacks accessible text. Screen readers will announce this as an image but cannot convey its purpose.

Fix any of the following:
- Element has no child that is a title
- aria-label attribute does not exist or is empty
- aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
- Element has no title attribute

**[Why it is important]**  
When images are not properly labeled, screen reader users cannot understand their purpose. If the image is decorative, it creates noise. If it's meaningful, users miss important information.

**[Code reference]**  
```html
<svg aria-hidden="false" focusable="false" role="img" class="color-white" height="24" width="24" viewBox="0 0 32 32">
```

**[How to fix]**  
- If decorative: Add `aria-hidden="true"` and remove `role="img"`
- If meaningful: Add an `aria-label` or include a `<title>` element inside the SVG

**[Compliant code example]**  

For decorative icons:
```html
<svg aria-hidden="true" focusable="false" height="24" width="24" viewBox="0 0 32 32">
  ...
</svg>
```

For meaningful icons:
```html
<svg aria-hidden="false" focusable="false" role="img" aria-label="Search" height="24" width="24" viewBox="0 0 32 32">
  <title>Search</title>
  ...
</svg>
```

**[How to test]**  
- Automated: Use axe, Lighthouse, or Level Access to scan for svg-img-alt violations
- Manual: Use a screen reader (NVDA, JAWS, VoiceOver) to navigate to images and verify meaningful icons are announced with descriptive names

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/image-decorative/  
https://www.magentaa11y.com/how-to-test/images/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/svg-img-alt?application=axeAPI  
https://www.w3.org/WAI/tutorials/images/decision-tree/

**[WCAG]**  
1.1.1 Non-text Content (Level A)

**[Assistive technology]**  
JAWS, NVDA, VoiceOver

---

## Issue 3: svg-img-alt (Mobile)

**Severity**: 2-Serious  
**Priority**: High  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage on mobile viewport (320x640)
2. Locate SVG icons in the header/navigation area

**[Element]**  
SVG icon located at `svg[aria-hidden="false"]`

**[What is the issue]**  
The SVG element has `role="img"` but lacks accessible text. Screen readers will announce this as an image but cannot convey its purpose.

Fix any of the following:
- Element has no child that is a title
- aria-label attribute does not exist or is empty
- aria-labelledby attribute does not exist, references elements that do not exist or references elements that are empty
- Element has no title attribute

**[Why it is important]**  
When images are not properly labeled, screen reader users cannot understand their purpose. If the image is decorative, it creates noise. If it's meaningful, users miss important information.

**[Code reference]**  
```html
<svg aria-hidden="false" focusable="false" role="img" class="color-white" height="24" width="24" viewBox="0 0 32 32">
```

**[How to fix]**  
- If decorative: Add `aria-hidden="true"` and remove `role="img"`
- If meaningful: Add an `aria-label` or include a `<title>` element inside the SVG

**[Compliant code example]**  

For decorative icons:
```html
<svg aria-hidden="true" focusable="false" height="24" width="24" viewBox="0 0 32 32">
  ...
</svg>
```

For meaningful icons:
```html
<svg aria-hidden="false" focusable="false" role="img" aria-label="Search" height="24" width="24" viewBox="0 0 32 32">
  <title>Search</title>
  ...
</svg>
```

**[How to test]**  
- Automated: Use axe, Lighthouse, or Level Access to scan for svg-img-alt violations
- Manual: Use a screen reader (NVDA, JAWS, VoiceOver) to navigate to images and verify meaningful icons are announced with descriptive names

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/image-decorative/  
https://www.magentaa11y.com/how-to-test/images/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/svg-img-alt?application=axeAPI  
https://www.w3.org/WAI/tutorials/images/decision-tree/

**[WCAG]**  
1.1.1 Non-text Content (Level A)

**[Assistive technology]**  
JAWS, NVDA, VoiceOver, TalkBack

---

## Issue 4: aria-allowed-role

**Severity**: 4-Low  
**Priority**: Low  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage on mobile viewport (320x640)
2. Scroll to the footer section
3. Locate the collapsible accordion sections

**[Element]**  
The h3 element located at `#h3-title-0`

**[What is the issue]**  
Ensure role attribute has an appropriate value for the element

Fix any of the following:
- ARIA role button is not allowed for given element

**[Why it is important]**  
Using inappropriate ARIA roles on elements can confuse assistive technologies and their users. Heading elements (`<h3>`) have implicit semantics that conflict with `role="button"`, which can break the document outline and navigation.

**[Code reference]**  
```html
<h3 id="h3-title-0" aria-controls="links-tray-0" aria-expanded="false" class="collapse-cta heading-xs flex flex-items-center justify-between-md justify-between-sm" role="button" tabindex="0">
```

**[How to fix]**  
Use a `<button>` element inside the heading, or restructure to separate the heading from the interactive control.

**[Compliant code example]**  
```html
<h3 class="heading-xs">
  <button aria-controls="links-tray-0" aria-expanded="false" class="collapse-cta flex flex-items-center">
    Section Title
  </button>
</h3>
```

**[How to test]**  
- Automated: Use axe or similar tools to scan for aria-allowed-role violations
- Manual: Use a screen reader to navigate by headings and verify the document structure is logical

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/accordion/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/aria-allowed-role?application=axeAPI

**[WCAG]**  
Best Practice (supports 4.1.2 Name, Role, Value)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver, TalkBack

---

## Issue 5: aria-allowed-role

**Severity**: 4-Low  
**Priority**: Low  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage on mobile viewport (320x640)
2. Scroll to the footer section
3. Locate the second collapsible accordion section

**[Element]**  
The h3 element located at `#h3-title-1`

**[What is the issue]**  
Ensure role attribute has an appropriate value for the element

Fix any of the following:
- ARIA role button is not allowed for given element

**[Why it is important]**  
Using inappropriate ARIA roles on elements can confuse assistive technologies and their users. Heading elements (`<h3>`) have implicit semantics that conflict with `role="button"`, which can break the document outline and navigation.

**[Code reference]**  
```html
<h3 id="h3-title-1" aria-controls="links-tray-1" aria-expanded="false" class="collapse-cta heading-xs flex flex-items-center justify-between-md justify-between-sm" role="button" tabindex="0">
```

**[How to fix]**  
Use a `<button>` element inside the heading, or restructure to separate the heading from the interactive control.

**[Compliant code example]**  
```html
<h3 class="heading-xs">
  <button aria-controls="links-tray-1" aria-expanded="false" class="collapse-cta flex flex-items-center">
    Section Title
  </button>
</h3>
```

**[How to test]**  
- Automated: Use axe or similar tools to scan for aria-allowed-role violations
- Manual: Use a screen reader to navigate by headings and verify the document structure is logical

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/accordion/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/aria-allowed-role?application=axeAPI

**[WCAG]**  
Best Practice (supports 4.1.2 Name, Role, Value)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver, TalkBack

---

## Issue 6: region

**Severity**: 3-Average  
**Priority**: Medium  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage
2. Inspect the page structure for content outside landmark regions

**[Element]**  
The h1 element located at `h1`

**[What is the issue]**  
Ensure all page content is contained by landmarks

Fix any of the following:
- Some page content is not contained by landmarks

**[Why it is important]**  
Screen reader users rely on landmarks to navigate efficiently. Content outside landmarks may be missed or difficult to find, creating a fragmented and confusing experience.

**[Code reference]**  
```html
<h1 class="hidden-spoken">AT&T Official Site | Our Best Wireless & Internet Service</h1>
```

**[How to fix]**  
Move the `<h1>` element inside a landmark region, typically within the `<main>` element or `<header>`.

**[Compliant code example]**  
```html
<header>
  <h1 class="hidden-spoken">AT&T Official Site | Our Best Wireless & Internet Service</h1>
  <!-- Other header content -->
</header>
```

**[How to test]**  
- Automated: Use axe or similar tools to scan for region violations
- Manual: Use a screen reader's landmark navigation to verify all content is reachable via landmarks

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/main/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/region?application=axeAPI

**[WCAG]**  
Best Practice (supports 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver

---

## Issue 7: region

**Severity**: 3-Average  
**Priority**: Medium  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage
2. Inspect the headband/promotional banner area at the top of the page

**[Element]**  
The div element located at `div[data-testid="headband-header7"]`

**[What is the issue]**  
Ensure all page content is contained by landmarks

Fix any of the following:
- Some page content is not contained by landmarks

**[Why it is important]**  
Screen reader users rely on landmarks to navigate efficiently. Content outside landmarks may be missed or difficult to find, creating a fragmented and confusing experience.

**[Code reference]**  
```html
<div class="max-width-background bgcolor theme-base-bg" data-testid="headband-header7">
```

**[How to fix]**  
Wrap this promotional content within an appropriate landmark, such as a `<header>`, `<aside>`, or `<section>` with an accessible name.

**[Compliant code example]**  
```html
<aside aria-label="Promotional banner">
  <div class="max-width-background bgcolor theme-base-bg" data-testid="headband-header7">
    <!-- Banner content -->
  </div>
</aside>
```

**[How to test]**  
- Automated: Use axe or similar tools to scan for region violations
- Manual: Use a screen reader's landmark navigation to verify all content is reachable via landmarks

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/main/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/region?application=axeAPI

**[WCAG]**  
Best Practice (supports 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver

---

## Issue 8: region

**Severity**: 3-Average  
**Priority**: Medium  

**[URL/Path]**  
https://www.att.com/

**[Steps to reproduce]**  
1. Navigate to the homepage
2. Locate the "Call to order" phone number link

**[Element]**  
The link element located at `#link-\:R4aj6\:`

**[What is the issue]**  
Ensure all page content is contained by landmarks

Fix any of the following:
- Some page content is not contained by landmarks

**[Why it is important]**  
Screen reader users rely on landmarks to navigate efficiently. Content outside landmarks may be missed or difficult to find, creating a fragmented and confusing experience.

**[Code reference]**  
```html
<a id="link-:R4aj6:" class="cto-link link-text2" aria-label="Call to order 844-249-5043" href="tel:+18775084231">
```

**[How to fix]**  
Ensure this link is contained within an appropriate landmark region, such as `<header>` or `<nav>`.

**[Compliant code example]**  
```html
<header>
  <a class="cto-link link-text2" aria-label="Call to order 844-249-5043" href="tel:+18775084231">
    Call to order
  </a>
</header>
```

**[How to test]**  
- Automated: Use axe or similar tools to scan for region violations
- Manual: Use a screen reader's landmark navigation to verify all content is reachable via landmarks

**[MagentaA11y]**  
https://www.magentaa11y.com/checklist-web/main/

**[Resources]**  
https://dequeuniversity.com/rules/axe/4.11/region?application=axeAPI

**[WCAG]**  
Best Practice (supports 1.3.1 Info and Relationships, 2.4.1 Bypass Blocks)

**[Assistive technology]**  
Keyboard, JAWS, NVDA, VoiceOver

---

## Summary

| # | Issue | Severity | WCAG | Priority |
|---|-------|----------|------|----------|
| 1 | Missing main landmark | Average | Best Practice | Medium |
| 2 | SVG missing alt text (Desktop) | Serious | 1.1.1 (A) | High |
| 3 | SVG missing alt text (Mobile) | Serious | 1.1.1 (A) | High |
| 4 | Invalid ARIA role on h3 | Low | Best Practice | Low |
| 5 | Invalid ARIA role on h3 | Low | Best Practice | Low |
| 6 | H1 outside landmark | Average | Best Practice | Medium |
| 7 | Div outside landmark | Average | Best Practice | Medium |
| 8 | Link outside landmark | Average | Best Practice | Medium |

**Total Issues**: 8  
**Critical/Serious**: 2 (SVG alt text - WCAG 1.1.1 Level A)  
**Moderate**: 4 (Landmark structure)  
**Minor**: 2 (ARIA role misuse)
