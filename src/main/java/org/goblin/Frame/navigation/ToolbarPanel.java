package org.goblin.Frame.navigation;

import org.goblin.Frame.board.ChessBoardPanel;
import org.goblin.Frame.screens.GameScreen;

import javax.swing.*;
import java.awt.*;

public class ToolbarPanel extends JPanel {
    private Color bgGray = new Color(38, 36, 33);
    
    public ToolbarPanel(ChessBoardPanel boardPanel) {
        setPreferredSize(new Dimension(640, 100)); // Increased height
        setBackground(bgGray);
        setLayout(new GridLayout(1, 4, 15, 0));
        this.setBorder(BorderFactory.createEmptyBorder(15, 10, 15, 10));
        
        JButton optBtn = createBtn("≡", "Tùy chọn");
        JButton chatBtn = createBtn("💬", "Chat");
        JButton backBtn = createBtn("◄", "Quay lại");
        JButton nextBtn = createBtn("►", "Tiếp");

        backBtn.addActionListener(e -> {
            boardPanel.game.board.undoMove();
            boardPanel.repaint();
            Container parent = getParent();
            while (parent != null && !(parent instanceof GameScreen)) {
                parent = parent.getParent();
            }
            if (parent instanceof GameScreen) {
                ((GameScreen) parent).updatePlayerPanels();
            }
        });
        
        add(optBtn);
        add(chatBtn);
        add(backBtn);
        add(nextBtn);
    }
    
    private JButton createBtn(String iconTxt, String labelTxt) {
        JButton btn = new JButton("<html><center><font size='7'>" + iconTxt + "</font><br><font size='5'>" + labelTxt + "</font></center></html>");
        btn.setFocusPainted(false);
        btn.setContentAreaFilled(false);
        btn.setBorderPainted(false);
        btn.setForeground(Color.LIGHT_GRAY);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setForeground(Color.WHITE);
            }
            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setForeground(Color.LIGHT_GRAY);
            }
        });
        return btn;
    }
}
