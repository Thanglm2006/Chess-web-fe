package org.goblin.Frame.screens;

import javax.swing.*;
import java.awt.*;

import org.goblin.Frame.components.CustomPasswordField;
import org.goblin.Frame.components.CustomTextField;
import org.goblin.Frame.components.GoogleAuthButton;
import org.goblin.Frame.components.PrimaryButton;
import org.goblin.Utils.Theme;

public class LoginScreen extends JPanel {
    private MainFrame parentFrame;

    public LoginScreen(MainFrame frame) {
        this.parentFrame = frame;
        this.setLayout(new GridBagLayout());
        this.setBackground(Theme.BG_DARK);
        this.setPreferredSize(new java.awt.Dimension(1100, 780));

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
        CustomTextField userField = new CustomTextField("Tên đăng nhập hoặc Email");
        CustomPasswordField passField = new CustomPasswordField("Mật khẩu");
        
        // --- Login Button ---
        PrimaryButton loginBtn = new PrimaryButton("Đăng Nhập");
        loginBtn.addActionListener(e -> {
            // TODO: Kết nối API Backend tại đây. Dưới đây là luồng giả lập thành công.
            parentFrame.loginSuccess();
        });
        
        // --- Google OAuth Button ---
        GoogleAuthButton googleBtn = new GoogleAuthButton("G | Đăng nhập bằng Google");
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
}
