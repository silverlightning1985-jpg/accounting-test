import { questions } from './questions.js';
import { scoreAssessment } from './scoring.js';

const form = document.querySelector('#assessment-form');
const nameInput = document.querySelector('#candidate-name');
const roleInput = document.querySelector('#candidate-role');
const dateInput = document.querySelector('#assessment-date');
const questionList = document.querySelector('#question-list');
const answeredCount = document.querySelector('#answered-count');
const progressBar = document.querySelector('#progress-bar');
const formFeedback = document.querySelector('#form-feedback');
const submitButton = document.querySelector('#submit-button');
const resultPanel = document.querySelector('#result-panel');
const resetButton = document.querySelector('#reset-button');

const state = {
  answers: {},
  submitted: false
};

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

function renderQuestions() {
  questionList.innerHTML = questions.map((question) => `
    <article class="question-card" data-question-id="${question.id}">
      <div class="question-meta">
        <span class="question-number">Q${String(question.number).padStart(2, '0')}</span>
        <span class="question-skill">${question.skill}</span>
        <span class="question-status" data-status-for="${question.id}">未完成</span>
      </div>
      <h3>${question.prompt}</h3>
      <div class="option-grid">
        ${question.options.map((option, index) => `
          <label class="option-card">
            <input type="radio" name="${question.id}" value="${option.id}" />
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option.text}</span>
            <span class="option-check" aria-hidden="true">✓</span>
          </label>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function updateProgress() {
  const completed = Object.keys(state.answers).length;
  answeredCount.textContent = String(completed);
  progressBar.style.width = `${(completed / questions.length) * 100}%`;

  for (const question of questions) {
    const card = questionList.querySelector(`[data-question-id="${question.id}"]`);
    const status = card.querySelector(`[data-status-for="${question.id}"]`);
    const isAnswered = Boolean(state.answers[question.id]);
    card.classList.toggle('is-complete', isAnswered);
    status.textContent = isAnswered ? '已完成' : '未完成';
  }
}

function clearValidation() {
  formFeedback.textContent = '';
  formFeedback.classList.remove('is-visible');
  nameInput.classList.remove('is-invalid');
  roleInput.classList.remove('is-invalid');
  questionList.querySelectorAll('.question-card').forEach((card) => card.classList.remove('is-missing'));
}

function showValidation(missing) {
  clearValidation();
  formFeedback.textContent = `请先补齐：${missing.join('、')}。`;
  formFeedback.classList.add('is-visible');

  if (missing.includes('姓名')) nameInput.classList.add('is-invalid');
  if (missing.includes('应征岗位')) roleInput.classList.add('is-invalid');
  for (const question of questions) {
    if (missing.includes(`第 ${question.number} 题`)) {
      questionList.querySelector(`[data-question-id="${question.id}"]`).classList.add('is-missing');
    }
  }

  if (missing.includes('姓名')) nameInput.focus();
  else if (missing.includes('应征岗位')) roleInput.focus();
  else {
    const firstMissingQuestion = questions.find((question) => missing.includes(`第 ${question.number} 题`));
    questionList.querySelector(`[data-question-id="${firstMissingQuestion.id}"] input`)?.focus();
  }
}

function renderResult(result) {
  document.querySelector('#result-score').textContent = String(result.total);
  document.querySelector('#result-score-bar').style.width = `${(result.total / 12) * 100}%`;
  document.querySelector('#result-level').textContent = result.level.label;
  document.querySelector('#result-level').dataset.tone = result.level.tone;
  document.querySelector('#result-title').textContent = `${nameInput.value.trim()} 的能力结果`;
  document.querySelector('#result-summary').textContent = result.summary;
  document.querySelector('#result-follow-up').textContent = result.followUp;

  document.querySelector('#result-breakdown').innerHTML = result.breakdown.map((item) => `
    <article class="breakdown-item">
      <div class="breakdown-item-head">
        <div><span class="breakdown-number">Q${String(item.number).padStart(2, '0')}</span><span>${item.skill}</span></div>
        <span class="breakdown-score">${item.score} / 3</span>
      </div>
      <p class="breakdown-answer">${item.selectedText}</p>
      <p class="breakdown-feedback">${item.feedback}</p>
    </article>
  `).join('');

  resultPanel.hidden = false;
  resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function lockAssessment() {
  state.submitted = true;
  form.classList.add('is-locked');
  form.querySelectorAll('input, button').forEach((control) => {
    control.disabled = true;
  });
  submitButton.disabled = true;
}

function resetAssessment() {
  state.answers = {};
  state.submitted = false;
  form.reset();
  dateInput.value = formatDate();
  form.classList.remove('is-locked');
  form.querySelectorAll('input, button').forEach((control) => {
    control.disabled = false;
  });
  resultPanel.hidden = true;
  clearValidation();
  updateProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  nameInput.focus();
}

questionList.addEventListener('change', (event) => {
  if (event.target.matches('input[type="radio"]')) {
    state.answers[event.target.name] = event.target.value;
    const card = event.target.closest('.question-card');
    card.classList.remove('is-missing');
    updateProgress();
  }
});

nameInput.addEventListener('input', () => nameInput.classList.remove('is-invalid'));
roleInput.addEventListener('input', () => roleInput.classList.remove('is-invalid'));

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (state.submitted) return;

  const result = scoreAssessment({
    candidate: { name: nameInput.value, role: roleInput.value },
    answers: state.answers,
    questions
  });

  if (!result.valid) {
    showValidation(result.missing);
    return;
  }

  clearValidation();
  renderResult(result);
  lockAssessment();
});

resetButton.addEventListener('click', resetAssessment);

dateInput.value = formatDate();
renderQuestions();
updateProgress();
