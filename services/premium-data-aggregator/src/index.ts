/**
 * Premium Data Aggregator - Main Entry Point
 * 
 * Can be run as:
 * 1. Express API server
 * 2. Cron job scheduler
 * 3. CLI tool
 */

import 'dotenv/config';
import express from 'express';
import { CronJob } from 'cron';
import { aggregator } from './services/aggregator.js';
import { SCHEDULE } from './config.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get best deals (cached from database)
app.get('/api/best-deals', async (req, res) => {
    try {
        const deals = await aggregator.getBestDeals();
        res.json(deals);
    } catch (error) {
        console.error('Error getting best deals:', error);
        res.status(500).json({ error: 'Failed to get best deals' });
    }
});

// Trigger full refresh (protected)
app.post('/api/refresh', async (req, res) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.ADMIN_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('📡 Manual refresh triggered');
        const deals = await aggregator.runFullPipeline();
        res.json({
            success: true,
            message: 'Refresh completed',
            stats: deals.fetchStats
        });
    } catch (error) {
        console.error('Error during refresh:', error);
        res.status(500).json({ error: 'Failed to refresh' });
    }
});

// Trigger API-only refresh (faster)
app.post('/api/refresh/api-only', async (req, res) => {
    const authHeader = req.headers.authorization;
    const expectedToken = process.env.ADMIN_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('📡 API-only refresh triggered');
        const results = await aggregator.fetchApiOnly();
        await aggregator.saveToDatabase(results);
        const deals = await aggregator.getBestDeals();
        res.json({
            success: true,
            message: 'API refresh completed',
            stats: deals.fetchStats
        });
    } catch (error) {
        console.error('Error during API refresh:', error);
        res.status(500).json({ error: 'Failed to refresh' });
    }
});

// Setup cron jobs
function setupCronJobs() {
    console.log('⏰ Setting up cron jobs...');

    // Full refresh (includes scraping)
    for (const cronExpression of SCHEDULE.fullRefresh) {
        new CronJob(
            cronExpression,
            async () => {
                console.log('🔄 Cron: Running full refresh');
                try {
                    await aggregator.runFullPipeline();
                } catch (error) {
                    console.error('Cron full refresh error:', error);
                }
            },
            null,
            true,
            'Europe/Rome'
        );
        console.log(`  📅 Full refresh scheduled: ${cronExpression}`);
    }

    // API-only refresh (faster)
    for (const cronExpression of SCHEDULE.apiRefresh) {
        new CronJob(
            cronExpression,
            async () => {
                console.log('🔄 Cron: Running API-only refresh');
                try {
                    const results = await aggregator.fetchApiOnly();
                    await aggregator.saveToDatabase(results);
                } catch (error) {
                    console.error('Cron API refresh error:', error);
                }
            },
            null,
            true,
            'Europe/Rome'
        );
        console.log(`  📅 API refresh scheduled: ${cronExpression}`);
    }
}

// Start server
async function start() {
    console.log('🚀 Starting Premium Data Aggregator...');
    console.log('=====================================');

    // Run initial fetch
    console.log('📊 Running initial data fetch...');
    try {
        await aggregator.runFullPipeline();
    } catch (error) {
        console.error('Initial fetch failed:', error);
        console.log('⚠️ Continuing with empty data...');
    }

    // Setup cron jobs
    setupCronJobs();

    // Start Express server
    app.listen(PORT, () => {
        console.log('=====================================');
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`📊 API: http://localhost:${PORT}/api/best-deals`);
        console.log(`🔄 Refresh: POST http://localhost:${PORT}/api/refresh`);
    });
}

// CLI mode: just run once and exit
const isCliMode = process.argv.includes('--cli');

if (isCliMode) {
    console.log('🔧 Running in CLI mode...');
    aggregator.runFullPipeline()
        .then((deals) => {
            console.log('\n📊 Results:');
            console.log(JSON.stringify(deals, null, 2));
            process.exit(0);
        })
        .catch((error) => {
            console.error('Error:', error);
            process.exit(1);
        });
} else {
    start().catch((error) => {
        console.error('Failed to start:', error);
        process.exit(1);
    });
}
