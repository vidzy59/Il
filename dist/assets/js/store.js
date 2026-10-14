/* Store global: filter katalog, pembanding. */
const KEY = "fonobase-state-v1";

const defaults = {
  filters: { q: "", merek: "", hargaMaks: "", ramMin: "", storageMin: "", bateraiMin: "", jaringan: "", nfc: "" },
  sort: "skor",
  page: 1,
  compare: [],
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaults);
    return { ...structuredClone(defaults), ...JSON.parse(raw) };
  } catch { return structuredClone(defaults); }
}

export const store = {
  state: load(),
  listeners: new Set(),
  save() {
    try { localStorage.setItem(KEY, JSON.stringify({ filters: this.state.filters, sort: this.state.sort, compare: this.state.compare })); } catch {}
  },
  setFilters(patch) {
    this.state.filters = { ...this.state.filters, ...patch };
    this.state.page = 1;
    this.save(); this.emit();
  },
  resetFilters() {
    this.state.filters = structuredClone(defaults.filters);
    this.state.page = 1;
    this.save(); this.emit();
  },
  setSort(v) { this.state.sort = v; this.save(); this.emit(); },
  setPage(v) { this.state.page = v; this.emit(); },
  toggleCompare(id) {
    const c = this.state.compare;
    if (c.includes(id)) this.state.compare = c.filter(x => x !== id);
    else if (c.length < 3) this.state.compare = [...c, id];
    else { this.state.compare = [...c.slice(1), id]; }
    this.save(); this.emit();
  },
  removeCompare(id) {
    this.state.compare = this.state.compare.filter(x => x !== id);
    this.save(); this.emit();
  },
  setCompare(ids) {
    this.state.compare = ids.slice(0, 3);
    this.save(); this.emit();
  },
  on(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); },
  emit() { this.listeners.forEach(fn => fn(this.state)); },
};
