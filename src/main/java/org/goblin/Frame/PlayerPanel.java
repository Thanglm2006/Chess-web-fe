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
    private Color bgGray = new Color(38, 36, 33);
    private Color timerInactiveBg = new Color(55, 51, 48);
    private Color timerActiveBg = new Color(255, 255, 255);
    private Color timerInactiveText = new Color(200, 200, 200);
    private Color timerActiveText = new Color(0, 0, 0);

    public PlayerPanel(String username, int elo, boolean isWhite, int timeInSeconds) {
        this.username = username;
        this.elo = elo;
        this.isWhite = isWhite;
        this.timeInSeconds = timeInSeconds;
        this.hasTimeLimit = (timeInSeconds > 0);
        
        Dimension size = new Dimension(640, 50);
        setPreferredSize(size);
        setMinimumSize(size);
        setMaximumSize(size);
        setBackground(bgGray);
        setLayout(new BorderLayout());
        
        // Left side: Avatar + Info
        JPanel infoPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 10, 5));
        infoPanel.setOpaque(false);
        
        // Avatar placeholder
        JLabel avatar = new JLabel();
        avatar.setPreferredSize(new Dimension(40, 40));
        avatar.setOpaque(true);
        avatar.setBackground(Color.LIGHT_GRAY);
        infoPanel.add(avatar);
        
        // Name & Elo
        JPanel textPanel = new JPanel(new FlowLayout(FlowLayout.LEFT, 5, 0));
        textPanel.setOpaque(false);
        JLabel nameLabel = new JLabel(username);
        nameLabel.setFont(new Font("SansSerif", Font.BOLD, 16));
        nameLabel.setForeground(Color.WHITE);
        
        JLabel eloLabel = new JLabel("(" + elo + ")");
        eloLabel.setFont(new Font("SansSerif", Font.PLAIN, 14));
        eloLabel.setForeground(Color.LIGHT_GRAY);
        
        JLabel flagLabel = new JLabel(isWhite ? "🏳" : "🏴");
        
        textPanel.add(nameLabel);
        textPanel.add(eloLabel);
        textPanel.add(flagLabel);
        
        // Align text vertically center
        JPanel wrap = new JPanel(new GridBagLayout());
        wrap.setOpaque(false);
        wrap.add(textPanel);
        infoPanel.add(wrap);
        
        this.add(infoPanel, BorderLayout.WEST);
        
        // Right side: Timer Box
        timerBox = new JPanel(new GridBagLayout());
        timerBox.setPreferredSize(new Dimension(100, 40));
        timerBox.setBackground(timerInactiveBg);
        
        timerLabel = new JLabel(formatTime(timeInSeconds));
        timerLabel.setFont(new Font("SansSerif", Font.BOLD, 22));
        timerLabel.setForeground(timerInactiveText);
        timerBox.add(timerLabel);
        
        JPanel timerWrapper = new JPanel(new FlowLayout(FlowLayout.RIGHT, 0, 5));
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
        } else {
            timerBox.setBackground(timerInactiveBg);
            timerLabel.setForeground(timerInactiveText);
        }
    }
    
    private String formatTime(int t) {
        return String.format("%d:%02d", Math.max(0, t) / 60, Math.max(0, t) % 60);
    }
}
