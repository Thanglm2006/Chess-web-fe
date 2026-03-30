package org.goblin.Frame;

import javax.swing.*;
import java.awt.*;
import java.awt.event.FocusAdapter;
import java.awt.event.FocusEvent;
import java.awt.event.KeyAdapter;
import java.awt.event.KeyEvent;
import org.goblin.Utils.Theme;

public class ChatPanel extends JPanel {
    private JTextArea chatArea;
    private JTextField chatInput;
    private final String PLACEHOLDER = " Gửi tin nhắn...";

    public ChatPanel() {
        this.setLayout(new BorderLayout());
        this.setBackground(Theme.BG_DARK);

        // 1. Vùng hiển thị tin nhắn (Chat History)
        chatArea = new JTextArea();
        chatArea.setEditable(false);
        chatArea.setLineWrap(true);
        chatArea.setWrapStyleWord(true);
        chatArea.setFont(Theme.MAIN_FONT_REGULAR);
        chatArea.setBackground(Theme.BG_LIGHT);
        chatArea.setForeground(Theme.TEXT_NORMAL);
        chatArea.setMargin(new Insets(10, 15, 10, 15));

        JScrollPane scrollPane = new JScrollPane(chatArea);
        scrollPane.setBorder(BorderFactory.createEmptyBorder());
        scrollPane.getViewport().setBackground(Theme.BG_LIGHT);
        scrollPane.getVerticalScrollBar().setPreferredSize(new Dimension(8, 0)); // Giấu bớt scrollbar cho mượt

        // Tin nhắn hệ thống ban đầu
        chatArea.setText("[Hệ thống]: Chào mừng bạn đến với phòng chat. Nhập tin nhắn để giao tiếp!\n");

        // 2. Vùng nhập tin nhắn (Chat Input)
        JPanel inputWrapper = new JPanel(new BorderLayout());
        inputWrapper.setPreferredSize(new Dimension(380, 40));
        inputWrapper.setBackground(Theme.BG_DARK);

        chatInput = new JTextField(PLACEHOLDER);
        chatInput.setBackground(Theme.BG_DARK);
        chatInput.setForeground(Theme.TEXT_GRAY);
        chatInput.setBorder(BorderFactory.createMatteBorder(1, 0, 0, 0, Theme.BORDER_COLOR));
        chatInput.setFont(new Font("SansSerif", Font.PLAIN, 14));

        // Logic ẩn/hiện placeholder
        chatInput.addFocusListener(new FocusAdapter() {
            @Override
            public void focusGained(FocusEvent e) {
                if (chatInput.getText().equals(PLACEHOLDER)) {
                    chatInput.setText("");
                    chatInput.setForeground(Theme.TEXT_NORMAL);
                }
            }

            @Override
            public void focusLost(FocusEvent e) {
                if (chatInput.getText().trim().isEmpty()) {
                    chatInput.setText(PLACEHOLDER);
                    chatInput.setForeground(Theme.TEXT_GRAY);
                }
            }
        });

        // Logic nhấn Enter để gửi tin nhắn
        chatInput.addKeyListener(new KeyAdapter() {
            @Override
            public void keyPressed(KeyEvent e) {
                if (e.getKeyCode() == KeyEvent.VK_ENTER) {
                    sendMessage();
                }
            }
        });

        inputWrapper.add(chatInput, BorderLayout.CENTER);

        // Gắn vào ChatPanel
        this.add(scrollPane, BorderLayout.CENTER);
        this.add(inputWrapper, BorderLayout.SOUTH);
    }

    private void sendMessage() {
        String msg = chatInput.getText().trim();
        if (!msg.isEmpty() && !msg.equals(PLACEHOLDER)) {
            // Hiển thị tạm thời bằng chữ "Bạn"
            chatArea.append("[Bạn]: " + msg + "\n");
            
            // Xóa input sau khi gửi
            chatInput.setText("");
            
            // Cuộn khung chat xuống cuối cùng
            chatArea.setCaretPosition(chatArea.getDocument().getLength());
            
            // Ở đây sau này có thể gọi thêm Game API để bắn thông điệp lên Server
        }
    }
}
