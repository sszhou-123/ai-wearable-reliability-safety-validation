/**
 * AI Wearable Telemetry Ingestion API
 * 
 * This service acts as the edge entry point for all diagnostic logs and telemetry
 * submitted by the companion mobile application. To maintain low-latency under 
 * high load, payloads are immediately validated, sanitized, and published to 
 * an asynchronous event queue (e.g., Kafka) for downstream triage.
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validatePayload, sanitizeData } = require('./middleware/security');
// Mocking a distributed message queue publisher
const { publishToQueue } = require('./services/eventQueue'); 

const app = express();
app.use(express.json());

// Ingestion Endpoint for Incident Reports
app.post('/v1/telemetry/incident', validatePayload, async (req, res) => {
    try {
        const rawPayload = req.body;
        
        // 1. Assign a traceable unique identifier
        const incidentId = uuidv4();
        
        // 2. Enforce data minimization (drop raw audio, PII, etc.)
        const sanitizedPayload = sanitizeData(rawPayload);
        
        // 3. Enrich with ingestion timestamp
        const enrichedRecord = {
            incident_id: incidentId,
            ingestion_timestamp: new Date().toISOString(),
            status: "new",
            ...sanitizedPayload
        };

        // 4. Publish to async queue for severity classification and routing
        // This decouples ingestion from processing, ensuring high throughput
        await publishToQueue('wearable-incident-stream', enrichedRecord);

        // 5. Return 202 Accepted to the client immediately
        return res.status(202).json({
            message: "Incident payload accepted for processing",
            incident_id: incidentId
        });

    } catch (error) {
        console.error(`[Ingestion Error]: ${error.message}`);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Telemetry Ingestion API running on port ${PORT}`);
});
