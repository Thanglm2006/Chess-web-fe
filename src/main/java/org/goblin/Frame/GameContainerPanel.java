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
        this.setLayout(new BorderLayout());
        this.setBackground(new Color(49, 46, 43));
        
        // Initialize Game and Board Panel
        boardPanel = new Panel();
        
        hasTimeLimit = (timeInSeconds > 0);
        whiteTime = timeInSeconds;
        blackTime = timeInSeconds;
        
        // Initialize UI Components
        topPlayer = new PlayerPanel("Đối thủ", 1456, false, timeInSeconds);
        bottomPlayer = new PlayerPanel("Bạn", 1470, true, timeInSeconds);
        toolbar = new ToolbarPanel(boardPanel);
        
        // Top wrapper
        JPanel topWrapper = new JPanel(new BorderLayout());
        topWrapper.add(topPlayer, BorderLayout.CENTER);
        
        // Bottom wrapper
        JPanel bottomWrapper = new JPanel(new BorderLayout());
        bottomWrapper.add(bottomPlayer, BorderLayout.NORTH);
        bottomWrapper.add(toolbar, BorderLayout.SOUTH);
        
        this.add(topWrapper, BorderLayout.NORTH);
        this.add(boardPanel, BorderLayout.CENTER);
        this.add(bottomWrapper, BorderLayout.SOUTH);
        
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
