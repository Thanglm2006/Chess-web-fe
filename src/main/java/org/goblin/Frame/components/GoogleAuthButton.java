package org.goblin.Frame.components;

import org.goblin.Utils.Theme;
import javax.swing.*;
import java.awt.*;

public class GoogleAuthButton extends JButton {
    public GoogleAuthButton(String text) {
        super(text);
        this.setMaximumSize(new Dimension(320, 50));
        this.setPreferredSize(new Dimension(320, 50));
        this.setAlignmentX(Component.CENTER_ALIGNMENT);
        this.setFont(Theme.MAIN_FONT_BOLD);
        this.setBackground(Color.WHITE);
        this.setForeground(new Color(68, 68, 68)); // Xám đậm Google
        this.setFocusPainted(false);
        this.setBorder(BorderFactory.createLineBorder(new Color(218, 220, 224), 2));
        this.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
}
