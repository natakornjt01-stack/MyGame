const DAILY_VERSION = 1;

function thaiDateKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(now);
}

function makeQuest(date) {
  return {
    id: `daily-slime-${date}`,
    type: 'kill',
    targetType: 'slime',
    name: 'SLIME HUNT',
    description: 'กำจัด Slime ให้ครบ 5 ตัว',
    target: 5,
    progress: 0,
    reward: { coin: 25, exp: 50 },
    status: 'AVAILABLE',
    claimed: false,
    date,
  };
}

export default class DailyQuest {
  constructor(saved = null) {
    const raw = saved && typeof saved === 'object' ? saved : {};
    this.state = {
      version: DAILY_VERSION,
      date: raw.date || thaiDateKey(),
      quest: raw.quest || null,
      pending: Array.isArray(raw.pending) ? raw.pending : [],
    };
    this.refresh();
  }

  refresh(now = new Date()) {
    const today = thaiDateKey(now);
    if (this.state.date === today && this.state.quest) return;
    if (this.state.quest && this.state.quest.status === 'COMPLETED' && !this.state.quest.claimed) {
      this.state.pending.push({ ...this.state.quest });
    }
    this.state.date = today;
    this.state.quest = makeQuest(today);
  }

  getCurrent() { this.refresh(); return this.state.quest; }
  getPending() { this.refresh(); return this.state.pending; }

  accept() {
    const quest = this.getCurrent();
    if (quest.status === 'AVAILABLE') quest.status = 'ACTIVE';
    return quest;
  }

  onEnemyKill(type) {
    const quest = this.getCurrent();
    if (quest.status !== 'ACTIVE' || type !== quest.targetType) return false;
    quest.progress = Math.min(quest.target, quest.progress + 1);
    if (quest.progress >= quest.target) quest.status = 'COMPLETED';
    return true;
  }

  claim() {
    const candidates = [this.getCurrent(), ...this.getPending()];
    const quest = candidates.find(q => q && q.status === 'COMPLETED' && !q.claimed);
    if (!quest) return null;
    quest.claimed = true;
    quest.status = 'CLAIMED';
    this.state.pending = this.state.pending.filter(q => q.id !== quest.id);
    return { ...quest.reward };
  }

  getData() { this.refresh(); return JSON.parse(JSON.stringify(this.state)); }
}

export { thaiDateKey };
