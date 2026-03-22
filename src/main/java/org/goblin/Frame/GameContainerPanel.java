package org.goblin.Frame;

import org.goblin.Game.Game;
import javax.swing.*;
import java.awt.*;

public class GameContainerPanel extends JPanel {
    private Panel boardPanel;
    private PlayerPanel topPlayer;
    private PlayerPanel bottomPlayer;
    private ToolbarPanel toolbar;
    
    private Timer timer;
    private int whiteTime;
    private int blackTime;
    private boolean hasTimeLimit;
    
    public GameContainerPanel(int timeInSeconds) {
        this.setLayout(new GridBagLayout());
        this.setBackground(new Color(49, 46, 43));
        
        // Initialize Game and Board Panel
        boardPanel = new Panel();
        
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
                if (Game.gameOver) {
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
                updatePlayerPanels();
            });
            timer.start();
        }
        
        // Initial ui update
        updatePlayerPanels();
    }
    
    public void performUndo() {
        org.goblin.Game.Game.board.undoMove();
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performRedo() {
        org.goblin.Game.Game.board.redoMove();
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performFirst() {
        while(!org.goblin.Game.Game.board.lastMoves.isEmpty()) {
            org.goblin.Game.Game.board.undoMove();
        }
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void performLast() {
        while(!org.goblin.Game.Game.board.undoneMoves.isEmpty()) {
            org.goblin.Game.Game.board.redoMove();
        }
        boardPanel.repaint();
        updatePlayerPanels();
    }
    
    public void updatePlayerPanels() {
        topPlayer.updateTime(blackTime, !Game.player && !Game.gameOver);
        bottomPlayer.updateTime(whiteTime, Game.player && !Game.gameOver);
    }
    
    private void endGame(String message) {
        Game.gameOver = true;
        if (timer != null) timer.stop();
        updatePlayerPanels();
        JOptionPane.showMessageDialog(this, message, "Hết thời gian", JOptionPane.INFORMATION_MESSAGE);
    }
}
