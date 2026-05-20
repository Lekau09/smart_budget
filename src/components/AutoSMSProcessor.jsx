import React, { useState, useEffect, useRef } from 'react';
import { API_BASE, parseSMSBulk, checkMLHealth } from '../config/api';
import { useNotification } from '../context/NotificationContext';

const CATEGORY_ICONS = {
  Food: '🍴', Groceries: '🛒', Transport: '🚌',
  Entertainment: '🎭', Health: '💊', Utilities: '⚡',
  Shopping: '🛍️', Other: '❓'
};

const AUTO_SAVE_CONFIDENCE_THRESHOLD = 0.75; // Auto-save if >= 75% confident

// Persist processed SMS IDs across remounts using localStorage
function loadProcessedIds() {
  try {
    const stored = localStorage.getItem('sb_processed_sms_ids');
    return new Set(stored ? JSON.parse(stored) : []);
  } catch { return new Set(); }
}
function saveProcessedId(id) {
  try {
    const existing = loadProcessedIds();
    existing.add(id);
    // Keep last 500 IDs to avoid unbounded growth
    const arr = [...existing].slice(-500);
    localStorage.setItem('sb_processed_sms_ids', JSON.stringify(arr));
  } catch {}
}

export default function AutoSMSProcessor({ userId, onTransactionAdded, onBudgetUpdate }) {
  const [autoProcessing, setAutoProcessing] = useState(true);
  const [processedCount, setProcessedCount] = useState(0);
  const { addNotification } = useNotification();
  const processingRef = useRef(loadProcessedIds());
  const busyRef = useRef(false);

  useEffect(() => {
    if (!userId || !autoProcessing) return;

    // Poll every 10 seconds — avoids cascading re-renders
    const interval = setInterval(autoProcessSMS, 10000);
    // Also run once on mount after a short delay
    const initial = setTimeout(autoProcessSMS, 2000);
    return () => { clearInterval(interval); clearTimeout(initial); };
  }, [userId, autoProcessing]);

  const autoProcessSMS = async () => {
    if (busyRef.current) return; // prevent overlapping polls
    busyRef.current = true;
    try {
      // Fetch unprocessed SMS
      const response = await fetch(`${API_BASE}/get-sms-messages.php?user_id=${userId}&limit=10`);
      const data = await response.json();

      if (!data.success || !data.messages) return;

      const messagesToProcess = data.messages.filter(m => !processingRef.current.has(m.id));
      if (messagesToProcess.length === 0) return;

      // Parse all with ML
      const mlResults = await parseSMSBulk(messagesToProcess.map(m => m.sms_text));
      
      if (!mlResults.results) return;

      // Process each result
      for (let i = 0; i < messagesToProcess.length; i++) {
        const message = messagesToProcess[i];
        const mlResult = mlResults.results[i];
        processingRef.current.add(message.id);
        saveProcessedId(message.id);

        const isCashWithdrawal = mlResult.transaction_type === 'Cash Withdrawal';

        if (isCashWithdrawal) {
          // Cash withdrawals: save immediately as Other so they appear in the amber banner
          await autoSaveTransaction(message, mlResult);
          continue;
        }

        if (!mlResult.category || mlResult.needs_manual_category) {
          // Low confidence purchase → save to DB as "Other" so it appears in purple banner
          await autoSaveTransaction(message, {
            ...mlResult,
            category: 'Other',
            transaction_type: mlResult.transaction_type || 'Purchase',
          });
          continue;
        }

        // High confidence → auto-save
        if (mlResult.confidence >= AUTO_SAVE_CONFIDENCE_THRESHOLD) {
          await autoSaveTransaction(message, mlResult);
        }
      }
    } catch (err) {
      console.error('Auto-process error:', err);
    } finally {
      busyRef.current = false;
    }
  };

  const autoSaveTransaction = async (message, mlResult) => {
    try {
      const saveResponse = await fetch(`${API_BASE}/save-sms-transaction.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          sms_raw_id: message.id,
          amount: mlResult.amount || 0,
          category: mlResult.category || 'Other',
          description: mlResult.store || 'Transaction',
          transaction_type: mlResult.transaction_type || 'Purchase',
          type: 'expense',
          auto_processed: true
        })
      });

      const saveData = await saveResponse.json();

      if (saveData.success) {
        setProcessedCount(c => c + 1);

        // Only notify for high-confidence auto-saves, not "Other" items headed for review
        if (mlResult.category !== 'Other') {
          const emoji = CATEGORY_ICONS[mlResult.category] || '📝';
          addNotification(
            `${mlResult.store || 'Purchase'} categorized as ${emoji} ${mlResult.category}`,
            'success',
            true
          );
        }

        if (onTransactionAdded) {
          onTransactionAdded(saveData.transaction_id);
        }
      }
    } catch (err) {
      console.error('Auto-save error:', err);
    }
  };

  return null; // Runs silently in background, sends notifications only
}
