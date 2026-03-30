package org.goblin.Frame.components;

import org.goblin.Utils.Theme;
import javax.swing.*;
import java.awt.*;

public class CustomPasswordField extends JPasswordField {
    private String placeholder;

    public CustomPasswordField(String placeholder) {
        this.placeholder = placeholder;
        this.setMaximumSize(new Dimension(320, 50));
        this.setPreferredSize(new Dimension(320, 50));
        this.setAlignmentX(Component.CENTER_ALIGNMENT);
        this.setFont(Theme.MAIN_FONT_REGULAR);
        this.setBackground(Theme.BG_LIGHT);
        this.setForeground(Theme.TEXT_NORMAL);
        this.setCaretColor(Color.WHITE);
        this.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(Theme.BORDER_COLOR, 1),
            BorderFactory.createEmptyBorder(10, 15, 10, 15)
        ));
    }

    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        if (new String(getPassword()).isEmpty()) {
            Graphics2D g2 = (Graphics2D) g.create();
            g2.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2.setFont(getFont());
            g2.setColor(Theme.TEXT_GRAY);
            FontMetrics fm = g2.getFontMetrics();
            int y = (getHeight() - fm.getHeight()) / 2 + fm.getAscent();
            g2.drawString(placeholder, getInsets().left, y);
            g2.dispose();
        }
    }
}
