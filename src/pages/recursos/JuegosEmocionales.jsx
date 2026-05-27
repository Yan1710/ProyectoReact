import { useState, useEffect, useRef } from "react";
import './JuegosEmocionales.css';

/* ═══════════════════════════════════════════════════
   JUEGOS PSICOEDUCATIVOS
   Salud mental · Fondo blanco · Paleta suave
═══════════════════════════════════════════════════ */

const G = {
  bg:       "#ffffff",
  paper:    "#fafafa",
  card:     "#ffffff",
  ink:      "#2d2d2d",
  muted:    "#9a9a9a",
  border:   "#e8e8e8",
  rose:     "#c4748a",
  teal:     "#6aacaa",
  amber:    "#c49a6a",
  indigo:   "#8494b8",
  sage:     "#7aaa82",
  coral:    "#c47a6a",
  lavender: "#a494c4",
  sky:      "#6a9ec4",
};

/* ═══════════ DATA ═══════════ */
const DECKS = {
  emotions: {
    label: "Emociones", icon: "🎭", color: G.rose,
    description: "Conecta emociones con sus descripciones",
    pairs: [
      { id:"a1", type:"emoji", value:"😰", group:"ansiedad" },
      { id:"a2", type:"text",  value:"Preocupación intensa ante lo incierto", group:"ansiedad" },
      { id:"b1", type:"emoji", value:"😔", group:"tristeza" },
      { id:"b2", type:"text",  value:"Sentimiento de pérdida o vacío interior", group:"tristeza" },
      { id:"c1", type:"emoji", value:"😤", group:"enojo" },
      { id:"c2", type:"text",  value:"Energía que surge ante la injusticia", group:"enojo" },
      { id:"d1", type:"emoji", value:"😊", group:"alegria" },
      { id:"d2", type:"text",  value:"Bienestar cuando las cosas fluyen bien", group:"alegria" },
      { id:"e1", type:"emoji", value:"😌", group:"calma" },
      { id:"e2", type:"text",  value:"Paz interior cuando aceptamos el momento", group:"calma" },
      { id:"f1", type:"emoji", value:"😳", group:"verguenza" },
      { id:"f2", type:"text",  value:"Incomodidad ante la mirada de otros", group:"verguenza" },
    ],
  },
  coping: {
    label: "Afrontamiento", icon: "🛡️", color: G.teal,
    description: "Empareja el problema con su estrategia",
    pairs: [
      { id:"a1", type:"problem",  value:"Me siento abrumado/a", group:"respiracion" },
      { id:"a2", type:"strategy", value:"Respira profundo 4-4-6", group:"respiracion" },
      { id:"b1", type:"problem",  value:"No puedo dormir por pensamientos", group:"journaling" },
      { id:"b2", type:"strategy", value:"Escribe lo que te preocupa antes de dormir", group:"journaling" },
      { id:"c1", type:"problem",  value:"Me siento desconectado/a de todo", group:"grounding" },
      { id:"c2", type:"strategy", value:"Técnica 5-4-3-2-1 de los sentidos", group:"grounding" },
      { id:"d1", type:"problem",  value:"Tengo mucha energía negativa acumulada", group:"ejercicio" },
      { id:"d2", type:"strategy", value:"Camina 10 minutos al aire libre", group:"ejercicio" },
      { id:"e1", type:"problem",  value:"Me critico constantemente", group:"autocompasion" },
      { id:"e2", type:"strategy", value:"Habla contigo como hablarías a un amigo", group:"autocompasion" },
      { id:"f1", type:"problem",  value:"Me siento solo/a con mis emociones", group:"conexion" },
      { id:"f2", type:"strategy", value:"Busca a alguien de confianza para hablar", group:"conexion" },
    ],
  },
  thoughts: {
    label: "Pensamientos", icon: "💭", color: G.indigo,
    description: "Une el pensamiento distorsionado con su nombre",
    pairs: [
      { id:"a1", type:"thought",    value:'"Todo me sale mal, siempre"', group:"generalizacion" },
      { id:"a2", type:"distortion", value:"Generalización excesiva", group:"generalizacion" },
      { id:"b1", type:"thought",    value:'"Sé que va a salir mal"', group:"adivinacion" },
      { id:"b2", type:"distortion", value:"Adivinación del futuro", group:"adivinacion" },
      { id:"c1", type:"thought",    value:'"Me miraron raro, me odian"', group:"lectura" },
      { id:"c2", type:"distortion", value:"Lectura de mente", group:"lectura" },
      { id:"d1", type:"thought",    value:'"Si no es perfecto, no sirve"', group:"perfeccion" },
      { id:"d2", type:"distortion", value:"Pensamiento todo-o-nada", group:"perfeccion" },
      { id:"e1", type:"thought",    value:'"Esto es terrible, no lo soporto"', group:"catastrofe" },
      { id:"e2", type:"distortion", value:"Catastrofización", group:"catastrofe" },
      { id:"f1", type:"thought",    value:'"Debería ser más fuerte"', group:"deber" },
      { id:"f2", type:"distortion", value:'Tiranía del "debería"', group:"deber" },
    ],
  },
  selfcare: {
    label: "Autocuidado", icon: "🌱", color: G.sage,
    description: "Conecta el área de vida con su práctica",
    pairs: [
      { id:"a1", type:"area",     value:"🧠 Mente", group:"mente" },
      { id:"a2", type:"practice", value:"Medita 5 min cada mañana", group:"mente" },
      { id:"b1", type:"area",     value:"💪 Cuerpo", group:"cuerpo" },
      { id:"b2", type:"practice", value:"Mueve el cuerpo 30 min diarios", group:"cuerpo" },
      { id:"c1", type:"area",     value:"❤️ Vínculos", group:"vinculos" },
      { id:"c2", type:"practice", value:"Llama a alguien que aprecias hoy", group:"vinculos" },
      { id:"d1", type:"area",     value:"😴 Descanso", group:"descanso" },
      { id:"d2", type:"practice", value:"Duerme a la misma hora cada día", group:"descanso" },
      { id:"e1", type:"area",     value:"🎨 Creatividad", group:"creatividad" },
      { id:"e2", type:"practice", value:"Dedica tiempo a algo que disfrutes", group:"creatividad" },
      { id:"f1", type:"area",     value:"🌿 Naturaleza", group:"naturaleza" },
      { id:"f2", type:"practice", value:"Sal afuera 10 min sin pantallas", group:"naturaleza" },
    ],
  },
};

