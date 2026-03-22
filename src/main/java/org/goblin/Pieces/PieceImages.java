package org.goblin.Pieces;

import java.awt.Color;

import javax.swing.ImageIcon;

public class PieceImages {
	static Color WHITECOLOR = Color.WHITE;
	static Color BLACKCOLOR = Color.BLACK;
	static String PAWN = "♟";
	static String ROOK = "♜";
	static String KNIGHT = "♞";
	static String BISHOP = "♝";
	static String QUEEN = "♛";
	static String KING = "♚";

	static ImageIcon wk;
	static ImageIcon bk;
	static ImageIcon wr;
	static ImageIcon br;
	static ImageIcon wq;
	static ImageIcon bq;
	static ImageIcon wb;
	static ImageIcon bb;
	static ImageIcon wn;
	static ImageIcon bn;
	static ImageIcon wp;
	static ImageIcon bp;

	public PieceImages() {
		wk = new ImageIcon(getClass().getResource("/wk.png"));
		bk = new ImageIcon(getClass().getResource("/bk.png"));
		wr = new ImageIcon(getClass().getResource("/wr.png"));
		br = new ImageIcon(getClass().getResource("/br.png"));
		wq = new ImageIcon(getClass().getResource("/wq.png"));
		bq = new ImageIcon(getClass().getResource("/bq.png"));
		wb = new ImageIcon(getClass().getResource("/wb.png"));
		bb = new ImageIcon(getClass().getResource("/bb.png"));
		wn = new ImageIcon(getClass().getResource("/wn.png"));
		bn = new ImageIcon(getClass().getResource("/bn.png"));
		wp = new ImageIcon(getClass().getResource("/wp.png"));
		bp = new ImageIcon(getClass().getResource("/bp.png"));
	}
}
