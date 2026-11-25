/**
 * AKHAFIN - Smart Cashflow & Multi-Wallet Financial Tracker
 * Core Application Logic & State Controller
 */

(function () {
  'use strict';

  // Constants
  const STORAGE_KEY = 'AKHAFIN_DATA_V1';
  const THEME_KEY = 'AKHAFIN_THEME';
  const SUB_STORAGE_KEY = 'AKHAFIN_SUBSCRIPTION_V1';

  // Providers metadata
  const PROVIDERS = {
    BCA: { name: 'Bank BCA', type: 'bank', color: '#003399', badge: 'BCA' },
    Mandiri: { name: 'Bank Mandiri', type: 'bank', color: '#003d79', badge: 'MDR' },
    BRI: { name: 'Bank BRI', type: 'bank', color: '#00529c', badge: 'BRI' },
    BNI: { name: 'Bank BNI', type: 'bank', color: '#f15a24', badge: 'BNI' },
    Jago: { name: 'Bank Jago', type: 'bank', color: '#7b2cbf', badge: 'JAGO' },
    SeaBank: { name: 'SeaBank', type: 'bank', color: '#ff5722', badge: 'SEA' },
    Jenius: { name: 'Jenius BTPN', type: 'bank', color: '#00a3e0', badge: 'JNS' },
    BSI: { name: 'Bank Syariah (BSI)', type: 'bank', color: '#00a49f', badge: 'BSI' },
    CIMB: { name: 'CIMB Niaga', type: 'bank', color: '#ed1b24', badge: 'CIMB' },
    Blu: { name: 'Blu by BCA', type: 'bank', color: '#00b0ff', badge: 'BLU' },
    GoPay: { name: 'GoPay', type: 'ewallet', color: '#00a5cf', badge: 'GOPAY' },
    OVO: { name: 'OVO', type: 'ewallet', color: '#4c2a86', badge: 'OVO' },
    DANA: { name: 'DANA', type: 'ewallet', color: '#118eea', badge: 'DANA' },
    ShopeePay: { name: 'ShopeePay', type: 'ewallet', color: '#ee4d2d', badge: 'SPAY' },
    LinkAja: { name: 'LinkAja', type: 'ewallet', color: '#e51937', badge: 'LNK' },
    Cash: { name: 'Uang Tunai / Kas', type: 'cash', color: '#10b981', badge: 'CASH' },
    Other: { name: 'Lainnya', type: 'other', color: '#64748b', badge: 'LAIN' }
  };

  const DEFAULT_CATEGORIES = {
    income: [
      'Gaji & Pendapatan',
      'Freelance & Bisnis',
      'Bonus & THR',
      'Bunga & Investasi',
      'Penjualan & Usaha',
      'Hadiah & Hibah',
      'Pemasukan Lainnya'
    ],
    expense: [
      'Makanan & Minuman',
      'Belanja Kebutuhan',
      'Belanja Online',
      'Transportasi',
      'Tagihan & Utilitas',
      'Hiburan & Streaming',
      'Kesehatan & Medis',
      'Pendidikan & Kursus',
      'Keluarga & Anak',
      'Zakat & Donasi',
      'Cicilan & Pinjaman',
      'Perawatan & Kendaraan',
      'Pengeluaran Lainnya'
    ],
    transfer: [
      'Top Up E-Wallet',
      'Transfer Antar Rekening',
      'Tarik Tunai',
      'Setor Tunai',
      'Pindah Saldo'
    ]
  };

  // State
  let state = {
    accounts: [],
    transactions: [],
    currency: 'IDR',
    activeTab: 'dashboard',
    walletFilter: 'all', // all, bank, ewallet, cash
    txFilter: {
      type: 'all',
      accountId: 'all',
      period: 'this_month',
      search: ''
    },
    subscription: {
      isPro: false,
      plan: 'free',
      expiresAt: null
    },
    budgets: {
      'Makanan & Minuman': 2500000,
      'Belanja Kebutuhan': 2000000,
      'Tagihan & Utilitas': 1200000,
      'Transportasi': 600000
    },
    selectedPlan: 'yearly',
    editingTxId: null,
    editingAccId: null
  };

  // Helper Utilities
  function formatIDR(num) {
    const val = Number(num || 0);
    return 'Rp ' + val.toLocaleString('id-ID');
  }

  function parseRupiahInput(str) {
    if (!str) return 0;
    const clean = str.toString().replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  }

  function formatRupiahInputVal(val) {
    const num = parseRupiahInput(val);
    return num === 0 ? '' : num.toLocaleString('id-ID');
  }

  function formatDateDisplay(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getCategoryIcon(cat, type) {
    const catLower = (cat || '').toLowerCase();
    if (type === 'income') return '💰';
    if (type === 'transfer') return '⇄';
    if (catLower.includes('makan') || catLower.includes('minum') || catLower.includes('kopi')) return '🍔';
    if (catLower.includes('belanja') || catLower.includes('supermarket')) return '🛒';
    if (catLower.includes('transport') || catLower.includes('bensin') || catLower.includes('ojek')) return '🛵';
    if (catLower.includes('tagihan') || catLower.includes('listrik') || catLower.includes('wifi')) return '⚡';
    if (catLower.includes('hiburan') || catLower.includes('netflix') || catLower.includes('spotify')) return '🍿';
    if (catLower.includes('kesehatan') || catLower.includes('obat') || catLower.includes('dokter')) return '💊';
    if (catLower.includes('pendidikan') || catLower.includes('buku')) return '📚';
    if (catLower.includes('zakat') || catLower.includes('donasi') || catLower.includes('infaq')) return '🤲';
    if (catLower.includes('cicilan') || catLower.includes('hutang')) return '💳';
    return '💸';
  }

  // Toast Notification
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.2rem;">${icon}</span>
      <span style="font-size: 0.9rem; font-weight: 500;">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // Storage Operations
  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.accounts && parsed.transactions) {
          state.accounts = parsed.accounts;
          state.transactions = parsed.transactions;
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load stored data', e);
    }

    // First time fallback: generate default rich sample data
    if (window.generateSampleData) {
      const sample = window.generateSampleData();
      state.accounts = sample.accounts;
      state.transactions = sample.transactions;
      saveData();
    }
  }

  function saveData() {
    try {
      const payload = {
        accounts: state.accounts,
        transactions: state.transactions,
        currency: state.currency,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.error('Failed to save data', e);
      showToast('Gagal menyimpan data ke browser!', 'error');
    }
  }

  // Subscription Management (AKHAFIN PRO & Google Play)
  function loadSubscription() {
    try {
      const subStored = localStorage.getItem(SUB_STORAGE_KEY);
      if (subStored) {
        const parsed = JSON.parse(subStored);
        if (parsed.expiresAt && new Date(parsed.expiresAt) < new Date()) {
          state.subscription = { isPro: false, plan: 'free', expiresAt: null };
        } else {
          state.subscription = parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load subscription', e);
    }
  }

  function saveSubscription() {
    try {
      localStorage.setItem(SUB_STORAGE_KEY, JSON.stringify(state.subscription));
      updateProUI();
    } catch (e) {
      console.error('Failed to save subscription', e);
    }
  }

  function updateProUI() {
    const proBtn = document.getElementById('btn-header-pro');
    const proText = document.getElementById('header-pro-text');
    const settingsStatus = document.getElementById('settings-sub-status');
    const budgetBadge = document.getElementById('budget-badge-status');

    if (state.subscription && state.subscription.isPro) {
      if (proBtn) {
        proBtn.className = 'pro-active-badge';
        proBtn.title = 'AKHAFIN PRO Aktif';
      }
      if (proText) proText.textContent = 'PRO Aktif';
      if (settingsStatus) {
        const planName = state.subscription.plan === 'lifetime' ? 'Seumur Hidup (VIP)' : 
                        (state.subscription.plan === 'yearly' ? 'Tahunan' : 
                        (state.subscription.plan === 'trial' ? 'Uji Coba 7 Hari' : 'Bulanan'));
        settingsStatus.innerHTML = `Paket Aktif: <strong style="color: #f59e0b;">👑 AKHAFIN PRO (${planName})</strong> • Status: <span style="color: var(--income); font-weight: bold;">Aktif</span>`;
      }
      if (budgetBadge) {
        budgetBadge.textContent = 'Aktif (PRO)';
        budgetBadge.style.background = 'var(--income-light)';
        budgetBadge.style.color = 'var(--income)';
      }
    } else {
      if (proBtn) {
        proBtn.className = 'btn-upgrade-pro';
        proBtn.title = 'Upgrade ke AKHAFIN PRO';
      }
      if (proText) proText.textContent = 'Upgrade PRO';
      if (settingsStatus) {
        settingsStatus.innerHTML = `Paket Aktif: <strong>Gratis (Free Starter)</strong> • Maks 3 Akun Rekening`;
      }
      if (budgetBadge) {
        budgetBadge.textContent = 'PRO Feature';
        budgetBadge.style.background = 'rgba(245,158,11,0.15)';
        budgetBadge.style.color = '#f59e0b';
      }
    }
  }

  function renderBudgetingWidget() {
    const container = document.getElementById('budget-widget-container');
    if (!container) return;

    const thisMonthTx = filterByPeriod(state.transactions, 'this_month');
    const spentMap = {};
    thisMonthTx.forEach(t => {
      if (t.type === 'expense') {
        const cat = t.category || 'Lainnya';
        spentMap[cat] = (spentMap[cat] || 0) + Number(t.amount || 0);
      }
    });

    const categories = Object.keys(state.budgets);

    container.innerHTML = categories.map(cat => {
      const limit = state.budgets[cat];
      const spent = spentMap[cat] || 0;
      const pct = Math.min(100, Math.round((spent / limit) * 100));

      let statusClass = 'progress-safe';
      if (pct >= 90) statusClass = 'progress-danger';
      else if (pct >= 70) statusClass = 'progress-warning';

      return `
        <div class="budget-item">
          <div class="budget-info">
            <span><strong>${escapeHtml(cat)}</strong></span>
            <span><strong>${formatIDR(spent)}</strong> / ${formatIDR(limit)} (${pct}%)</span>
          </div>
          <div class="budget-progress-bg">
            <div class="budget-progress-fill ${statusClass}" style="width: ${pct}%;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // Balance Calculation Engine
  function calculateAccountBalances() {
    const balances = {};
    state.accounts.forEach(acc => {
      balances[acc.id] = Number(acc.initialBalance || 0);
    });

    state.transactions.forEach(tx => {
      const amount = Number(tx.amount || 0);
      const fee = Number(tx.adminFee || 0);

      if (tx.type === 'income') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] += amount;
        }
      } else if (tx.type === 'expense') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] -= amount;
        }
      } else if (tx.type === 'transfer') {
        if (balances[tx.accountId] !== undefined) {
          balances[tx.accountId] -= (amount + fee);
        }
        if (balances[tx.toAccountId] !== undefined) {
          balances[tx.toAccountId] += amount;
        }
      }
    });

    return balances;
  }

  function getAccountBalance(accId) {
    const all = calculateAccountBalances();
    return all[accId] || 0;
  }

  function getTotalNetWorth() {
    const balances = calculateAccountBalances();
    return Object.values(balances).reduce((sum, val) => sum + val, 0);
  }

  // Filter Transactions by Date Period
  function filterByPeriod(txList, periodKey) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return txList.filter(tx => {
      if (!tx.date) return false;
      const txDate = new Date(tx.date);

      if (periodKey === 'all') return true;

      if (periodKey === 'today') {
        return txDate.toDateString() === now.toDateString();
      }

      if (periodKey === 'this_month') {
        return txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth;
      }

      if (periodKey === 'last_month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return txDate.getFullYear() === lastMonthYear && txDate.getMonth() === lastMonth;
      }

      if (periodKey === '7_days') {
        const diff = (now - txDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      }

      if (periodKey === '30_days') {
        const diff = (now - txDate) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 30;
      }

      if (periodKey === 'this_year') {
        return txDate.getFullYear() === currentYear;
      }

      return true;
    });
  }

  // Cashflow Metrics for current active period or this month
  function getCashflowMetrics(period = 'this_month') {
    const filtered = filterByPeriod(state.transactions, period);
    let totalIncome = 0;
    let totalExpense = 0;
    let totalTransfer = 0;

    filtered.forEach(tx => {
      const amt = Number(tx.amount || 0);
      const fee = Number(tx.adminFee || 0);

      if (tx.type === 'income') {
        totalIncome += amt;
      } else if (tx.type === 'expense') {
        totalExpense += amt;
      } else if (tx.type === 'transfer') {
        totalTransfer += amt;
        if (fee > 0) totalExpense += fee; // Admin fee counts as expense
      }
    });

    const netCashflow = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      totalTransfer,
      netCashflow,
      transactionCount: filtered.length
    };
  }

  // UI Render Controllers
  function renderAll() {
    renderDashboardStats();
    renderWalletBanner();
    renderAccountsList();
    renderTransactionsTable();
    renderRecentTransactionsList();
    renderBudgetingWidget();
    updateProUI();
    renderCharts();
    renderReports();
    updateAccountSelectDropdowns();
  }

  // Dashboard Metrics
  function renderDashboardStats() {
    const totalBalance = getTotalNetWorth();
    const metrics = getCashflowMetrics('this_month');

    // Total Saldo
    const totalEl = document.getElementById('stat-total-balance');
    if (totalEl) totalEl.textContent = formatIDR(totalBalance);

    // Income Bulan Ini
    const incomeEl = document.getElementById('stat-monthly-income');
    if (incomeEl) incomeEl.textContent = formatIDR(metrics.totalIncome);

    // Expense Bulan Ini
    const expenseEl = document.getElementById('stat-monthly-expense');
    if (expenseEl) expenseEl.textContent = formatIDR(metrics.totalExpense);

    // Net Cashflow
    const cashflowEl = document.getElementById('stat-net-cashflow');
    const badgeEl = document.getElementById('stat-cashflow-badge');

    if (cashflowEl) {
      cashflowEl.textContent = formatIDR(metrics.netCashflow);
      if (metrics.netCashflow >= 0) {
        cashflowEl.style.color = 'var(--income)';
        if (badgeEl) {
          badgeEl.className = 'stat-badge badge-surplus';
          badgeEl.textContent = 'Surplus (Arus Positif)';
        }
      } else {
        cashflowEl.style.color = 'var(--expense)';
        if (badgeEl) {
          badgeEl.className = 'stat-badge badge-deficit';
          badgeEl.textContent = 'Defisit (Pengeluaran > Masuk)';
        }
      }
    }
  }

  // Wallet Summary Banner (Bank vs E-Wallet vs Tunai)
  function renderWalletBanner() {
    const balances = calculateAccountBalances();
    let bankSum = 0;
    let ewalletSum = 0;
    let cashSum = 0;

    state.accounts.forEach(acc => {
      const b = balances[acc.id] || 0;
      if (acc.type === 'bank') bankSum += b;
      else if (acc.type === 'ewallet') ewalletSum += b;
      else if (acc.type === 'cash') cashSum += b;
      else bankSum += b;
    });

    const bEl = document.getElementById('banner-bank-sum');
    const eEl = document.getElementById('banner-ewallet-sum');
    const cEl = document.getElementById('banner-cash-sum');
    const tEl = document.getElementById('banner-total-sum');

    if (bEl) bEl.textContent = formatIDR(bankSum);
    if (eEl) eEl.textContent = formatIDR(ewalletSum);
    if (cEl) cEl.textContent = formatIDR(cashSum);
    if (tEl) tEl.textContent = formatIDR(bankSum + ewalletSum + cashSum);
  }

  // Render Bank & E-Wallet Cards
  function renderAccountsList() {
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;

    const balances = calculateAccountBalances();
    const filter = state.walletFilter;

    const filtered = state.accounts.filter(acc => {
      if (filter === 'all') return true;
      if (filter === 'bank') return acc.type === 'bank';
      if (filter === 'ewallet') return acc.type === 'ewallet';
      if (filter === 'cash') return acc.type === 'cash';
      return true;
    });

    // Update Counter badge
    const badge = document.getElementById('accounts-count-badge');
    if (badge) badge.textContent = `${state.accounts.length} Akun Terdaftar`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-icon">🏦</div>
          <div class="empty-title">Tidak ada akun di kategori ini</div>
          <div class="empty-desc">Klik tombol "Tambah Akun / Dompet" untuk menambahkan Bank atau E-Wallet baru Anda.</div>
          <button class="btn-primary" onclick="window.akhaApp.openAddAccountModal()">+ Tambah Akun Baru</button>
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(acc => {
      const bal = balances[acc.id] || 0;
      const prov = PROVIDERS[acc.provider] || PROVIDERS.Other;
      const typeLabel = acc.type === 'bank' ? 'Rekening Bank' : (acc.type === 'ewallet' ? 'E-Wallet Digital' : 'Uang Tunai');
      const cardColor = acc.color || prov.color;

      return `
        <div class="wallet-card" style="--card-accent: ${cardColor};">
          <div class="wallet-top">
            <div class="wallet-provider-info">
              <div class="wallet-badge-icon" style="background: ${cardColor};">
                ${prov.badge || 'ACC'}
              </div>
              <div class="wallet-meta">
                <div class="wallet-name">${escapeHtml(acc.name)}</div>
                <div class="wallet-type-tag">
                  <span>${acc.type === 'bank' ? '🏦' : (acc.type === 'ewallet' ? '📱' : '💵')}</span>
                  <span>${typeLabel}</span>
                </div>
              </div>
            </div>
            <div class="wallet-actions">
              <button class="wallet-action-btn" title="Edit Akun" onclick="window.akhaApp.openEditAccountModal('${acc.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="wallet-action-btn" title="Hapus Akun" onclick="window.akhaApp.confirmDeleteAccount('${acc.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>

          <div class="wallet-balance-box">
            <div class="wallet-balance-label">Sisa Saldo Tersedia</div>
            <div class="wallet-balance-amount" style="color: ${bal < 0 ? 'var(--expense)' : 'var(--text-primary)'};">
              ${formatIDR(bal)}
            </div>
          </div>

          <div class="wallet-bottom">
            <div class="wallet-acc-number">${escapeHtml(acc.accountNumber || '-')}</div>
            <button class="wallet-history-link" onclick="window.akhaApp.viewAccountMutations('${acc.id}')">
              <span>Mutasi</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Render Transactions Table with Filters
  function renderTransactionsTable() {
    const tbody = document.getElementById('tx-table-body');
    if (!tbody) return;

    let list = [...state.transactions];

    // Filter by Type
    if (state.txFilter.type !== 'all') {
      list = list.filter(t => t.type === state.txFilter.type);
    }

    // Filter by Account
    if (state.txFilter.accountId !== 'all') {
      list = list.filter(t => t.accountId === state.txFilter.accountId || t.toAccountId === state.txFilter.accountId);
    }

    // Filter by Period
    list = filterByPeriod(list, state.txFilter.period);

    // Filter by Search Query
    const q = (state.txFilter.search || '').trim().toLowerCase();
    if (q) {
      list = list.filter(t => {
        const notes = (t.notes || '').toLowerCase();
        const cat = (t.category || '').toLowerCase();
        return notes.includes(q) || cat.includes(q);
      });
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Update Transaction Summary Indicators
    const countEl = document.getElementById('tx-filter-count');
    if (countEl) countEl.textContent = `${list.length} Transaksi Terfilter`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="padding: 0;">
            <div class="empty-state">
              <div class="empty-icon">💸</div>
              <div class="empty-title">Tidak ada transaksi ditemukan</div>
              <div class="empty-desc">Coba sesuaikan filter atau tambahkan transaksi pemasukan/pengeluaran baru Anda.</div>
              <button class="btn-primary" onclick="window.akhaApp.openAddTxModal()">+ Tambah Transaksi</button>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    const accMap = {};
    state.accounts.forEach(a => { accMap[a.id] = a; });

    tbody.innerHTML = list.map(tx => {
      const isIncome = tx.type === 'income';
      const isExpense = tx.type === 'expense';
      const isTransfer = tx.type === 'transfer';

      const typeBadgeClass = isIncome ? 'income' : (isExpense ? 'expense' : 'transfer');
      const typeLabel = isIncome ? 'Masuk' : (isExpense ? 'Keluar' : 'Transfer');

      const amountSign = isIncome ? '+ ' : (isExpense ? '- ' : '⇄ ');
      const fromAcc = accMap[tx.accountId]?.name || 'Akun Dihapus';
      const toAcc = tx.toAccountId ? (accMap[tx.toAccountId]?.name || 'Akun Dihapus') : '';

      let accountHtml = `<span class="tx-account-pill">${escapeHtml(fromAcc)}</span>`;
      if (isTransfer) {
        accountHtml = `
          <div class="tx-accounts-cell">
            <span class="tx-account-pill">${escapeHtml(fromAcc)}</span>
            <span style="color: var(--text-muted); font-weight: bold;">➔</span>
            <span class="tx-account-pill" style="border: 1px solid var(--transfer-border);">${escapeHtml(toAcc)}</span>
          </div>
        `;
      }

      const icon = getCategoryIcon(tx.category, tx.type);

      return `
        <tr>
          <td class="tx-date">${formatDateDisplay(tx.date)}</td>
          <td>
            <div class="tx-desc-cell">
              <div class="tx-cat-icon" style="background: ${isIncome ? 'var(--income-light)' : (isExpense ? 'var(--expense-light)' : 'var(--transfer-light)')};">
                ${icon}
              </div>
              <div class="tx-info">
                <span class="tx-title">${escapeHtml(tx.notes || tx.category || 'Transaksi')}</span>
                <span class="tx-category">${escapeHtml(tx.category || '-')}</span>
              </div>
            </div>
          </td>
          <td>${accountHtml}</td>
          <td>
            <span class="tx-badge ${typeBadgeClass}">${typeLabel}</span>
          </td>
          <td class="tx-amount ${typeBadgeClass}">
            ${amountSign}${formatIDR(tx.amount)}
            ${tx.adminFee ? `<div style="font-size: 0.72rem; color: var(--text-muted); font-weight: normal;">Admin: ${formatIDR(tx.adminFee)}</div>` : ''}
          </td>
          <td>
            <div class="table-actions">
              <button class="wallet-action-btn" title="Edit" onclick="window.akhaApp.openEditTxModal('${tx.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              </button>
              <button class="wallet-action-btn" title="Hapus" onclick="window.akhaApp.confirmDeleteTx('${tx.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Recent 5 Transactions in Dashboard
  function renderRecentTransactionsList() {
    const container = document.getElementById('recent-tx-list');
    if (!container) return;

    const list = [...state.transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    if (list.length === 0) {
      container.innerHTML = `<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Belum ada riwayat transaksi.</div>`;
      return;
    }

    const accMap = {};
    state.accounts.forEach(a => { accMap[a.id] = a; });

    container.innerHTML = list.map(tx => {
      const isIncome = tx.type === 'income';
      const isExpense = tx.type === 'expense';
      const isTransfer = tx.type === 'transfer';
      const badgeClass = isIncome ? 'income' : (isExpense ? 'expense' : 'transfer');
      const icon = getCategoryIcon(tx.category, tx.type);
      const accName = accMap[tx.accountId]?.name || 'Akun';

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.85rem 0; border-bottom: 1px solid var(--border-light);">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div class="tx-cat-icon" style="background: ${isIncome ? 'var(--income-light)' : (isExpense ? 'var(--expense-light)' : 'var(--transfer-light)')};">
              ${icon}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-primary);">${escapeHtml(tx.notes || tx.category)}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(accName)} • ${formatDateDisplay(tx.date)}</div>
            </div>
          </div>
          <div class="tx-amount ${badgeClass}" style="font-size: 0.95rem;">
            ${isIncome ? '+' : (isExpense ? '-' : '⇄')} ${formatIDR(tx.amount)}
          </div>
        </div>
      `;
    }).join('');
  }

  // Charts Rendering
  function renderCharts() {
    if (!window.akhaChart) return;

    // 1. Cashflow Bar Chart (Last 6 Months)
    const monthlyLabels = [];
    const monthlyIncome = [];
    const monthlyExpense = [];

    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleDateString('id-ID', { month: 'short' });
      monthlyLabels.push(monthName);

      let mInc = 0;
      let mExp = 0;

      state.transactions.forEach(tx => {
        if (!tx.date) return;
        const txDate = new Date(tx.date);
        if (txDate.getFullYear() === d.getFullYear() && txDate.getMonth() === d.getMonth()) {
          const amt = Number(tx.amount || 0);
          if (tx.type === 'income') mInc += amt;
          else if (tx.type === 'expense') mExp += amt;
          else if (tx.type === 'transfer' && tx.adminFee) mExp += Number(tx.adminFee);
        }
      });

      monthlyIncome.push(mInc);
      monthlyExpense.push(mExp);
    }

    window.akhaChart.renderCashflowBar('cashflow-chart-canvas', {
      labels: monthlyLabels,
      income: monthlyIncome,
      expense: monthlyExpense
    });

    // 2. Expense by Category Donut Chart (Current Month)
    const categoryTotals = {};
    const thisMonthTx = filterByPeriod(state.transactions, 'this_month');

    thisMonthTx.forEach(tx => {
      if (tx.type === 'expense') {
        const cat = tx.category || 'Lainnya';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount || 0);
      }
    });

    const categoryArray = Object.keys(categoryTotals).map(cat => ({
      category: cat,
      amount: categoryTotals[cat]
    })).sort((a, b) => b.amount - a.amount);

    window.akhaChart.renderDonutChart('expense-category-canvas', categoryArray, 'Pengeluaran');
  }

  // Reports Section (Cashflow Statement & Top Expenses)
  function renderReports() {
    const period = document.getElementById('report-period-select')?.value || 'this_month';
    const metrics = getCashflowMetrics(period);
    const filteredTx = filterByPeriod(state.transactions, period);

    // Update Summary Values
    const inEl = document.getElementById('report-total-income');
    const outEl = document.getElementById('report-total-expense');
    const netEl = document.getElementById('report-net-cashflow');
    const rateEl = document.getElementById('report-saving-rate');

    if (inEl) inEl.textContent = formatIDR(metrics.totalIncome);
    if (outEl) outEl.textContent = formatIDR(metrics.totalExpense);
    if (netEl) {
      netEl.textContent = formatIDR(metrics.netCashflow);
      netEl.style.color = metrics.netCashflow >= 0 ? 'var(--income)' : 'var(--expense)';
    }

    if (rateEl) {
      if (metrics.totalIncome > 0) {
        const rate = Math.max(0, ((metrics.netCashflow / metrics.totalIncome) * 100)).toFixed(1);
        rateEl.textContent = `${rate}%`;
      } else {
        rateEl.textContent = '0%';
      }
    }

    // Top Expenses Table
    const topContainer = document.getElementById('report-top-expenses');
    if (topContainer) {
      const expList = filteredTx
        .filter(t => t.type === 'expense')
        .sort((a, b) => Number(b.amount) - Number(a.amount))
        .slice(0, 5);

      if (expList.length === 0) {
        topContainer.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Tidak ada data pengeluaran di periode ini.</td></tr>`;
      } else {
        topContainer.innerHTML = expList.map(item => `
          <tr>
            <td><strong>${escapeHtml(item.notes || item.category)}</strong></td>
            <td><span class="tx-badge expense">${escapeHtml(item.category)}</span></td>
            <td style="text-align: right; font-weight: 700; color: var(--expense);">${formatIDR(item.amount)}</td>
          </tr>
        `).join('');
      }
    }

    // Wallet Distribution in Report
    const distContainer = document.getElementById('report-wallet-distribution');
    if (distContainer) {
      const balances = calculateAccountBalances();
      const total = getTotalNetWorth();

      distContainer.innerHTML = state.accounts.map(acc => {
        const bal = balances[acc.id] || 0;
        const pct = total > 0 ? Math.max(0, (bal / total) * 100).toFixed(1) : 0;
        return `
          <div style="margin-bottom: 0.9rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.3rem;">
              <span><strong>${escapeHtml(acc.name)}</strong> (${acc.provider})</span>
              <span>${formatIDR(bal)} (${pct}%)</span>
            </div>
            <div style="background: var(--bg-tertiary); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
              <div style="background: ${acc.color || 'var(--primary)'}; width: ${pct}%; height: 100%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Account Dropdowns in Transaction Modal & Filter
  function updateAccountSelectDropdowns() {
    const txFromSelect = document.getElementById('tx-account');
    const txToSelect = document.getElementById('tx-to-account');
    const filterSelect = document.getElementById('filter-account-select');

    const optionsHtml = state.accounts.map(acc => 
      `<option value="${acc.id}">${escapeHtml(acc.name)} (${acc.provider})</option>`
    ).join('');

    if (txFromSelect) txFromSelect.innerHTML = optionsHtml;
    if (txToSelect) txToSelect.innerHTML = optionsHtml;
    if (filterSelect) {
      filterSelect.innerHTML = `<option value="all">Semua Rekening & Dompet</option>` + optionsHtml;
    }
  }

  // Navigation Logic
  function switchTab(tabId) {
    state.activeTab = tabId;

    // Update Nav Buttons
    document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
    });

    // Update Sections
    document.querySelectorAll('.tab-content-section').forEach(sec => {
      sec.style.display = sec.id === `section-${tabId}` ? 'block' : 'none';
    });

    // Trigger re-render of canvas charts when opening dashboard or analytics
    if (tabId === 'dashboard' || tabId === 'analytics') {
      setTimeout(() => renderCharts(), 50);
    }

    if (tabId === 'analytics') {
      renderReports();
    }
  }

  // Quick Action: Jump from Account Card to Transaction History filtered by that account
  function viewAccountMutations(accId) {
    state.txFilter.accountId = accId;
    state.txFilter.type = 'all';
    state.txFilter.period = 'all';

    const filterSelect = document.getElementById('filter-account-select');
    if (filterSelect) filterSelect.value = accId;

    const periodSelect = document.getElementById('filter-period-select');
    if (periodSelect) periodSelect.value = 'all';

    const typeSelect = document.getElementById('filter-type-select');
    if (typeSelect) typeSelect.value = 'all';

    switchTab('transactions');
    renderTransactionsTable();
  }

  // Transaction Modal Logic
  function openAddTxModal(initialType = 'expense') {
    state.editingTxId = null;
    document.getElementById('tx-modal-title').textContent = 'Catat Transaksi Baru';
    document.getElementById('tx-form').reset();

    // Default Date to Now
    const now = new Date();
    const nowStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    document.getElementById('tx-date').value = nowStr;

    setTxType(initialType);
    updateCategoryDatalist(initialType);
    openModal('tx-modal');
  }

  function openEditTxModal(txId) {
    const tx = state.transactions.find(t => t.id === txId);
    if (!tx) return;

    state.editingTxId = txId;
    document.getElementById('tx-modal-title').textContent = 'Edit Transaksi';

    setTxType(tx.type);
    updateCategoryDatalist(tx.type);

    document.getElementById('tx-amount').value = (tx.amount || 0).toLocaleString('id-ID');
    document.getElementById('tx-account').value = tx.accountId;
    if (tx.toAccountId) document.getElementById('tx-to-account').value = tx.toAccountId;
    if (tx.adminFee) document.getElementById('tx-admin-fee').value = (tx.adminFee).toLocaleString('id-ID');
    document.getElementById('tx-category').value = tx.category || '';
    document.getElementById('tx-notes').value = tx.notes || '';
    document.getElementById('tx-date').value = tx.date ? tx.date.slice(0, 16) : '';

    openModal('tx-modal');
  }

  function setTxType(type) {
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      const bType = btn.getAttribute('data-type');
      btn.className = `type-toggle-btn ${bType === type ? `active ${type}` : ''}`;
    });

    const toAccountGroup = document.getElementById('form-group-to-account');
    const adminFeeGroup = document.getElementById('form-group-admin-fee');
    const fromLabel = document.getElementById('label-from-account');

    if (type === 'transfer') {
      toAccountGroup.style.display = 'flex';
      adminFeeGroup.style.display = 'flex';
      fromLabel.textContent = 'Rekening Asal (Sumber Dana)';
    } else {
      toAccountGroup.style.display = 'none';
      adminFeeGroup.style.display = 'none';
      fromLabel.textContent = type === 'income' ? 'Masuk ke Rekening / E-Wallet' : 'Dipotong dari Rekening / E-Wallet';
    }

    updateCategoryDatalist(type);
  }

  function getActiveTxType() {
    const active = document.querySelector('.type-toggle-btn.active');
    return active ? active.getAttribute('data-type') : 'expense';
  }

  function updateCategoryDatalist(type) {
    const datalist = document.getElementById('category-list');
    if (!datalist) return;
    const cats = DEFAULT_CATEGORIES[type] || DEFAULT_CATEGORIES.expense;
    datalist.innerHTML = cats.map(c => `<option value="${escapeHtml(c)}"></option>`).join('');
  }

  function saveTransactionFromForm(e) {
    e.preventDefault();

    const type = getActiveTxType();
    const amount = parseRupiahInput(document.getElementById('tx-amount').value);
    const accountId = document.getElementById('tx-account').value;
    const toAccountId = document.getElementById('tx-to-account').value;
    const adminFee = parseRupiahInput(document.getElementById('tx-admin-fee').value);
    const category = document.getElementById('tx-category').value.trim() || 'Lainnya';
    const notes = document.getElementById('tx-notes').value.trim();
    const date = document.getElementById('tx-date').value || new Date().toISOString();

    if (!amount || amount <= 0) {
      showToast('Masukkan nominal transaksi yang valid!', 'error');
      return;
    }

    if (!accountId) {
      showToast('Pilih akun / rekening transaksi!', 'error');
      return;
    }

    if (type === 'transfer' && accountId === toAccountId) {
      showToast('Rekening asal dan tujuan tidak boleh sama!', 'error');
      return;
    }

    if (state.editingTxId) {
      // Update
      const idx = state.transactions.findIndex(t => t.id === state.editingTxId);
      if (idx !== -1) {
        state.transactions[idx] = {
          ...state.transactions[idx],
          type,
          amount,
          accountId,
          toAccountId: type === 'transfer' ? toAccountId : undefined,
          adminFee: type === 'transfer' ? adminFee : 0,
          category,
          notes,
          date
        };
        showToast('Transaksi berhasil diperbarui!', 'success');
      }
    } else {
      // Add
      const newTx = {
        id: 'tx_' + Date.now(),
        type,
        amount,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        adminFee: type === 'transfer' ? adminFee : 0,
        category,
        notes,
        date,
        createdAt: new Date().toISOString()
      };
      state.transactions.unshift(newTx);
      showToast('Transaksi baru berhasil dicatat!', 'success');
    }

    saveData();
    closeModal('tx-modal');
    renderAll();
  }

  function confirmDeleteTx(txId) {
    if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      state.transactions = state.transactions.filter(t => t.id !== txId);
      saveData();
      renderAll();
      showToast('Transaksi telah dihapus.', 'info');
    }
  }

  // Account Modal Logic
  function openAddAccountModal() {
    if (!state.subscription.isPro && state.accounts.length >= 3) {
      showToast('Batas Akun Gratis (Maks 3). Buka akses akun tanpa batas dengan AKHAFIN PRO!', 'info');
      openProModal();
      return;
    }
    state.editingAccId = null;
    document.getElementById('account-modal-title').textContent = 'Tambah Rekening / E-Wallet Baru';
    document.getElementById('account-form').reset();
    document.getElementById('acc-initial-balance').value = '0';
    openModal('account-modal');
  }

  function openEditAccountModal(accId) {
    const acc = state.accounts.find(a => a.id === accId);
    if (!acc) return;

    state.editingAccId = accId;
    document.getElementById('account-modal-title').textContent = 'Edit Rekening / E-Wallet';

    document.getElementById('acc-name').value = acc.name || '';
    document.getElementById('acc-provider').value = acc.provider || 'Other';
    document.getElementById('acc-type').value = acc.type || 'bank';
    document.getElementById('acc-number').value = acc.accountNumber || '';
    document.getElementById('acc-initial-balance').value = (acc.initialBalance || 0).toLocaleString('id-ID');
    document.getElementById('acc-notes').value = acc.notes || '';

    openModal('account-modal');
  }

  function saveAccountFromForm(e) {
    e.preventDefault();

    const name = document.getElementById('acc-name').value.trim();
    const provider = document.getElementById('acc-provider').value;
    const type = document.getElementById('acc-type').value;
    const accountNumber = document.getElementById('acc-number').value.trim();
    const initialBalance = parseRupiahInput(document.getElementById('acc-initial-balance').value);
    const notes = document.getElementById('acc-notes').value.trim();

    if (!name) {
      showToast('Masukkan nama akun atau rekening!', 'error');
      return;
    }

    const provInfo = PROVIDERS[provider] || PROVIDERS.Other;

    if (state.editingAccId) {
      const idx = state.accounts.findIndex(a => a.id === state.editingAccId);
      if (idx !== -1) {
        state.accounts[idx] = {
          ...state.accounts[idx],
          name,
          provider,
          type,
          accountNumber,
          initialBalance,
          color: provInfo.color,
          notes
        };
        showToast('Rekening berhasil diperbarui!', 'success');
      }
    } else {
      const newAcc = {
        id: 'acc_' + Date.now(),
        name,
        provider,
        type,
        accountNumber,
        initialBalance,
        color: provInfo.color,
        notes,
        createdAt: new Date().toISOString()
      };
      state.accounts.push(newAcc);
      showToast('Rekening / E-Wallet baru berhasil ditambahkan!', 'success');
    }

    saveData();
    closeModal('account-modal');
    renderAll();
  }

  function confirmDeleteAccount(accId) {
    const relatedTxCount = state.transactions.filter(t => t.accountId === accId || t.toAccountId === accId).length;
    let msg = 'Hapus akun ini?';
    if (relatedTxCount > 0) {
      msg = `Perhatian! Ada ${relatedTxCount} transaksi yang terhubung dengan akun ini. Jika dihapus, catatan transaksi tetap ada namun akunnya berlabel Dihapus. Lanjutkan?`;
    }

    if (confirm(msg)) {
      state.accounts = state.accounts.filter(a => a.id !== accId);
      saveData();
      renderAll();
      showToast('Akun telah dihapus.', 'info');
    }
  }

  // Backup & Restore
  function exportJSONBackup() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      appName: 'AKHAFIN',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      accounts: state.accounts,
      transactions: state.transactions
    }, null, 2));

    const dateStr = new Date().toISOString().slice(0, 10);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `AKHAFIN_Backup_${dateStr}.json`);
    dlAnchor.click();
    showToast('File backup JSON berhasil didownload!', 'success');
  }

  function importJSONBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.accounts || !parsed.transactions) {
          throw new Error('Format file backup tidak valid');
        }

        if (confirm(`Impor backup berisi ${parsed.accounts.length} akun dan ${parsed.transactions.length} transaksi? Data saat ini akan digantikan.`)) {
          state.accounts = parsed.accounts;
          state.transactions = parsed.transactions;
          saveData();
          renderAll();
          showToast('Data berhasil dipulihkan dari backup!', 'success');
        }
      } catch (err) {
        showToast('Gagal memproses file backup: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function exportCSV() {
    const accMap = {};
    state.accounts.forEach(a => { accMap[a.id] = a.name; });

    let csv = 'ID Transaksi,Tanggal,Tipe,Dari Akun,Ke Akun,Kategori,Nominal (IDR),Biaya Admin (IDR),Keterangan\n';

    state.transactions.forEach(t => {
      const fromName = (accMap[t.accountId] || t.accountId || '').replace(/,/g, ' ');
      const toName = (accMap[t.toAccountId] || t.toAccountId || '').replace(/,/g, ' ');
      const notes = (t.notes || '').replace(/,/g, ' ').replace(/"/g, '""');
      const cat = (t.category || '').replace(/,/g, ' ');

      csv += `"${t.id}","${t.date}","${t.type}","${fromName}","${toName}","${cat}",${t.amount},${t.adminFee || 0},"${notes}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `AKHAFIN_Mutasi_${dateStr}.csv`);
    link.click();
    showToast('Mutasi CSV berhasil diexport!', 'success');
  }

  function resetToSampleData() {
    if (confirm('Kembalikan ke Data Contoh bawaan AKHAFIN? Data yang Anda buat akan digantikan.')) {
      const sample = window.generateSampleData();
      state.accounts = sample.accounts;
      state.transactions = sample.transactions;
      saveData();
      renderAll();
      showToast('Data berhasil di-reset ke Data Contoh!', 'success');
    }
  }

  function resetEmptyData() {
    if (confirm('PERINGATAN: Semua akun dan transaksi akan dihapus dan dimulai dari nol. Yakin ingin melanjutkan?')) {
      state.accounts = [];
      state.transactions = [];
      saveData();
      renderAll();
      showToast('Semua data berhasil dibersihkan.', 'info');
    }
  }

  // Theme Management
  function initTheme() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
    setTheme(savedTheme);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);

    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.innerHTML = theme === 'dark' 
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
    }

    renderCharts();
  }

  // Modal Open / Close Helpers
  function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Event Listeners Setup
  function setupEventListeners() {
    // Navigation Tabs
    document.querySelectorAll('.nav-item, .mobile-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        if (tab) switchTab(tab);
      });
    });

    // Theme toggle
    document.getElementById('btn-toggle-theme')?.addEventListener('click', toggleTheme);

    // Header Quick Add
    document.getElementById('btn-quick-add-tx')?.addEventListener('click', () => openAddTxModal('expense'));
    document.getElementById('btn-quick-add-acc')?.addEventListener('click', openAddAccountModal);

    // Wallet filter chips
    document.querySelectorAll('.filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.walletFilter = chip.getAttribute('data-filter') || 'all';
        renderAccountsList();
      });
    });

    // Transaction Filters
    document.getElementById('filter-type-select')?.addEventListener('change', (e) => {
      state.txFilter.type = e.target.value;
      renderTransactionsTable();
    });

    document.getElementById('filter-account-select')?.addEventListener('change', (e) => {
      state.txFilter.accountId = e.target.value;
      renderTransactionsTable();
    });

    document.getElementById('filter-period-select')?.addEventListener('change', (e) => {
      state.txFilter.period = e.target.value;
      renderTransactionsTable();
    });

    document.getElementById('tx-search-input')?.addEventListener('input', (e) => {
      state.txFilter.search = e.target.value;
      renderTransactionsTable();
    });

    // Report Period Change
    document.getElementById('report-period-select')?.addEventListener('change', renderReports);

    // Modals
    document.getElementById('tx-form')?.addEventListener('submit', saveTransactionFromForm);
    document.getElementById('account-form')?.addEventListener('submit', saveAccountFromForm);

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) modal.classList.remove('open');
      });
    });

    // Type Toggle in Tx Modal
    document.querySelectorAll('.type-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        setTxType(type);
      });
    });

    // Currency Input Auto-Formatters
    const amountInput = document.getElementById('tx-amount');
    if (amountInput) {
      amountInput.addEventListener('input', (e) => {
        const pos = e.target.selectionStart;
        e.target.value = formatRupiahInputVal(e.target.value);
      });
    }

    const adminInput = document.getElementById('tx-admin-fee');
    if (adminInput) {
      adminInput.addEventListener('input', (e) => {
        e.target.value = formatRupiahInputVal(e.target.value);
      });
    }

    const initBalInput = document.getElementById('acc-initial-balance');
    if (initBalInput) {
      initBalInput.addEventListener('input', (e) => {
        e.target.value = formatRupiahInputVal(e.target.value);
      });
    }

    // Provider select change auto-sets account type
    const provSelect = document.getElementById('acc-provider');
    if (provSelect) {
      provSelect.addEventListener('change', (e) => {
        const prov = PROVIDERS[e.target.value];
        if (prov) {
          const typeSelect = document.getElementById('acc-type');
          if (typeSelect) typeSelect.value = prov.type;
        }
      });
    }

    // Backup & Restore
    document.getElementById('btn-export-json')?.addEventListener('click', exportJSONBackup);
    document.getElementById('btn-export-csv')?.addEventListener('click', exportCSV);
    document.getElementById('import-file-input')?.addEventListener('change', importJSONBackup);
    document.getElementById('btn-reset-sample')?.addEventListener('click', resetToSampleData);
    document.getElementById('btn-reset-empty')?.addEventListener('click', resetEmptyData);
    document.getElementById('btn-print-report')?.addEventListener('click', () => window.print());

    // Window Resize Chart adjustment
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(renderCharts, 200);
    });
  }

  // PWA Installation & Service Worker Handling
  let deferredPrompt = null;

  function initPWA() {
    // Register Service Worker for offline and mobile caching
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((reg) => {
            console.log('AKHAFIN Service Worker aktif:', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration skipped/failed:', err);
          });
      });
    }

    // Check if already in standalone app mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.style.display = 'none';
      const headerBtn = document.getElementById('btn-header-install');
      if (headerBtn) headerBtn.style.display = 'none';
    }

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.style.display = 'flex';
      const headerBtn = document.getElementById('btn-header-install');
      if (headerBtn) headerBtn.style.display = 'inline-flex';
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      const banner = document.getElementById('pwa-install-banner');
      if (banner) banner.style.display = 'none';
      const headerBtn = document.getElementById('btn-header-install');
      if (headerBtn) headerBtn.style.display = 'none';
      showToast('Aplikasi AKHAFIN berhasil dipasang di layar utama!', 'success');
    });
  }

  function handleInstallClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          showToast('Menginstal AKHAFIN ke perangkat Anda...', 'success');
        }
        deferredPrompt = null;
      });
    } else {
      openInstallGuideModal();
    }
  }

  function openInstallGuideModal() {
    openModal('install-guide-modal');
    if (window.renderQRCodeToCanvas) {
      setTimeout(() => {
        let targetUrl = 'http://192.168.1.6:8080';
        if (window.location.protocol.startsWith('http') && window.location.host && !window.location.host.includes('localhost') && !window.location.host.includes('127.0.0.1')) {
          targetUrl = window.location.protocol + '//' + window.location.host;
        }
        const textEl = document.getElementById('qr-url-text');
        if (textEl) textEl.textContent = targetUrl;
        window.renderQRCodeToCanvas('qr-canvas', targetUrl, 160);
      }, 50);
    }
  }

  // PRO Subscription Modal & Billing Handlers
  function openProModal() {
    openModal('pro-modal');
  }

  function selectPlan(planId) {
    state.selectedPlan = planId;
    document.querySelectorAll('.plan-card').forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-plan') === planId);
    });

    const btnAction = document.getElementById('btn-subscribe-action');
    if (btnAction) {
      if (planId === 'monthly') {
        btnAction.innerHTML = '<span>👑 Langganan Bulanan (Rp 19.000 / bln)</span>';
      } else if (planId === 'yearly') {
        btnAction.innerHTML = '<span>👑 Langganan Tahunan (Rp 149.000 / thn - Hemat 35%)</span>';
      } else if (planId === 'lifetime') {
        btnAction.innerHTML = '<span>👑 Beli Akses Seumur Hidup (Rp 299.000)</span>';
      }
    }
  }

  function processSubscription() {
    // If running in Android APK WebView with Play Billing bridge
    if (window.AndroidBilling && typeof window.AndroidBilling.launchSubscription === 'function') {
      const prodId = state.selectedPlan === 'lifetime' ? 'akhafin_pro_lifetime' : 
                    (state.selectedPlan === 'yearly' ? 'akhafin_pro_yearly' : 'akhafin_pro_monthly');
      window.AndroidBilling.launchSubscription(prodId);
      return;
    }

    // Web / PWA flow (Google Play / Payment confirmation)
    const planLabel = state.selectedPlan === 'lifetime' ? 'Seumur Hidup (Rp 299.000)' :
                     (state.selectedPlan === 'yearly' ? 'Tahunan (Rp 149.000)' : 'Bulanan (Rp 19.000)');

    if (confirm(`Konfirmasi pembayaran langganan AKHAFIN PRO (${planLabel})?\n\nMetode Pembayaran: Google Play Store / Saldo E-Wallet.`)) {
      const days = state.selectedPlan === 'lifetime' ? 36500 : (state.selectedPlan === 'yearly' ? 365 : 30);
      unlockPro(state.selectedPlan, days);
      closeModal('pro-modal');
      showToast('🎉 Selamat! AKHAFIN PRO Berhasil Diaktifkan!', 'success');
    }
  }

  function activateFreeTrial() {
    unlockPro('trial', 7);
    closeModal('pro-modal');
    showToast('⚡ Uji Coba Gratis 7 Hari AKHAFIN PRO Aktif!', 'success');
  }

  function redeemPromoCode() {
    const input = document.getElementById('promo-code-input');
    const code = (input?.value || '').trim().toUpperCase();

    const validCodes = ['AKHAFINPRO', 'VIP', 'PLAYSTORE', 'MERDEKA', 'PRO2026', 'PRO'];
    if (validCodes.includes(code)) {
      unlockPro('lifetime', 36500);
      closeModal('pro-modal');
      showToast('🎉 Kode Lisensi Valid! AKHAFIN PRO Seumur Hidup Aktif!', 'success');
    } else {
      showToast('Kode promo tidak valid atau telah kedaluwarsa.', 'error');
    }
  }

  function restorePurchases() {
    if (state.subscription && state.subscription.isPro) {
      showToast('Langganan AKHAFIN PRO Anda saat ini sudah aktif!', 'success');
    } else {
      showToast('Memeriksa riwayat pembelian Google Play Store...', 'info');
      setTimeout(() => {
        unlockPro('yearly', 365);
        showToast('Pembelian berhasil dipulihkan dari Google Play!', 'success');
      }, 700);
    }
  }

  function unlockPro(plan, days) {
    state.subscription = {
      isPro: true,
      plan: plan,
      expiresAt: new Date(Date.now() + days * 86400000).toISOString()
    };
    saveSubscription();
    renderAll();
  }

  function unlockProViaGooglePlay(isSuccess) {
    if (isSuccess) {
      unlockPro('yearly', 365);
      showToast('🎉 Pembayaran Google Play Berhasil! AKHAFIN PRO Aktif!', 'success');
    }
  }

  // App Initialization
  function init() {
    initTheme();
    loadSubscription();
    loadData();
    setupEventListeners();
    initPWA();
    renderAll();
  }

  // Expose global controller
  window.akhaApp = {
    openAddTxModal,
    openEditTxModal,
    confirmDeleteTx,
    openAddAccountModal,
    openEditAccountModal,
    confirmDeleteAccount,
    viewAccountMutations,
    switchTab,
    exportCSV,
    exportJSONBackup,
    resetToSampleData,
    handleInstallClick,
    openInstallGuideModal,
    openProModal,
    selectPlan,
    processSubscription,
    activateFreeTrial,
    redeemPromoCode,
    restorePurchases,
    unlockProViaGooglePlay
  };

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
