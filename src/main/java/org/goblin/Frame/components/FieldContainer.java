package org.goblin.Frame.components;

import org.goblin.Utils.Theme;
import javax.swing.*;
import java.awt.*;

public class FieldContainer extends JPanel {
    public FieldContainer(String labelText, JComponent field) {
        this.setLayout(new BoxLayout(this, BoxLayout.Y_AXIS));
        this.setOpaque(false);
        
        JLabel lbl = new JLabel(labelText);
        lbl.setFont(Theme.MAIN_FONT_BOLD);
        lbl.setForeground(Theme.TEXT_GRAY);
        lbl.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        field.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        this.add(lbl);
        this.add(Box.createRigidArea(new Dimension(0, 5)));
        this.add(field);
    }
}
