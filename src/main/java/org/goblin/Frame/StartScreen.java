package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

public class StartScreen extends JPanel {
    private Frame parentFrame;

    public StartScreen(Frame frame) {
        this.parentFrame = frame;
        this.setLayout(new GridBagLayout());
        this.setBackground(Theme.BOARD_DARK);

        GridBagConstraints gbc = new GridBagConstraints();
        gbc.insets = new Insets(10, 10, 20, 10);
        gbc.gridx = 0;
        gbc.gridy = 0;
        gbc.gridwidth = 2;

        JLabel title = new JLabel("CHESS");
        title.setFont(Theme.FONT_TITLE);
        title.setForeground(Theme.BOARD_LIGHT);
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
        btn.setFont(Theme.MAIN_FONT_BOLD);
        btn.setBackground(Theme.BOARD_LIGHT);
        btn.setForeground(Theme.BOARD_DARK);
        btn.setFocusPainted(false);
        btn.setPreferredSize(new Dimension(240, 50));
        btn.setBorder(BorderFactory.createLineBorder(Theme.BOARD_LIGHT.darker(), 2));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
        
        btn.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                btn.setBackground(Color.WHITE);
            }
            public void mouseExited(java.awt.event.MouseEvent evt) {
                btn.setBackground(Theme.BOARD_LIGHT);
            }
        });
        
        return btn;
    }
}
