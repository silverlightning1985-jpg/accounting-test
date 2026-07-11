const LEVELS = [
  {
    key: 'entry',
    min: 0,
    max: 3,
    label: '会计助理／初级',
    range: '0–3 分',
    tone: 'entry',
    summary: '具备基本会计概念，但仍需要清晰的流程、复核与岗位指导。',
    followUp: '请面试官追问：你平时会如何确认一笔分录没有漏记或错记？'
  },
  {
    key: 'operator',
    min: 4,
    max: 6,
    label: '会计执行员',
    range: '4–6 分',
    tone: 'operator',
    summary: '能够处理常见会计工作，但面对跨项目或异常事项时需要复核支持。',
    followUp: '请面试官追问：你遇到对账差异时，会按什么顺序排查？'
  },
  {
    key: 'senior',
    min: 7,
    max: 9,
    label: '资深会计',
    range: '7–9 分',
    tone: 'senior',
    summary: '能够把会计处理、期末复核与经营数字联系起来，适合独立承担较完整的工作范围。',
    followUp: '请面试官追问：你会怎样向非财务同事解释现金流与利润的差异？'
  },
  {
    key: 'lead',
    min: 10,
    max: 12,
    label: '会计主管／分析方向',
    range: '10–12 分',
    tone: 'lead',
    summary: '展现出较完整的会计判断与分析框架，可进一步评估其复核、带人和经营分析能力。',
    followUp: '请面试官追问：如果要提升部门月结质量，你会先建立哪些控制点？'
  }
];

export function getLevel(total) {
  const safeTotal = Math.max(0, Math.min(12, Number(total) || 0));
  return LEVELS.find((level) => safeTotal >= level.min && safeTotal <= level.max) ?? LEVELS[0];
}

function findOption(question, optionId) {
  return question.options.find((option) => option.id === optionId);
}

export function scoreAssessment({ candidate, answers, questions }) {
  const missing = [];
  const name = candidate?.name?.trim() ?? '';
  const role = candidate?.role?.trim() ?? '';

  if (!name) missing.push('姓名');
  if (!role) missing.push('应征岗位');

  const breakdown = questions.map((question) => {
    const option = findOption(question, answers?.[question.id]);
    if (!option) missing.push(`第 ${question.number ?? question.id.replace('q', '')} 题`);

    return {
      questionId: question.id,
      number: question.number,
      skill: question.skill,
      selectedText: option?.text ?? '',
      score: option?.score ?? 0,
      feedback: option?.feedback ?? ''
    };
  });

  if (missing.length > 0) {
    return { valid: false, missing };
  }

  const total = breakdown.reduce((sum, item) => sum + item.score, 0);
  const level = getLevel(total);

  return {
    valid: true,
    total,
    level,
    summary: `${level.label}：${level.summary}`,
    followUp: level.followUp,
    breakdown
  };
}