/* ═══════════ UTILS ═══════════ */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function useTimer(running) {
  const [t, setT] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (running) ref.current = setInterval(() => setT(s => s + 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [running]);
  const reset = () => setT(0);
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return { t, fmt: fmt(t), reset };
}

/* ══════════════════════════════════════════════════
   PILL — stat chip en el HUD
══════════════════════════════════════════════════ */
function Pill({ label, value, color, mono, icon }) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}18, ${color}0a)`,
      border: `1.5px solid ${color}30`,
      borderRadius: 12, padding: "6px 12px", textAlign: "center",
    }}>
      {icon && <span style={{ fontSize: 12, marginBottom: 2, display: "block" }}>{icon}</span>}
      <p style={{ fontSize: 17, fontWeight: 700, color, lineHeight: 1, fontFamily: mono ? "monospace" : "'Outfit',sans-serif" }}>{value}</p>
      <p style={{ fontSize: 10, color: G.muted, marginTop: 2, fontWeight: 500, letterSpacing: ".04em", textTransform: "uppercase" }}>{label}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   HUD — barra de estado superior
══════════════════════════════════════════════════ */
function HUD({ pills, color, onRestart }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      background: "rgba(255,255,255,.8)", backdropFilter: "blur(10px)",
      borderRadius: 16, padding: "10px 14px",
      border: `1.5px solid ${G.border}`,
      boxShadow: "0 2px 12px rgba(0,0,0,.05)",
      marginBottom: 2,
    }}>
      <div style={{ display: "flex", gap: 10 }}>
        {pills.map(p => <Pill key={p.label} {...p} color={color} />)}
      </div>
      <button className="btn" onClick={onRestart} style={{
        padding: "8px 16px", borderRadius: 10,
        background: `${color}15`, color, border: `1.5px solid ${color}35`,
        fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 5,
      }}>
        <span
          style={{ display: "inline-block", transition: "transform .3s" }}
          onMouseEnter={e => e.currentTarget.style.transform = "rotate(180deg)"}
          onMouseLeave={e => e.currentTarget.style.transform = "rotate(0deg)"}
        >↺</span>
        Reiniciar
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   WIN BANNER
══════════════════════════════════════════════════ */
function WinBanner({ moves, time, color, onRestart, onBack, extra }) {
  const confettiColors = [G.rose, G.teal, G.amber, G.indigo, G.sage];
  return (
    <div className="pop-in" style={{ position: "relative", overflow: "hidden" }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} className="confetti-piece" style={{
          left: `${Math.random() * 100}%`, top: 0,
          background: confettiColors[i % confettiColors.length],
          animationDelay: `${Math.random() * .4}s`,
          animationDuration: `${.6 + Math.random() * .6}s`,
          borderRadius: Math.random() > .5 ? "50%" : "2px",
        }} />
      ))}
      <div style={{
        background: `linear-gradient(145deg, ${color}12, ${G.teal}0e, ${G.paper})`,
        border: `2px solid ${color}40`,
        borderRadius: 20, padding: "28px 24px", textAlign: "center",
        boxShadow: `0 8px 40px ${color}1a, inset 0 1px 0 rgba(255,255,255,.8)`,
      }}>
        <div className="heartbeat" style={{ fontSize: 44, marginBottom: 10, display: "inline-block" }}>🎉</div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 700, marginBottom: 6, color: G.ink }}>
          ¡Lo lograste!
        </h3>
        <p style={{ color: G.muted, fontSize: 13, marginBottom: 20, lineHeight: 1.7 }}>
          {moves} movimientos · {time}{extra ? ` · ${extra}` : ""}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button className="btn" onClick={onRestart} style={{
            padding: "12px 28px", borderRadius: 12,
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            color: "#fff", fontSize: 14, fontWeight: 600,
            boxShadow: `0 4px 16px ${color}44`,
          }}>
            Jugar de nuevo
          </button>
          <button className="btn" onClick={onBack} style={{
            padding: "12px 24px", borderRadius: 12,
            background: G.card, color: G.muted, fontSize: 14,
            border: `1.5px solid ${G.border}`,
          }}>
            Menú
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   JUEGO 1 — VOLTEAR PAREJAS
══════════════════════════════════════════════════ */
function MemoryFlip({ deck, onBack, color }) {
  const [board, setBoard] = useState(() => shuffle(deck.pairs).map((c, i) => ({ ...c, uid: `${c.id}-${i}` })));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);
  const { fmt, reset } = useTimer(!done && board.length > 0);

  const flip = (uid) => {
    if (locked || flipped.includes(uid) || matched.includes(uid)) return;
    const next = [...flipped, uid];
    setFlipped(next);
    if (next.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = next.map(u => board.find(c => c.uid === u));
      if (a.group === b.group) {
        const nm = [...matched, a.uid, b.uid];
        setMatched(nm); setFlipped([]); setLocked(false);
        if (nm.length === board.length) setDone(true);
      } else {
        setWrong(next);
        setTimeout(() => { setFlipped([]); setWrong([]); setLocked(false); }, 900);
      }
    }
  };

  const restart = () => {
    setBoard(shuffle(deck.pairs).map((c, i) => ({ ...c, uid: `${c.id}-${i}` })));
    setFlipped([]); setMatched([]); setMoves(0);
    setWrong([]); setLocked(false); setDone(false); reset();
  };

  const isFlipped = uid => flipped.includes(uid) || matched.includes(uid);
  const isWrong   = uid => wrong.includes(uid);
  const isMatch   = uid => matched.includes(uid);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HUD color={color} onRestart={restart} pills={[
        { label: "Movimientos", value: moves },
        { label: "Tiempo", value: fmt, mono: true, icon: "⏱" },
        { label: "Pares", value: `${matched.length / 2}/${board.length / 2}`, icon: "✦" },
      ]} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
        {board.map((card, idx) => {
          const revealed = isFlipped(card.uid);
          const match = isMatch(card.uid);
          const err = isWrong(card.uid);
          return (
            <div key={card.uid} className="card-flip"
              style={{ height: 88, cursor: revealed ? "default" : "pointer", animation: `fadeUp .3s ease ${idx * .03}s both` }}
              onClick={() => flip(card.uid)}>
              <div className={`card-inner ${revealed ? "flipped" : ""}`}>
                <div className="card-face" style={{
                  background: `linear-gradient(145deg, ${color}1a, ${color}08)`,
                  border: `2px solid ${color}30`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `${color}20`, border: `1.5px solid ${color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                  }}>✦</div>
                </div>
                <div className={`card-face card-back ${err ? "shake" : ""}`} style={{
                  background: match ? `linear-gradient(135deg, ${G.teal}1a, ${G.teal}08)` : err ? `${G.rose}12` : G.card,
                  border: `2px solid ${match ? G.teal : err ? G.rose : color}50`,
                  padding: 8, flexDirection: "column", gap: 2,
                  animation: match ? "matchPop .35s ease, glow .6s ease" : undefined,
                  boxShadow: match ? `0 0 12px ${G.teal}30` : undefined,
                }}>
                  {match && (
                    <div style={{
                      position: "absolute", top: 6, right: 6, width: 16, height: 16,
                      background: G.teal, borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 9, color: "#fff",
                    }}>✓</div>
                  )}
                  <span style={{
                    fontSize: (card.type === "emoji" || card.type === "area") ? 24 : 10.5,
                    textAlign: "center", lineHeight: 1.4,
                    color: match ? G.teal : err ? G.rose : G.ink,
                    fontWeight: (card.type === "emoji" || card.type === "area") ? 400 : 600,
                  }}>
                    {card.value}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {done && <WinBanner moves={moves} time={fmt} color={color} onRestart={restart} onBack={onBack} />}

      <button className="btn" onClick={onBack} style={{
        padding: "9px 16px", borderRadius: 10, background: G.border,
        color: G.muted, fontSize: 13, alignSelf: "flex-start", border: `1.5px solid ${G.border}`,
      }}>← Volver</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   JUEGO 2 — CONECTAR COLUMNAS
