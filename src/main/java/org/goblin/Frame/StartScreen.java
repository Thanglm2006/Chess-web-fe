package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;

public class StartScreen extends JPanel {
    private Frame parentFrame;
    private Color darkGreen = new Color(118, 150, 86);
    private Color lightCream = new Color(238, 238, 210);

    public StartScreen(Frame frame) {
        this.parentFrame = frame;
        this.setLayout(new GridBagLayout());
        this.setBackground(darkGreen);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 20, 10);
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;

        JLabel title = new JLabel("CHESS");
        title.setFont(new Font("Arial", Font.BOLD, 60));
        title.setForeground(lightCream);
        this.add(title, gbc);

        gbc.gridwidth = 1;
        gbc.gridy++;
        String[] options = {"1 Phút (Siêu chớp)", "3 Phút (Chớp)", "5 Phút (Nhanh)", "10 Phút", "30 Phút", "Không giới hạn"};
        int[] times = {60, 180, 300, 600, 1800, 0};

        gbc.insets = new Insets(10, 10, 10, 10);
        for (int i = 0; i < options.length; i++) {
            if (i % 2 == 0) {
                gbc.gridx = 0;
                if (i > 0) gbc.gridy++;
            } else {
                gbc.gridx = 1;
            }
            JButton btn = createStyledButton(options[i]);
            int timeInSeconds = times[i];
            btn.addActionListener(e -> {
                parentFrame.startGame(timeInSeconds);
            });
            this.add(btn, gbc);
        }
    }

    private JButton createStyledButton(String text) {
        JButton btn = new JButton(text);
        btn.setFont(new Font("SansSerif", Font.BOLD, 18));
        btn.setBackground(lightCream);
        btn.setForeground(darkGreen);
        btn.setFocusPainted(false);
        btn.setPreferredSize(new Dimension(240, 50));
        btn.setBorder(BorderFactory.createLineBorder(lightCream.darker(), 2));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setBackground(Color.WHITE);
            }
            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setBackground(lightCream);
            }
        });
        
        return btn;
    }
}
