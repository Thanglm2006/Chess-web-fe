package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;
import org.goblin.Game.Game;

public class RightSidebarPanel extends JPanel {
    private Color bgDark = new Color(38, 36, 33);
    private Color bgLight = new Color(49, 46, 43);
    private Color bgBtn = new Color(60, 58, 56);
    private Color textGray = new Color(153, 153, 153);
    private Frame parentFrame;
    private GameContainerPanel gameContainer;
    private JTextArea moveListArea;
    
    public RightSidebarPanel(Frame frame, GameContainerPanel gameContainer) {
        this.parentFrame = frame;
        this.gameContainer = gameContainer;
        setPreferredSize(new Dimension(380, 740));
        setBackground(bgDark);
        setLayout(new BorderLayout());
        
        // 1. Top Tabs
        JPanel topTabs = new JPanel(new GridLayout(1, 4));
        topTabs.setPreferredSize(new Dimension(380, 60));
        topTabs.setBackground(bgDark);
        topTabs.add(createTab("⚡ Chơi", true));
        topTabs.add(createTab("+ Ván mới", false));
        topTabs.add(createTab("Các ván đấu", false));
        topTabs.add(createTab("Các kỳ thủ", false));
        
        // 2. Sub Tabs
        JPanel subTabs = new JPanel(new GridLayout(1, 2));
        subTabs.setPreferredSize(new Dimension(380, 40));
        subTabs.setBackground(bgDark);
        subTabs.add(createSubTab("Các nước đi", true));
        subTabs.add(createSubTab("Thông tin", false));
        
        JPanel topWrapper = new JPanel(new BorderLayout());
        topWrapper.add(topTabs, BorderLayout.NORTH);
        topWrapper.add(subTabs, BorderLayout.SOUTH);
        this.add(topWrapper, BorderLayout.NORTH);
        
        // 3. Move List Area (Center)
        moveListArea = new JTextArea();
        moveListArea.setEditable(false);
        moveListArea.setFont(new Font("SansSerif", Font.PLAIN, 16));
        moveListArea.setBackground(bgLight);
        moveListArea.setForeground(Color.WHITE);
        moveListArea.setMargin(new Insets(10, 15, 10, 15));
        
        JScrollPane scrollPane = new JScrollPane(moveListArea);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        scrollPane.getViewport().setBackground(bgLight);
        
        // Remove scrollbars for cleaner look or style them
        scrollPane.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0));
        
        this.add(scrollPane, BorderLayout.CENTER);
        
        // 4. Controls & Chat Area (Bottom)
        JPanel bottomArea = new JPanel();
        bottomArea.setLayout(new BoxLayout(bottomArea, BoxLayout.Y_AXIS));
        bottomArea.setBackground(bgDark);
        
        // 4a. Navigation Buttons
        JPanel navRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 5, 10));
        navRow.setBackground(bgLight);
        navRow.setBorder(BorderFactory.createMatteBorder(1, 0, 1, 0, new Color(70, 70, 70)));
        JButton btnFirst = createNavBtn("|<");
        JButton btnPrev = createNavBtn("<");
        JButton btnNext = createNavBtn(">");
        JButton btnLast = createNavBtn(">|");
        
        btnFirst.addActionListener(e -> {
            if (this.gameContainer != null) {
                this.gameContainer.performFirst();
            }
        });
        
        btnPrev.addActionListener(e -> {
            if (this.gameContainer != null) {
                this.gameContainer.performUndo();
            }
        });
        
        btnNext.addActionListener(e -> {
            if (this.gameContainer != null) {
                this.gameContainer.performRedo();
            }
        });
        
        btnLast.addActionListener(e -> {
            if (this.gameContainer != null) {
                this.gameContainer.performLast();
            }
        });
        
        navRow.add(btnFirst);
        navRow.add(btnPrev);
        navRow.add(btnNext);
        navRow.add(btnLast);
        
        // 4b. Draw / Resign
        JPanel actionRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 10));
        actionRow.setBackground(bgLight);
        JButton btnDraw = createActionBtn("½ Hòa cờ");
        JButton btnResign = createActionBtn("🏳 Hủy");
        actionRow.add(btnDraw);
        actionRow.add(btnResign);
        
        // 4c. Player Info Text
        JPanel infoRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 10));
        infoRow.setBackground(bgDark);
        JLabel infoText = new JLabel("<html><font color='white'><b>VÁN CỜ MỚI</b></font><br><font color='#999999'>Đối thủ (1488) gặp Bạn (1470) (5 phút)</font></html>");
        infoText.setFont(new Font("SansSerif", Font.PLAIN, 12));
        infoRow.add(infoText);
        
        // 4d. Chat Input
        JPanel chatRow = new JPanel(new BorderLayout());
        chatRow.setPreferredSize(new Dimension(380, 40));
        chatRow.setBackground(bgDark);
        JTextField chatInput = new JTextField(" Gửi tin nhắn...");
        chatInput.setBackground(bgDark);
        chatInput.setForeground(textGray);
        chatInput.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, new Color(70, 70, 70)));
        chatRow.add(chatInput, BorderLayout.CENTER);
        
        bottomArea.add(navRow);
        bottomArea.add(actionRow);
        bottomArea.add(infoRow);
        bottomArea.add(chatRow);
        
        this.add(bottomArea, BorderLayout.SOUTH);
        updateMoveList();
    }
    
    public void updateMoveList() {
        if (moveListArea == null || Game.board == null) return;
        StringBuilder sb = new StringBuilder();
        int halfMoveCount = 1;
        
        for (org.goblin.Board.Move m : Game.board.lastMoves) {
            if (halfMoveCount % 2 != 0) {
                sb.append((halfMoveCount / 2 + 1)).append(". ").append(m.getNotation()).append("   ");
            } else {
                sb.append(m.getNotation()).append("\n");
            }
            halfMoveCount++;
        }
        
        moveListArea.setText(sb.toString());
        moveListArea.setCaretPosition(moveListArea.getDocument().getLength());
    }
    
    private JLabel createTab(String text, boolean active) {
        JLabel lbl = new JLabel("<html><center>" + text + "</center></html>", SwingConstants.CENTER);
        lbl.setFont(new Font("SansSerif", Font.BOLD, 12));
        lbl.setForeground(active ? Color.WHITE : textGray);
        lbl.setOpaque(true);
        lbl.setBackground(bgDark);
        return lbl;
    }
    
    private JLabel createSubTab(String text, boolean active) {
        JLabel lbl = new JLabel("<html><center>" + text + "</center></html>", SwingConstants.CENTER);
        lbl.setFont(new Font("SansSerif", Font.BOLD, 14));
        lbl.setForeground(active ? Color.WHITE : textGray);
        lbl.setOpaque(true);
        lbl.setBackground(bgDark);
        if (active) {
            lbl.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 0, Color.WHITE));
        }
        return lbl;
    }
    
    private JButton createNavBtn(String txt) {
        JButton btn = new JButton(txt);
        btn.setPreferredSize(new Dimension(60, 40));
        btn.setFont(new Font("SansSerif", Font.BOLD, 18));
        btn.setBackground(bgBtn);
        btn.setForeground(Color.WHITE);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }
    
    private JButton createActionBtn(String txt) {
        JButton btn = new JButton(txt);
        btn.setFont(new Font("SansSerif", Font.BOLD, 14));
        btn.setBackground(bgLight);
        btn.setForeground(Color.WHITE);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }
}
