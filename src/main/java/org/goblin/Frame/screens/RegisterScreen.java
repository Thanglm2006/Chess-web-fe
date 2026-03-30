package org.goblin.Frame.screens;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

public class RegisterScreen extends JPanel {
    private MainFrame parentFrame;

    public RegisterScreen(MainFrame frame) {
        this.parentFrame = frame;
        this.setLayout(new GridBagLayout());
        this.setBackground(Theme.BG_DARK);

        JPanel formPanel = new JPanel();
        formPanel.setLayout(new GridBagLayout());
        formPanel.setBackground(Theme.BG_DARK);
        formPanel.setBorder(BorderFactory.createEmptyBorder(40, 50, 40, 50));
        
        GridBagConstraints gbc = new GridBagConstraints();
        gbc.gridwidth = GridBagConstraints.REMAINDER;
        gbc.fill = GridBagConstraints.NONE;
        gbc.anchor = GridBagConstraints.CENTER;
        
        // --- Logo / Title ---
        JLabel titleLabel = new JLabel("TẠO TÀI KHOẢN");
        titleLabel.setFont(Theme.FONT_TITLE);
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        // --- Input Fields ---
        JTextField emailField = createTextField("Nhập Email của bạn");
        JTextField userField = createTextField("Tên đăng nhập (Username)");
        JPasswordField passField = createPasswordField("Nhập mật khẩu");
        JPasswordField confirmPassField = createPasswordField("Nhập lại mật khẩu");
        
        // --- Register Button ---
        JButton registerBtn = new JButton("Đăng Ký");
        stylePrimaryButton(registerBtn);
        registerBtn.addActionListener(e -> {
            JOptionPane.showMessageDialog(this, "Bạn đã đăng ký thành công! Hãy đăng nhập.", "Web App Chess", JOptionPane.INFORMATION_MESSAGE);
            parentFrame.showLoginScreen();
        });
        
        // --- Back to Login Link ---
        JLabel loginLink = new JLabel("<html><u>Đã có tài khoản? Quay lại Đăng Nhập.</u></html>");
        loginLink.setFont(Theme.MAIN_FONT_REGULAR);
        loginLink.setForeground(Theme.GREEN_BTN);
        loginLink.setCursor(new Cursor(Cursor.HAND_CURSOR));
        loginLink.setAlignmentX(Component.CENTER_ALIGNMENT);
        loginLink.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                parentFrame.showLoginScreen();
            }
        });

        // Add to form
        gbc.insets = new Insets(0, 0, 25, 0);
        formPanel.add(titleLabel, gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(createFieldContainer("Email:", emailField), gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(createFieldContainer("Tên đăng nhập:", userField), gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(createFieldContainer("Mật khẩu:", passField), gbc);
        
        gbc.insets = new Insets(0, 0, 25, 0);
        formPanel.add(createFieldContainer("Nhập lại mật khẩu:", confirmPassField), gbc);
        
        gbc.insets = new Insets(0, 0, 20, 0);
        formPanel.add(registerBtn, gbc);
        
        gbc.insets = new Insets(0, 0, 0, 0);
        formPanel.add(loginLink, gbc);

        this.add(formPanel);
    }
    
    private JPanel createFieldContainer(String labelText, JComponent field) {
        JPanel panel = new JPanel();
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setOpaque(false);
        
        JLabel lbl = new JLabel(labelText);
        lbl.setFont(Theme.MAIN_FONT_BOLD);
        lbl.setForeground(Theme.TEXT_GRAY);
        lbl.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        field.setAlignmentX(Component.LEFT_ALIGNMENT);
        
        panel.add(lbl);
        panel.add(Box.createRigidArea(new Dimension(0, 5)));
        panel.add(field);
        
        return panel;
    }
    
    private JTextField createTextField(String placeholder) {
        JTextField field = new JTextField() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                if (getText().isEmpty()) {
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
        };
        field.setMaximumSize(new Dimension(320, 50));
        field.setPreferredSize(new Dimension(320, 50));
        field.setAlignmentX(Component.CENTER_ALIGNMENT);
        field.setFont(Theme.MAIN_FONT_REGULAR);
        field.setBackground(Theme.BG_LIGHT);
        field.setForeground(Theme.TEXT_NORMAL);
        field.setCaretColor(Color.WHITE);
        field.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(Theme.BORDER_COLOR, 1),
            BorderFactory.createEmptyBorder(10, 15, 10, 15)
        ));
        return field;
    }
    
    private JPasswordField createPasswordField(String placeholder) {
        JPasswordField field = new JPasswordField() {
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
        };
        field.setMaximumSize(new Dimension(320, 50));
        field.setPreferredSize(new Dimension(320, 50));
        field.setAlignmentX(Component.CENTER_ALIGNMENT);
        field.setFont(Theme.MAIN_FONT_REGULAR);
        field.setBackground(Theme.BG_LIGHT);
        field.setForeground(Theme.TEXT_NORMAL);
        field.setCaretColor(Color.WHITE);
        field.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(Theme.BORDER_COLOR, 1),
            BorderFactory.createEmptyBorder(10, 15, 10, 15)
        ));
        return field;
    }

    private void stylePrimaryButton(JButton btn) {
        btn.setMaximumSize(new Dimension(320, 50));
        btn.setPreferredSize(new Dimension(320, 50));
        btn.setAlignmentX(Component.CENTER_ALIGNMENT);
        btn.setFont(Theme.FONT_LARGE_BOLD);
        btn.setBackground(Theme.GREEN_BTN);
        btn.setForeground(Theme.TEXT_NORMAL);
        btn.setFocusPainted(false);
        btn.setBorderPainted(false);
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
}
