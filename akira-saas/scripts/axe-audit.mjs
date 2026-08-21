#!/usr/bin/env node
/**
 * Axe Core Accessibility Audit Script
 * Scans pages for WCAG 2.1 Level AA violations
 *
 * Usage: npm run a11y:audit
 */

import { chromium } from 'playwright'
import { injectAxe, checkA11y } from 'axe-playwright'
import fs from 'fs'
import path from 'path'

const config = {
  baseURL: 'http://localhost:5173',
  pages: [
    { name: 'Dashboard', path: '/' },
    { name: 'Clients', path: '/clients' },
    { name: 'Projects', path: '/projects' },
    { name: 'Finance', path: '/finance' },
    { name: 'Offers', path: '/offers' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Services', path: '/services' },
    { name: 'Knowledge', path: '/knowledge' },
  ],
  reportDir: './a11y-reports',
}

const results = {
  timestamp: new Date().toISOString(),
  pages: [],
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    violations: [],
  },
}

async function auditPage(browser, pageName, pagePath) {
  console.log(`\n🔍 Auditing ${pageName}...`)

  const page = await browser.newPage()

  try {
    await page.goto(`${config.baseURL}${pagePath}`, {
      waitUntil: 'networkidle',
    })

    // Inject Axe Core
    await injectAxe(page)

    // Run accessibility check
    const violations = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    })

    const pageResult = {
      name: pageName,
      path: pagePath,
      violations: violations || [],
      passed: !violations || violations.length === 0,
    }

    results.pages.push(pageResult)
    results.summary.total++

    if (pageResult.passed) {
      results.summary.passed++
      console.log(`  ✅ ${pageName} - No violations`)
    } else {
      results.summary.failed++
      console.log(`  ❌ ${pageName} - ${violations.length} violation(s)`)

      violations.forEach((v) => {
        results.summary.violations.push({
          page: pageName,
          issue: v.id,
          description: v.description,
          impact: v.impact,
          instances: v.nodes.length,
        })
      })
    }

    await page.close()
  } catch (error) {
    console.error(`  ⚠️  Error auditing ${pageName}:`, error.message)
    await page.close()
  }
}

async function main() {
  console.log('🚀 Starting AKIRA Accessibility Audit (WCAG 2.1 Level AA)')
  console.log(`📍 Base URL: ${config.baseURL}`)

  const browser = await chromium.launch()

  try {
    // Audit each page
    for (const page of config.pages) {
      await auditPage(browser, page.name, page.path)
    }

    // Generate report
    await generateReport()

    // Print summary
    printSummary()
  } finally {
    await browser.close()
  }
}

async function generateReport() {
  // Ensure output directory exists
  if (!fs.existsSync(config.reportDir)) {
    fs.mkdirSync(config.reportDir, { recursive: true })
  }

  // Save JSON report
  const jsonPath = path.join(config.reportDir, 'accessibility-audit.json')
  fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2))
  console.log(`\n📊 Report saved to: ${jsonPath}`)

  // Generate HTML report
  const htmlReport = generateHtmlReport()
  const htmlPath = path.join(config.reportDir, 'accessibility-audit.html')
  fs.writeFileSync(htmlPath, htmlReport)
  console.log(`📊 HTML report saved to: ${htmlPath}`)
}

function generateHtmlReport() {
  const violations = results.summary.violations

  const violationRows = violations
    .map(
      (v) => `
    <tr>
      <td>${v.page}</td>
      <td><code>${v.issue}</code></td>
      <td>${v.description}</td>
      <td><span class="impact ${v.impact}">${v.impact.toUpperCase()}</span></td>
      <td>${v.instances}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AKIRA - Accessibility Audit Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    header { background: linear-gradient(135deg, #e63946 0%, #d62828 100%); color: white; padding: 40px 20px; border-radius: 8px; margin-bottom: 30px; }
    h1 { font-size: 28px; margin-bottom: 10px; }
    .subtitle { opacity: 0.9; font-size: 14px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
    .summary-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .summary-card h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; }
    .summary-card .value { font-size: 32px; font-weight: bold; }
    .passed { color: #22c55e; }
    .failed { color: #e63946; }
    .neutral { color: #666; }
    table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    th { background: #f9fafb; padding: 12px 16px; text-align: left; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 1px solid #e5e7eb; }
    td { padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    tr:last-child td { border-bottom: none; }
    code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'Monaco', monospace; font-size: 12px; }
    .impact { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
    .impact.critical { background: #fee2e2; color: #991b1b; }
    .impact.serious { background: #fef3c7; color: #92400e; }
    .impact.moderate { background: #dbeafe; color: #1e40af; }
    .impact.minor { background: #d1fae5; color: #065f46; }
    footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>♿ AKIRA Accessibility Audit</h1>
      <p class="subtitle">WCAG 2.1 Level AA Compliance Report</p>
    </header>

    <div class="summary">
      <div class="summary-card">
        <h3>Total Pages</h3>
        <div class="value neutral">${results.summary.total}</div>
      </div>
      <div class="summary-card">
        <h3>Passed</h3>
        <div class="value passed">${results.summary.passed}</div>
      </div>
      <div class="summary-card">
        <h3>Failed</h3>
        <div class="value failed">${results.summary.failed}</div>
      </div>
      <div class="summary-card">
        <h3>Violations Found</h3>
        <div class="value ${violations.length > 0 ? 'failed' : 'passed'}">${violations.length}</div>
      </div>
    </div>

    ${violations.length > 0
      ? `
    <h2 style="margin-bottom: 20px; color: #333;">Found Issues</h2>
    <table>
      <thead>
        <tr>
          <th>Page</th>
          <th>Issue ID</th>
          <th>Description</th>
          <th>Severity</th>
          <th>Instances</th>
        </tr>
      </thead>
      <tbody>
        ${violationRows}
      </tbody>
    </table>
    `
      : '<div style="background: #d1fae5; color: #065f46; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;"><strong>✅ All pages passed accessibility audit!</strong></div>'
    }

    <footer>
      <p>Generated: ${new Date().toLocaleString('es-ES')}</p>
      <p>Report: WCAG 2.1 Level AA | Tool: Axe Core</p>
    </footer>
  </div>
</body>
</html>
  `
}

function printSummary() {
  console.log('\n' + '='.repeat(50))
  console.log('📋 AUDIT SUMMARY')
  console.log('='.repeat(50))
  console.log(`Total Pages Audited: ${results.summary.total}`)
  console.log(`✅ Passed: ${results.summary.passed}`)
  console.log(`❌ Failed: ${results.summary.failed}`)
  console.log(`⚠️  Violations Found: ${results.summary.violations.length}`)
  console.log('='.repeat(50))

  if (results.summary.violations.length > 0) {
    console.log('\n🔴 Top Issues:')
    const topIssues = results.summary.violations.slice(0, 5)
    topIssues.forEach((v, i) => {
      console.log(`  ${i + 1}. [${v.impact.toUpperCase()}] ${v.issue}`)
      console.log(`     ${v.description}`)
      console.log(`     Pages: ${v.page} (${v.instances} instance)`)
    })
  }

  console.log('\n✨ For detailed report, see: a11y-reports/accessibility-audit.html')
}

main().catch((error) => {
  console.error('❌ Audit failed:', error)
  process.exit(1)
})
