package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;

public class PlayerPanel extends JPanel {
    private String username;
    private int elo;
    private boolean isWhite;
    private int timeInSeconds;
    private boolean hasTimeLimit;
    
    // Components
    private JLabel timerLabel;
    private JPanel timerBox;
    
    // Colors
    private Color bgGray = new Color(49, 46, 43);
    private Color timerInactiveBg = new Color(43, 40, 38);
    private Color timerActiveBg = new Color(255, 255, 255);
    private Color timerInactiveText = new Color(153, 153, 153);
    private Color timerActiveText = new Color(0, 0, 0);

    public PlayerPanel(String username, int elo, boolean isWhite, int timeInSeconds) {
        this.username = username;
        this.elo = elo;
        this.isWhite = isWhite;
        this.timeInSeconds = timeInSeconds;
        this.hasTimeLimit = (timeInSeconds > 0);
        
        setPreferredSize(new Dimension(640, 80));
        setBackground(bgGray);
        setLayout(new BorderLayout());
        
        // Left side: Avatar + Info
        JPanel infoPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 15));
        infoPanel.setOpaque(false);
        
        // Avatar placeholder
        JLabel avatar = new JLabel();
        avatar.setPreferredSize(new Dimension(50, 50));
        avatar.setOpaque(true);
        avatar.setBackground(Color.LIGHT_GRAY);
        avatar.setBorder(BorderFactory.createLineBorder(Color.DARK_GRAY, 1));
        infoPanel.add(avatar);
        
        // Name & Elo
        JPanel textPanel = new JPanel(new GridLayout(2, 1));
        textPanel.setOpaque(false);
        JLabel nameLabel = new JLabel(username);
        nameLabel.setFont(new Font("SansSerif", Font.BOLD, 18));
        nameLabel.setForeground(Color.WHITE);
        
        JLabel eloLabel = new JLabel("⚡ " + elo + " " + (isWhite ? "🏳" : "🏴"));
        eloLabel.setFont(new Font("SansSerif", Font.PLAIN, 14));
        eloLabel.setForeground(Color.LIGHT_GRAY);
        
        textPanel.add(nameLabel);
        textPanel.add(eloLabel);
        infoPanel.add(textPanel);
        
        this.add(infoPanel, BorderLayout.WEST);
        
        // Right side: Timer Box
        timerBox = new JPanel(new GridBagLayout());
        timerBox.setPreferredSize(new Dimension(140, 50));
        timerBox.setBackground(timerInactiveBg);
        
        timerLabel = new JLabel(formatTime(timeInSeconds));
        timerLabel.setFont(new Font("SansSerif", Font.BOLD, 28));
        timerLabel.setForeground(timerInactiveText);
        timerBox.add(timerLabel);
        
        JPanel timerWrapper = new JPanel(new FlowLayout(FlowLayout.RIGHT, 15, 15));
        timerWrapper.setOpaque(false);
        timerWrapper.add(timerBox);
        this.add(timerWrapper, BorderLayout.EAST);
    }
    
    public void updateTime(int timeInSec, boolean isActive) {
        this.timeInSeconds = timeInSec;
        if (hasTimeLimit) {
            timerLabel.setText(formatTime(timeInSec));
        } else {
            timerLabel.setText("∞");
        }
        
        // Update styling based on active state
        if (isActive) {
            timerBox.setBackground(timerActiveBg);
            timerLabel.setForeground(timerActiveText);
            // Yellow background check
            timerBox.setBorder(BorderFactory.createLineBorder(new Color(255, 215, 0), 3));
        } else {
            timerBox.setBackground(timerInactiveBg);
            timerLabel.setForeground(timerInactiveText);
            timerBox.setBorder(BorderFactory.createEmptyBorder(3, 3, 3, 3));
        }
    }
    
    private String formatTime(int t) {
        return String.format("%02d:%02d", Math.max(0, t) / 60, Math.max(0, t) % 60);
    }
}
