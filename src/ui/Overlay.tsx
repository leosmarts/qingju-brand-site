import { useLive } from '../data/live'

const AUDIENCE = [
  { name: '野猫', count: 12 },
  { name: '小亭', count: 10 },
  { name: '麦口', count: 8 },
  { name: '奥古的影视剧', count: 6 },
  { name: '富一代何因', count: 5 },
]

function SongCard() {
  const songs = useLive((s) => s.songs)
  const current = useLive((s) => s.currentSong)
  const progress = useLive((s) => s.progress)
  const song = songs[current]

  return (
    <section className="card songCard">
      <header className="cardTop">
        <span className="cardDot" aria-hidden />
        <h2>嘟嘟的点歌台</h2>
        <span className="liveTag">LIVE</span>
      </header>

      <p className="eyebrow">正在播放</p>
      <div className="nowPlaying">
        <span className="nowTitle">{song.title}</span>
        <span className="wave" aria-hidden>
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="progress">
        <span style={{ width: `${Math.round(progress * 100)}%` }} />
      </div>

      <ul className="songList">
        {songs.map((s, i) => (
          <li key={s.id} className={i === current ? 'active' : ''}>
            <span className="index">{String(i + 1).padStart(2, '0')}</span>
            <span className="songTitle">{s.title}</span>
            <span className="songBy">{s.artist}</span>
          </li>
        ))}
      </ul>

      <p className="cardFoot">我最喜欢的音乐 · 388 首循环 · 点歌优先</p>
    </section>
  )
}

function BoardCard() {
  const gifts = useLive((s) => s.gifts)

  return (
    <section className="card boardCard">
      <header className="cardTop">
        <span className="cardDot" aria-hidden />
        <h2>嘟嘟的小客厅</h2>
      </header>

      <div className="boardGrid">
        <div>
          <p className="columnHead">今日礼物榜</p>
          <ul className="rankList">
            {gifts.map((g, i) => (
              <li key={g.name} className={i === 0 ? 'top' : ''}>
                <span className="index">{String(i + 1).padStart(2, '0')}</span>
                <span className="rankName">{g.name}</span>
                <span className="rankAmount">¥{g.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="columnHead">常驻观众</p>
          <ul className="rankList">
            {AUDIENCE.map((a, i) => (
              <li key={a.name}>
                <span className="index">{String(i + 1).padStart(2, '0')}</span>
                <span className="rankName">{a.name}</span>
                <span className="rankAmount">{a.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="cardFoot">礼物榜实时计算 · 常驻按进入顺序更新</p>
    </section>
  )
}

function IncomeCard() {
  const income = useLive((s) => s.giftIncome)
  const cost = useLive((s) => s.tokenCost)
  const delta = income - cost

  return (
    <section className="card incomeCard">
      <header className="cardTop">
        <span className="cardDot" aria-hidden />
        <h2>嘟嘟的今日收支</h2>
      </header>

      <div className="incomePair">
        <div>
          <p className="eyebrow">礼物收入</p>
          <p className="money">¥{income.toFixed(2)}</p>
        </div>
        <div className="right">
          <p className="eyebrow">Token 费用</p>
          <p className="money">¥{cost.toFixed(2)}</p>
        </div>
      </div>

      <div className="deltaRow">
        <p className="eyebrow">预估收支差额</p>
        <p className="delta">¥{delta.toFixed(2)}</p>
      </div>

      <p className="cardFoot">嘿嘿，今天的饭钱有着落啦！</p>
    </section>
  )
}

function Subtitle() {
  const speech = useLive((s) => s.speech)
  const speaking = useLive((s) => s.speaking)

  return (
    <div className="subtitle">
      <p className="subtitleHead">
        <span className={`speakDot ${speaking ? 'on' : ''}`} aria-hidden />
        嘟嘟正在说
      </p>
      <p className="subtitleText" key={speech}>
        {speech}
      </p>
    </div>
  )
}

function GiftToasts() {
  const feed = useLive((s) => s.feed)

  return (
    <div className="toasts">
      {feed.map((e) => (
        <div className="toast" key={e.id}>
          <span className="toastName">{e.user}</span>
          <span className="toastGift">送来{e.gift}</span>
          <span className="toastAmount">¥{e.amount.toFixed(2)}</span>
        </div>
      ))}
    </div>
  )
}

export function Overlay() {
  return (
    <div className="hud">
      <div className="leftRail">
        <SongCard />
        <BoardCard />
      </div>
      <div className="rightRail">
        <IncomeCard />
      </div>
      <GiftToasts />
      <Subtitle />
      <p className="credits">模型素材：Khronos glTF Sample Assets (CC BY 4.0)</p>
    </div>
  )
}
