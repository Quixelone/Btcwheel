/**
 * Browser-based scraper for exchanges without API
 * 
 * Supports: Pionex, Bybit, Bitget, BingX
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { CollectorInterface, DualInvestmentProduct, FetchResult, Exchange } from '../types/index.js';
import { EXCHANGES, BROWSER_CONFIG } from '../config.js';

// Use stealth plugin to avoid detection
puppeteerExtra.use(StealthPlugin());

/**
 * Base class for browser-based scrapers
 */
abstract class BaseScraper implements CollectorInterface {
    abstract exchange: Exchange;
    protected browser: Browser | null = null;

    protected getConfig() {
        return EXCHANGES.find(e => e.name === this.exchange)!;
    }

    protected async initBrowser(): Promise<Browser> {
        if (!this.browser) {
            this.browser = await puppeteerExtra.launch({
                headless: BROWSER_CONFIG.headless ? 'new' : false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                ],
            });
        }
        return this.browser;
    }

    protected async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    protected async createPage(): Promise<Page> {
        const browser = await this.initBrowser();
        const page = await browser.newPage();

        await page.setViewport(BROWSER_CONFIG.viewport);
        await page.setUserAgent(BROWSER_CONFIG.userAgent);

        // Block unnecessary resources for faster loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        return page;
    }

    abstract fetch(): Promise<FetchResult>;
}

/**
 * Pionex Dual Investment Scraper
 */
export class PionexScraper extends BaseScraper {
    exchange = 'pionex' as const;

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const config = this.getConfig();

