package org.goblin.Frame.navigation;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

import org.goblin.Frame.screens.MainFrame;

public class MainMenuPanel extends JPanel {
    
    private MainFrame parentFrame;

    public MainMenuPanel(MainFrame frame) {
        this.parentFrame = frame;
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
        
        // Push the rest of the items to the bottom
        add(Box.createVerticalGlue());
        
        // --- Profile Button ---
        JLabel profileLbl = new JLabel("  👤 Hồ sơ (Profile)");
        profileLbl.setFont(Theme.MAIN_FONT_BOLD);
        profileLbl.setForeground(Theme.TEXT_LIGHT_GRAY);
        profileLbl.setAlignmentX(Component.LEFT_ALIGNMENT);
        profileLbl.setCursor(new Cursor(Cursor.HAND_CURSOR));
        profileLbl.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                JOptionPane.showMessageDialog(MainMenuPanel.this, "Tính năng xem Hồ Sơ (Profile) sẽ được cập nhật sau!", "Profile", JOptionPane.INFORMATION_MESSAGE);
            }
        });
        add(profileLbl);
        add(Box.createRigidArea(new Dimension(0, 30)));
        
        // --- Logout Button ---
        JLabel logoutLbl = new JLabel("  🚪 Đăng xuất");
        logoutLbl.setFont(Theme.MAIN_FONT_BOLD);
        logoutLbl.setForeground(new Color(255, 100, 100)); // Red for emphasis
        logoutLbl.setAlignmentX(Component.LEFT_ALIGNMENT);
        logoutLbl.setCursor(new Cursor(Cursor.HAND_CURSOR));
        logoutLbl.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                int confirm = JOptionPane.showConfirmDialog(MainMenuPanel.this, "Bạn có chắc chắn muốn đăng xuất?", "Đăng xuất", JOptionPane.YES_NO_OPTION);
                if (confirm == JOptionPane.YES_OPTION) {
                    if(parentFrame != null) {
                        parentFrame.showLoginScreen();
                    }
                }
            }
        });
        add(logoutLbl);
        add(Box.createRigidArea(new Dimension(0, 10))); // small bottom padding
    }
}
