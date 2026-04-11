/**
 * @file dataManagement.ts - Handles viewing and deleting performance records.
 * @date 2026-04-12
 * @description Provides a modal to list all user_topic_stats entries with delete buttons for each,
 * and a delete all button. Uses Tauri commands to delete records.
 */
import { invoke } from '@tauri-apps/api/core';
import { topics } from './constants';
import * as ui from './ui';
let modal: HTMLElement|null=null;
let dataList: HTMLElement|null=null;
export async function openDataModal() {
	modal = document.getElementById('data-modal');
	if (!modal) return;
	dataList = document.getElementById('data-list');
	await loadData();
	modal.classList.add('show');
}
async function loadData() {
	if (!dataList) return;
	const stats = await invoke('get_performance_stats', { difficulty: null, days: null }) as Array<any>;
	if (!stats || stats.length === 0) {
		dataList.innerHTML = '<p>No performance data yet. Answer some questions first.</p>';
		return;
	}
	dataList.innerHTML = '';
	for (const s of stats) {
		const topicName = topics.find(t => t.id === s.topic_id)?.name || s.topic_id;
		const acc = (s.accuracy * 100).toFixed(1);
		const div = document.createElement('div');
		div.className = 'data-item';
		div.innerHTML = `
			<div class="data-info">
				<strong>${topicName}</strong> (${s.difficulty})<br>
				Accuracy: ${acc}% | Attempts: ${s.attempts} | Avg time: ${Math.round(s.avg_time_ms)}ms
			</div>
			<button class="secondary-button delete-record" data-topic="${s.topic_id}" data-diff="${s.difficulty}">Delete</button>
		`;
		dataList.appendChild(div);
	}
	document.querySelectorAll('.delete-record').forEach(btn => {
		btn.addEventListener('click', async (e) => {
			const topic = (e.currentTarget as HTMLElement).getAttribute('data-topic');
			const diff = (e.currentTarget as HTMLElement).getAttribute('data-diff');
			if (topic && diff && confirm(`Delete all records for ${topic} (${diff})?`)) {
				await invoke('delete_performance_record', { topicId: topic, difficulty: diff });
				ui.showNotification(`Deleted ${topic} (${diff})`, 'info');
				await loadData();
			}
		});
	});
	const deleteAllBtn = document.getElementById('delete-all-btn');
	if (deleteAllBtn) {
		deleteAllBtn.onclick = async () => {
			if (confirm('Delete ALL performance data? This cannot be undone.')) {
				for (const s of stats) {
					await invoke('delete_performance_record', { topicId: s.topic_id, difficulty: s.difficulty });
				}
				ui.showNotification('All performance data deleted.', 'info');
				await loadData();
			}
		};
	}
}
export function initDataModal() {
	modal = document.getElementById('data-modal');
	if (!modal) return;
	const closeBtn = document.getElementById('data-close');
	const refreshBtn = document.getElementById('data-refresh');
	if (closeBtn) closeBtn.onclick = () => modal?.classList.remove('show');
	if (refreshBtn) refreshBtn.onclick = loadData;
}