        try {
            const page = await this.createPage();

            console.log(`🔍 [Pionex] Navigating to ${config.scrapeUrl}`);

            await page.goto(config.scrapeUrl!, {
                waitUntil: 'networkidle2',
                timeout: BROWSER_CONFIG.timeout,
            });

            // Wait for table to load
            await page.waitForSelector('table, [class*="table"]', { timeout: 15000 });

            // Give it a moment for data to populate
            await new Promise(r => setTimeout(r, 2000));

            // Extract data from the table
            const products = await page.evaluate(() => {
                const data: Array<{
                    apy: number;
                    durationDays: number;
                    targetPrice: number;
                    priceDiffPercent: number;
                }> = [];

                // Try multiple selectors
                const rows = document.querySelectorAll('table tbody tr, [class*="table"] [class*="row"]');

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td, [class*="cell"]');

                    if (cells.length >= 4) {
                        const apyText = cells[0]?.textContent || '';
                        const durationText = cells[1]?.textContent || '';
                        const targetText = cells[2]?.textContent || '';
                        const diffText = cells[3]?.textContent || '';

                        // Parse APY (e.g., "+93.168%")
                        const apyMatch = apyText.match(/([+-]?\d+\.?\d*)/);
                        const apy = apyMatch ? parseFloat(apyMatch[1]) : 0;

                        // Parse duration (e.g., "1 G" or "1 Day")
                        const durationMatch = durationText.match(/(\d+)/);
                        const duration = durationMatch ? parseInt(durationMatch[1]) : 1;

                        // Parse target price (e.g., "94,500" or "94500")
                        const targetMatch = targetText.match(/[\d,]+\.?\d*/);
                        const target = targetMatch ? parseFloat(targetMatch[0].replace(/,/g, '')) : 0;

                        // Parse price diff (e.g., "-0.72%")
                        const diffMatch = diffText.match(/([+-]?\d+\.?\d*)/);
                        const diff = diffMatch ? parseFloat(diffMatch[1]) : 0;

                        if (apy > 0) {
                            data.push({
                                apy,
                                durationDays: duration,
                                targetPrice: target,
                                priceDiffPercent: diff,
                            });
                        }
                    }
                });

                return data;
            });

            await page.close();

            // Transform to our format
            const result: DualInvestmentProduct[] = products.map((p, idx) => ({
                exchange: 'pionex' as const,
                productId: `pionex_${idx}`,
                investCoin: 'USDT',
                exerciseCoin: 'BTC',
                optionType: 'PUT' as const,
                apy: p.apy,
                targetPrice: p.targetPrice,
                priceDiffPercent: p.priceDiffPercent,
                durationDays: p.durationDays,
                fetchedAt: new Date(),
                dataSource: 'scrape' as const,
            }));

            console.log(`✅ [Pionex] Scraped ${result.length} products`);

            return {
                exchange: 'pionex',
                success: true,
                products: result,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [Pionex] Error: ${message}`);

            return {
                exchange: 'pionex',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        } finally {
            await this.closeBrowser();
        }
    }
}

/**
 * Bybit Dual Asset Scraper
 */
export class BybitScraper extends BaseScraper {
    exchange = 'bybit' as const;

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const config = this.getConfig();

        try {
            const page = await this.createPage();

            console.log(`🔍 [Bybit] Navigating to ${config.scrapeUrl}`);

            await page.goto(config.scrapeUrl!, {
                waitUntil: 'networkidle2',
                timeout: BROWSER_CONFIG.timeout,
            });

            // Wait for content
            await page.waitForSelector('[class*="dual"], table', { timeout: 15000 });
            await new Promise(r => setTimeout(r, 3000));

            // Try to select BTC if there's a coin selector
            try {
                await page.click('[data-coin="BTC"], [class*="BTC"]');
                await new Promise(r => setTimeout(r, 1000));
            } catch {
                // Coin selector might not exist
            }

            // Extract data
            const products = await page.evaluate(() => {
                const data: Array<{
                    apy: number;
                    durationDays: number;
                    targetPrice: number;
                }> = [];

                // Bybit specific selectors
                const cards = document.querySelectorAll('[class*="dual-asset-card"], [class*="product-card"], table tbody tr');

                cards.forEach((card) => {
                    // Try to find APY
                    const apyEl = card.querySelector('[class*="apy"], [class*="apr"], [class*="rate"]');
                    const durationEl = card.querySelector('[class*="duration"], [class*="term"], [class*="day"]');
                    const priceEl = card.querySelector('[class*="price"], [class*="strike"]');

                    const apyText = apyEl?.textContent || '';
                    const durationText = durationEl?.textContent || '';
                    const priceText = priceEl?.textContent || '';

                    const apyMatch = apyText.match(/(\d+\.?\d*)/);
                    const durationMatch = durationText.match(/(\d+)/);
                    const priceMatch = priceText.match(/[\d,]+\.?\d*/);

                    if (apyMatch) {
                        data.push({
                            apy: parseFloat(apyMatch[1]),
                            durationDays: durationMatch ? parseInt(durationMatch[1]) : 1,
                            targetPrice: priceMatch ? parseFloat(priceMatch[0].replace(/,/g, '')) : 0,
                        });
                    }
                });

                return data;
            });

            await page.close();

            const result: DualInvestmentProduct[] = products.map((p, idx) => ({
                exchange: 'bybit' as const,
                productId: `bybit_${idx}`,
                investCoin: 'USDT',
                exerciseCoin: 'BTC',
                optionType: 'PUT' as const,
                apy: p.apy,
                targetPrice: p.targetPrice,
                durationDays: p.durationDays,
                fetchedAt: new Date(),
                dataSource: 'scrape' as const,
            }));

            console.log(`✅ [Bybit] Scraped ${result.length} products`);

            return {
                exchange: 'bybit',
                success: true,
                products: result,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [Bybit] Error: ${message}`);

            return {
                exchange: 'bybit',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        } finally {
            await this.closeBrowser();
        }
    }
}

/**
 * Bitget Dual Investment Scraper
 */
export class BitgetScraper extends BaseScraper {
    exchange = 'bitget' as const;

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const config = this.getConfig();

