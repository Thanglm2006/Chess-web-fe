package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

public class RightSidebarStartPanel extends JPanel {
    private Frame parentFrame;
    
    public RightSidebarStartPanel(Frame frame) {
        this.parentFrame = frame;
        setPreferredSize(new Dimension(380, 800));
        setBackground(Theme.BG_DARK);
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
        	btn.setFont(Theme.MAIN_FONT_BOLD);
        	btn.setBackground(Theme.BG_LIGHT);
        	btn.setForeground(Theme.TEXT_NORMAL);
        	btn.setFocusPainted(false);
        	btn.setBorder(BorderFactory.createLineBorder(Theme.BG_DARK, 2));
        	btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        	
        	int val = timeVals[i];
        	btn.addActionListener(e -> {
        		selectedTime[0] = val;
        		for (JButton b : timeBtns) {
        			b.setBackground(Theme.BG_LIGHT);
        			b.setBorder(BorderFactory.createLineBorder(Theme.BG_DARK, 2));
        		}
        		btn.setBackground(Theme.BTN_BG_GRAY);
        		btn.setBorder(BorderFactory.createLineBorder(Theme.GREEN_BTN, 2));
        	});
        	timeBtns[i] = btn;
        	timeGrid.add(btn);
        }
        
        // Highlight default 5 mins
        timeBtns[2].setBackground(Theme.BTN_BG_GRAY);
        timeBtns[2].setBorder(BorderFactory.createLineBorder(Theme.GREEN_BTN, 2));
        
        // Play Button
        JButton playBtn = new JButton("Bắt đầu ván cờ");
        playBtn.setPreferredSize(new Dimension(340, 80));
        playBtn.setFont(Theme.FONT_LARGE_BOLD);
        playBtn.setBackground(Theme.GREEN_BTN);
        playBtn.setForeground(Theme.TEXT_NORMAL);
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
        btn.setFont(Theme.MAIN_FONT_BOLD);
        btn.setBackground(Theme.BG_LIGHT);
        btn.setForeground(Theme.TEXT_NORMAL);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
    
    private JLabel createTab(String text, boolean active) {
        JLabel lbl = new JLabel("<html><center>" + text + "</center></html>", SwingConstants.CENTER);
        lbl.setFont(Theme.MAIN_FONT_BOLD);
        lbl.setForeground(active ? Theme.TEXT_NORMAL : Theme.TEXT_GRAY);
        lbl.setOpaque(true);
        lbl.setBackground(active ? Theme.BG_LIGHT : Theme.BG_DARK);
        return lbl;
    }
}
