
"use client";
import React, { useState, useRef } from "react";

const BUTTONS = [
  ["CE", "⌫", "", "/"],
  ["7", "8", "9", "x"],
  ["4", "5", "6", "-"],
  ["1", "2", "3", "+"],
  ["0", ".", "=", ""],
];


function isOperator(val: string) {
  return ["+", "-", "x", "/"].includes(val);
}

export default function Home() {
  const [display, setDisplay] = useState("0");
  const [pending, setPending] = useState<string | null>(null);
  const [acc, setAcc] = useState<number | null>(null);
  const [lastPressed, setLastPressed] = useState<string>("");
  const [magicMode, setMagicMode] = useState(false);
  const [magicNumber, setMagicNumber] = useState<string>("");
  const [magicDigits, setMagicDigits] = useState<number>(0); // how many digits revealed
  const [preMagicDisplay, setPreMagicDisplay] = useState<string>(""); // display before magic mode
  const [magicBaseSum, setMagicBaseSum] = useState<number | null>(null); // sum at activation
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  function getCurrentDateTimeNumber() {
    const now = new Date();
    const yyyy = now.getFullYear().toString();
    const mm = (now.getMonth() + 1).toString().padStart(2, "0");
    const dd = now.getDate().toString().padStart(2, "0");
    const HH = now.getHours().toString().padStart(2, "0");
    const MM = now.getMinutes().toString().padStart(2, "0");
    return `${yyyy}${mm}${dd}${HH}${MM}`;
  }

  function handlePress(val: string) {
    if (val === "⌫") {
      handleBackspace();
      return;
    }
    if (magicMode) {
      // Only digits are allowed, up to numOfDigitsBeforeFullNumberIsShown presses
      const numOfDigitsBeforeFullNumberIsShown = 9;
      if (/^[0-9]$/.test(val)) {
        if (magicDigits < numOfDigitsBeforeFullNumberIsShown) {
          // reveal one more digit
          const next = magicDigits + 1;
          setMagicDigits(next);
          setDisplay(magicNumber.slice(0, next));
        } else if (magicDigits === numOfDigitsBeforeFullNumberIsShown) {
          // On 5th digit reveal full number
          setMagicDigits(magicNumber.length); // mark fully revealed
          setDisplay(magicNumber);
        } // else ignore further digits
        setLastPressed(val);
        return;
      }
      // Allow CE to exit magic mode
      if (val === "CE") {
        setMagicMode(false);
        setDisplay("0");
        setAcc(null);
        setPending(null);
        setLastPressed("");
        setMagicNumber("");
        setMagicDigits(0);
        setMagicBaseSum(null);
        return;
      }
      // Only allow equals after 5 digits
      if (val === "=" && magicDigits >= 5) {
        const base = magicBaseSum ?? 0;
        const result = base + parseInt(magicNumber, 10);
        setDisplay(result.toString());
        setAcc(null);
        setPending(null);
        setMagicMode(false);
        setMagicNumber("");
        setMagicDigits(0);
        setMagicBaseSum(null);
        setLastPressed("=");
        return;
      }
      // Other buttons do nothing in magic mode
      return;
    }
    if (val === "CE") {
      setDisplay("0");
      setAcc(null);
      setPending(null);
      setLastPressed("");
      return;
    }
    if (val === "+") {
      if (pending === "+" && acc !== null) {
        setAcc(acc + parseFloat(display));
        setDisplay((acc + parseFloat(display)).toString());
      } else {
        setAcc(parseFloat(display));
      }
      setPending("+");
      setLastPressed("+");
      return;
    }
    if (val === "=") {
      if (pending === "+" && acc !== null) {
        const result = acc + parseFloat(display);
        setDisplay(result.toString());
        setAcc(null);
        setPending(null);
      }
      setLastPressed("=");
      return;
    }
    if (["-", "x", "/"].includes(val)) {
      // Non-functional
      setLastPressed(val);
      return;
    }
    if (val === ".") {
      if (!display.includes(".")) {
        setDisplay(display + ".");
      }
      setLastPressed(".");
      return;
    }
    // Digits
    if (display === "0" || isOperator(lastPressed) || lastPressed === "=") {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
    setLastPressed(val);
  }

  // Handler for the hidden button
  function handleHiddenBtnDown() {
    longPressTimer.current = setTimeout(() => {
      // Enable magic mode
      let sum = acc !== null ? acc : 0;
      // Only add the current display if we're in the middle of typing a new operand (lastPressed not '+')
      if (pending === "+" && lastPressed !== "+") {
        sum += parseFloat(display);
      }
      const target = getCurrentDateTimeNumber();
      const magic = (parseInt(target, 10) - sum).toString();
      setMagicNumber(magic);
      setMagicMode(true);
      setMagicDigits(0);
      setMagicBaseSum(sum);
      setPreMagicDisplay(display);
      // Do NOT clear the display; keep the current number visible
    }, 1000);
  }

  function handleBackspace() {
    if (magicMode) {
      // Allow backspacing revealed digits before full reveal
      if (magicDigits > 0 && magicDigits < 5) {
        const newCount = magicDigits - 1;
        setMagicDigits(newCount);
        if (newCount === 0) {
          setDisplay(preMagicDisplay);
        } else {
          setDisplay(magicNumber.slice(0, newCount));
        }
      } else if (magicDigits >= 5 && magicDigits === magicNumber.length) {
        // If full number shown, revert to first 4 digits to mimic removing last digit
        setMagicDigits(4);
        setDisplay(magicNumber.slice(0, 4));
      }
      return;
    }
    // Normal mode backspace
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay("0");
    }
  }

  function handleHiddenBtnUp() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[100dvh] w-full bg-[#202124] px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+16px)]">
      <div className="w-full max-w-[420px] rounded-2xl shadow-2xl bg-[#23262F] p-4 pt-8 pb-6 flex flex-col gap-4 mx-auto">
  <div className="calc-display text-right text-4xl text-white font-light mb-2 h-20 flex items-end justify-end px-2 select-none" data-testid="display">
          {display}
        </div>
  <div className="calc-grid grid grid-cols-4 gap-1">
    {BUTTONS.flat().map((btn, i) => {
      // Bottom right hidden button
      if (i === BUTTONS.flat().length - 1) {
        return (
          <button
            key={i}
            className="w-full h-full bg-transparent border-none select-none"
            style={{ opacity: 0.01, position: "relative" }}
            onMouseDown={handleHiddenBtnDown}
            onMouseUp={handleHiddenBtnUp}
            onMouseLeave={handleHiddenBtnUp}
            onTouchStart={e => { e.preventDefault(); handleHiddenBtnDown(); }}
            onTouchEnd={e => { e.preventDefault(); handleHiddenBtnUp(); }}
            onTouchCancel={e => { e.preventDefault(); handleHiddenBtnUp(); }}
            aria-label="hidden-magic-mode"
          >
            {/* Hidden button */}
          </button>
        );
      }
      return (
        <button
          key={i}
          className={`calc-btn w-full h-16 flex items-center justify-center text-xl font-medium shadow transition-all select-none
            ${btn === "=" ? "bg-[#FF9500] text-white" :
              btn === "+" ? "bg-[#23262F] text-[#FF9500] border border-[#23262F]" :
              btn === "CE" ? "bg-[#23262F] text-[#FF3B30] border border-[#23262F]" :
              btn === "⌫" ? "bg-[#23262F] text-[#FF3B30] border border-[#23262F]" :
              isOperator(btn) ? "bg-[#23262F] text-[#A6A6A6] border border-[#23262F]" :
              btn === "" ? "bg-transparent border-none" :
              "bg-[#343645] text-white border border-[#23262F]"}
            ${btn === "" ? "pointer-events-none" : "hover:scale-105 active:scale-95"}`}
          onClick={() => btn && handlePress(btn)}
          disabled={btn === ""}
          aria-label={btn}
          style={{ padding: 0 }}
        >
          {btn && (
            <span className="block w-full h-full rounded-full flex items-center justify-center">
              {btn}
            </span>
          )}
        </button>
      );
    })}
  </div>
      </div>
    </div>
  );
}
