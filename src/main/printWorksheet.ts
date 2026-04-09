// src/main/printWorksheet.ts
/**
 * @file printWorksheet.ts - Handles printable worksheet generation (Kuta-style)
 * @date 2026-04-05
 * @description Generates a standalone HTML document with questions and optional answer key,
 * using MathJax for LaTeX rendering. Properly cleans up #question-area after each generation
 * so no canvas, Three.js, or other artifacts remain in the main UI.
 */

import { topics, scopeTopics } from "./constants";
import { generateQuestion as callGenerator } from "./questionGenerator";
import * as dom from "./dom";

let modal: HTMLElement | null = null;
let questionCountSelect: HTMLSelectElement | null = null;
let topicSelect: HTMLSelectElement | null = null;
let scopeSelect: HTMLSelectElement | null = null;
let difficultySelect: HTMLSelectElement | null = null;
let answerKeyCheckbox: HTMLInputElement | null = null;

/**
 * Escapes HTML special characters to prevent injection issues.
 */
function escapeHtml(str: string): string {
    return str.replace(/[&<>]/g, (m) => {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * Wraps plain math text with \( ... \) if it looks like LaTeX.
 */
function wrapLatexIfNeeded(text: string): string {
    if (text.match(/\\\(.*\\\)/) || text.match(/\$\$.*\$\$/)) return text;
    if (/\\[a-zA-Z]+|[_^]|[\{\}]/.test(text)) {
        return `\\(${text}\\)`;
    }
    return text;
}

/**
 * Extracts clean text from the generated question HTML and converts it to safe printable lines.
 * This approach avoids carrying over raw DOM elements (canvas, Three.js, etc.) into the printout.
 */
function cleanQuestionText(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Get only visible text content (this removes canvas/Three.js elements automatically)
    let text = tempDiv.textContent || tempDiv.innerText || '';

    // Normalize whitespace
    text = text.replace(/\r\n/g, '\n')
               .replace(/\n\s*\n/g, '\n')
               .trim();

    const lines = text.split('\n')
                      .map(l => l.trim())
                      .filter(l => l.length > 0);

    // Remove duplicate consecutive lines
    const uniqueLines: string[] = [];
    for (let i = 0; i < lines.length; i++) {
        if (i === 0 || lines[i] !== lines[i - 1]) {
            uniqueLines.push(lines[i]);
        }
    }

    // Return as safely escaped HTML with line breaks
    return uniqueLines
        .map(l => `<span class="question-line">${escapeHtml(l)}</span>`)
        .join('<br>');
}

/**
 * Generates one question while protecting the main UI state.
 * Restores original content and correctAnswer after generation.
 */
async function generateQuestionText(topicId: string, difficulty: string): Promise<{ html: string; answerDisplay: string }> {
    if (!dom.questionArea) {
        return { html: "Error: Question area not found", answerDisplay: "" };
    }

    const originalHtml = dom.questionArea.innerHTML;
    const originalCorrectAnswer = (window as any).correctAnswer;

    try {
        // Clear the area before generating new question (prevents ghosting)
        dom.questionArea.innerHTML = '';

        // Generate the new question
        callGenerator(topicId, difficulty);

        // Short wait for generation to complete
        await new Promise(resolve => setTimeout(resolve, 80));

        // Capture and clean the output (text only → no canvas/Three.js left behind)
        const rawHtml = dom.questionArea.innerHTML || '';
        const cleanedHtml = cleanQuestionText(rawHtml);

        // Get answer
        const ansObj = (window as any).correctAnswer;
        let answer = ansObj?.correct || '';
        let answerDisplay = ansObj?.display || answer;

        // Special handling for system of equations if needed
        if (answerDisplay.includes('{') && (answerDisplay.includes('x') || answerDisplay.includes('y'))) {
            answerDisplay = answerDisplay.replace(/\{/g, '\\{').replace(/\}/g, '\\}');
        }

        answerDisplay = wrapLatexIfNeeded(answerDisplay);

        return { html: cleanedHtml, answerDisplay };

    } finally {
        // === CRITICAL: Always restore original state ===
        dom.questionArea.innerHTML = originalHtml;
        (window as any).correctAnswer = originalCorrectAnswer;
    }
}

/**
 * Updates the topic dropdown based on selected scope.
 */
function updateTopicDropdown(): void {
    if (!topicSelect || !scopeSelect) return;

    const scope = scopeSelect.value;
    const allowedIds = scopeTopics[scope as keyof typeof scopeTopics] || scopeTopics.all;
    const filteredTopics = topics.filter(t => allowedIds.includes(t.id));

    topicSelect.innerHTML = '<option value="all">All topics (from selected scope)</option>';

    for (const t of filteredTopics) {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        topicSelect.appendChild(opt);
    }
}

async function generateWorksheet(): Promise<void> {
    const count = parseInt(questionCountSelect?.value || '10', 10);
    const topic = topicSelect?.value || 'all';
    const scope = scopeSelect?.value || 'all';
    const difficulty = difficultySelect?.value || 'medium';
    const includeAnswers = answerKeyCheckbox?.checked || false;

    let topicList: string[] = [];
    if (topic === 'all') {
        const allowedIds = scopeTopics[scope as keyof typeof scopeTopics] || scopeTopics.all;
        topicList = allowedIds;
    } else {
        topicList = [topic];
    }

    if (topicList.length === 0) {
        alert('No topics available in this scope.');
        return;
    }

    const questions: Array<{ html: string; answerDisplay: string }> = [];

    // Generate questions one by one
    for (let i = 0; i < count; i++) {
        const selectedTopic = topicList[Math.floor(Math.random() * topicList.length)];
        const diff = difficulty === 'mixed'
            ? ['easy', 'medium', 'hard'][Math.floor(Math.random() * 3)]
            : difficulty;

        const q = await generateQuestionText(selectedTopic, diff);
        questions.push(q);
    }

    // Build the printable document
    let docHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Math Worksheet</title>
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js" defer></script>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            font-size: 12.5pt;
            margin: 0.75in;
            padding: 0;
            background: white;
            color: black;
            line-height: 1.45;
        }
        @page { margin: 0.75in; }
        h1, h2 { text-align: center; }
        hr { margin: 25px 0; }
        .questions-list {
            list-style: none;
            counter-reset: question-counter;
            padding-left: 0;
        }
        .question-item {
            margin-bottom: 45px;
            counter-increment: question-counter;
            position: relative;
            padding-left: 38px;
        }
        .question-item:before {
            content: counter(question-counter) ".";
            position: absolute;
            left: 0;
            font-weight: bold;
        }
        .question-text {
            margin-bottom: 12px;
        }
        .question-line {
            display: block;
            margin: 3px 0;
        }
        .answer-space {
            height: 1.4em;
            border-bottom: 1px solid #000;
            width: 70%;
            margin-top: 8px;
        }
        .answer-key {
            page-break-before: always;
        }
        .answer-key ol {
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="worksheet">
        <h1>Math Worksheet</h1>
        <p>Topic: ${topic === 'all' ? `Scope: ${scope}` : (topics.find(t => t.id === topic)?.name || topic)}</p>
        <p>Difficulty: ${difficulty}</p>
        <hr>
        <ol class="questions-list">`;

    for (const q of questions) {
        docHtml += `
            <li class="question-item">
                <div class="question-text">${q.html}</div>
                <div class="answer-space"></div>
            </li>`;
    }

    docHtml += `</ol>`;

    if (includeAnswers) {
        docHtml += `<div class="answer-key"><h2>Answer Key</h2><ol>`;
        for (const q of questions) {
            docHtml += `<li>${q.answerDisplay}</li>`;
        }
        docHtml += `</ol></div>`;
    }

    docHtml += `
    </div>

    <script>
        window.addEventListener('load', function() {
            if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
                window.MathJax.typesetPromise()
                    .then(() => {
                        setTimeout(() => window.print(), 800);
                    })
                    .catch(() => {
                        setTimeout(() => window.print(), 1500);
                    });
            } else {
                setTimeout(() => window.print(), 2000);
            }
        });
    </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (printWindow) {
        printWindow.document.write(docHtml);
        printWindow.document.close();
        printWindow.focus();
    } else {
        alert("Popup was blocked. Please allow pop-ups for this website.");
    }
}

export function openPrintModal(): void {
    modal?.classList.add('show');
}

export function initPrintModal(): void {
    modal = document.getElementById('print-modal');
    if (!modal) return;

    questionCountSelect = document.getElementById('print-question-count') as HTMLSelectElement;
    topicSelect = document.getElementById('print-topic') as HTMLSelectElement;
    scopeSelect = document.getElementById('print-scope') as HTMLSelectElement;
    difficultySelect = document.getElementById('print-difficulty') as HTMLSelectElement;
    answerKeyCheckbox = document.getElementById('print-answer-key') as HTMLInputElement;

    const generateBtn = document.getElementById('print-generate');
    const closeBtn = document.getElementById('print-close');

    if (closeBtn) closeBtn.addEventListener('click', () => modal?.classList.remove('show'));
    if (generateBtn) generateBtn.addEventListener('click', generateWorksheet);

    scopeSelect?.addEventListener('change', updateTopicDropdown);
    updateTopicDropdown();
}