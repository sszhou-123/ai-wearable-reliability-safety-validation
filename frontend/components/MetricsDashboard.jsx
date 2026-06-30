import React, { useState, useEffect } from 'react';

/**
 * Controlled AI Capability Evaluation Dashboard
 * 
 * Provides read-only visibility into real-world validation metrics.
 * Responsible teams use this dashboard to monitor staged rollouts 
 * and trigger mitigation workflows if predefined safety thresholds are breached.
 */
const MetricsDashboard = ({ capabilityVersion, cohortId }) => {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch aggregated rollout health metrics from the backend
        const fetchMetrics = async () => {
            try {
                // Mocking the API call to your backend metrics service
                const response = await fetch(`/api/v1/metrics/rollout?version=${capabilityVersion}&cohort=${cohortId}`);
                const data = await response.json();
                setMetrics(data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to load evaluation metrics", error);
                setLoading(false);
            }
        };

        fetchMetrics();
        // Poll every 30 seconds for near real-time visibility
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, [capabilityVersion, cohortId]);

    if (loading) return <div>Loading Telemetry Data...</div>;

    return (
        <div className="dashboard-container">
            <h2>AI Capability Rollout Health: Version {capabilityVersion}</h2>
            <p>Cohort: {cohortId} | Status: <span className="status-live">Monitoring</span></p>
            
            <div className="metrics-grid">
                {/* End-to-End Success Rate */}
                <div className="metric-card">
                    <h3>E2E Success Rate</h3>
                    <div className={`value ${metrics.successRate < 0.98 ? 'warning' : 'healthy'}`}>
                        {(metrics.successRate * 100).toFixed(2)}%
                    </div>
                    <p className="subtext">Target: > 98.0%</p>
                </div>

                {/* Session Reliability */}
                <div className="metric-card">
                    <h3>Crash-Free Sessions</h3>
                    <div className={`value ${metrics.crashFreeRate < 0.99 ? 'critical' : 'healthy'}`}>
                        {(metrics.crashFreeRate * 100).toFixed(2)}%
                    </div>
                    <p className="subtext">Target: > 99.0%</p>
                </div>

                {/* Latency Distribution */}
                <div className="metric-card">
                    <h3>p95 Latency</h3>
                    <div className={`value ${metrics.p95Latency > 1200 ? 'warning' : 'healthy'}`}>
                        {metrics.p95Latency} ms
                    </div>
                    <p className="subtext">Threshold: < 1200ms</p>
                </div>
            </div>

            <div className="action-panel">
                <button className="btn-danger">Halt Rollout (S0 Trigger)</button>
                <button className="btn-secondary">Export Audit Log</button>
            </div>
        </div>
    );
};

export default MetricsDashboard;
