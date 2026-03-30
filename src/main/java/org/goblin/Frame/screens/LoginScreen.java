package org.goblin.Frame.screens;

import javax.swing.*;
import java.awt.*;
import org.goblin.Utils.Theme;

public class LoginScreen extends JPanel {
    private MainFrame parentFrame;

    public LoginScreen(MainFrame frame) {
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
        JLabel titleLabel = new JLabel("ĐĂNG NHẬP CHESS");
        titleLabel.setFont(Theme.FONT_TITLE);
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        // --- Input Fields ---
        JTextField userField = createTextField("Tên đăng nhập hoặc Email");
        JPasswordField passField = createPasswordField("Mật khẩu");
        
        // --- Login Button ---
        JButton loginBtn = new JButton("Đăng Nhập");
        stylePrimaryButton(loginBtn);
        loginBtn.addActionListener(e -> {
            // TODO: Kết nối API Backend tại đây. Dưới đây là luồng giả lập thành công.
            parentFrame.loginSuccess();
        });
        
        // --- Google OAuth Button ---
        JButton googleBtn = new JButton("G | Đăng nhập bằng Google");
        styleGoogleButton(googleBtn);
        googleBtn.addActionListener(e -> {
            // TODO: Tạo Component mở Default System Browser chui vào link Oauth2.
            JOptionPane.showMessageDialog(this, "[Hệ thống]: Chờ API Backend mở trình duyệt lấy Token OAuth2...", "Tính năng Google Login", JOptionPane.INFORMATION_MESSAGE);
            parentFrame.loginSuccess(); // Tạm thời Bypass để test.
        });
        
        // --- Register Link ---
        JLabel registerLink = new JLabel("<html><u>Chưa có tài khoản? Đăng ký ngay.</u></html>");
        registerLink.setFont(Theme.MAIN_FONT_REGULAR);
        registerLink.setForeground(Theme.GREEN_BTN);
        registerLink.setCursor(new Cursor(Cursor.HAND_CURSOR));
        registerLink.setAlignmentX(Component.CENTER_ALIGNMENT);
        registerLink.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseClicked(java.awt.event.MouseEvent evt) {
                parentFrame.showRegisterScreen();
            }
        });

        // Add to form
        gbc.insets = new Insets(0, 0, 30, 0);
        formPanel.add(titleLabel, gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(userField, gbc);
        
        gbc.insets = new Insets(0, 0, 25, 0);
        formPanel.add(passField, gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(loginBtn, gbc);
        
        gbc.insets = new Insets(0, 0, 30, 0);
        formPanel.add(googleBtn, gbc);
        
        gbc.insets = new Insets(0, 0, 0, 0);
        formPanel.add(registerLink, gbc);

        this.add(formPanel);
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
    
    private void styleGoogleButton(JButton btn) {
        btn.setMaximumSize(new Dimension(320, 50));
        btn.setPreferredSize(new Dimension(320, 50));
        btn.setAlignmentX(Component.CENTER_ALIGNMENT);
        btn.setFont(Theme.MAIN_FONT_BOLD);
        btn.setBackground(Color.WHITE);
        btn.setForeground(new Color(68, 68, 68)); // Xám đậm Google
        btn.setFocusPainted(false);
        btn.setBorder(BorderFactory.createLineBorder(new Color(218, 220, 224), 2));
        btn.setCursor(new Cursor(Cursor.HAND_CURSOR));
    }
}
