import OpenAI from "openai";
import type { TrafficLog, InsertAttackPattern, InsertAIAnalysisResult } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface AttackAnalysis {
  attackType: string;
  technique: string;
  riskScore: number;
  recommendations: string[];
  confidence: number;
  isNewPattern: boolean;
  patternName?: string;
  patternDescription?: string;
}

export class AIAnalyzer {
  async analyzeTrafficLog(log: TrafficLog): Promise<AttackAnalysis> {
    try {
      const prompt = `
        Analyze this security traffic log and provide detailed analysis in JSON format:
        
        IP: ${log.sourceIP}
        Country: ${log.country}
        Attack Type: ${log.attackType}
        Target: ${log.target}
        Method: ${log.method}
        User Agent: ${log.userAgent || 'N/A'}
        Payload: ${log.payload || 'N/A'}
        
        Provide analysis with:
        - attackType: specific attack classification
        - technique: detailed attack technique used
        - riskScore: integer from 1-10
        - recommendations: array of specific countermeasures
        - confidence: integer from 0-100
        - isNewPattern: boolean if this represents a novel attack pattern
        - patternName: if new pattern, provide a descriptive name
        - patternDescription: if new pattern, describe the unique characteristics
        
        Respond only with valid JSON.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a cybersecurity expert specializing in attack pattern analysis. Analyze traffic logs and identify attack techniques, risk levels, and countermeasures."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.3
      });

      const analysis = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        attackType: analysis.attackType || log.attackType,
        technique: analysis.technique || 'Unknown technique',
        riskScore: Math.max(1, Math.min(10, analysis.riskScore || 5)),
        recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
        confidence: Math.max(0, Math.min(100, analysis.confidence || 50)),
        isNewPattern: Boolean(analysis.isNewPattern),
        patternName: analysis.patternName,
        patternDescription: analysis.patternDescription
      };
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Return basic analysis if AI fails
      return {
        attackType: log.attackType,
        technique: 'Standard attack pattern',
        riskScore: this.calculateBasicRiskScore(log),
        recommendations: this.getBasicRecommendations(log.attackType),
        confidence: 60,
        isNewPattern: false
      };
    }
  }

  async detectAnomalies(logs: TrafficLog[]): Promise<InsertAttackPattern[]> {
    if (logs.length === 0) return [];

    try {
      const logSummary = logs.map(log => ({
        ip: log.sourceIP,
        type: log.attackType,
        target: log.target,
        method: log.method
      }));

      const prompt = `
        Analyze these recent attack logs for anomalous patterns that might represent new attack techniques:
        
        ${JSON.stringify(logSummary, null, 2)}
        
        Look for:
        - Unusual attack vectors or techniques
        - Novel payload patterns
        - Coordinated attacks from multiple IPs
        - New exploitation methods
        
        Return JSON array of detected anomalies with:
        - name: descriptive name for the pattern
        - description: detailed description of what makes it anomalous
        - confidence: integer 0-100
        - technique: attack technique classification
        - riskScore: integer 1-10
        - occurrences: how many times this pattern appeared
        
        Only return patterns with confidence > 70. If no significant anomalies found, return empty array.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an AI security analyst specializing in anomaly detection and novel attack pattern identification."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2
      });

      const result = JSON.parse(response.choices[0].message.content || '{"anomalies": []}');
      const anomalies = result.anomalies || [];

      return anomalies.map((anomaly: any): InsertAttackPattern => ({
        name: anomaly.name || 'Unknown Pattern',
        description: anomaly.description || 'No description available',
        confidence: Math.max(0, Math.min(100, anomaly.confidence || 50)),
        occurrences: anomaly.occurrences || 1,
        firstSeen: new Date(),
        lastSeen: new Date(),
        technique: anomaly.technique || 'Unknown',
        riskScore: Math.max(1, Math.min(10, anomaly.riskScore || 5)),
        status: 'new',
        aiGenerated: true
      }));
    } catch (error) {
      console.error('Anomaly detection failed:', error);
      return [];
    }
  }

  private calculateBasicRiskScore(log: TrafficLog): number {
    let score = 1;
    
    if (log.severity === 'high') score += 4;
    else if (log.severity === 'medium') score += 2;
    
    if (log.attackType.includes('SQL Injection')) score += 3;
    else if (log.attackType.includes('XSS')) score += 2;
    else if (log.attackType.includes('Brute Force')) score += 2;
    else if (log.attackType.includes('DDoS')) score += 4;
    
    return Math.min(10, score);
  }

  private getBasicRecommendations(attackType: string): string[] {
    const recommendations: { [key: string]: string[] } = {
      'SQL Injection': [
        'Implement parameterized queries',
        'Enable SQL injection protection rules',
        'Regular security code reviews'
      ],
      'XSS': [
        'Implement Content Security Policy',
        'Sanitize user inputs',
        'Use XSS protection headers'
      ],
      'Brute Force': [
        'Implement rate limiting',
        'Enable account lockout policies',
        'Use multi-factor authentication'
      ],
      'DDoS': [
        'Deploy DDoS protection service',
        'Implement traffic rate limiting',
        'Configure load balancing'
      ]
    };

    for (const [key, recs] of Object.entries(recommendations)) {
      if (attackType.includes(key)) {
        return recs;
      }
    }

    return ['Monitor traffic patterns', 'Update security policies', 'Review firewall rules'];
  }
}

export const aiAnalyzer = new AIAnalyzer();
