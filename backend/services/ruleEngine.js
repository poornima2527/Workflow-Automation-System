class RuleEngine {
  constructor() {
    this.maxIterations = 100;
  }

  evaluateCondition(condition, data) {
    try {
      const sanitizedCondition = this.sanitizeCondition(condition);
      
      const func = new Function('data', `
        const { amount, country, department, priority, ...rest } = data;
        return ${sanitizedCondition};
      `);
      
      return func(data);
    } catch (error) {
      console.error('Error evaluating condition:', error);
      return false;
    }
  }

  sanitizeCondition(condition) {
    let sanitized = condition.trim();
    
    sanitized = sanitized.replace(/contains\(/g, 'String(');
    sanitized = sanitized.replace(/startsWith\(/g, 'String(');
    sanitized = sanitized.replace(/endsWith\(/g, 'String(');
    
    sanitized = sanitized.replace(/contains\(([^,]+),\s*"([^"]+)"\)/g, '$1.includes("$2")');
    sanitized = sanitized.replace(/startsWith\(([^,]+),\s*"([^"]+)"\)/g, '$1.startsWith("$2")');
    sanitized = sanitized.replace(/endsWith\(([^,]+),\s*"([^"]+)"\)/g, '$1.endsWith("$2")');
    
    return sanitized;
  }

  async evaluateRules(rules, data) {
    if (!rules || rules.length === 0) {
      return null;
    }

    const sortedRules = rules.sort((a, b) => a.priority - b.priority);
    
    for (const rule of sortedRules) {
      try {
        const result = this.evaluateCondition(rule.condition, data);
        
        if (result) {
          return {
            rule: rule,
            next_step_id: rule.next_step_id,
            is_default: rule.is_default || false
          };
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error);
        continue;
      }
    }

    const defaultRule = sortedRules.find(rule => rule.is_default);
    if (defaultRule) {
      return {
        rule: defaultRule,
        next_step_id: defaultRule.next_step_id,
        is_default: true
      };
    }

    throw new Error('No matching rule found and no default rule specified');
  }

  validateCondition(condition) {
    try {
      const testData = {
        amount: 100,
        country: 'US',
        department: 'IT',
        priority: 'High',
        test: 'value'
      };

      this.evaluateCondition(condition, testData);
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  checkForInfiniteLoop(executionLog) {
    const stepSequence = executionLog.map(log => log.step_name);
    const recentSteps = stepSequence.slice(-10);
    
    const uniqueSteps = new Set(recentSteps);
    if (uniqueSteps.size <= 2 && recentSteps.length >= 6) {
      return true;
    }
    
    return false;
  }
}

module.exports = new RuleEngine();
