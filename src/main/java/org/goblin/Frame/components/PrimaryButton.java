package org.goblin.Frame.components;

import org.goblin.Utils.Theme;
import javax.swing.*;
import java.awt.*;

public class PrimaryButton extends JButton {
    public PrimaryButton(String text) {
        super(text);
        this.setMaximumSize(new Dimension(320, 50));
        this.setPreferredSize(new Dimension(320, 50));
        this.setAlignmentX(Component.CENTER_ALIGNMENT);
        this.setFont(Theme.FONT_LARGE_BOLD);
        this.setBackground(Theme.GREEN_BTN);
        this.setForeground(Theme.TEXT_NORMAL);
        this.setFocusPainted(false);
        this.setBorderPainted(false);
        this.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
}
