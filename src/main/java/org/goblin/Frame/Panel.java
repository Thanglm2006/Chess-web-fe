package org.goblin.Frame;

import org.goblin.Game.Game;
import org.goblin.Pieces.Piece;

import java.awt.Cursor;
import java.awt.Graphics;
import java.awt.Dimension;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

import javax.swing.JPanel;
import javax.swing.SwingUtilities;

public class Panel extends JPanel {

	private static final long serialVersionUID = 1L;
	Game game;
	int ti,tj;
	public static int xx, yy;
	JPanel panel = this;
	
	public Panel(){
		this.setFocusable(true);
		this.setPreferredSize(new Dimension(80 * 8, 80 * 8));
		this.addMouseListener(new Listener());
		this.addMouseMotionListener(new Listener());
		this.addKeyListener(new KeyAdapter() {
			public void keyPressed(KeyEvent e) {
				if(e.getKeyCode() == 37) {
					Game.board.undoMove();
					
					// Update container if needed
					java.awt.Container parent = getParent();
					while (parent != null && !(parent instanceof GameContainerPanel)) {
						parent = parent.getParent();
					}
					if (parent instanceof GameContainerPanel) {
						((GameContainerPanel) parent).updatePlayerPanels();
					}
					repaint();
				}
			}
		});
		game = new Game();
	}
	
	public void paintComponent(Graphics g) {
		super.paintComponent(g);
		game.draw(g, xx, yy, this);
	}

	class Listener extends MouseAdapter{
		@Override
		public void mouseClicked(MouseEvent e) {
			if(Game.gameOver) return;
			if(SwingUtilities.isLeftMouseButton(e)) {
				int x = e.getX()/ Piece.size;
				int y = e.getY()/Piece.size;
				// Out of bounds safety
				if (x >= 8 || y >= 8 || x < 0 || y < 0) return;
				
				Game.drag = false;
				game.active = null;
				game.selectPiece(x, y);
				revalidate();
				repaint();
			}
		}
		
		@Override
		public void mouseMoved(MouseEvent e) {
			if(Game.gameOver) {
				setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
				return;
			}
			ti = e.getX()/Piece.size;
			tj = e.getY()/Piece.size;
			if (ti >= 8 || tj >= 8 || ti < 0 || tj < 0) return;
			
			if(Game.board.getPiece(ti, tj) != null)  {
				setCursor(new Cursor(Cursor.HAND_CURSOR));
			}
			else {
				setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
			}
			revalidate();
			repaint();
		}
		
		@Override
		public void mouseDragged(MouseEvent e) {
			if(Game.gameOver) return;
			if(!Game.drag && game.active != null) {
				game.active = null;
			}
			if(SwingUtilities.isLeftMouseButton(e)) {
				int x = e.getX()/ Piece.size;
				int y = e.getY()/Piece.size;
				if (x >= 8 || y >= 8 || x < 0 || y < 0) return;
				
				game.selectPiece(x, y);
				Game.drag = true;
				xx = e.getX();
				yy = e.getY();				
			}
			revalidate();
			repaint();
		}
		
		@Override
		public void mouseReleased(MouseEvent e) {
			if(Game.gameOver) {
				Game.drag = false;
				repaint();
				return;
			}
			int x = e.getX() / Piece.size;
			int y = e.getY() / Piece.size;
			if (x >= 8 || y >= 8 || x < 0 || y < 0) {
				Game.drag = false;
				repaint();
				return;
			}
			game.move(x, y);
			revalidate();
			repaint();
			
			// Update game container info after move
			java.awt.Container parent = getParent();
			while (parent != null && !(parent instanceof GameContainerPanel)) {
				parent = parent.getParent();
			}
			if (parent instanceof GameContainerPanel) {
				((GameContainerPanel) parent).updatePlayerPanels();
			}
		}
	}
}
