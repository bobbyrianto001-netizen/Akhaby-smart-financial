/**
 * AKHAFIN - Pure Canvas Chart Engine
 * Lightweight, zero external dependencies, responsive, supports Hi-DPI & Dark Mode
 */

class AkhaChartEngine {
  constructor() {
    this.activeTooltips = new Map();
  }

  isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  getTextColor() {
    return this.isDark() ? '#94a3b8' : '#64748b';
  }

  getGridColor() {
    return this.isDark() ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
  }

  setupCanvas(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    
    // Set actual resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return { ctx, width: rect.width, height: rect.height };
  }

  formatShortRupiah(val) {
    if (Math.abs(val) >= 1000000000) {
      return (val / 1000000000).toFixed(1) + ' M';
    }
    if (Math.abs(val) >= 1000000) {
      return (val / 1000000).toFixed(1) + ' jt';
    }
    if (Math.abs(val) >= 1000) {
      return (val / 1000).toFixed(0) + ' rb';
    }
    return val.toString();
  }

  formatFullRupiah(val) {
    return 'Rp ' + Number(val || 0).toLocaleString('id-ID');
  }

  /**
   * Cashflow Bar Chart (Income vs Expense)
   * data: { labels: ['Jan', 'Feb', ...], income: [100, 200, ...], expense: [50, 120, ...] }
   */
  renderCashflowBar(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, width, height } = this.setupCanvas(canvas);
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const labels = data.labels || [];
    const income = data.income || [];
    const expense = data.expense || [];

    if (labels.length === 0) {
      this.drawEmptyMessage(ctx, width, height, 'Belum ada data transaksi cashflow');
      return;
    }

    const padding = { top: 35, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxVal = Math.max(...income, ...expense, 1000000) * 1.15;

    // Draw horizontal grid lines & Y labels
    const gridLines = 4;
    ctx.strokeStyle = this.getGridColor();
    ctx.lineWidth = 1;
    ctx.fillStyle = this.getTextColor();
    ctx.font = '11px system-ui, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';

    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      const val = maxVal * (1 - i / gridLines);

      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillText(this.formatShortRupiah(val), padding.left - 8, y);
    }

    // Draw grouped bars
    const groupWidth = chartWidth / labels.length;
    const barWidth = Math.min(22, (groupWidth - 16) / 2);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    labels.forEach((label, idx) => {
      const groupX = padding.left + idx * groupWidth;
      const centerX = groupX + groupWidth / 2;

      // X Label
      ctx.fillStyle = this.getTextColor();
      ctx.fillText(label, centerX, height - padding.bottom + 10);

      // Income Bar
      const incVal = income[idx] || 0;
      const incH = (incVal / maxVal) * chartHeight;
      const incX = centerX - barWidth - 2;
      const incY = height - padding.bottom - incH;

      ctx.fillStyle = '#10b981'; // Green
      this.drawRoundedRect(ctx, incX, incY, barWidth, incH, 4, true, false);

      // Expense Bar
      const expVal = expense[idx] || 0;
      const expH = (expVal / maxVal) * chartHeight;
      const expX = centerX + 2;
      const expY = height - padding.bottom - expH;

      ctx.fillStyle = '#ef4444'; // Red
      this.drawRoundedRect(ctx, expX, expY, barWidth, expH, 4, true, false);
    });

    // Draw Legend Top Right
    this.drawLegend(ctx, width - padding.right, 15, [
      { color: '#10b981', label: 'Pemasukan' },
      { color: '#ef4444', label: 'Pengeluaran' }
    ]);
  }

  /**
   * Donut Chart for Expense Categories
   * data: [ { category: 'Makanan', amount: 500000, color: '#ff6384' }, ... ]
   */
  renderDonutChart(canvasId, items, centerText = 'Pengeluaran') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const { ctx, width, height } = this.setupCanvas(canvas);
    if (width === 0 || height === 0) return;

    ctx.clearRect(0, 0, width, height);

    const total = items.reduce((acc, it) => acc + (it.amount || 0), 0);

    if (total === 0 || items.length === 0) {
      this.drawEmptyMessage(ctx, width, height, 'Belum ada pengeluaran');
      return;
    }

    const centerX = width > 380 ? width * 0.38 : width * 0.5;
    const centerY = height * 0.5;
    const outerRadius = Math.min(centerX, centerY) - 20;
    const innerRadius = outerRadius * 0.65;

    let startAngle = -Math.PI / 2;

    const defaultColors = [
      '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
      '#ec4899', '#06b6d4', '#84cc16', '#64748b', '#14b8a6'
    ];

    items.forEach((item, idx) => {
      const sliceAngle = (item.amount / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      const color = item.color || defaultColors[idx % defaultColors.length];

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      // Border between slices
      ctx.strokeStyle = this.isDark() ? '#141d2e' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      startAngle = endAngle;
    });

    // Center Text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = this.getTextColor();
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(centerText, centerX, centerY - 10);

    ctx.fillStyle = this.isDark() ? '#ffffff' : '#0f172a';
    ctx.font = 'bold 13px system-ui, sans-serif';
    ctx.fillText(this.formatShortRupiah(total), centerX, centerY + 10);

    // If space allows on right side, draw category list
    if (width > 380) {
      const legendX = width * 0.72;
      const startY = Math.max(25, centerY - (items.slice(0, 5).length * 24) / 2);

      items.slice(0, 5).forEach((item, idx) => {
        const color = item.color || defaultColors[idx % defaultColors.length];
        const y = startY + idx * 26;
        const pct = ((item.amount / total) * 100).toFixed(1) + '%';

        // Dot
        ctx.beginPath();
        ctx.arc(legendX - 25, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Label
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.font = '11px system-ui, sans-serif';
        ctx.fillStyle = this.isDark() ? '#cbd5e1' : '#334155';
        
        let labelName = item.category || 'Lainnya';
        if (labelName.length > 12) labelName = labelName.substring(0, 11) + '..';
        ctx.fillText(labelName, legendX - 14, y);

        // Pct
        ctx.textAlign = 'right';
        ctx.fillStyle = this.getTextColor();
        ctx.fillText(pct, width - 15, y);
      });
    }
  }

  drawRoundedRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (height <= 0) return;
    if (height < radius) radius = height;

    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.closePath();

    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  drawLegend(ctx, rightX, topY, items) {
    ctx.font = '11px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    let currentX = rightX;

    items.slice().reverse().forEach(item => {
      const textWidth = ctx.measureText(item.label).width;
      const dotX = currentX - textWidth - 14;

      // Label
      ctx.textAlign = 'left';
      ctx.fillStyle = this.getTextColor();
      ctx.fillText(item.label, dotX + 12, topY);

      // Box/Dot
      ctx.fillStyle = item.color;
      ctx.beginPath();
      ctx.arc(dotX + 4, topY, 4, 0, Math.PI * 2);
      ctx.fill();

      currentX = dotX - 16;
    });
  }

  drawEmptyMessage(ctx, width, height, message) {
    ctx.fillStyle = this.getTextColor();
    ctx.font = '13px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(message, width / 2, height / 2);
  }
}

window.akhaChart = new AkhaChartEngine();
