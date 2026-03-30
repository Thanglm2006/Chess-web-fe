package org.goblin.Pieces;
import org.goblin.Board.Board;
import org.goblin.Board.Move;
import org.goblin.Game.Game;
import java.util.ArrayList;
import java.util.List;

public abstract class Piece implements Cloneable{
	protected int xCord;
	protected int yCord;
	protected boolean isWhite;
	protected boolean isAlive;
	protected int valueInTheBoard;
	protected Board board;
	public static int size = 80;
	protected List<Move> moves = new ArrayList<>();
	
	public boolean makeMove(int toX, int toY, Board board) {
		Move move = new Move(xCord, yCord, toX, toY, this);
		if(!alive()) {
			return false;
		}
		for(Move m: moves) {
			if(m.compareTo(move) == 0) {
				board.updatePieces(xCord, yCord, toX, toY,this);
				xCord = toX;
				yCord = toY;
				return true;
			}
		}
		return false;
		
	}
	public abstract boolean canMove(int x ,int y, Board board);

	@SuppressWarnings("unlikely-arg-type")
	public boolean alive() {
		if (board.getXY(xCord, yCord) != valueInTheBoard || board.getXY(xCord, yCord) == 0 || board.getPiece(xCord, yCord) == null) {
			isAlive = false;
			board.getGame().AllPieces.remove(getClass());
		}
		return isAlive;
	}
	
	public void intializeSide(int value){
		valueInTheBoard = value;
	};
	
	public Piece(int x,int y,boolean iswhite,Board board, int value) {
		this.xCord = x;
		this.yCord = y;
		this.isWhite = iswhite;
		isAlive = true;
		this.board = board;
		intializeSide(value);
		board.setPieceIntoBoard(x, y, this);
	}
	
	// Drawing methods removed for Headless Backend Readiness
	
	public void fillAllPseudoLegalMoves(Board b) {
		moves = new ArrayList<Move>();
		for(int i=0; i<8; i++) {
			for(int j=0; j<8; j++) {
				if(canMove(i, j, b)) {
					moves.add(new Move(xCord, yCord, i, j, this));
				}
			}
		}
	}

	
	public int getXcord() {
		return xCord;
	}

	public void setXcord(int xcord) {
		this.xCord = xcord;
	}

	public int getYcord() {
		return yCord;
	}
	public void setYcord(int ycord) {
		this.yCord = ycord;
	}

	public boolean isWhite() {
		return isWhite;
	}

	public void setWhite(boolean isWhite) {
		this.isWhite = isWhite;
	}

	public Board getBoard() {
		return board;
	}

	public void setBoard(Board board) {
		this.board = board;
	}

	public void setValueInTheboard(int value) {
		this.valueInTheBoard = value;
	}
	public int getValueInTheboard() {
		return valueInTheBoard;
	}
	public List<Move> getMoves() {
		return moves;
	}
	public void setMoves(List<Move> moves) {
		this.moves = moves;
	}
	public Piece getClone() {
		try {
			return (Piece) this.clone();
		} catch (CloneNotSupportedException e) {
			e.printStackTrace();
		}
		return null;
	}
	
}
