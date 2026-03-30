package org.goblin.Frame;

import org.goblin.Game.Game;
import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;
import org.goblin.Pieces.Piece;

public class GameContainerPanel extends JPanel implements GameEventListener {
    private Panel boardPanel;
    private PlayerPanel topPlayer;
    private PlayerPanel bottomPlayer;
    private ToolbarPanel toolbar;
    
    private Timer timer;
    private int whiteTime;
    private int blackTime;
    private boolean hasTimeLimit;
    private RightSidebarPanel rightSidebar;

    public void setRightSidebar(RightSidebarPanel panel) {
        this.rightSidebar = panel;
    }
    
    public GameContainerPanel(int timeInSeconds) {
        this.setLayout(new GridBagLayout());
        this.setBackground(Theme.BG_LIGHT);
        
        // Initialize Game and Board Panel
        boardPanel = new Panel(new MoveListener() {
            @Override
            public void onMoveMade() {
                updatePlayerPanels();
            }
            @Override
            public void onUndoRequsted() {
                performUndo();
            }
        });
        boardPanel.game.setEventListener(this);
        
        hasTimeLimit = (timeInSeconds > 0);
        whiteTime = timeInSeconds;
        blackTime = timeInSeconds;
        
        // Initialize UI Components
        topPlayer = new PlayerPanel("Đối thủ", 1488, false, timeInSeconds);
        bottomPlayer = new PlayerPanel("Bạn", 1470, true, timeInSeconds);
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridx = 0;
        gbc.weightx = 1.0;
        gbc.weighty = 0.0;
        gbc.fill = GridBagConstraints.NONE;
        gbc.anchor = GridBagConstraints.CENTER;
        gbc.insets = new Insets(0, 0, 0, 0);

        gbc.gridy = 0;
        this.add(topPlayer, gbc);

        gbc.gridy = 1;
        this.add(boardPanel, gbc);

        gbc.gridy = 2;
        this.add(bottomPlayer, gbc);
        
        if (hasTimeLimit) {
            timer = new Timer(1000, e -> {
                if (getGame().gameOver) {
                    timer.stop();
                    return;
                }
                if (getGame().player) {
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
                updatePlayerPanels();
            });
            timer.start();
        }
        
        // Initial ui update
        updatePlayerPanels();
    }
    
    public Game getGame() {
        return boardPanel.game;
    }
    
    public void performUndo() {
        getGame().board.undoMove();
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performRedo() {
        getGame().board.redoMove();
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performFirst() {
        while(!getGame().board.lastMoves.isEmpty()) {
            getGame().board.undoMove();
        }
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performLast() {
        while(!getGame().board.undoneMoves.isEmpty()) {
            getGame().board.redoMove();
        }
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void updatePlayerPanels() {
        topPlayer.updateTime(blackTime, !getGame().player && !getGame().gameOver);
        bottomPlayer.updateTime(whiteTime, getGame().player && !getGame().gameOver);
        if (rightSidebar != null) {
            rightSidebar.updateMoveList();
        }
    }
    
    private void endGame(String message) {
        getGame().gameOver = true;
        if (timer != null) timer.stop();
        updatePlayerPanels();
        JOptionPane.showMessageDialog(this, message, "Hết thời gian", JOptionPane.INFORMATION_MESSAGE);
    }
    
    @Override
    public void onGameOver(String message) {
        endGame(message);
    }
    
    @Override
    public int onPromotionRequested(Piece pawn) {
        Object[] options = { "Queen", "Rook", "Knight", "Bishop" };
        return JOptionPane.showOptionDialog(this, "Chọn quân cờ để phong cấp", "Phong cấp", JOptionPane.YES_NO_CANCEL_OPTION, JOptionPane.QUESTION_MESSAGE, null, options, options[0]);
    }
}
