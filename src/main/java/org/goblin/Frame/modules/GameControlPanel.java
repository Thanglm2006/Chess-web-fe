package org.goblin.Frame.modules;


import javax.swing.*;
import java.awt.*;

import org.goblin.Frame.modules.chat.ChatPanel;
import org.goblin.Frame.screens.GameScreen;
import org.goblin.Frame.screens.MainFrame;
import org.goblin.Utils.Theme;

public class GameControlPanel extends JPanel {
    private MainFrame parentFrame;
    private GameScreen gameContainer;
    private JTextArea moveListArea;
    private JPanel centerCards;
    private CardLayout cardLayout;
    private JLabel tabMoves;
    private JLabel tabChat;
    private ChatPanel chatPanel;
    
    public GameControlPanel(MainFrame frame, GameScreen gameContainer) {
        this.parentFrame = frame;
        this.gameContainer = gameContainer;
        setPreferredSize(new Dimension(380, 740));
        setBackground(Theme.BG_DARK);
        setLayout(new BorderLayout());
        
        // 1. Top Tabs
        JPanel topTabs = new JPanel(new GridLayout(1, 4));
        topTabs.setPreferredSize(new Dimension(380, 60));
        topTabs.setBackground(Theme.BG_DARK);
        topTabs.add(createTab("⚡ Chơi", true));
        
        JLabel newGameTab = createTab("+ Ván mới", false);
        newGameTab.setCursor(new Cursor(Cursor.HAND_CURSOR));
        newGameTab.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                int confirm = JOptionPane.showConfirmDialog(parentFrame, 
                    "Bạn có muốn thoát ván cờ hiện tại để quay lại sảnh chọn ván mới?", 
                    "Tạo Ván Mới", JOptionPane.YES_NO_OPTION);
                if (confirm == JOptionPane.YES_OPTION) {
                    if (parentFrame != null) {
                        parentFrame.initStartScreen();
                    }
                }
            }
        });
        topTabs.add(newGameTab);
        topTabs.add(createTab("Các ván đấu", false));
        topTabs.add(createTab("Các kỳ thủ", false));
        
        // 2. Sub Tabs
        JPanel subTabs = new JPanel(new GridLayout(1, 2));
        subTabs.setPreferredSize(new Dimension(380, 40));
        subTabs.setBackground(Theme.BG_DARK);
        
        tabMoves = createSubTab("Các nước đi", true);
        tabChat = createSubTab("Trò chuyện", false);
        
        subTabs.add(tabMoves);
        subTabs.add(tabChat);
        
        JPanel topWrapper = new JPanel(new BorderLayout());
        topWrapper.add(topTabs, BorderLayout.NORTH);
        topWrapper.add(subTabs, BorderLayout.SOUTH);
        this.add(topWrapper, BorderLayout.NORTH);
        
        // 3. Center Area (CardLayout chứa Move History & Chat)
        cardLayout = new CardLayout();
        centerCards = new JPanel(cardLayout);
        
        // 3a. Move List Component
        moveListArea = new JTextArea();
        moveListArea.setEditable(false);
        moveListArea.setFont(Theme.MAIN_FONT_REGULAR);
        moveListArea.setBackground(Theme.BG_LIGHT);
        moveListArea.setForeground(Theme.TEXT_NORMAL);
        moveListArea.setMargin(new Insets(10, 15, 10, 15));
        
        JScrollPane moveScroll = new JScrollPane(moveListArea);
        moveScroll.setBorder(BorderFactory.createEmptyBorder());
        moveScroll.getViewport().setBackground(Theme.BG_LIGHT);
        moveScroll.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0));
        
        // 3b. Chat Component (Modular Class)
        chatPanel = new ChatPanel();
        
        centerCards.add(moveScroll, "MOVES");
        centerCards.add(chatPanel, "CHAT");
        
        this.add(centerCards, BorderLayout.CENTER);
        
        // Sub Tabs Logic (Switch Cards)
        tabMoves.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                switchTab(true);
            }
        });
        
        tabChat.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                switchTab(false);
            }
        });
        
        // 4. Controls (Bottom)
        JPanel bottomArea = new JPanel();
        bottomArea.setLayout(new BoxLayout(bottomArea, BoxLayout.Y_AXIS));
        bottomArea.setBackground(Theme.BG_DARK);
        
        // 4a. Navigation Buttons
        JPanel navRow = new JPanel(new FlowLayout(FlowLayout.CENTER, 5, 10));
        navRow.setBackground(Theme.BG_LIGHT);
        navRow.setBorder(BorderFactory.createMatteBorder(1, 0, 1, 0, Theme.BORDER_COLOR));
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
        actionRow.setBackground(Theme.BG_LIGHT);
        JButton btnAbort = createActionBtn("❌ Hủy ván");
        JButton btnDraw = createActionBtn("½ Hòa cờ");
        JButton btnResign = createActionBtn("🏳 Xin thua");
        
        btnAbort.addActionListener(e -> {
            int confirm = JOptionPane.showConfirmDialog(parentFrame, 
                "Bạn có chắc chắn muốn hủy ván cờ này? (Sẽ không tính điểm xếp hạng nếu mới bắt đầu)", 
                "Hủy ván đấu", JOptionPane.YES_NO_OPTION);
            if (confirm == JOptionPane.YES_OPTION) {
                if (parentFrame != null) {
                    parentFrame.initStartScreen();
                }
            }
        });
        
        btnDraw.addActionListener(e -> {
            int confirm = JOptionPane.showConfirmDialog(parentFrame, 
                "Bạn có muốn đề nghị hòa cờ với đối thủ?", 
                "Đề nghị Cầu Hòa", JOptionPane.YES_NO_OPTION);
            if (confirm == JOptionPane.YES_OPTION) {
                JOptionPane.showMessageDialog(parentFrame, 
                    "Đối thủ đã chấp nhận lời đề nghị hòa cờ của bạn. Ván đấu kết thúc với kết quả Hòa (1/2 - 1/2).", 
                    "Hòa cờ", JOptionPane.INFORMATION_MESSAGE);
                if (parentFrame != null) {
                    parentFrame.initStartScreen();
                }
            }
        });
        
        btnResign.addActionListener(e -> {
            int confirm = JOptionPane.showConfirmDialog(parentFrame, 
                "Bạn có chấp nhận đầu hàng và nhận phần thua?", 
                "Xin thua", JOptionPane.YES_NO_OPTION);
            if (confirm == JOptionPane.YES_OPTION) {
                JOptionPane.showMessageDialog(parentFrame, 
                    "Bạn đã chịu thua. Trắng thắng (1-0) / Đen thắng (0-1).", 
                    "Ván cờ kết thúc", JOptionPane.INFORMATION_MESSAGE);
                if (parentFrame != null) {
                    parentFrame.initStartScreen();
                }
            }
        });
        
        actionRow.add(btnAbort);
        actionRow.add(btnDraw);
        actionRow.add(btnResign);
        
        // 4c. Player Info Text
        JPanel infoRow = new JPanel(new FlowLayout(FlowLayout.LEFT, 15, 10));
        infoRow.setBackground(Theme.BG_DARK);
        JLabel infoText = new JLabel("<html><font color='white'><b>VÁN CỜ MỚI</b></font><br><font color='#999999'>Đối thủ (1488) gặp Bạn (1470) (5 phút)</font></html>");
        infoText.setFont(new Font("SansSerif", Font.PLAIN, 12));
        infoRow.add(infoText);
        
        // Chat input removed from here, it's now inside ChatPanel
        
        bottomArea.add(navRow);
        bottomArea.add(actionRow);
        bottomArea.add(infoRow);
        
        this.add(bottomArea, BorderLayout.SOUTH);
        updateMoveList();
    }
    
    private void switchTab(boolean isMoves) {
        if (isMoves) {
            cardLayout.show(centerCards, "MOVES");
            tabMoves.setForeground(Theme.TEXT_NORMAL);
            tabMoves.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 0, Theme.TEXT_NORMAL));
            tabChat.setForeground(Theme.TEXT_GRAY);
            tabChat.setBorder(null);
        } else {
            cardLayout.show(centerCards, "CHAT");
            tabChat.setForeground(Theme.TEXT_NORMAL);
            tabChat.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 0, Theme.TEXT_NORMAL));
            tabMoves.setForeground(Theme.TEXT_GRAY);
            tabMoves.setBorder(null);
        }
    }
    
    public void updateMoveList() {
        if (moveListArea == null || gameContainer == null || gameContainer.getGame() == null) return;
        StringBuilder sb = new StringBuilder();
        int halfMoveCount = 1;
        
        for (org.goblin.Board.Move m : gameContainer.getGame().board.lastMoves) {
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
        lbl.setForeground(active ? Theme.TEXT_NORMAL : Theme.TEXT_GRAY);
        lbl.setOpaque(true);
        lbl.setBackground(Theme.BG_DARK);
        return lbl;
    }
    
    private JLabel createSubTab(String text, boolean active) {
        JLabel lbl = new JLabel("<html><center>" + text + "</center></html>", SwingConstants.CENTER);
        lbl.setFont(new Font("SansSerif", Font.BOLD, 14));
        lbl.setForeground(active ? Theme.TEXT_NORMAL : Theme.TEXT_GRAY);
        lbl.setOpaque(true);
        lbl.setBackground(Theme.BG_DARK);
        if (active) {
            lbl.setBorder(BorderFactory.createMatteBorder(0, 0, 2, 0, Theme.TEXT_NORMAL));
        }
        return lbl;
    }
    
    private JButton createNavBtn(String txt) {
        JButton btn = new JButton(txt);
        btn.setPreferredSize(new Dimension(60, 40));
        btn.setFont(new Font("SansSerif", Font.BOLD, 18));
        btn.setBackground(Theme.BTN_BG_GRAY);
        btn.setForeground(Theme.TEXT_NORMAL);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }
    
    private JButton createActionBtn(String txt) {
        JButton btn = new JButton(txt);
        btn.setFont(new Font("SansSerif", Font.BOLD, 14));
        btn.setBackground(Theme.BG_LIGHT);
        btn.setForeground(Theme.TEXT_NORMAL);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        return btn;
    }
}
