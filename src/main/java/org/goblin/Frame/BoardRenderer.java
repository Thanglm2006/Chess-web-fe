package org.goblin.Frame;

import java.awt.BasicStroke;
import java.awt.Color;
import java.awt.Graphics;
import java.awt.Graphics2D;

import javax.swing.ImageIcon;
import javax.swing.JPanel;

import org.goblin.Board.Move;
import org.goblin.Pieces.*;
import org.goblin.Utils.Theme;
import org.goblin.Game.Game;

public class BoardRenderer {
    private PieceImages pieceImages;
    private Game game;

    public BoardRenderer(Game game) {
        this.game = game;
        pieceImages = new PieceImages();
    }

    public void drawBoard(Graphics g) {
        g.setFont(Theme.MAIN_FONT_BOLD);
        for (int i = 0; i < 8; i++) {
            for (int j = 0; j < 8; j++) {
                boolean isDark = ((i + j) % 2 == 1);
                Color darkCol = Theme.BOARD_DARK;
                Color lightCol = Theme.BOARD_LIGHT;
                
                if (isDark) {
                    g.setColor(darkCol);
                } else {
                    g.setColor(lightCol);
                }
                g.fillRect(i * Piece.size, j * Piece.size, Piece.size, Piece.size);
                
                // Draw coordinates
                g.setColor(isDark ? lightCol : darkCol);
                
                // Ranks (1-8) top-left
                if (i == 0) {
                    String rank = String.valueOf(8 - j);
                    g.drawString(rank, i * Piece.size + 4, j * Piece.size + 16);
                }
                
                // Files (a-h) bottom-right
                if (j == 7) {
                    String file = String.valueOf((char) ('a' + i));
                    int strWidth = g.getFontMetrics().stringWidth(file);
                    g.drawString(file, (i + 1) * Piece.size - strWidth - 4, (j + 1) * Piece.size - 4);
                }
            }
        }
    }

    public void drawPieces(Graphics g, JPanel panel) {
        for (Piece p : game.AllPieces) {
            drawSinglePiece(g, p, panel, false, 0, 0);
        }
    }

    public void drawDraggedPiece(Graphics g, JPanel panel, Piece active, int x, int y) {
        if (active != null && game.drag) {
            drawSinglePiece(g, active, panel, true, x, y);
        }
    }

    private void drawSinglePiece(Graphics g, Piece p, JPanel panel, boolean isDragged, int x, int y) {
        ImageIcon img = getImageForPiece(p);
        if (img != null) {
            if (isDragged) {
                g.drawImage(img.getImage(), x - Piece.size/2, y - Piece.size/2, Piece.size, Piece.size, panel);
            } else {
                g.drawImage(img.getImage(), p.getXcord() * Piece.size, p.getYcord() * Piece.size, Piece.size, Piece.size, panel);
            }
        }
    }

    private ImageIcon getImageForPiece(Piece p) {
        if (p instanceof King) return p.isWhite() ? PieceImages.wk : PieceImages.bk;
        if (p instanceof Queen) return p.isWhite() ? PieceImages.wq : PieceImages.bq;
        if (p instanceof Rook) return p.isWhite() ? PieceImages.wr : PieceImages.br;
        if (p instanceof Bishop) return p.isWhite() ? PieceImages.wb : PieceImages.bb;
        if (p instanceof Knight) return p.isWhite() ? PieceImages.wn : PieceImages.bn;
        if (p instanceof Pawn) return p.isWhite() ? PieceImages.wp : PieceImages.bp;
        return null;
    }

    public void drawPossibleMoves(Graphics g, JPanel panel, Piece active) {
        if (active == null) return;
        Graphics2D g2 = (Graphics2D) g;
        g2.setStroke(new BasicStroke(3));

        for (Move m : active.getMoves()) {
            if (active.getBoard().getPiece(m.getToX(), m.getToY()) != null && active.getBoard().getPiece(m.getToX(), m.getToY()).isWhite() != active.isWhite()) {
                g.setColor(Color.ORANGE);
            } else {
                g.setColor(Color.DARK_GRAY);
            }
            g.fillOval((m.getToX() * Piece.size) + Piece.size/3, (m.getToY() * Piece.size) + Piece.size/3, Piece.size/3, Piece.size/3);
            g2.setColor(Color.DARK_GRAY);
            if (game.drag) {
                g2.fillRect(m.getFromX() * Piece.size, m.getFromY() * Piece.size, Piece.size, Piece.size);             
            } else {
                g2.drawRect(m.getFromX() * Piece.size, m.getFromY() * Piece.size, Piece.size, Piece.size);
            }
        }
    }

    public void drawKingInCheck(Graphics g, JPanel panel) {
        g.setColor(Color.RED);
        if (game.player) {
            for (Piece p : game.wPieces) {
                if (p instanceof King && ((King) p).isInCheck()) {
                    g.drawRect(p.getXcord() * Piece.size, p.getYcord() * Piece.size, Piece.size, Piece.size);
                }
            }
        } else {
            for (Piece p : game.bPieces) {
                if (p instanceof King && ((King) p).isInCheck()) {
                    g.drawRect(p.getXcord() * Piece.size, p.getYcord() * Piece.size, Piece.size, Piece.size);
                }
            }
        }
    }
}
