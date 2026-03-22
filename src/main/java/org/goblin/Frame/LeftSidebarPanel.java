package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;

public class LeftSidebarPanel extends JPanel {
    private Color bgGray = new Color(38, 36, 33);
    
    public LeftSidebarPanel() {
        setPreferredSize(new Dimension(220, 800));
        setBackground(bgGray);
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBorder(BorderFactory.createEmptyBorder(25, 20, 25, 20));
        
        // Logo
        JLabel logo = new JLabel("Chess.com");
        logo.setFont(new Font("SansSerif", Font.BOLD, 28));
        logo.setForeground(Color.WHITE);
        logo.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        add(logo);
        add(Box.createRigidArea(new Dimension(0, 40)));
        
        // Menu Items
        String[] menuItems = {"Chơi", "Câu đố", "Học", "Xem", "Cộng đồng"};
        for (String item : menuItems) {
            JLabel lbl = new JLabel("  " + item);
            lbl.setFont(new Font("SansSerif", Font.BOLD, 20));
            lbl.setForeground(new Color(200, 200, 200));
            lbl.setAlignmentX(Component.LEFT_ALIGNMENT);
            lbl.setCursor(new Cursor(Cursor.HAND_CURSOR));
            add(lbl);
            add(Box.createRigidArea(new Dimension(0, 30)));
        }
    }
}