        try {
            const page = await this.createPage();

            console.log(`🔍 [Bitget] Navigating to ${config.scrapeUrl}`);

            await page.goto(config.scrapeUrl!, {
                waitUntil: 'networkidle2',
                timeout: BROWSER_CONFIG.timeout,
            });

            await page.waitForSelector('[class*="dual"], table', { timeout: 15000 });
            await new Promise(r => setTimeout(r, 3000));

            const products = await page.evaluate(() => {
                const data: Array<{
                    apy: number;
                    durationDays: number;
                    targetPrice: number;
                }> = [];

                const rows = document.querySelectorAll('table tbody tr, [class*="product-item"]');

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td, [class*="cell"]');

                    // Try to extract data
                    const texts = Array.from(cells).map(c => c.textContent?.trim() || '');

                    for (const text of texts) {
                        const apyMatch = text.match(/(\d+\.?\d*)%/);
                        if (apyMatch) {
                            data.push({
                                apy: parseFloat(apyMatch[1]),
                                durationDays: 1,
                                targetPrice: 0,
                            });
                            break;
                        }
                    }
                });

                return data.filter(d => d.apy > 0);
            });

            await page.close();

            const result: DualInvestmentProduct[] = products.map((p, idx) => ({
                exchange: 'bitget' as const,
                productId: `bitget_${idx}`,
                investCoin: 'USDT',
                exerciseCoin: 'BTC',
                optionType: 'PUT' as const,
                apy: p.apy,
                targetPrice: p.targetPrice,
                durationDays: p.durationDays,
                fetchedAt: new Date(),
                dataSource: 'scrape' as const,
            }));

            console.log(`✅ [Bitget] Scraped ${result.length} products`);

            return {
                exchange: 'bitget',
                success: true,
                products: result,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [Bitget] Error: ${message}`);

            return {
                exchange: 'bitget',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        } finally {
            await this.closeBrowser();
        }
    }
}

/**
 * BingX Dual Investment Scraper
 */
export class BingXScraper extends BaseScraper {
    exchange = 'bingx' as const;

    async fetch(): Promise<FetchResult> {
        const startTime = Date.now();
        const config = this.getConfig();

        try {
            const page = await this.createPage();

            console.log(`🔍 [BingX] Navigating to ${config.scrapeUrl}`);

            await page.goto(config.scrapeUrl!, {
                waitUntil: 'networkidle2',
                timeout: BROWSER_CONFIG.timeout,
            });

            await page.waitForSelector('[class*="dual"], table', { timeout: 15000 });
            await new Promise(r => setTimeout(r, 3000));

            const products = await page.evaluate(() => {
                const data: Array<{
                    apy: number;
                    durationDays: number;
                    targetPrice: number;
                }> = [];

                const rows = document.querySelectorAll('table tbody tr, [class*="product-row"]');

                rows.forEach((row) => {
                    const cells = row.querySelectorAll('td, [class*="cell"]');
                    const texts = Array.from(cells).map(c => c.textContent?.trim() || '');

                    for (const text of texts) {
                        const apyMatch = text.match(/(\d+\.?\d*)%/);
                        if (apyMatch) {
                            data.push({
                                apy: parseFloat(apyMatch[1]),
                                durationDays: 1,
                                targetPrice: 0,
                            });
                            break;
                        }
                    }
                });

                return data.filter(d => d.apy > 0);
            });

            await page.close();

            const result: DualInvestmentProduct[] = products.map((p, idx) => ({
                exchange: 'bingx' as const,
                productId: `bingx_${idx}`,
                investCoin: 'USDT',
                exerciseCoin: 'BTC',
                optionType: 'PUT' as const,
                apy: p.apy,
                targetPrice: p.targetPrice,
                durationDays: p.durationDays,
                fetchedAt: new Date(),
                dataSource: 'scrape' as const,
            }));

            console.log(`✅ [BingX] Scraped ${result.length} products`);

            return {
                exchange: 'bingx',
                success: true,
                products: result,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error(`❌ [BingX] Error: ${message}`);

            return {
                exchange: 'bingx',
                success: false,
                products: [],
                error: message,
                fetchedAt: new Date(),
                durationMs: Date.now() - startTime,
            };
        } finally {
            await this.closeBrowser();
        }
    }
}

// Export all scrapers
export const scrapers = {
    pionex: new PionexScraper(),
    bybit: new BybitScraper(),
    bitget: new BitgetScraper(),
    bingx: new BingXScraper(),
};
