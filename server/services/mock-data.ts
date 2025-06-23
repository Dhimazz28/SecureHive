import type { InsertTrafficLog, InsertSystemMetrics, InsertDatasetStats, InsertAttackPattern } from "@shared/schema";

export class MockDataGenerator {
  private countries = ['CN', 'RU', 'US', 'BR', 'IN', 'DE', 'FR', 'UK', 'JP', 'KR'];
  private attackTypes = [
    'SQL Injection', 'XSS Attempt', 'Brute Force', 'DDoS Attack', 
    'Directory Traversal', 'Command Injection', 'Cross-Site Request Forgery',
    'Authentication Bypass', 'Buffer Overflow', 'Code Injection'
  ];
  private targets = [
    '/admin/login.php', '/wp-admin/', '/login', '/admin/', '/api/users',
    '/search?q=', '/upload.php', '/index.php', '/config.php', '/database.php'
  ];
  private methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  private severities = ['high', 'medium', 'low'];
  private statuses = ['blocked', 'monitored', 'analyzed'];
  private userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    'curl/7.68.0',
    'python-requests/2.25.1',
    'Wget/1.20.3'
  ];

  generateTrafficLog(): InsertTrafficLog {
    const now = new Date();
    const timestamp = new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000); // Within last 24 hours

    return {
      timestamp,
      sourceIP: this.generateRandomIP(),
      country: this.getRandomItem(this.countries),
      attackType: this.getRandomItem(this.attackTypes),
      target: this.getRandomItem(this.targets),
      severity: this.getRandomItem(this.severities),
      status: this.getRandomItem(this.statuses),
      payload: this.generatePayload(),
      userAgent: this.getRandomItem(this.userAgents),
      method: this.getRandomItem(this.methods),
      port: Math.random() > 0.8 ? 443 : 80
    };
  }

  generateSystemMetrics(): InsertSystemMetrics {
    return {
      attacksToday: Math.floor(Math.random() * 100) + 200,
      uniqueIPs: Math.floor(Math.random() * 30) + 70,
      aiDetections: Math.floor(Math.random() * 50) + 140,
      blockedAttempts: Math.floor(Math.random() * 500) + 1500,
      uptime: this.generateUptime(),
      lastUpdated: new Date()
    };
  }

  generateDatasetStats(): InsertDatasetStats {
    return {
      sqlSamples: Math.floor(Math.random() * 1000) + 15000,
      bruteForceSamples: Math.floor(Math.random() * 1000) + 12000,
      xssSamples: Math.floor(Math.random() * 500) + 8500,
      ddosPatterns: Math.floor(Math.random() * 500) + 6000,
      modelAccuracy: Math.floor(Math.random() * 5) + 92, // 92-97%
      lastRetraining: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    };
  }

  generateAttackPattern(): InsertAttackPattern {
    const patterns = [
      {
        name: 'Advanced SQL Injection Variant',
        description: 'Sophisticated SQL injection using encoded payloads and time-based techniques',
        technique: 'Union-based injection with encoding'
      },
      {
        name: 'Hybrid Brute Force Attack',
        description: 'Combination of dictionary and brute force attacks with distributed source IPs',
        technique: 'Distributed credential stuffing'
      },
      {
        name: 'Polymorphic XSS Pattern',
        description: 'XSS attempts using dynamic payload generation to evade detection',
        technique: 'DOM-based XSS with obfuscation'
      },
      {
        name: 'Zero-Day Exploit Attempt',
        description: 'Previously unknown attack vector targeting specific application vulnerabilities',
        technique: 'Buffer overflow with shellcode injection'
      },
      {
        name: 'AI-Evading Command Injection',
        description: 'Command injection using obfuscated techniques to bypass ML detection',
        technique: 'Base64 encoded command execution'
      },
      {
        name: 'Multi-Vector DDoS Campaign',
        description: 'Coordinated attack using multiple protocols and attack vectors simultaneously',
        technique: 'Layer 3/4/7 hybrid amplification'
      },
      {
        name: 'Steganographic Data Exfiltration',
        description: 'Data theft using hidden channels in legitimate-looking traffic',
        technique: 'DNS tunneling with encrypted payloads'
      },
      {
        name: 'Living-off-the-Land Attack',
        description: 'Attack using legitimate system tools to avoid detection',
        technique: 'PowerShell fileless execution'
      }
    ];

    const pattern = this.getRandomItem(patterns);
    const now = new Date();
    const firstSeen = new Date(now.getTime() - Math.random() * 12 * 60 * 60 * 1000); // Within last 12 hours

    return {
      name: pattern.name,
      description: pattern.description,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      occurrences: Math.floor(Math.random() * 50) + 5,
      firstSeen,
      lastSeen: now,
      technique: pattern.technique,
      riskScore: Math.floor(Math.random() * 4) + 6, // 6-10
      status: Math.random() > 0.5 ? 'new' : 'under_review',
      aiGenerated: true
    };
  }

  private generateRandomIP(): string {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  private generatePayload(): string {
    const payloads = [
      "' OR '1'='1",
      '<script>alert("XSS")</script>',
      '../../../etc/passwd',
      'admin\' --',
      'UNION SELECT * FROM users--',
      '<img src=x onerror=alert(1)>',
      '; DROP TABLE users; --'
    ];
    return this.getRandomItem(payloads);
  }

  private generateUptime(): string {
    const days = Math.floor(Math.random() * 30);
    const hours = Math.floor(Math.random() * 24);
    const minutes = Math.floor(Math.random() * 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
}

export const mockDataGenerator = new MockDataGenerator();
