package org.goblin.Frame.screens;

import javax.swing.*;
import java.awt.*;

import org.goblin.Frame.components.CustomPasswordField;
import org.goblin.Frame.components.CustomTextField;
import org.goblin.Frame.components.FieldContainer;
import org.goblin.Frame.components.PrimaryButton;
import org.goblin.Utils.Theme;

public class RegisterScreen extends JPanel {
    private MainFrame parentFrame;

    public RegisterScreen(MainFrame frame) {
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
        JLabel titleLabel = new JLabel("TẠO TÀI KHOẢN");
        titleLabel.setFont(Theme.FONT_TITLE);
        titleLabel.setForeground(Color.WHITE);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        
        // --- Input Fields ---
        CustomTextField emailField = new CustomTextField("Nhập Email của bạn");
        CustomTextField userField = new CustomTextField("Tên đăng nhập (Username)");
        CustomPasswordField passField = new CustomPasswordField("Nhập mật khẩu");
        CustomPasswordField confirmPassField = new CustomPasswordField("Nhập lại mật khẩu");
        
        // --- Register Button ---
        PrimaryButton registerBtn = new PrimaryButton("Đăng Ký");
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
        formPanel.add(new FieldContainer("Email:", emailField), gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(new FieldContainer("Tên đăng nhập:", userField), gbc);
        
        gbc.insets = new Insets(0, 0, 15, 0);
        formPanel.add(new FieldContainer("Mật khẩu:", passField), gbc);
        
        gbc.insets = new Insets(0, 0, 25, 0);
        formPanel.add(new FieldContainer("Nhập lại mật khẩu:", confirmPassField), gbc);
        
        gbc.insets = new Insets(0, 0, 20, 0);
        formPanel.add(registerBtn, gbc);
        
        gbc.insets = new Insets(0, 0, 0, 0);
        formPanel.add(loginLink, gbc);

        this.add(formPanel);
    }
}
