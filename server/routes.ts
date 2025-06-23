import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { aiAnalyzer } from "./services/ai-analyzer";
import { mockDataGenerator } from "./services/mock-data";
import { insertTrafficLogSchema, insertAttackPatternSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize mock data
  await initializeMockData();
  
  // Start real-time data generation
  startRealTimeDataGeneration();

  // Get system metrics
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch metrics" });
    }
  });

  // Get traffic logs with filtering and pagination
  app.get("/api/traffic-logs", async (req, res) => {
    try {
      const { severity, attackType, ipAddress, page = "1", limit = "10" } = req.query;
      const pageNum = parseInt(page as string);
      const limitNum = parseInt(limit as string);
      const offset = (pageNum - 1) * limitNum;

      const filters = {
        severity: severity as string,
        attackType: attackType as string,
        ipAddress: ipAddress as string,
        limit: limitNum,
        offset
      };

      const [logs, total] = await Promise.all([
        storage.getTrafficLogs(filters),
        storage.getTrafficLogCount(filters)
      ]);

      res.json({
        data: logs,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch traffic logs" });
    }
  });

  // Get attack patterns
  app.get("/api/attack-patterns", async (req, res) => {
    try {
      const patterns = await storage.getNewAttackPatterns();
      res.json(patterns);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attack patterns" });
    }
  });

  // Get AI analysis results
  app.get("/api/ai-analysis", async (req, res) => {
    try {
      const results = await storage.getAIAnalysisResults();
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch AI analysis results" });
    }
  });

  // Get dataset statistics
  app.get("/api/dataset-stats", async (req, res) => {
    try {
      const stats = await storage.getDatasetStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dataset stats" });
    }
  });

  // Update attack pattern status
  app.patch("/api/attack-patterns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const pattern = await storage.updateAttackPatternStatus(id, status);
      if (!pattern) {
        return res.status(404).json({ message: "Attack pattern not found" });
      }

      res.json(pattern);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attack pattern" });
    }
  });

  // Export report
  app.get("/api/export-report", async (req, res) => {
    try {
      const [logs, patterns, metrics, stats] = await Promise.all([
        storage.getTrafficLogs({ limit: 1000 }),
        storage.getAttackPatterns(),
        storage.getSystemMetrics(),
        storage.getDatasetStats()
      ]);

      const report = {
        generatedAt: new Date().toISOString(),
        summary: metrics,
        datasetStats: stats,
        recentLogs: logs.slice(0, 100),
        attackPatterns: patterns,
        totalLogEntries: logs.length
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename=honeypot-report.json');
      res.json(report);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate export report" });
    }
  });

  // Retrain AI model (simulate)
  app.post("/api/retrain-model", async (req, res) => {
    try {
      // Simulate model retraining
      const currentStats = await storage.getDatasetStats();
      if (currentStats) {
        const newAccuracy = Math.min(99, currentStats.modelAccuracy + Math.floor(Math.random() * 3) + 1);
        await storage.updateDatasetStats({
          ...currentStats,
          modelAccuracy: newAccuracy,
          lastRetraining: new Date()
        });
      }

      res.json({ message: "Model retraining initiated", success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to retrain model" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function initializeMockData() {
  // Generate initial system metrics
  const metrics = mockDataGenerator.generateSystemMetrics();
  await storage.updateSystemMetrics(metrics);

  // Generate initial dataset stats
  const stats = mockDataGenerator.generateDatasetStats();
  await storage.updateDatasetStats(stats);

  // Generate initial traffic logs
  for (let i = 0; i < 50; i++) {
    const log = mockDataGenerator.generateTrafficLog();
    await storage.createTrafficLog(log);
  }

  // Generate initial attack patterns
  for (let i = 0; i < 5; i++) {
    const pattern = mockDataGenerator.generateAttackPattern();
    await storage.createAttackPattern(pattern);
  }

  // Generate initial AI analysis results
  const logs = await storage.getTrafficLogs({ limit: 10 });
  for (const log of logs) {
    const analysis = await aiAnalyzer.analyzeTrafficLog(log);
    await storage.createAIAnalysisResult({
      trafficLogId: log.id,
      attackType: analysis.attackType,
      technique: analysis.technique,
      riskScore: analysis.riskScore,
      recommendations: JSON.stringify(analysis.recommendations),
      confidence: analysis.confidence,
      timestamp: new Date()
    });
  }
}

function startRealTimeDataGeneration() {
  // Generate new traffic logs every 30-60 seconds
  setInterval(async () => {
    try {
      const log = mockDataGenerator.generateTrafficLog();
      const createdLog = await storage.createTrafficLog(log);
      
      // Analyze new logs with AI
      const analysis = await aiAnalyzer.analyzeTrafficLog(createdLog);
      await storage.createAIAnalysisResult({
        trafficLogId: createdLog.id,
        attackType: analysis.attackType,
        technique: analysis.technique,
        riskScore: analysis.riskScore,
        recommendations: JSON.stringify(analysis.recommendations),
        confidence: analysis.confidence,
        timestamp: new Date()
      });

      // Update metrics
      const currentMetrics = await storage.getSystemMetrics();
      if (currentMetrics) {
        await storage.updateSystemMetrics({
          ...currentMetrics,
          attacksToday: currentMetrics.attacksToday + 1,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error('Error generating real-time data:', error);
    }
  }, Math.random() * 30000 + 30000); // 30-60 seconds

  // Generate new attack patterns every 2-3 minutes for demonstration
  setInterval(async () => {
    try {
      if (Math.random() > 0.6) { // 40% chance
        const pattern = mockDataGenerator.generateAttackPattern();
        await storage.createAttackPattern(pattern);
      }
    } catch (error) {
      console.error('Error generating attack patterns:', error);
    }
  }, Math.random() * 60000 + 120000); // 2-3 minutes

  // Perform anomaly detection every 5 minutes
  setInterval(async () => {
    try {
      const recentLogs = await storage.getTrafficLogs({ limit: 20 });
      const anomalies = await aiAnalyzer.detectAnomalies(recentLogs);
      
      for (const anomaly of anomalies) {
        await storage.createAttackPattern(anomaly);
      }
      
      if (anomalies.length > 0) {
        console.log(`Detected ${anomalies.length} new attack patterns from anomaly analysis`);
      }
    } catch (error) {
      console.error('Error in anomaly detection:', error);
    }
  }, 300000); // 5 minutes
}
