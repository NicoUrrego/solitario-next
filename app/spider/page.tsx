"use client";

import { useEffect, useMemo, useState } from "react";

type Suit = "♠";

interface Card {
  id: string;
  suit: Suit;
  value: number;
  faceUp: boolean;
}

const valueToLabel = (value: number) => {
  if (value === 1) return "A";
  if (value === 11) return "J";
  if (value === 12) return "Q";
  if (value === 13) return "K";
  return value.toString();
};

const createDeck = (): Card[] => {
  const deck: Card[] = [];

  for (let d = 0; d < 8; d++) {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `${d}-${value}-${Math.random()}`,
        suit: "♠",
        value,
        faceUp: false,
      });
    }
  }

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export default function SpiderSolitairePage() {
  const [tableau, setTableau] = useState<Card[][]>(
    Array.from({ length: 10 }, () => [])
  );

  const [stock, setStock] = useState<Card[]>([]);
  const [completedSequences, setCompletedSequences] = useState<Card[][]>([]);

  const [selected, setSelected] = useState<{
    pileIndex: number;
    cardIndex: number;
  } | null>(null);

  const [message, setMessage] = useState(
    "Bienvenido a Spider Solitaire"
  );

  const startGame = () => {
    const deck = createDeck();

    const newTableau: Card[][] = Array.from({ length: 10 }, () => []);

    for (let i = 0; i < 10; i++) {
      const cardsToDeal = i < 4 ? 6 : 5;

      for (let j = 0; j < cardsToDeal; j++) {
        const card = deck.pop()!;
        card.faceUp = j === cardsToDeal - 1;
        newTableau[i].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck);
    setCompletedSequences([]);
    setSelected(null);
    setMessage("Nueva partida iniciada");
  };

  useEffect(() => {
    startGame();
  }, []);

  const dealNewRow = () => {
    if (stock.length < 10) {
      setMessage("No quedan suficientes cartas en el mazo");
      return;
    }

    const hasEmptyPile = tableau.some((pile) => pile.length === 0);

    if (hasEmptyPile) {
      setMessage(
        "No puedes repartir nuevas cartas mientras haya columnas vacías"
      );
      return;
    }

    const updatedStock = [...stock];
    const updatedTableau = [...tableau];

    for (let i = 0; i < 10; i++) {
      const card = updatedStock.pop()!;
      card.faceUp = true;
      updatedTableau[i] = [...updatedTableau[i], card];
    }

    setStock(updatedStock);
    setTableau(updatedTableau);
  };

  const checkCompletedSequence = (pileIndex: number) => {
    const pile = tableau[pileIndex];

    if (pile.length < 13) return;

    const last13 = pile.slice(-13);

    let valid = true;

    for (let i = 0; i < 13; i++) {
      if (last13[i].value !== 13 - i) {
        valid = false;
        break;
      }
    }

    if (!valid) return;

    const updatedTableau = [...tableau];
    updatedTableau[pileIndex] = pile.slice(0, -13);

    if (updatedTableau[pileIndex].length > 0) {
      updatedTableau[pileIndex][
        updatedTableau[pileIndex].length - 1
      ].faceUp = true;
    }

    setTableau(updatedTableau);
    setCompletedSequences((prev) => [...prev, last13]);
    setMessage("¡Secuencia completada!");
  };

  const moveCards = (
    sourcePileIndex: number,
    sourceCardIndex: number,
    targetPileIndex: number
  ) => {
    if (sourcePileIndex === targetPileIndex) {
      setSelected(null);
      return;
    }

    const sourcePile = tableau[sourcePileIndex];
    const targetPile = tableau[targetPileIndex];

    const movingCards = sourcePile.slice(sourceCardIndex);

    for (let i = 0; i < movingCards.length - 1; i++) {
      if (movingCards[i].value !== movingCards[i + 1].value + 1) {
        setMessage("Solo puedes mover secuencias ordenadas");
        setSelected(null);
        return;
      }
    }

    const firstCard = movingCards[0];

    const canMove =
      targetPile.length === 0 ||
      targetPile[targetPile.length - 1].value === firstCard.value + 1;

    if (!canMove) {
      setSelected(null);
      return;
    }

    const updatedTableau = [...tableau];

    updatedTableau[sourcePileIndex] = sourcePile.slice(0, sourceCardIndex);

    if (updatedTableau[sourcePileIndex].length > 0) {
      updatedTableau[sourcePileIndex][
        updatedTableau[sourcePileIndex].length - 1
      ].faceUp = true;
    }

    updatedTableau[targetPileIndex] = [
      ...targetPile,
      ...movingCards,
    ];

    setTableau(updatedTableau);
    setSelected(null);

    setTimeout(() => {
      checkCompletedSequence(targetPileIndex);
    }, 50);
  };

  const handleCardClick = (pileIndex: number, cardIndex: number) => {
    const pile = tableau[pileIndex];
    const card = pile[cardIndex];

    if (!card.faceUp) {
      const updatedTableau = [...tableau];
      updatedTableau[pileIndex][cardIndex].faceUp = true;
      setTableau(updatedTableau);
      return;
    }

    if (!selected) {
      setSelected({ pileIndex, cardIndex });
      return;
    }

    moveCards(selected.pileIndex, selected.cardIndex, pileIndex);
  };

  const autoWin = useMemo(() => {
    const allCardsVisible = tableau.every((pile) =>
      pile.every((card) => card.faceUp)
    );

    return allCardsVisible && stock.length === 0;
  }, [tableau, stock]);

  const hasWon = useMemo(() => {
    return completedSequences.length === 8 || autoWin;
  }, [completedSequences, autoWin]);

  return (
    <main className="min-h-screen bg-slate-900 p-4 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-slate-800 p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Spider Solitaire</h1>
            <p className="text-slate-300">
              Variante clásica de una sola pinta
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-4 py-2 font-semibold text-black transition hover:scale-105"
            >
              Nueva Partida
            </button>

            <button
              onClick={dealNewRow}
              className="rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-black transition hover:scale-105"
            >
              Repartir Cartas
            </button>
          </div>
        </div>

        {autoWin && (
          <div className="mb-4 rounded-3xl border border-emerald-300 bg-emerald-400/20 p-4 text-center text-xl font-bold text-emerald-100">
            Victoria automática: todas las cartas fueron descubiertas 🎉
          </div>
        )}

        {hasWon && (
          <div className="mb-6 rounded-3xl border border-yellow-300 bg-yellow-400/20 p-4 text-center text-3xl font-bold text-yellow-100">
            ¡Ganaste Spider Solitaire! 🕷️
          </div>
        )}

        <div className="mb-6 rounded-3xl bg-slate-800 p-4 text-slate-200 shadow-xl">
          {message}
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-slate-800 p-5 shadow-xl">
          <div className="flex gap-4">
            <div className="flex h-32 w-24 items-center justify-center rounded-2xl border border-white/20 bg-slate-700 text-lg font-bold">
              {stock.length} cartas
            </div>

            <div className="flex flex-wrap gap-2">
              {completedSequences.map((_, index) => (
                <div
                  key={index}
                  className="flex h-32 w-20 items-center justify-center rounded-xl bg-emerald-500 text-3xl font-bold text-black shadow-lg"
                >
                  ♠
                </div>
              ))}
            </div>
          </div>

          <div className="text-sm text-slate-300">
            Secuencias completadas: {completedSequences.length}/8
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-5 lg:grid-cols-10">
          {tableau.map((pile, pileIndex) => (
            <div
              key={pileIndex}
              onClick={() => {
                if (pile.length === 0 && selected) {
                  moveCards(selected.pileIndex, selected.cardIndex, pileIndex);
                }
              }}
              className="min-h-[650px] rounded-2xl bg-slate-800/70 p-2"
            >
              <div className="relative min-h-[620px]">
                {pile.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    onClick={() => handleCardClick(pileIndex, cardIndex)}
                    className={`absolute left-0 transition-transform hover:translate-y-[-2px] ${
                      selected?.pileIndex === pileIndex &&
                      selected.cardIndex === cardIndex
                        ? "ring-4 ring-yellow-300"
                        : ""
                    }`}
                    style={{ top: `${cardIndex * 28}px` }}
                  >
                    <SpiderCard card={card} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-slate-800 p-5 text-sm leading-7 text-slate-200 shadow-xl">
          <h2 className="mb-3 text-xl font-bold">Reglas básicas</h2>

          <ul className="list-disc space-y-2 pl-5">
            <li>
              Ordena las cartas en secuencia descendente desde Rey hasta As.
            </li>
            <li>
              Puedes mover grupos de cartas si están correctamente ordenadas.
            </li>
            <li>
              Cuando completas una secuencia completa, se elimina del tablero.
            </li>
            <li>
              No puedes repartir nuevas cartas si hay columnas vacías.
            </li>
            <li>
              El objetivo es completar las 8 secuencias.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function SpiderCard({ card }: { card: Card }) {
  if (!card.faceUp) {
    return (
      <div className="flex h-28 w-20 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-indigo-700 to-indigo-950 text-2xl font-bold text-white shadow-xl">
        🕷️
      </div>
    );
  }

  return (
    <div className="flex h-28 w-20 flex-col justify-between rounded-xl border border-slate-300 bg-white p-2 text-black shadow-xl">
      <div className="text-lg font-bold leading-none">
        {valueToLabel(card.value)}
      </div>

      <div className="flex flex-1 items-center justify-center text-4xl">
        {card.suit}
      </div>

      <div className="rotate-180 self-end text-lg font-bold leading-none">
        {valueToLabel(card.value)}
      </div>
    </div>
  );
}
