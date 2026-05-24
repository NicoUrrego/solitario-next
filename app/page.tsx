"use client";

import { useEffect, useMemo, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";

type Card = {
  id: string;
  suit: Suit;
  value: number;
  faceUp: boolean;
};

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const redSuits: Suit[] = ["♥", "♦"];

const suitSymbols: Record<Suit, string> = {
  "♠": "Spades",
  "♥": "Hearts",
  "♦": "Diamonds",
  "♣": "Clubs",
};

const valueLabel = (value: number) => {
  if (value === 1) return "A";
  if (value === 11) return "J";
  if (value === 12) return "Q";
  if (value === 13) return "K";
  return value.toString();
};

const isRed = (suit: Suit) => redSuits.includes(suit);

const createDeck = (): Card[] => {
  const deck: Card[] = [];

  suits.forEach((suit) => {
    for (let value = 1; value <= 13; value++) {
      deck.push({
        id: `${suit}-${value}-${Math.random()}`,
        suit,
        value,
        faceUp: false,
      });
    }
  });

  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export default function Page() {
  const [stock, setStock] = useState<Card[]>([]);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>([[], [], [], [], [], [], []]);
  const [selected, setSelected] = useState<{
    type: "waste" | "tableau";
    pileIndex?: number;
    cardIndex?: number;
  } | null>(null);
  const [message, setMessage] = useState("Bienvenido a Klondike Solitaire");

  const startGame = () => {
    const deck = createDeck();

    const newTableau: Card[][] = [[], [], [], [], [], [], []];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j <= i; j++) {
        const card = deck.pop()!;
        card.faceUp = j === i;
        newTableau[i].push(card);
      }
    }

    setTableau(newTableau);
    setStock(deck);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setSelected(null);
    setMessage("Nueva partida iniciada");
  };

  useEffect(() => {
    startGame();
  }, []);

  const drawCard = () => {
    if (stock.length === 0) {
      const recycled = [...waste]
        .reverse()
        .map((card) => ({ ...card, faceUp: false }));

      setStock(recycled);
      setWaste([]);
      setMessage("Baraja reciclada");
      return;
    }

    const updatedStock = [...stock];
    const card = updatedStock.pop()!;
    card.faceUp = true;

    setStock(updatedStock);
    setWaste((prev) => [...prev, card]);
  };

  const moveWasteToFoundation = (foundationIndex: number) => {
    if (waste.length === 0) return;

    const card = waste[waste.length - 1];
    const foundation = foundations[foundationIndex];

    const canMove =
      (foundation.length === 0 && card.value === 1) ||
      (foundation.length > 0 &&
        foundation[foundation.length - 1].suit === card.suit &&
        foundation[foundation.length - 1].value + 1 === card.value);

    if (!canMove) return;

    const newWaste = [...waste];
    newWaste.pop();

    const newFoundations = [...foundations];
    newFoundations[foundationIndex] = [...foundation, card];

    setWaste(newWaste);
    setFoundations(newFoundations);
    setSelected(null);
  };

  const moveTableauToFoundation = (
    tableauIndex: number,
    foundationIndex: number
  ) => {
    const pile = tableau[tableauIndex];
    if (pile.length === 0) return;

    const card = pile[pile.length - 1];
    if (!card.faceUp) return;

    const foundation = foundations[foundationIndex];

    const canMove =
      (foundation.length === 0 && card.value === 1) ||
      (foundation.length > 0 &&
        foundation[foundation.length - 1].suit === card.suit &&
        foundation[foundation.length - 1].value + 1 === card.value);

    if (!canMove) return;

    const newTableau = [...tableau];
    newTableau[tableauIndex] = [...pile.slice(0, -1)];

    if (newTableau[tableauIndex].length > 0) {
      newTableau[tableauIndex][
        newTableau[tableauIndex].length - 1
      ].faceUp = true;
    }

    const newFoundations = [...foundations];
    newFoundations[foundationIndex] = [...foundation, card];

    setTableau(newTableau);
    setFoundations(newFoundations);
    setSelected(null);
  };

  const handleTableauClick = (pileIndex: number, cardIndex: number) => {
    const pile = tableau[pileIndex];

    if (pile.length === 0) {
      if (selected?.type === "waste") {
        moveWasteToTableau(pileIndex);
        return;
      }

      if (selected?.type === "tableau") {
        moveTableauToTableau(
          selected.pileIndex!,
          selected.cardIndex!,
          pileIndex
        );
        return;
      }

      return;
    }

    const card = pile[cardIndex];

    if (!card?.faceUp) {
      const newTableau = [...tableau];
      newTableau[pileIndex][cardIndex].faceUp = true;
      setTableau(newTableau);
      return;
    }

    if (!selected) {
      setSelected({
        type: "tableau",
        pileIndex,
        cardIndex,
      });
      return;
    }

    if (selected.type === "waste") {
      moveWasteToTableau(pileIndex);
      return;
    }

    moveTableauToTableau(selected.pileIndex!, selected.cardIndex!, pileIndex);
  };

  const moveWasteToTableau = (targetPileIndex: number) => {
    if (waste.length === 0) return;

    const card = waste[waste.length - 1];
    const targetPile = tableau[targetPileIndex];

    const canMove =
      (targetPile.length === 0 && card.value === 13) ||
      (targetPile.length > 0 &&
        targetPile[targetPile.length - 1].faceUp &&
        isRed(targetPile[targetPile.length - 1].suit) !==
        isRed(card.suit) &&
        targetPile[targetPile.length - 1].value === card.value + 1);

    if (!canMove) return;

    const newWaste = [...waste];
    newWaste.pop();

    const newTableau = [...tableau];
    newTableau[targetPileIndex] = [...targetPile, card];

    setWaste(newWaste);
    setTableau(newTableau);
    setSelected(null);
  };

  const moveTableauToTableau = (
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
    const firstCard = movingCards[0];

    const canMove =
      (targetPile.length === 0 && firstCard.value === 13) ||
      (targetPile.length > 0 &&
        targetPile[targetPile.length - 1].faceUp &&
        isRed(targetPile[targetPile.length - 1].suit) !==
        isRed(firstCard.suit) &&
        targetPile[targetPile.length - 1].value === firstCard.value + 1);

    if (!canMove) {
      setSelected(null);
      return;
    }

    const newTableau = [...tableau];

    newTableau[sourcePileIndex] = sourcePile.slice(0, sourceCardIndex);

    if (newTableau[sourcePileIndex].length > 0) {
      newTableau[sourcePileIndex][
        newTableau[sourcePileIndex].length - 1
      ].faceUp = true;
    }

    newTableau[targetPileIndex] = [...targetPile, ...movingCards];

    setTableau(newTableau);
    setSelected(null);
  };

  const handleWasteClick = () => {
    if (waste.length === 0) return;

    setSelected({ type: "waste" });
  };

  const hasWon = useMemo(() => {
    return foundations.every((foundation) => foundation.length === 13);
  }, [foundations]);

  return (
    <main className="min-h-screen bg-green-900 p-4 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl bg-green-950/60 p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Klondike Solitaire</h1>
            <p className="text-green-200">PWA creada con Next.js</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={startGame}
              className="rounded-2xl bg-white px-4 py-2 font-semibold text-green-900 transition hover:scale-105"
            >
              Nueva Partida
            </button>

            <button
              onClick={drawCard}
              className="rounded-2xl bg-yellow-400 px-4 py-2 font-semibold text-black transition hover:scale-105"
            >
              Robar Carta
            </button>
          </div>
        </div>

        {hasWon && (
          <div className="mb-6 rounded-3xl border border-yellow-300 bg-yellow-400/20 p-4 text-center text-2xl font-bold text-yellow-100">
            ¡Ganaste la partida! 🎉
          </div>
        )}

        <div className="mb-6 rounded-3xl bg-green-950/40 p-4 text-sm text-green-100">
          {message}
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-6">
          <div className="flex gap-4">
            <div
              onClick={drawCard}
              className="flex h-36 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-green-800 shadow-lg"
            >
              {stock.length > 0 ? (
                <div className="flex h-32 w-20 items-center justify-center rounded-xl bg-blue-700 text-sm font-bold">
                  {stock.length}
                </div>
              ) : (
                <span className="text-xs text-center text-white/70">
                  Reciclar
                  <br />
                  Cartas
                </span>
              )}
            </div>

            <div
              onClick={handleWasteClick}
              className={`flex h-36 w-24 cursor-pointer items-center justify-center rounded-2xl border-2 shadow-lg transition ${selected?.type === "waste"
                  ? "border-yellow-300"
                  : "border-transparent"
                } bg-white`}
            >
              {waste.length > 0 ? (
                <CardComponent card={waste[waste.length - 1]} />
              ) : (
                <span className="text-gray-400">Vacío</span>
              )}
            </div>
          </div>

          {foundations.map((foundation, index) => (
            <div
              key={index}
              onClick={() => {
                if (selected?.type === "waste") {
                  moveWasteToFoundation(index);
                  return;
                }

                if (selected?.type === "tableau") {
                  moveTableauToFoundation(selected.pileIndex!, index);
                }
              }}
              className="flex h-36 w-24 items-center justify-center rounded-2xl border-2 border-dashed border-white/40 bg-green-800 shadow-lg"
            >
              {foundation.length > 0 ? (
                <CardComponent card={foundation[foundation.length - 1]} />
              ) : (
                <span className="text-3xl opacity-50">
                  {Object.keys(suitSymbols)[index]}
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {tableau.map((pile, pileIndex) => (
            <div
              key={pileIndex}
              onClick={() => {
                if (tableau[pileIndex].length === 0) {
                  if (selected?.type === "waste") {
                    moveWasteToTableau(pileIndex);
                  }

                  if (selected?.type === "tableau") {
                    moveTableauToTableau(
                      selected.pileIndex!,
                      selected.cardIndex!,
                      pileIndex
                    );
                  }
                }
              }}
              className="min-h-[420px] rounded-2xl bg-green-950/30 p-2"
            >
              <div className="relative min-h-[400px]">
                {pile.map((card, cardIndex) => (
                  <div
                    key={card.id}
                    onClick={() => handleTableauClick(pileIndex, cardIndex)}
                    className={`absolute left-0 transition-transform hover:translate-y-[-2px] ${selected?.type === "tableau" &&
                        selected.pileIndex === pileIndex &&
                        selected.cardIndex === cardIndex
                        ? "ring-4 ring-yellow-300"
                        : ""
                      }`}
                    style={{ top: `${cardIndex * 32}px` }}
                  >
                    <CardComponent card={card} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-green-950/50 p-5 text-sm leading-7 text-green-100">
          <h2 className="mb-2 text-xl font-bold">Cómo jugar</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>Haz clic en “Robar Carta” para sacar cartas del mazo.</li>
            <li>
              Las cartas del tableau deben ordenarse alternando colores y en
              orden descendente.
            </li>
            <li>
              Las fundaciones se construyen por palo desde As hasta Rey.
            </li>
            <li>
              Solo los Reyes pueden colocarse en columnas vacías.
            </li>
            <li>
              Haz clic en una carta y luego en otra columna para moverla.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}

function CardComponent({ card }: { card: Card }) {
  if (!card.faceUp) {
    return (
      <div className="flex h-32 w-20 items-center justify-center rounded-xl border border-white/20 bg-gradient-to-br from-blue-700 to-blue-900 text-xl font-bold text-white shadow-xl">
        ♜
      </div>
    );
  }

  return (
    <div
      className={`flex h-32 w-20 flex-col justify-between rounded-xl border border-gray-300 bg-white p-2 shadow-xl ${isRed(card.suit) ? "text-red-600" : "text-black"
        }`}
    >
      <div className="text-lg font-bold leading-none">
        {valueLabel(card.value)}
      </div>

      <div className="flex flex-1 items-center justify-center text-4xl">
        {card.suit}
      </div>

      <div className="rotate-180 self-end text-lg font-bold leading-none">
        {valueLabel(card.value)}
      </div>
    </div>
  );
}
