package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;

public class RightSidebarStartPanel extends JPanel {
    private Color bgGray = new Color(38, 36, 33);
    private Color bgLightGray = new Color(49, 46, 43);
    private Color greenBtn = new Color(129, 182, 76);
    private Frame parentFrame;
    
    public RightSidebarStartPanel(Frame frame) {
        this.parentFrame = frame;
        setPreferredSize(new Dimension(380, 800));
        setBackground(bgGray);
        setLayout(new FlowLayout(FlowLayout.CENTER, 15, 25));
        setBorder(BorderFactory.createEmptyBorder(15, 10, 15, 10));
        
        // Top tabs fake
        JPanel tabs = new JPanel(new GridLayout(1, 3, 5, 0));
        tabs.setOpaque(false);
        tabs.setPreferredSize(new Dimension(340, 50));
        tabs.add(createTab("Ván cờ mới", true));
        tabs.add(createTab("Các ván đấu", false));
        tabs.add(createTab("Các kỳ thủ", false));
        
        // Time selection grid
        JPanel timeGrid = new JPanel(new GridLayout(2, 3, 10, 10));
        timeGrid.setOpaque(false);
        timeGrid.setPreferredSize(new Dimension(340, 140));
        
        String[] timeLabels = {"1 phút", "3 phút", "5 phút", "10 phút", "30 phút", "∞"};
        int[] timeVals = {60, 180, 300, 600, 1800, 0};
        
        JButton[] timeBtns = new JButton[timeLabels.length];
        int[] selectedTime = {300}; // Default 5 mins
        
        for (int i = 0; i < timeLabels.length; i++) {
        	JButton btn = new JButton(timeLabels[i]);
        	btn.setFont(new Font("SansSerif", Font.BOLD, 17));
        	btn.setBackground(bgLightGray);
        	btn.setForeground(Color.WHITE);
        	btn.setFocusPainted(false);
        	btn.setBorder(BorderFactory.createLineBorder(bgGray, 2));
        	btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        	
        	int val = timeVals[i];
        	btn.addActionListener(e -> {
        		selectedTime[0] = val;
        		for (JButton b : timeBtns) {
        			b.setBackground(bgLightGray);
        			b.setBorder(BorderFactory.createLineBorder(bgGray, 2));
        		}
        		btn.setBackground(new Color(60, 58, 56));
        		btn.setBorder(BorderFactory.createLineBorder(greenBtn, 2));
        	});
        	timeBtns[i] = btn;
        	timeGrid.add(btn);
        }
        
        // Highlight default 5 mins
        timeBtns[2].setBackground(new Color(60, 58, 56));
        timeBtns[2].setBorder(BorderFactory.createLineBorder(greenBtn, 2));
        
        // Play Button
        JButton playBtn = new JButton("Bắt đầu ván cờ");
        playBtn.setPreferredSize(new Dimension(340, 80));
        playBtn.setFont(new Font("SansSerif", Font.BOLD, 30));
        playBtn.setBackground(greenBtn);
        playBtn.setForeground(Color.WHITE);
        playBtn.setFocusPainted(false);
        playBtn.setBorderPainted(false);
        playBtn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        playBtn.addActionListener(e -> {
            parentFrame.startGame(selectedTime[0]);
        });
        
        // Additional fake buttons
        JButton customBtn = new JButton("Tùy chỉnh thách thức");
        styleSecondaryBtn(customBtn);
        
        JButton friendBtn = new JButton("Chơi với một người bạn");
        styleSecondaryBtn(friendBtn);
        
        add(tabs);
        add(timeGrid);
        add(playBtn);
        add(customBtn);
        add(friendBtn);
    }
    
    private void styleSecondaryBtn(JButton btn) {
        btn.setPreferredSize(new Dimension(340, 60));
        btn.setFont(new Font("SansSerif", Font.BOLD, 20));
        btn.setBackground(bgLightGray);
        btn.setForeground(Color.WHITE);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
    
    private JLabel createTab(String text, boolean active) {
        JLabel lbl = new JLabel("<html><center>" + text + "</center></html>", SwingConstants.CENTER);
        lbl.setFont(new Font("SansSerif", Font.BOLD, 14));
        lbl.setForeground(active ? Color.WHITE : Color.GRAY);
        lbl.setOpaque(true);
        lbl.setBackground(active ? bgLightGray : bgGray);
        return lbl;
    }
}
