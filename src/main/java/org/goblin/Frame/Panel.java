package org.goblin.Frame;

import org.goblin.Game.Game;
import org.goblin.Pieces.Piece;

import java.awt.Color;
import java.awt.Cursor;
import java.awt.Font;
import java.awt.FontMetrics;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.SwingUtilities;
import javax.swing.Timer;

public class Panel extends JPanel {

	private static final long serialVersionUID = 1L;
	Game game;
	int ti,tj;
	public static int xx, yy;
	JPanel panel = this;
	
	// Timer variables
	private Timer timer;
	private int whiteTime;
	private int blackTime;
	private boolean hasTimeLimit;
	private boolean myGameOver = false;
	
	private Color darkGreen = new Color(118, 150, 86);
	private Color lightCream = new Color(238, 238, 210);

	Panel(int timeInSeconds){
		this.setFocusable(true);
		this.addMouseListener(new Listener());
		this.addMouseMotionListener(new Listener());
		this.addKeyListener(new KeyAdapter() {
			public void keyPressed(KeyEvent e) {
				if(e.getKeyCode() == 37) {
					Game.board.undoMove();
				}
			}
		});
		game = new Game();
		
		this.hasTimeLimit = (timeInSeconds > 0);
		this.whiteTime = timeInSeconds;
		this.blackTime = timeInSeconds;
		
		if (hasTimeLimit) {
			timer = new Timer(1000, e -> {
				if (myGameOver || Game.gameOver) {
					timer.stop();
					return;
				}
				if (Game.player) {
					whiteTime--;
					if (whiteTime <= 0) {
						endGame("Đen thắng! Trắng đã hết thời gian.");
					}
				} else {
					blackTime--;
					if (blackTime <= 0) {
						endGame("Trắng thắng! Đen đã hết thời gian.");
					}
				}
				repaint();
			});
			timer.start();
		}
	}
	
	private void endGame(String message) {
		myGameOver = true;
		Game.gameOver = true;
		if (timer != null) timer.stop();
		repaint();
		JOptionPane.showMessageDialog(this, message, "Hết thời gian", JOptionPane.INFORMATION_MESSAGE);
	}
	
	public void paintComponent(Graphics g) {
		super.paintComponent(g);
		game.draw(g, xx, yy, this);
		drawSidebar(g);
	}
	
	private void drawSidebar(Graphics g) {
		Graphics2D g2 = (Graphics2D) g;
		g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
		
		int sidebarX = Frame.BOARD_WIDTH;
		int width = Frame.SIDEBAR_WIDTH;
		int height = Frame.HEIGTH;
		
		// Background (Darker than the board's dark green)
		g2.setColor(new Color(85, 110, 60));
		g2.fillRect(sidebarX, 0, width, height);
		
		// Separator shadow/line
		g2.setColor(new Color(40, 55, 25));
		g2.fillRect(sidebarX, 0, 4, height);
		
		// Draw Black player info (top)
		drawPlayerBox(g2, "Nước đi của Đen", false, sidebarX + 24, 40, width - 48, 100);
		
		// Draw White player info (bottom)
		drawPlayerBox(g2, "Nước đi của Trắng", true, sidebarX + 24, height - 140, width - 48, 100);
	}
	
	private void drawPlayerBox(Graphics2D g2, String label, boolean isWhite, int x, int y, int w, int h) {
		boolean isTurn = (Game.player == isWhite);
		
		if (isTurn && !myGameOver && !Game.gameOver) {
			g2.setColor(Color.YELLOW);
			g2.fillRoundRect(x - 4, y - 4, w + 8, h + 8, 15, 15);
		}
		
		g2.setColor(lightCream);
		g2.fillRoundRect(x, y, w, h, 15, 15);
		
		g2.setColor(darkGreen);
		g2.setFont(new Font("SansSerif", Font.BOLD, 18));
		FontMetrics fm = g2.getFontMetrics();
		
		// Determine time text
		String timeText = "--:--";
		if (hasTimeLimit) {
			int t = isWhite ? whiteTime : blackTime;
			timeText = String.format("%02d:%02d", t / 60, t % 60);
		} else {
			timeText = "∞";
		}
		
		int labelWidth = fm.stringWidth(label);
		g2.drawString(label, x + (w - labelWidth)/2, y + 30);
		
		g2.setFont(new Font("SansSerif", Font.BOLD, 40));
		FontMetrics timeFm = g2.getFontMetrics();
		int timeWidth = timeFm.stringWidth(timeText);
		g2.drawString(timeText, x + (w - timeWidth)/2, y + 80);
	}

	class Listener extends MouseAdapter{
		@Override
		public void mouseClicked(MouseEvent e) {
			if (e.getX() >= Frame.BOARD_WIDTH || myGameOver || Game.gameOver) return;
			if(SwingUtilities.isLeftMouseButton(e)) {
				int x = e.getX()/ Piece.size;
				int y = e.getY()/Piece.size;
				Game.drag = false;
				game.active = null;
				game.selectPiece(x, y);
				revalidate();
				repaint();
			}
		}
		
		@Override
		public void mouseMoved(MouseEvent e) {
			if (e.getX() >= Frame.BOARD_WIDTH || myGameOver || Game.gameOver) {
				setCursor(new Cursor(Cursor.DEFAULT_CURSOR));
				return;
			}
			ti = e.getX()/Piece.size;
			tj = e.getY()/Piece.size;
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
			if (e.getX() >= Frame.BOARD_WIDTH || myGameOver || Game.gameOver) return;
			if(!Game.drag && game.active != null) {
				game.active = null;
			}
			if(SwingUtilities.isLeftMouseButton(e)) {
				game.selectPiece(e.getX()/Piece.size, e.getY()/Piece.size);
				Game.drag = true;
				xx = e.getX();
				yy = e.getY();				
			}
			revalidate();
			repaint();
		}
		
		@Override
		public void mouseReleased(MouseEvent e) {
			if (e.getX() >= Frame.BOARD_WIDTH || myGameOver || Game.gameOver) {
				Game.drag = false;
				repaint();
				return;
			}
			int x = e.getX() / Piece.size;
			int y = e.getY() / Piece.size;
			game.move(x, y);
			revalidate();
			repaint();
		}
	}
}
