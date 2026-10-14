/* Grafik canvas tanpa dependensi. */
export function drawLineChart(canvas, series, labels) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600, h = 260;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const pad = { l: 64, r: 16, t: 18, b: 30 };
  const min = Math.min(...series) * 0.995, max = Math.max(...series) * 1.005;
  const X = (i) => pad.l + (i * (w - pad.l - pad.r)) / (series.length - 1);
  const Y = (v) => pad.t + (1 - (v - min) / (max - min)) * (h - pad.t - pad.b);
  ctx.strokeStyle = "#dfe6ee"; ctx.fillStyle = "#5d6f83"; ctx.font = "11px sans-serif"; ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const v = min + ((max - min) * g) / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke();
    ctx.fillText("Rp " + (v / 1e9).toFixed(2) + " M", 4, Y(v) + 4);
  }
  // area
  const grad = ctx.createLinearGradient(0, pad.t, 0, h - pad.b);
  grad.addColorStop(0, "rgba(20,80,127,.28)"); grad.addColorStop(1, "rgba(20,80,127,.03)");
  ctx.beginPath(); ctx.moveTo(X(0), Y(series[0]));
  series.forEach((v, i) => ctx.lineTo(X(i), Y(v)));
  ctx.lineTo(X(series.length - 1), h - pad.b); ctx.lineTo(X(0), h - pad.b); ctx.closePath();
  ctx.fillStyle = grad; ctx.fill();
  // line
  ctx.beginPath(); series.forEach((v, i) => (i ? ctx.lineTo(X(i), Y(v)) : ctx.moveTo(X(i), Y(v))));
  ctx.strokeStyle = "#0f3a5d"; ctx.lineWidth = 2.5; ctx.stroke();
  // points + labels
  ctx.fillStyle = "#0f3a5d";
  series.forEach((v, i) => { ctx.beginPath(); ctx.arc(X(i), Y(v), 4, 0, 7); ctx.fill(); });
  ctx.fillStyle = "#5d6f83";
  labels.forEach((l, i) => { if (i % 1 === 0) ctx.fillText(l, X(i) - 12, h - 10); });
}

export function drawScoreBars(canvas, rows) {
  // rows: [{label, values:[..], max}]
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 600;
  const h = rows.length * 44 + 20;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const colors = ["#0f3a5d", "#b07e1f", "#1e7a4c"];
  rows.forEach((r, i) => {
    const y = 14 + i * 44;
    ctx.fillStyle = "#1b2735"; ctx.font = "bold 12px sans-serif";
    ctx.fillText(r.label, 4, y);
    r.values.forEach((v, j) => {
      const bw = ((w - 170) * v) / r.max;
      const by = y + 8 + j * 0; // stacked? use segmented
    });
    // grouped bars
    const groupW = w - 170;
    const bh = 10, gap = 4;
    r.values.forEach((v, j) => {
      const bw = (groupW * v) / r.max;
      const by = y + 8 + j * (bh + gap);
      ctx.fillStyle = "#e7edf3";
      ctx.fillRect(160, by, groupW, bh);
      ctx.fillStyle = colors[j % colors.length];
      ctx.fillRect(160, by, bw, bh);
    });
  });
  canvas.style.height = h + "px";
}
