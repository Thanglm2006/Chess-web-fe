package org.goblin.Game;

import org.goblin.Board.Board;
import org.goblin.Board.Move;
import org.goblin.Pieces.*;
import java.util.*;
import org.goblin.Frame.GameEventListener;

public class Game {
	public org.goblin.Board.Board board = new org.goblin.Board.Board(this);

	public King wk;
	public King bk;
	public ArrayList<Piece> wPieces = new ArrayList<Piece>();
	public ArrayList<Piece> bPieces = new ArrayList<Piece>();
	public GameEventListener listener;

	public void setEventListener(GameEventListener l) {
		listener = l;
	}

	public boolean player = true;
	public Piece active = null;
	public boolean drag = false;
	public ArrayList<Piece> AllPieces = new ArrayList<Piece>();

	public ArrayList<Move> allPossiblesMoves = new ArrayList<Move>();

	public List<Move> allPlayersMove = new ArrayList<Move>();
	public List<Move> allEnemysMove = new ArrayList<Move>();
	public boolean gameOver = false;

	public Game() {
		board = new Board(this); // Reset board
		AllPieces.clear();
		wPieces.clear();
		bPieces.clear();
		allPlayersMove.clear();
		allEnemysMove.clear();
		player = true;
		gameOver = false;
		drag = false;
		
		loadFenPosition("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
		start();
	}

	public void start() {
		fillPieces();
		generatePlayersTurnMoves(board);
		generateEnemysMoves(board);
		checkPlayersLegalMoves();
	}

	public void generatePlayersTurnMoves(Board board) {
		allPlayersMove = new ArrayList<Move>();
		for (Piece p : AllPieces) {
			if (p.isWhite() == player) {
				p.fillAllPseudoLegalMoves(board);
				allPlayersMove.addAll(p.getMoves());
			}
		}
	}

	public void generateEnemysMoves(Board board) {
		allEnemysMove = new ArrayList<Move>();
		for (Piece p : AllPieces) {
			if (p.isWhite() != player) {
				p.fillAllPseudoLegalMoves(board);
				allEnemysMove.addAll(p.getMoves());
			}
		}
	}

	public void changeSide() {
		player = !player;
		generateEnemysMoves(board);
		generatePlayersTurnMoves(board);
		checkPlayersLegalMoves();
		checkMate();
	}

	public void randomPlay() {
		if (gameOver) {
			return;
		}
		if (!player) {
			Random r = new Random();
			active = bPieces.get(r.nextInt(bPieces.size()));
			while (active.getMoves().isEmpty()) {
				active = bPieces.get(r.nextInt(bPieces.size()));
			}
			Move m = active.getMoves().get(r.nextInt(active.getMoves().size()));
			move(m.getToX(), m.getToY());
		}
	}

	public void selectPiece(int x, int y) {
		if (active == null && board.getPiece(x, y) != null && board.getPiece(x, y).isWhite() == player) {
			active = board.getPiece(x, y);
		}
	}

	public void checkMate() {
		if (player) {
			for (Piece p : wPieces) {
				if (!p.getMoves().isEmpty()) {
					return;
				}
			}
		} else {
			for (Piece p : bPieces) {
				if (!p.getMoves().isEmpty()) {
					return;
				}
			}
		}
		if (player) {
			if (wk.isInCheck()) {
				if (listener != null) listener.onGameOver("check mate " + (!player ? "white" : "black") + " wins");
			} else {
				if (listener != null) listener.onGameOver("stalemate ");
			}
		} else {
			if (bk.isInCheck()) {
				if (listener != null) listener.onGameOver("check mate " + (!player ? "white" : "black") + " wins");
			} else {
				if (listener != null) listener.onGameOver("stalemate ");
			}
		}
		gameOver = true;
	}

	public void checkPlayersLegalMoves() {
		List<Piece> pieces = null;
		if (player) {
			pieces = wPieces;
		} else {
			pieces = bPieces;
		}
		for (Piece p : pieces) {
			checkLegalMoves(p);
		}
	}

	public void checkLegalMoves(Piece piece) {
		List<Move> movesToRemove = new ArrayList<Move>();
		Board clonedBoard = board.getNewBoard();
		Piece clonedActive = piece.getClone();

		for (Move move : clonedActive.getMoves()) {
			clonedBoard = board.getNewBoard();
			clonedActive = piece.getClone();

			clonedActive.makeMove(move.getToX(), move.getToY(), clonedBoard);

			List<Piece> enemyPieces = new ArrayList<Piece>();
			Piece king = null;

			if (piece.isWhite()) {
				enemyPieces = bPieces;
				king = wk;
			} else {
				enemyPieces = wPieces;
				king = bk;
			}

			for (Piece enemyP : enemyPieces) {

				Piece clonedEnemyPiece = enemyP.getClone();
				clonedEnemyPiece.fillAllPseudoLegalMoves(clonedBoard);

				for (Move bMove : clonedEnemyPiece.getMoves()) {
					if (!(clonedActive instanceof King) && bMove.getToX() == king.getXcord()
							&& bMove.getToY() == king.getYcord()
							&& clonedBoard.getGrid()[enemyP.getXcord()][enemyP.getYcord()] == enemyP
									.getValueInTheboard()) {
						movesToRemove.add(move);
					} else if (clonedActive instanceof King) {
						if (bMove.getToX() == clonedActive.getXcord() && bMove.getToY() == clonedActive.getYcord()
								&& clonedBoard.getGrid()[enemyP.getXcord()][enemyP.getYcord()] == enemyP
										.getValueInTheboard()) {
							movesToRemove.add(move);
						}
					}
				}

			}

		}

		for (Move move : movesToRemove) {
			piece.getMoves().remove(move);
		}
	}

	// Drag UI delegate moved to BoardRenderer

	public void move(int x, int y) {
		if (active != null) {
			if (active.makeMove(x, y, board)) {
				tryToPromote(active);
				changeSide();
				active = null;
			}
			drag = false;
		}
	}

	// Drawing methods moved to BoardRenderer

	public void tryToPromote(Piece p) {
		if (p instanceof Pawn) {
			if (((Pawn) p).madeToTheEnd()) {
				int choice = 0;
				if (listener != null) {
					choice = listener.onPromotionRequested(p);
				}
				choosePiece(p, choice);
			}
		}
	}

	public void choosePiece(Piece p, int choice) {
		switch (choice) {
		case 0:
			AllPieces.remove(p);
			p = new Queen(p.getXcord(), p.getYcord(), p.isWhite(), board, p.isWhite() ? 8 : -8);
			AllPieces.add(p);

			break;
		case 1:
			AllPieces.remove(p);
			p = new Rook(p.getXcord(), p.getYcord(), p.isWhite(), board, p.isWhite() ? 5 : -5);
			AllPieces.add(p);
			break;
		case 2:
			AllPieces.remove(p);
			p = new Knight(p.getXcord(), p.getYcord(), p.isWhite(), board, p.isWhite() ? 3 : -3);
			AllPieces.add(p);
			break;
		case 3:
			AllPieces.remove(p);
			p = new Bishop(p.getXcord(), p.getYcord(), p.isWhite(), board, p.isWhite() ? 3 : -3);
			AllPieces.add(p);
			break;
		default:
			AllPieces.remove(p);
			p = new Queen(p.getXcord(), p.getYcord(), p.isWhite(), board, p.isWhite() ? 8 : -8);
			AllPieces.add(p);
			break;
		}
		fillPieces();
	}

	// Moved to BoardRenderer

	public void loadFenPosition(String fenString) {
		String[] parts = fenString.split(" ");
		String position = parts[0];
		int row = 0, col = 0;
		for (char c : position.toCharArray()) {
			if (c == '/') {
				row++;
				col = 0;
			}
			if (Character.isLetter(c)) {
				if (Character.isLowerCase(c)) {
					addToBoard(col, row, c, false);
				} else {
					addToBoard(col, row, c, true);
				}
				col++;
			}
			if (Character.isDigit(c)) {
				col += Integer.parseInt(String.valueOf(c));
			}
		}

		if (parts[1].equals("w")) {
			player = true;
		} else {
			player = false;
		}

	}

	public void fillPieces() {
		wPieces = new ArrayList<Piece>();
		bPieces = new ArrayList<Piece>();
		for (Piece p : AllPieces) {
			if (p.isWhite()) {
				wPieces.add(p);
			} else {
				bPieces.add(p);
			}
		}
	}

	public void addToBoard(int x, int y, char c, boolean isWhite) {
		switch (String.valueOf(c).toUpperCase()) {
		case "R":
			AllPieces.add(new Rook(x, y, isWhite, board, isWhite ? 5 : -5));
			break;
		case "N":
			AllPieces.add(new Knight(x, y, isWhite, board, isWhite ? 3 : -3));
			break;
		case "B":
			AllPieces.add(new Bishop(x, y, isWhite, board, isWhite ? 3 : -3));
			break;
		case "Q":
			AllPieces.add(new Queen(x, y, isWhite, board, isWhite ? 8 : -8));
			break;
		case "K":
			King king = new King(x, y, isWhite, board, isWhite ? 10 : -10);
			AllPieces.add(king);
			if (isWhite) {
				wk = king;
			} else {
				bk = king;
			}
			break;
		case "P":
			AllPieces.add(new Pawn(x, y, isWhite, board, isWhite ? 1 : -1));
			break;
		}
	}

}
