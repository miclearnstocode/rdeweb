import { $, Request, Waiting, Toast } from '../../../lib/lib.js';

export const EmailScheduler = ({ eventId, eventName, eventDate, onScheduleComplete }) => {
    let queueData = null;
    let refreshInterval = null;
    let isInitialized = false;

    const sendNow = async () => {
        if (!confirm('Are you sure you want to send all pending emails now?')) {
            return;
        }
        
        const loading = Waiting();
        document.body.appendChild(loading);
        
        try {
            const req = new Request('/scheduleEmails');
            req.Post([
                { name: 'sendScheduledEmails', value: '1' }
            ]);
            req.Json();
            
            const result = await req.Send();
            
            if (result.status) {
                Toast(`${result.sent_count} emails sent, ${result.failed_count} failed`, 
                      result.failed_count > 0 ? 'warning' : 'success');
                refreshQueueStatus();
                if (onScheduleComplete) onScheduleComplete(result);
            } else {
                Toast(result.message || 'Failed to send emails', 'error');
            }
        } catch (error) {
            console.error('Error sending emails:', error);
            Toast('Error sending emails: ' + error.message, 'error');
        } finally {
            if (loading && loading.parentNode) {
                loading.remove();
            }
        }
    };
    
    const retryFailed = async () => {
        if (!confirm('Are you sure you want to retry all failed emails?')) {
            return;
        }
        
        const loading = Waiting();
        document.body.appendChild(loading);
        
        try {
            const req = new Request('/scheduleEmails');
            req.Post([
                { name: 'retryFailedEmails', value: '1' },
                { name: 'eventId', value: eventId || 0 }
            ]);
            req.Json();
            
            const result = await req.Send();
            
            if (result.status) {
                Toast(result.message, 'success');
                refreshQueueStatus();
                if (onScheduleComplete) onScheduleComplete(result);
            } else {
                Toast(result.message || 'Failed to retry emails', 'error');
            }
        } catch (error) {
            console.error('Error retrying emails:', error);
            Toast('Error retrying emails: ' + error.message, 'error');
        } finally {
            if (loading && loading.parentNode) {
                loading.remove();
            }
        }
    };
    
    const refreshQueueStatus = async () => {
        try {
            const req = new Request('/scheduleEmails');
            req.Post([
                { name: 'getEmailQueueStatus', value: '1' },
                { name: 'eventId', value: eventId || 0 },
                { name: 'limit', value: 50 }
            ]);
            req.Json();
            
            const result = await req.Send();
            queueData = result;
            
            // Update UI after DOM is ready
            setTimeout(() => {
                updateUI(result);
            }, 150);
        } catch (error) {
            console.error('Error refreshing queue status:', error);
        }
    };
    
    const updateUI = (data) => {
        
        // Find container
        const container = document.querySelector('.email-scheduler-container');
        if (!container) {
            console.warn('Container not found, retrying...');
            setTimeout(() => updateUI(data), 300);
            return;
        }
        
        // Update counts - find by class
        const counts = data.counts || { pending: 0, processing: 0, sent: 0, failed: 0 };
        
        // Try to find by specific class names
        const pendingEl = container.querySelector('.pending-count');
        const processingEl = container.querySelector('.processing-count');
        const sentEl = container.querySelector('.sent-count');
        const failedEl = container.querySelector('.failed-count');
        const totalEl = container.querySelector('.total-count');
        
        // Update if found
        if (pendingEl) {
            pendingEl.textContent = counts.pending || 0;
        } else {
            console.warn('pending-count element not found');
        }
        if (processingEl) processingEl.textContent = counts.processing || 0;
        if (sentEl) sentEl.textContent = counts.sent || 0;
        if (failedEl) failedEl.textContent = counts.failed || 0;
        if (totalEl) totalEl.textContent = counts.total || 0;
        
        // If not found by class, try by parent structure
        if (!pendingEl) {
            // Try to find stat cards and update by label
            const statCards = container.querySelectorAll('.stat-card');
            statCards.forEach(card => {
                const labelEl = card.querySelector('.stat-label');
                const countEl = card.querySelector('.stat-count');
                if (labelEl && countEl) {
                    const label = labelEl.textContent.trim().toLowerCase();
                    if (label.includes('pending')) countEl.textContent = counts.pending || 0;
                    else if (label.includes('processing')) countEl.textContent = counts.processing || 0;
                    else if (label.includes('sent')) countEl.textContent = counts.sent || 0;
                    else if (label.includes('failed')) countEl.textContent = counts.failed || 0;
                    else if (label.includes('total')) countEl.textContent = counts.total || 0;
                }
            });
        }
        
        // Update table
        let tableBody = container.querySelector('.queue-table-body');
        if (!tableBody) {
            const table = container.querySelector('table');
            if (table) {
                tableBody = table.querySelector('tbody');
                if (tableBody) {
                    tableBody.className = 'queue-table-body';
                }
            }
        }
        
        if (tableBody) {
            tableBody.innerHTML = '';
            
            if (data.data && data.data.length > 0) {
                data.data.forEach((item) => {
                    const row = document.createElement('tr');
                    const statusClass = item.status || 'pending';
                    
                    let scheduledDate = 'N/A';
                    if (item.scheduled_date) {
                        try {
                            const date = new Date(item.scheduled_date);
                            scheduledDate = date.toLocaleString();
                        } catch (e) {
                            scheduledDate = item.scheduled_date;
                        }
                    }
                    
                    const documentTitle = item.document_title || 'Untitled Document';
                    const authorName = item.author_name || 'N/A';
                    const authorEmail = item.author_email || 'N/A';
                    const evaluatorName = item.evaluator_name || 'Unknown Evaluator';
                    
                    row.innerHTML = `
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">
                            <div><strong>${documentTitle}</strong></div>
                            <div style="font-size:11px;color:#94a3b8;">Evaluator: ${evaluatorName}</div>
                        </td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${authorName}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${authorEmail}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">
                            <span class="status-badge ${statusClass}">${statusClass}</span>
                        </td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;">${scheduledDate}</td>
                        <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;font-size:13px;text-align:center;">${item.retry_count || 0}</td>
                    `;
                    tableBody.appendChild(row);
                });
                
                const emptyState = container.querySelector('.empty-state');
                if (emptyState) emptyState.style.display = 'none';
            } else {
                const emptyState = container.querySelector('.empty-state');
                if (emptyState) emptyState.style.display = 'table-row';
            }
        } else {
            console.warn('Table body not found');
        }
    };
    
    const startAutoRefresh = () => {
        if (refreshInterval) clearInterval(refreshInterval);
        refreshInterval = setInterval(refreshQueueStatus, 30000);
    };
    
    const stopAutoRefresh = () => {
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    };
    
    const cleanup = () => {
        stopAutoRefresh();
    };
    
    const render = () => {
        let displayDate = eventDate || 'No date set';
        
        return $({
            tag: 'div',
            att: { className: 'email-scheduler-container' },
            style: {
                padding: '20px',
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            },
            child: [
                // Header
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                        paddingBottom: '15px',
                        borderBottom: '2px solid #f1f5f9'
                    },
                    child: [
                        $({
                            tag: 'div',
                            child: [
                                $({
                                    tag: 'h3',
                                    text: '📧 Email Queue Monitor',
                                    style: { margin: '0 0 5px 0', fontSize: '18px', color: '#0f172a' }
                                }),
                                $({
                                    tag: 'p',
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: eventName ? `Event: ${eventName}` : 'No event selected',
                                            style: { fontSize: '14px', color: '#64748b' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: ' | ',
                                            style: { fontSize: '14px', color: '#64748b' }
                                        }),
                                        $({
                                            tag: 'span',
                                            text: `📅 ${displayDate}`,
                                            style: { fontSize: '14px', color: '#64748b' }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'p',
                                    text: 'Emails are automatically queued when evaluators save comments and sent by cron job every 10 minutes.',
                                    style: { margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            style: { display: 'flex', gap: '8px' },
                            child: [
                                $({
                                    tag: 'button',
                                    text: '🔄 Refresh',
                                    style: {
                                        padding: '6px 16px',
                                        background: '#f1f5f9',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '13px',
                                        color: '#475569',
                                        transition: 'all 0.2s'
                                    },
                                    event: {
                                        type: 'click',
                                        method: refreshQueueStatus,
                                        mouseenter: (e) => { e.target.style.background = '#e2e8f0'; },
                                        mouseleave: (e) => { e.target.style.background = '#f1f5f9'; }
                                    }
                                })
                            ]
                        })
                    ]
                }),
                
                // Stats - with unique class names and IDs for easy targeting
                $({
                    tag: 'div',
                    style: {
                        display: 'grid',
                        gridTemplateColumns: 'repeat(5, 1fr)',
                        gap: '12px',
                        marginBottom: '20px'
                    },
                    child: [
                        $({
                            tag: 'div',
                            att: { className: 'stat-card' },
                            style: { background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' },
                            child: [
                                $({ tag: 'div', text: '⏳ Pending', att: { className: 'stat-label' }, style: { fontSize: '12px', color: '#64748b' } }),
                                $({ tag: 'div', att: { className: 'pending-count stat-count' }, text: '0', style: { fontSize: '24px', fontWeight: '700', color: '#f59e0b' } })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'stat-card' },
                            style: { background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' },
                            child: [
                                $({ tag: 'div', text: '🔄 Processing', att: { className: 'stat-label' }, style: { fontSize: '12px', color: '#64748b' } }),
                                $({ tag: 'div', att: { className: 'processing-count stat-count' }, text: '0', style: { fontSize: '24px', fontWeight: '700', color: '#3b82f6' } })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'stat-card' },
                            style: { background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' },
                            child: [
                                $({ tag: 'div', text: '✅ Sent', att: { className: 'stat-label' }, style: { fontSize: '12px', color: '#64748b' } }),
                                $({ tag: 'div', att: { className: 'sent-count stat-count' }, text: '0', style: { fontSize: '24px', fontWeight: '700', color: '#22c55e' } })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'stat-card' },
                            style: { background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' },
                            child: [
                                $({ tag: 'div', text: '❌ Failed', att: { className: 'stat-label' }, style: { fontSize: '12px', color: '#64748b' } }),
                                $({ tag: 'div', att: { className: 'failed-count stat-count' }, text: '0', style: { fontSize: '24px', fontWeight: '700', color: '#ef4444' } })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: { className: 'stat-card' },
                            style: { background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' },
                            child: [
                                $({ tag: 'div', text: '📊 Total', att: { className: 'stat-label' }, style: { fontSize: '12px', color: '#64748b' } }),
                                $({ tag: 'div', att: { className: 'total-count stat-count' }, text: '0', style: { fontSize: '24px', fontWeight: '700', color: '#0f172a' } })
                            ]
                        })
                    ]
                }),
                
                // Admin Actions
                $({
                    tag: 'div',
                    style: {
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '20px',
                        padding: '15px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        alignItems: 'center',
                        border: '1px solid #e2e8f0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: { display: 'flex', alignItems: 'center', gap: '8px' },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-info-circle' }, style: { color: '#3b82f6', fontSize: '16px' } }),
                                $({ tag: 'span', text: 'Admin Actions:', style: { fontSize: '14px', fontWeight: '600', color: '#475569' } })
                            ]
                        }),
                        $({
                            tag: 'button',
                            text: '📤 Send Now',
                            style: {
                                padding: '6px 20px',
                                background: '#22c55e',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            },
                            event: {
                                type: 'click',
                                method: sendNow,
                                mouseenter: (e) => { e.target.style.background = '#16a34a'; },
                                mouseleave: (e) => { e.target.style.background = '#22c55e'; }
                            }
                        }),
                        $({
                            tag: 'button',
                            text: '🔄 Retry Failed',
                            style: {
                                padding: '6px 16px',
                                background: '#f59e0b',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '13px',
                                fontWeight: '500',
                                transition: 'all 0.2s'
                            },
                            event: {
                                type: 'click',
                                method: retryFailed,
                                mouseenter: (e) => { e.target.style.background = '#d97706'; },
                                mouseleave: (e) => { e.target.style.background = '#f59e0b'; }
                            }
                        }),
                        $({
                            tag: 'div',
                            style: { marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' },
                            text: '⏰ Cron runs every 10 minutes'
                        })
                    ]
                }),
                
                // Queue Table
                $({
                    tag: 'div',
                    style: {
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        overflow: 'hidden'
                    },
                    child: [
                        $({
                            tag: 'table',
                            style: {
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: '13px'
                            },
                            child: [
                                $({
                                    tag: 'thead',
                                    style: { background: '#f8fafc' },
                                    child: [
                                        $({
                                            tag: 'tr',
                                            child: [
                                                $({ tag: 'th', text: 'Document', style: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' } }),
                                                $({ tag: 'th', text: 'Author', style: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' } }),
                                                $({ tag: 'th', text: 'Recipient', style: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' } }),
                                                $({ tag: 'th', text: 'Status', style: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' } }),
                                                $({ tag: 'th', text: 'Scheduled', style: { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#475569' } }),
                                                $({ tag: 'th', text: 'Retries', style: { padding: '10px 12px', textAlign: 'center', fontWeight: '600', color: '#475569' } })
                                            ]
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'tbody',
                                    att: { className: 'queue-table-body' },
                                    child: [
                                        $({
                                            tag: 'tr',
                                            att: { className: 'empty-state' },
                                            child: [
                                                $({
                                                    tag: 'td',
                                                    att: { colspan: '6' },
                                                    style: { padding: '40px', textAlign: 'center', color: '#94a3b8' },
                                                    child: [
                                                        $({ tag: 'div', text: '📭', style: { fontSize: '32px', marginBottom: '8px' } }),
                                                        $({ tag: 'div', text: 'No scheduled emails found', style: { fontSize: '14px' } })
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                })
                            ]
                        })
                    ]
                }),
                
                // Auto-refresh indicator
                $({
                    tag: 'div',
                    style: {
                        marginTop: '12px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        textAlign: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                    },
                    child: [
                        $({ tag: 'span', att: { className: 'fa-solid fa-circle' }, style: { color: '#22c55e', fontSize: '8px' } }),
                        $({ tag: 'span', text: 'Auto-refreshes every 30 seconds' })
                    ]
                })
            ],
            elementHandler: (el) => {
                if (!isInitialized) {
                    isInitialized = true;
                    // Initial load after DOM is ready
                    setTimeout(() => {
                        refreshQueueStatus();
                        startAutoRefresh();
                    }, 500);
                }
            }
        });
    };
    
    return render();
};