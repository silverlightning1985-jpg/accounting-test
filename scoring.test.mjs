import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, scoreAssessment } from '../scoring.js';
import { questions as questionBank } from '../questions.js';

const questions = [
  {
    id: 'q1',
    options: [
      { id: 'q1-a', score: 0, feedback: '只记录现金支出，未确认预付资产。' },
      { id: 'q1-b', score: 1, feedback: '方向接近，但借贷科目不完整。' },
      { id: 'q1-c', score: 2, feedback: '能识别预付费用，但缺少后续摊销意识。' },
      { id: 'q1-d', score: 3, feedback: '借记预付费用、贷记现金，并能说明后续摊销。' }
    ]
  },
  {
    id: 'q2',
    options: [
      { id: 'q2-a', score: 0, feedback: '忽略期末确认义务。' },
      { id: 'q2-b', score: 1, feedback: '能发现差异，但没有说明调整方式。' },
      { id: 'q2-c', score: 2, feedback: '能完成主要调整，但缺少复核步骤。' },
      { id: 'q2-d', score: 3, feedback: '能区分未达账项与应计事项，并安排复核。' }
    ]
  },
  {
    id: 'q3',
    options: [
      { id: 'q3-a', score: 0, feedback: '只看单一指标，无法解释现金流差异。' },
      { id: 'q3-b', score: 1, feedback: '提出方向，但没有明确检查顺序。' },
      { id: 'q3-c', score: 2, feedback: '能关注应收或存货，但分析范围不完整。' },
      { id: 'q3-d', score: 3, feedback: '能按应收、存货、资本性支出与营运资金顺序排查。' }
    ]
  }
];

test('maps score boundaries to the four job levels', () => {
  assert.equal(getLevel(0).label, '会计助理／初级');
  assert.equal(getLevel(3).label, '会计助理／初级');
  assert.equal(getLevel(4).label, '会计执行员');
  assert.equal(getLevel(6).label, '会计执行员');
  assert.equal(getLevel(7).label, '资深会计');
  assert.equal(getLevel(9).label, '资深会计');
  assert.equal(getLevel(10).label, '会计主管／分析方向');
  assert.equal(getLevel(12).label, '会计主管／分析方向');
});

test('rejects incomplete candidate data and answers', () => {
  const result = scoreAssessment({
    candidate: { name: '  ', role: '' },
    answers: { q1: 'q1-d', q2: 'q2-c' },
    questions
  });

  assert.deepEqual(result, {
    valid: false,
    missing: ['姓名', '应征岗位', '第 3 题']
  });
});

test('returns total, level, summary, follow-up, and breakdown for a complete assessment', () => {
  const result = scoreAssessment({
    candidate: { name: '陈小明', role: '会计执行员' },
    answers: { q1: 'q1-d', q2: 'q2-c', q3: 'q3-c' },
    questions
  });

  assert.equal(result.valid, true);
  assert.equal(result.total, 7);
  assert.equal(result.level.label, '资深会计');
  assert.equal(result.breakdown.length, 3);
  assert.equal(result.breakdown[0].score, 3);
  assert.equal(result.breakdown[1].feedback, '能完成主要调整，但缺少复核步骤。');
  assert.match(result.summary, /资深会计/);
  assert.ok(result.followUp.length > 0);
});

test('contains three questions with four options scored from 0 to 3', () => {
  assert.equal(questionBank.length, 3);
  for (const question of questionBank) {
    assert.equal(question.options.length, 4);
    assert.deepEqual(
      question.options.map((option) => option.score),
      [0, 1, 2, 3]
    );
  }
});
