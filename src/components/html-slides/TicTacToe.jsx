import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TicTacToe = ({ className = "" }) => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const calculateWinner = (squares) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return { winner: squares[a], line: lines[i] };
      }
    }
    return null;
  };

  const handleClick = (index) => {
    if (board[index] || gameOver) return;

    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);

    const result = calculateWinner(newBoard);
    if (result) {
      setGameOver(true);
    } else if (newBoard.every(square => square !== null)) {
      setGameOver(true);
    } else {
      setIsXNext(!isXNext);
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameOver(false);
  };

  const winnerResult = calculateWinner(board);
  const winner = winnerResult?.winner;
  const winningLine = winnerResult?.line || [];
  const isDraw = gameOver && !winner;

  const getStatus = () => {
    if (winner) {
      return `Winner: ${winner}`;
    } else if (isDraw) {
      return "It's a Draw!";
    } else {
      return `Next Player: ${isXNext ? 'X' : 'O'}`;
    }
  };

  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-8 h-full p-6 md:p-8 ${className}`}>
      {/* Left Side - Game */}
      <div className="flex flex-col items-center justify-center flex-shrink-0">
        <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6" style={{ color: 'var(--slide-title)' }}>
          Tic-Tac-Toe
        </h2>

        {/* Status Display */}
        <div
          className="text-2xl font-semibold mb-6 min-h-[2rem]"
          style={{ color: 'var(--slide-text)' }}
        >
          {getStatus()}
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-3 gap-3 mb-6" style={{ width: '320px' }}>
          {board.map((value, index) => {
            const isWinningSquare = winningLine.includes(index);

            return (
              <button
                key={index}
                onClick={() => handleClick(index)}
                disabled={!!value || gameOver}
                className={`
                  aspect-square rounded-lg text-5xl font-bold
                  transition-all duration-200
                  hover:scale-105 active:scale-95
                  disabled:cursor-not-allowed
                  ${!value && !gameOver ? 'hover:opacity-80' : ''}
                  ${isWinningSquare ? 'ring-4 ring-green-500' : ''}
                `}
                style={{
                  backgroundColor: 'var(--slide-card-bg)',
                  border: '2px solid var(--slide-card-border)',
                  color: value === 'X' ? '#3b82f6' : value === 'O' ? '#ef4444' : 'transparent'
                }}
                aria-label={`Square ${index + 1}${value ? `, ${value}` : ', empty'}`}
              >
                {value}
              </button>
            );
          })}
        </div>

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className="px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            backgroundColor: 'var(--slide-card-bg)',
            border: '2px solid var(--slide-card-border)',
            color: 'var(--slide-text)'
          }}
          aria-label="Reset game"
        >
          Reset Game
        </button>
      </div>

      {/* Right Side - Description */}
      <div className="flex-1 max-w-lg">
        <div
          className="text-base md:text-lg leading-relaxed space-y-4"
          style={{ color: 'var(--slide-text)' }}
        >
          <p>
            This Tic-Tac-Toe game demonstrates how TaskBoardAI can manage game development tasks - from initial specification through implementation.
          </p>
          <p className="opacity-80">
            Using TaskBoardAI, we created a structured workflow that took this project from concept to completion, managing tasks for game logic, UI design, state management, and win detection.
          </p>
          <p className="opacity-80">
            The kanban board allowed both human developers and AI agents to collaborate on breaking down the implementation into manageable cards, tracking progress, and ensuring all requirements were met.
          </p>
        </div>
      </div>
    </div>
  );
};

TicTacToe.propTypes = {
  className: PropTypes.string
};

export default TicTacToe;