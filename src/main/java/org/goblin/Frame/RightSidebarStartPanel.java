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
        
        // Time selection combo
        String[] times = {"1 phút", "3 phút", "5 phút (Chớp)", "10 phút", "30 phút", "Không giới hạn"};
        int[] timeVals = {60, 180, 300, 600, 1800, 0};
        JComboBox<String> timeCombo = new JComboBox<>(times);
        timeCombo.setSelectedIndex(2); // default 5 min
        timeCombo.setPreferredSize(new Dimension(340, 60));
        timeCombo.setFont(new Font("SansSerif", Font.BOLD, 22));
        timeCombo.setBackground(bgLightGray);
        timeCombo.setForeground(Color.WHITE);
        
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
            int selectedIdx = timeCombo.getSelectedIndex();
            parentFrame.startGame(timeVals[selectedIdx]);
        });
        
        // Additional fake buttons
        JButton customBtn = new JButton("Tùy chỉnh thách thức");
        styleSecondaryBtn(customBtn);
        
        JButton friendBtn = new JButton("Chơi với một người bạn");
        styleSecondaryBtn(friendBtn);
        
        add(tabs);
        add(timeCombo);
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