══════════════════════════════════════════════════ */
function PairConnect({ deck, onBack, color }) {
  const half = deck.pairs.length / 2;
  const [leftCards]  = useState(() => shuffle(deck.pairs.filter((_, i) => i % 2 === 0)));
  const [rightCards] = useState(() => shuffle(deck.pairs.filter((_, i) => i % 2 === 1)));
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState([]);
  const [done, setDone] = useState(false);
  const [moves, setMoves] = useState(0);
  const { fmt, reset } = useTimer(!done);

  const connectedIds = connections.flatMap(c => [c.leftId, c.rightId]);

  const select = (side, card) => {
    if (connectedIds.includes(card.id)) return;
    if (!selected) { setSelected({ side, card }); return; }
    if (selected.side === side) { setSelected({ side, card }); return; }
    const left  = side === "right" ? selected.card : card;
    const right = side === "right" ? card : selected.card;
    const correct = left.group === right.group;
    const nc = [...connections, { leftId: left.id, rightId: right.id, correct }];
    setConnections(nc); setSelected(null); setMoves(m => m + 1);
    if (nc.length === half) setDone(true);
  };

  const restart = () => { setConnections([]); setSelected(null); setMoves(0); setDone(false); reset(); };
  const getConn = (side, id) => connections.find(c => side === "left" ? c.leftId === id : c.rightId === id);
  const isSel   = (side, id) => selected?.side === side && selected?.card.id === id;
  const correctCount = connections.filter(c => c.correct).length;

  const ConnBtn = ({ card, side, idx }) => {
    const conn = getConn(side, card.id);
    const sel  = isSel(side, card.id);
    return (
      <button className="btn" onClick={() => select(side, card)}
        style={{
          padding: "11px 13px", borderRadius: 13, textAlign: "left",
          background: conn ? (conn.correct ? `${G.teal}14` : `${G.rose}10`) : sel ? `${color}15` : G.card,
          border: `2px solid ${conn ? (conn.correct ? G.teal : G.rose) : sel ? color : G.border}`,
          fontSize: 12, lineHeight: 1.5,
          color: conn?.correct ? G.teal : G.ink,
          opacity: connectedIds.includes(card.id) && !sel ? .8 : 1,
          transform: "scale(1)",
          fontFamily: "'Outfit',sans-serif",
          boxShadow: sel ? `0 4px 16px ${color}30` : "0 1px 4px rgba(0,0,0,.04)",
          animation: "none",
          position: "relative",
        }}>
        {sel && (
          <div style={{
            position: "absolute", inset: -2, borderRadius: 15,
            border: `2px solid ${color}`, pointerEvents: "none",
            animation: "glow .8s ease infinite",
          }} />
        )}
        <span style={{ display: "block", paddingRight: conn ? 20 : 0 }}>{card.value}</span>
        {conn && (
          <span style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontSize: 14, color: conn.correct ? G.teal : G.rose, fontWeight: 700,
          }}>
            {conn.correct ? "✓" : "✗"}
          </span>
        )}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HUD color={color} onRestart={restart} pills={[
        { label: "Conexiones", value: `${connections.length}/${half}` },
        { label: "Correctas", value: correctCount, icon: "✓" },
        { label: "Tiempo", value: fmt, mono: true, icon: "⏱" },
      ]} />

      <div style={{
        background: `${color}08`, border: `1px dashed ${color}40`,
        borderRadius: 12, padding: "8px 12px", textAlign: "center",
        fontSize: 12, color, fontWeight: 600,
      }}>
        {selected
          ? `✦ "${selected.card.value.slice(0, 30)}…" seleccionado — elige su par`
          : "Toca un elemento izquierdo y luego su pareja derecha"}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {leftCards.map((card, i) => <ConnBtn key={card.id} card={card} side="left" idx={i} />)}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {rightCards.map((card, i) => <ConnBtn key={card.id} card={card} side="right" idx={i} />)}
        </div>
      </div>

      {done && <WinBanner moves={moves} time={fmt} color={color} onRestart={restart} onBack={onBack}
        extra={`${correctCount}/${half} correctas`} />}

      <button className="btn" onClick={onBack} style={{
        padding: "9px 16px", borderRadius: 10, background: G.border,
        color: G.muted, fontSize: 13, alignSelf: "flex-start", border: `1.5px solid ${G.border}`,
      }}>← Volver</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   JUEGO 3 — CLASIFICAR CARTAS
══════════════════════════════════════════════════ */
function SortMatch({ deck, onBack, color }) {
  const categories = [...new Set(deck.pairs.map(p => p.group))];
  const catLabels = deck.pairs.reduce((acc, p) => {
    if (["emoji", "area", "problem", "thought"].includes(p.type)) acc[p.group] = p.value;
    return acc;
  }, {});
  const textTypes = ["text", "strategy", "distortion", "practice"];

  const [cards]    = useState(() => shuffle(deck.pairs.filter(p => textTypes.includes(p.type))));
  const [current,  setCurrent]  = useState(0);
  const [buckets,  setBuckets]  = useState(() => Object.fromEntries(categories.map(c => [c, []])));
  const [feedback, setFeedback] = useState(null);
  const [done,     setDone]     = useState(false);
  const [score,    setScore]    = useState(0);
  const [moves,    setMoves]    = useState(0);
  const [hovering, setHovering] = useState(null);
  const { fmt, reset } = useTimer(!done && current < cards.length);

  const drop = (group) => {
    if (current >= cards.length || feedback) return;
    const card = cards[current];
    const correct = card.group === group;
    setFeedback(correct ? "correct" : "wrong");
    setMoves(m => m + 1);
    if (correct) setScore(s => s + 1);
    setBuckets(b => ({ ...b, [group]: [...b[group], { ...card, correct }] }));
    setTimeout(() => {
      setFeedback(null);
      const next = current + 1;
      setCurrent(next);
      if (next >= cards.length) setDone(true);
    }, 750);
  };

  const restart = () => {
    setCurrent(0);
    setBuckets(Object.fromEntries(categories.map(c => [c, []])));
    setFeedback(null); setDone(false); setScore(0); setMoves(0); reset();
  };

  const activeCard = cards[current];
  const progress   = (current / cards.length) * 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <HUD color={color} onRestart={restart} pills={[
        { label: "Correctas", value: score, icon: "✓" },
        { label: "Quedan", value: cards.length - current },
        { label: "Tiempo", value: fmt, mono: true, icon: "⏱" },
      ]} />

      <div style={{ height: 6, background: `${color}18`, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${progress}%`,
          background: `linear-gradient(90deg, ${color}, ${color}aa)`,
          borderRadius: 99, transition: "width .5s cubic-bezier(.4,0,.2,1)",
        }} />
      </div>

      <div style={{ minHeight: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {activeCard && !done ? (
          <div key={current} className="pop-in" style={{
            background: feedback === "correct" ? `linear-gradient(135deg, ${G.teal}18, ${G.teal}08)`
              : feedback === "wrong" ? `${G.rose}10` : G.card,
            border: `2px solid ${feedback === "correct" ? G.teal : feedback === "wrong" ? G.rose : color}50`,
            borderRadius: 18, padding: "20px 28px", textAlign: "center",
            maxWidth: 340, width: "100%",
            boxShadow: `0 8px 32px ${color}18, inset 0 1px 0 rgba(255,255,255,.9)`,
            transition: "all .3s ease",
          }}>
            <p style={{ fontSize: 10, color, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: ".1em" }}>
              ¿A cuál categoría pertenece?
            </p>
            <p style={{ fontSize: 15, lineHeight: 1.65, color: G.ink, fontWeight: 500 }}>
              {activeCard.value}
            </p>
            {feedback && (
              <div className="fade-in" style={{
                marginTop: 10, fontSize: 13, fontWeight: 700,
                color: feedback === "correct" ? G.teal : G.rose,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              }}>
                <span style={{ fontSize: 18 }}>{feedback === "correct" ? "✓" : "✗"}</span>
                {feedback === "correct" ? "¡Correcto!" : "Sigue intentando"}
              </div>
            )}
          </div>
        ) : !done ? (
          <p style={{ color: G.muted }}>Cargando...</p>
        ) : null}
      </div>

      <p style={{ fontSize: 12, color: G.muted, textAlign: "center", fontWeight: 500 }}>
        Toca la categoría correcta ↓
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
        {categories.map((cat, i) => {
          const isHover = hovering === cat;
          const correctInBucket = buckets[cat].filter(c => c.correct).length;
          return (
            <button key={cat} className="btn"
              onClick={() => drop(cat)}
              disabled={done || !activeCard}
              style={{
                padding: "14px 12px", borderRadius: 16, textAlign: "center",
                background: buckets[cat].length ? `${color}0c` : G.card,
                border: `2px solid ${color}30`,
                opacity: done ? .7 : 1,
                fontFamily: "'Outfit',sans-serif",
                boxShadow: "0 1px 4px rgba(0,0,0,.04)",
                transform: "scale(1)",
                animation: "none",
              }}>
              <p style={{ fontSize: 20, marginBottom: 4 }}>{catLabels[cat] || cat}</p>
              <p style={{ fontSize: 11, color: G.muted, fontWeight: 500 }}>
                {buckets[cat].length} carta{buckets[cat].length !== 1 ? "s" : ""}
                {buckets[cat].length > 0 && (
                  <span style={{ color: correctInBucket > 0 ? G.teal : G.rose, marginLeft: 4 }}>
                    · {correctInBucket} ✓
                  </span>
                )}
              </p>
            </button>
          );
        })}
      </div>

      {done && <WinBanner moves={moves} time={fmt} color={color} onRestart={restart} onBack={onBack}
        extra={`${score}/${cards.length} correctas`} />}

      <button className="btn" onClick={onBack} style={{
        padding: "9px 16px", borderRadius: 10, background: G.border,
        color: G.muted, fontSize: 13, alignSelf: "flex-start", border: `1.5px solid ${G.border}`,
      }}>← Volver</button>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   SELECCIÓN DE MODO
══════════════════════════════════════════════════ */
const GAME_MODES = [
  { id: "memory",  icon: "🃏", label: "Voltear Parejas",   desc: "Voltea cartas y encuentra las parejas ocultas",  color: G.rose },
  { id: "connect", icon: "🔗", label: "Conectar Columnas", desc: "Une los elementos de cada columna en pares",      color: G.indigo },
  { id: "sort",    icon: "📦", label: "Clasificar Cartas", desc: "Coloca cada carta en su categoría correcta",      color: G.amber },
];

function GameSelect({ deckKey, onSelect, onBack }) {
  const deck = DECKS[deckKey];
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <button className="btn" onClick={onBack} style={{
        padding: "8px 14px", borderRadius: 8, background: G.border,
        color: G.muted, fontSize: 13, alignSelf: "flex-start", border: `1.5px solid ${G.border}`,
      }}>← Mazos</button>

      <div style={{
        background: `linear-gradient(135deg, ${deck.color}14, ${deck.color}06)`,
        border: `1.5px solid ${deck.color}30`,
        borderRadius: 18, padding: "16px 18px",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16,
          background: `${deck.color}20`, border: `2px solid ${deck.color}40`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
        }}>{deck.icon}</div>
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 3 }}>
            {deck.label}
          </h2>
          <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.5 }}>{deck.description}</p>
        </div>
      </div>

      <p style={{ fontSize: 12, color: G.muted, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase" }}>
        Selecciona modo de juego
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {GAME_MODES.map((mode, i) => (
          <button key={mode.id} className="btn" onClick={() => onSelect(mode.id)}
            style={{
              padding: "18px 20px", borderRadius: 16, textAlign: "left",
              background: G.card, border: `2px solid ${G.border}`,
              display: "flex", gap: 14, alignItems: "center",
              fontFamily: "'Outfit',sans-serif",
              animation: `fadeUp .35s ease ${i * .09}s both`,
              boxShadow: "0 2px 8px rgba(0,0,0,.04)",
            }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: `${mode.color}18`, border: `1.5px solid ${mode.color}35`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
            }}>{mode.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: G.ink, marginBottom: 3 }}>{mode.label}</p>
              <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.5 }}>{mode.desc}</p>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: `${mode.color}15`, border: `1px solid ${mode.color}30`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: mode.color, fontSize: 14, flexShrink: 0,
            }}>→</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   APP PRINCIPAL
══════════════════════════════════════════════════ */
export default function App() {
  const [screen,   setScreen]   = useState("home");
  const [deckKey,  setDeckKey]  = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const deck  = deckKey ? DECKS[deckKey] : null;
  const color = deck?.color || G.teal;

  const renderGame = () => {
    const props = { deck, onBack: () => setScreen("game-select"), color };
    if (gameMode === "memory")  return <MemoryFlip  {...props} />;
    if (gameMode === "connect") return <PairConnect {...props} />;
    if (gameMode === "sort")    return <SortMatch   {...props} />;
  };

  return (
    <section id="juegos" className="juegos-emocionales-container">

      <div className="juegos-header">
        <h2 className="juegos-title">🎮 Juegos Psicoeducativos</h2>
        <p className="juegos-subtitle">Aprende sobre tu bienestar emocional de forma interactiva y divertida</p>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px 32px" }}>

        {/* INICIO */}
        {screen === "home" && (
          <div className="fade-up">
            <div style={{
              background: `linear-gradient(145deg, ${G.rose}10, ${G.indigo}08, ${G.teal}06)`,
              border: `1.5px solid ${G.border}`,
              borderRadius: 22, padding: "28px 24px", marginBottom: 24,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20, width: 120, height: 120,
                borderRadius: "50%", background: `${G.teal}10`, filter: "blur(30px)",
              }} />
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginBottom: 10, position: "relative" }}>
                Aprende sobre tu mente<br />
                <em style={{ color: G.sky }}>jugando</em>
              </h1>
              <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.8, maxWidth: 320, position: "relative" }}>
                4 mazos temáticos · 3 modos de juego · Refuerza conceptos de salud mental mientras te diviertes
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              {[
                { n: "4", l: "Mazos",  c: G.rose,   icon: "🗂" },
                { n: "3", l: "Modos",  c: G.indigo, icon: "🎯" },
                { n: "24", l: "Pares", c: G.teal,   icon: "🃏" },
              ].map((s, i) => (
                <div key={s.l} style={{
                  flex: 1, background: G.card, border: `1.5px solid ${s.c}20`,
                  borderRadius: 16, padding: "14px 0", textAlign: "center",
                  animation: `fadeUp .4s ease ${i * .08}s both`,
                  boxShadow: `0 2px 12px ${s.c}10`,
                }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: s.c }}>{s.n}</p>
                  <p style={{ fontSize: 11, color: G.muted, marginTop: 2, fontWeight: 500 }}>{s.l}</p>
                </div>
              ))}
            </div>

            <p style={{ fontSize: 11, fontWeight: 700, color: G.muted, marginBottom: 14, letterSpacing: ".08em", textTransform: "uppercase" }}>
              Elige un mazo para comenzar
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {Object.entries(DECKS).map(([key, d], i) => (
                <button key={key} className="btn"
                  onClick={() => { setDeckKey(key); setScreen("game-select"); }}
                  style={{
                    padding: "18px 20px", borderRadius: 18, textAlign: "left",
                    background: G.card, border: `2px solid ${G.border}`,
                    boxShadow: "0 2px 10px rgba(0,0,0,.04)",
                    transition: "none",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                      background: `${d.color}18`, border: `2px solid ${d.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                    }}>{d.icon}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: 16, color: G.ink, marginBottom: 3 }}>{d.label}</p>
                      <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.5 }}>{d.description}</p>
                    </div>
                    <div style={{
                      padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                      background: `${d.color}18`, color: d.color, border: `1.5px solid ${d.color}30`, flexShrink: 0,
                    }}>3 modos</div>
                  </div>
                </button>
              ))}
            </div>

            <p style={{ textAlign: "center", color: G.muted, fontSize: 15, marginTop: 28, lineHeight: 1.9 }}>
              🌱 Herramienta psicoeducativa<br />
              No reemplaza atención profesional
            </p>
          </div>
        )}

        {/* SELECCIÓN DE MODO */}
        {screen === "game-select" && deck && (
          <GameSelect
            deckKey={deckKey}
            onSelect={mode => { setGameMode(mode); setScreen("game"); }}
            onBack={() => setScreen("home")}
          />
        )}

        {/* JUEGO ACTIVO */}
        {screen === "game" && deck && (
          <div className="fade-up">
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: G.muted, fontWeight: 500 }}>
                {GAME_MODES.find(m => m.id === gameMode)?.icon}{" "}
                {GAME_MODES.find(m => m.id === gameMode)?.label}
              </span>
              <div style={{ height: 1, flex: 1, background: G.border }} />
            </div>
            {renderGame()}
          </div>
        )}

      </div>
    </section>
  );
}