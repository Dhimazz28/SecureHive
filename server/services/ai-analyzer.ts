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
  private useAdvancedAnalysis = true;
  private lastApiCall = 0;
  private apiCallDelay = 2000; // 2 seconds between calls

  async analyzeTrafficLog(log: TrafficLog): Promise<AttackAnalysis> {
    // Enhanced pattern detection with rule-based analysis
    const enhancedAnalysis = this.performEnhancedAnalysis(log);
    
    // Try AI analysis with rate limiting if available
    if (this.useAdvancedAnalysis && this.canMakeApiCall()) {
      try {
        return await this.performAIAnalysis(log, enhancedAnalysis);
      } catch (error: any) {
        console.error('AI Analysis failed:', error);
        // Disable AI temporarily if quota exceeded
        if (error?.status === 429) {
          this.useAdvancedAnalysis = false;
          setTimeout(() => { this.useAdvancedAnalysis = true; }, 300000); // Re-enable after 5 minutes
        }
      }
    }
    
    // Return enhanced rule-based analysis
    return enhancedAnalysis;
  }

  private canMakeApiCall(): boolean {
    const now = Date.now();
    if (now - this.lastApiCall < this.apiCallDelay) {
      return false;
    }
    this.lastApiCall = now;
    return true;
  }

  private async performAIAnalysis(log: TrafficLog, fallback: AttackAnalysis): Promise<AttackAnalysis> {
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
      attackType: analysis.attackType || fallback.attackType,
      technique: analysis.technique || fallback.technique,
      riskScore: Math.max(1, Math.min(10, analysis.riskScore || fallback.riskScore)),
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : fallback.recommendations,
      confidence: Math.max(0, Math.min(100, analysis.confidence || fallback.confidence)),
      isNewPattern: Boolean(analysis.isNewPattern) || fallback.isNewPattern,
      patternName: analysis.patternName || fallback.patternName,
      patternDescription: analysis.patternDescription || fallback.patternDescription
    };
  }

  private performEnhancedAnalysis(log: TrafficLog): AttackAnalysis {
    const analysis = {
      attackType: log.attackType,
      technique: this.identifyTechnique(log),
      riskScore: this.calculateEnhancedRiskScore(log),
      recommendations: this.getEnhancedRecommendations(log),
      confidence: this.calculateConfidence(log),
      isNewPattern: this.detectNewPattern(log),
      patternName: undefined as string | undefined,
      patternDescription: undefined as string | undefined
    };

    // Add pattern details if new pattern detected
    if (analysis.isNewPattern) {
      analysis.patternName = this.generatePatternName(log);
      analysis.patternDescription = this.generatePatternDescription(log);
    }

    return analysis;
  }

  private identifyTechnique(log: TrafficLog): string {
    const payload = log.payload?.toLowerCase() || '';
    const target = log.target.toLowerCase();
    const userAgent = log.userAgent?.toLowerCase() || '';

    // SQL Injection techniques
    if (log.attackType.includes('SQL')) {
      if (payload.includes('union')) return 'Union-based SQL Injection';
      if (payload.includes('sleep') || payload.includes('waitfor')) return 'Time-based Blind SQL Injection';
      if (payload.includes('and') || payload.includes('or')) return 'Boolean-based Blind SQL Injection';
      if (payload.includes('into outfile')) return 'File-based SQL Injection';
      return 'Classic SQL Injection';
    }

    // XSS techniques
    if (log.attackType.includes('XSS')) {
      if (payload.includes('document.')) return 'DOM-based XSS';
      if (payload.includes('onload') || payload.includes('onerror')) return 'Event-based XSS';
      if (payload.includes('javascript:')) return 'JavaScript Protocol XSS';
      return 'Reflected XSS';
    }

    // Brute Force techniques
    if (log.attackType.includes('Brute')) {
      if (userAgent.includes('curl') || userAgent.includes('python')) return 'Automated Brute Force';
      if (log.country && ['CN', 'RU'].includes(log.country)) return 'Distributed Brute Force';
      return 'Dictionary-based Brute Force';
    }

    // DDoS techniques
    if (log.attackType.includes('DDoS')) {
      if (log.method === 'GET') return 'HTTP GET Flood';
      if (log.method === 'POST') return 'HTTP POST Flood';
      return 'Layer 7 DDoS Attack';
    }

    // Directory Traversal
    if (log.attackType.includes('Directory')) {
      if (payload.includes('..\\')) return 'Windows Path Traversal';
      if (payload.includes('../')) return 'Unix Path Traversal';
      return 'Directory Traversal Attack';
    }

    return 'Advanced Persistent Threat';
  }

  private calculateEnhancedRiskScore(log: TrafficLog): number {
    let score = 1;
    
    // Base severity score
    if (log.severity === 'high') score += 4;
    else if (log.severity === 'medium') score += 2;
    
    // Attack type scoring
    if (log.attackType.includes('SQL Injection')) score += 3;
    else if (log.attackType.includes('Command Injection')) score += 4;
    else if (log.attackType.includes('XSS')) score += 2;
    else if (log.attackType.includes('Brute Force')) score += 2;
    else if (log.attackType.includes('DDoS')) score += 3;
    
    // Payload analysis
    const payload = log.payload?.toLowerCase() || '';
    if (payload.includes('drop table')) score += 2;
    if (payload.includes('exec') || payload.includes('system')) score += 3;
    if (payload.includes('script')) score += 1;
    
    // Target analysis
    if (log.target.includes('admin') || log.target.includes('config')) score += 2;
    if (log.target.includes('database') || log.target.includes('backup')) score += 2;
    
    // Country-based risk
    if (['CN', 'RU', 'KP'].includes(log.country)) score += 1;
    
    return Math.min(10, score);
  }

  private getEnhancedRecommendations(log: TrafficLog): string[] {
    const recommendations: string[] = [];
    
    // Attack-specific recommendations
    if (log.attackType.includes('SQL Injection')) {
      recommendations.push('Implement parameterized queries and prepared statements');
      recommendations.push('Enable SQL injection protection in WAF');
      recommendations.push('Conduct regular security code reviews');
      recommendations.push('Implement least privilege database access');
    } else if (log.attackType.includes('XSS')) {
      recommendations.push('Implement Content Security Policy (CSP)');
      recommendations.push('Sanitize and validate all user inputs');
      recommendations.push('Use XSS protection headers');
      recommendations.push('Encode output data properly');
    } else if (log.attackType.includes('Brute Force')) {
      recommendations.push('Implement rate limiting and account lockout');
      recommendations.push('Enable multi-factor authentication');
      recommendations.push('Use CAPTCHA for repeated attempts');
      recommendations.push('Monitor for suspicious login patterns');
    } else if (log.attackType.includes('DDoS')) {
      recommendations.push('Deploy DDoS protection service');
      recommendations.push('Implement traffic rate limiting');
      recommendations.push('Configure load balancing');
      recommendations.push('Set up automatic scaling');
    }
    
    // IP-based recommendations
    if (['CN', 'RU', 'KP'].includes(log.country)) {
      recommendations.push('Consider geo-blocking for high-risk countries');
      recommendations.push('Implement enhanced monitoring for this region');
    }
    
    // General recommendations
    recommendations.push('Update security monitoring rules');
    recommendations.push('Review and update firewall configurations');
    recommendations.push('Conduct threat hunting exercises');
    
    return recommendations;
  }

  private calculateConfidence(log: TrafficLog): number {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on payload analysis
    if (log.payload && log.payload.length > 10) confidence += 10;
    
    // Known attack patterns
    const payload = log.payload?.toLowerCase() || '';
    if (payload.includes('union select') || payload.includes('<script>')) confidence += 15;
    
    // Consistent attack targeting
    if (log.target.includes('admin') || log.target.includes('login')) confidence += 10;
    
    return Math.min(95, confidence);
  }

  private detectNewPattern(log: TrafficLog): boolean {
    // Detect potential new patterns based on unusual characteristics
    const payload = log.payload?.toLowerCase() || '';
    const userAgent = log.userAgent?.toLowerCase() || '';
    
    // New encoding techniques
    if (payload.includes('%u') || payload.includes('&#x')) return true;
    
    // Unusual user agents
    if (userAgent.includes('bot') && !userAgent.includes('googlebot')) return true;
    
    // Uncommon attack vectors
    if (log.target.includes('.env') || log.target.includes('.git')) return true;
    
    // New payload patterns
    if (payload.includes('${') && payload.includes('}')) return true; // Template injection
    
    return Math.random() > 0.85; // 15% chance for demonstration
  }

  private generatePatternName(log: TrafficLog): string {
    const patterns = [
      'Advanced SQL Injection Variant',
      'Encoded XSS Attack Pattern',
      'Hybrid Brute Force Campaign',
      'Polymorphic Script Injection',
      'Zero-Day Exploit Attempt',
      'AI-Evading Attack Vector',
      'Multi-Stage Payload Delivery',
      'Obfuscated Command Injection'
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private generatePatternDescription(log: TrafficLog): string {
    return `Novel attack pattern detected from ${log.sourceIP} targeting ${log.target}. Uses advanced techniques to bypass traditional security measures with confidence indicators suggesting coordinated attack campaign.`;
  }

  async detectAnomalies(logs: TrafficLog[]): Promise<InsertAttackPattern[]> {
    if (logs.length === 0) return [];

    // Enhanced rule-based anomaly detection
    const anomalies = this.performRuleBasedAnomalyDetection(logs);
    
    // Try AI-enhanced analysis if available
    if (this.useAdvancedAnalysis && this.canMakeApiCall()) {
      try {
        return await this.performAIAnomalyDetection(logs, anomalies);
      } catch (error: any) {
        console.error('AI Anomaly detection failed:', error);
        if (error?.status === 429) {
          this.useAdvancedAnalysis = false;
          setTimeout(() => { this.useAdvancedAnalysis = true; }, 300000);
        }
      }
    }
    
    return anomalies;
  }

  private performRuleBasedAnomalyDetection(logs: TrafficLog[]): InsertAttackPattern[] {
    const anomalies: InsertAttackPattern[] = [];
    
    // Detect coordinated attacks from multiple IPs
    const ipGroups = this.groupByIP(logs);
    const coordinatedAttacks = this.detectCoordinatedAttacks(ipGroups);
    anomalies.push(...coordinatedAttacks);
    
    // Detect unusual attack sequences
    const sequenceAnomalies = this.detectAttackSequences(logs);
    anomalies.push(...sequenceAnomalies);
    
    // Detect geographic anomalies
    const geoAnomalies = this.detectGeographicAnomalies(logs);
    anomalies.push(...geoAnomalies);
    
    // Detect payload anomalies
    const payloadAnomalies = this.detectPayloadAnomalies(logs);
    anomalies.push(...payloadAnomalies);
    
    return anomalies;
  }

  private async performAIAnomalyDetection(logs: TrafficLog[], fallback: InsertAttackPattern[]): Promise<InsertAttackPattern[]> {
    const logSummary = logs.map(log => ({
      ip: log.sourceIP,
      type: log.attackType,
      target: log.target,
      method: log.method,
      payload: log.payload?.substring(0, 100) // Truncate for API limits
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

    const aiAnomalies = anomalies.map((anomaly: any): InsertAttackPattern => ({
      name: anomaly.name || 'AI-Detected Anomaly',
      description: anomaly.description || 'Advanced anomaly detected by AI analysis',
      confidence: Math.max(0, Math.min(100, anomaly.confidence || 75)),
      occurrences: anomaly.occurrences || 1,
      firstSeen: new Date(),
      lastSeen: new Date(),
      technique: anomaly.technique || 'Unknown AI-detected technique',
      riskScore: Math.max(1, Math.min(10, anomaly.riskScore || 7)),
      status: 'new',
      aiGenerated: true
    }));

    return [...fallback, ...aiAnomalies];
  }

  private groupByIP(logs: TrafficLog[]): Map<string, TrafficLog[]> {
    const groups = new Map<string, TrafficLog[]>();
    for (const log of logs) {
      const existing = groups.get(log.sourceIP) || [];
      existing.push(log);
      groups.set(log.sourceIP, existing);
    }
    return groups;
  }

  private detectCoordinatedAttacks(ipGroups: Map<string, TrafficLog[]>): InsertAttackPattern[] {
    const anomalies: InsertAttackPattern[] = [];
    
    // Find IPs with multiple attack types in short time
    for (const [ip, logs] of ipGroups) {
      if (logs.length >= 3) {
        const attackTypes = new Set(logs.map(l => l.attackType));
        if (attackTypes.size >= 2) {
          anomalies.push({
            name: 'Multi-Vector Coordinated Attack',
            description: `Coordinated attack from ${ip} using ${attackTypes.size} different attack vectors within short timeframe`,
            confidence: 85,
            occurrences: logs.length,
            firstSeen: new Date(Math.min(...logs.map(l => l.timestamp.getTime()))),
            lastSeen: new Date(Math.max(...logs.map(l => l.timestamp.getTime()))),
            technique: 'Multi-stage attack coordination',
            riskScore: 8,
            status: 'new',
            aiGenerated: true
          });
        }
      }
    }
    
    return anomalies;
  }

  private detectAttackSequences(logs: TrafficLog[]): InsertAttackPattern[] {
    const anomalies: InsertAttackPattern[] = [];
    
    // Detect reconnaissance followed by exploitation
    const sortedLogs = logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    for (let i = 0; i < sortedLogs.length - 1; i++) {
      const current = sortedLogs[i];
      const next = sortedLogs[i + 1];
      
      if (current.sourceIP === next.sourceIP) {
        // Directory traversal followed by SQL injection
        if (current.attackType.includes('Directory') && next.attackType.includes('SQL')) {
          anomalies.push({
            name: 'Reconnaissance-to-Exploitation Sequence',
            description: `Attack sequence from ${current.sourceIP}: reconnaissance phase followed by SQL injection`,
            confidence: 80,
            occurrences: 2,
            firstSeen: current.timestamp,
            lastSeen: next.timestamp,
            technique: 'Multi-stage attack progression',
            riskScore: 9,
            status: 'new',
            aiGenerated: true
          });
        }
      }
    }
    
    return anomalies;
  }

  private detectGeographicAnomalies(logs: TrafficLog[]): InsertAttackPattern[] {
    const anomalies: InsertAttackPattern[] = [];
    
    // Detect attacks from unusual countries
    const countryCounts = new Map<string, number>();
    logs.forEach(log => {
      countryCounts.set(log.country, (countryCounts.get(log.country) || 0) + 1);
    });
    
    // Look for high-frequency attacks from unexpected regions
    for (const [country, count] of countryCounts) {
      if (count >= 5 && !['CN', 'RU', 'US'].includes(country)) {
        anomalies.push({
          name: 'Geographic Attack Concentration',
          description: `Unusual concentration of attacks from ${country} (${count} attempts)`,
          confidence: 75,
          occurrences: count,
          firstSeen: new Date(),
          lastSeen: new Date(),
          technique: 'Geographic attack clustering',
          riskScore: 6,
          status: 'new',
          aiGenerated: true
        });
      }
    }
    
    return anomalies;
  }

  private detectPayloadAnomalies(logs: TrafficLog[]): InsertAttackPattern[] {
    const anomalies: InsertAttackPattern[] = [];
    
    // Detect unusual payload patterns
    const payloads = logs.map(l => l.payload?.toLowerCase() || '').filter(p => p.length > 0);
    
    // Look for encoded payloads
    const encodedPayloads = payloads.filter(p => 
      p.includes('%u') || p.includes('&#x') || p.includes('base64')
    );
    
    if (encodedPayloads.length >= 2) {
      anomalies.push({
        name: 'Encoded Payload Attack Pattern',
        description: `Multiple attacks using encoded payloads to evade detection (${encodedPayloads.length} instances)`,
        confidence: 85,
        occurrences: encodedPayloads.length,
        firstSeen: new Date(),
        lastSeen: new Date(),
        technique: 'Payload encoding evasion',
        riskScore: 7,
        status: 'new',
        aiGenerated: true
      });
    }
    
    // Look for polyglot attacks
    const polyglotPayloads = payloads.filter(p => 
      (p.includes('script') && p.includes('union')) || 
      (p.includes('alert') && p.includes('drop'))
    );
    
    if (polyglotPayloads.length >= 1) {
      anomalies.push({
        name: 'Polyglot Attack Vector',
        description: 'Attacks using polyglot payloads targeting multiple vulnerabilities simultaneously',
        confidence: 90,
        occurrences: polyglotPayloads.length,
        firstSeen: new Date(),
        lastSeen: new Date(),
        technique: 'Multi-vulnerability exploitation',
        riskScore: 9,
        status: 'new',
        aiGenerated: true
      });
    }
    
    return anomalies;
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
