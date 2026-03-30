package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

public class LeftSidebarPanel extends JPanel {
    
    public LeftSidebarPanel() {
        setPreferredSize(new Dimension(220, 800));
        setBackground(Theme.BG_DARK);
        setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        setBorder(BorderFactory.createEmptyBorder(25, 20, 25, 20));
        
        // Logo
        JLabel logo = new JLabel("Chess.com");
        logo.setFont(Theme.FONT_LARGE_BOLD);
        logo.setForeground(Theme.TEXT_NORMAL);
        logo.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        add(logo);
        add(Box.createRigidArea(new Dimension(0, 40)));
        
        // Menu Items
        String[] menuItems = {"Chơi", "Câu đố", "Học", "Xem", "Cộng đồng"};
        for (String item : menuItems) {
            JLabel lbl = new JLabel("  " + item);
            lbl.setFont(Theme.MAIN_FONT_BOLD);
            lbl.setForeground(Theme.TEXT_LIGHT_GRAY);
            lbl.setAlignmentX(Component.LEFT_ALIGNMENT);
            lbl.setCursor(new Cursor(Cursor.HAND_CURSOR));
            add(lbl);
            add(Box.createRigidArea(new Dimension(0, 30)));
        }
    }
}
