import { create } from 'zustand'

export type Song = {
  id: number
  title: string
  artist: string
}

export type GiftRow = {
  name: string
  amount: number
}

export type GiftEvent = {
  id: number
  user: string
  gift: string
  amount: number
  at: number
}

type LiveState = {
  songs: Song[]
  currentSong: number
  progress: number
  gifts: GiftRow[]
  giftIncome: number
  tokenCost: number
  speaking: boolean
  speech: string
  feed: GiftEvent[]
  hot: string
  tick: () => void
  say: (text: string) => void
  reset: () => void
}

const SEED_SONGS: Song[] = [
  { id: 1, title: '出卖', artist: '哪吒' },
  { id: 2, title: '你过得好吗', artist: '哪吒' },
  { id: 3, title: '当爱在靠近', artist: '刘若英' },
  { id: 4, title: '伯乐', artist: '佚名' },
  { id: 5, title: '故梦（Cover 银临）', artist: '佚名' },
]

const SEED_GIFTS: GiftRow[] = [
  { name: '不如吃鱼', amount: 1.0 },
  { name: '富二代何因', amount: 1.0 },
  { name: '小亭', amount: 0.4 },
  { name: '麦口', amount: 0.2 },
  { name: '勤务农村汉', amount: 0.2 },
]

const GIFT_NAMES = ['小鱼干', '棉花糖', '热可可', '橘子', '围巾']
const SPEECHES = [
  '麦口，欢迎光临！请坐，请坐！',
  '今天的晚霞好漂亮，你看窗外～',
  '谢谢「不如吃鱼」的小鱼干，好香！',
  '下一首想听什么？打在公屏上。',
  '外面有点降温了，记得多穿一件。',
  '这首歌我练了好久，希望能唱好。',
]

let eventId = 0
const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)]

const initialState = {
  songs: SEED_SONGS,
  currentSong: 0,
  progress: 0.18,
  gifts: SEED_GIFTS,
  giftIncome: 2.0,
  tokenCost: 0.67,
  speaking: true,
  speech: SPEECHES[0],
  feed: [] as GiftEvent[],
  hot: '欢迎光临，随便坐～',
}

export const useLive = create<LiveState>((set, get) => ({
  ...initialState,

  say: (text: string) => set({ speech: text, speaking: true }),

  tick: () => {
    const state = get()
    const progress = state.progress + 0.02
    if (progress >= 1) {
      const next = (state.currentSong + 1) % state.songs.length
      set({ currentSong: next, progress: 0, speaking: true, speech: '接下来这首，送给还没睡的你们。' })
      return
    }

    const roll = Math.random()

    if (roll < 0.42) {
      const user = pick(SEED_GIFTS).name
      const gift = pick(GIFT_NAMES)
      const amount = Number((Math.random() * 0.8 + 0.2).toFixed(2))
      const gifts = state.gifts
        .map((row) => (row.name === user ? { ...row, amount: Number((row.amount + amount).toFixed(2)) } : row))
        .concat(state.gifts.some((row) => row.name === user) ? [] : [{ name: user, amount }])
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 6)

      eventId += 1
      set({
        progress,
        gifts,
        giftIncome: Number((state.giftIncome + amount).toFixed(2)),
        feed: [{ id: eventId, user, gift, amount, at: Date.now() }, ...state.feed].slice(0, 3),
        speech: `谢谢「${user}」的${gift}，${pick(['谢谢你呀～', '收到啦，好开心！', '这份心意我记下了。'])}`,
        speaking: true,
      })
      return
    }

    set({
      progress,
      tokenCost: Number((state.tokenCost + 0.004).toFixed(2)),
      speaking: roll < 0.72,
      speech: roll < 0.5 ? state.speech : pick(SPEECHES),
    })
  },

  reset: () => set({ ...initialState, feed: [] }),
}))
