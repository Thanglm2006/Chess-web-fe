# Cấu trúc và Chức năng Dự án Chess Web

## 1. Cấu trúc Thư mục (Project Structure)
Dự án được xây dựng bằng React + Vite, sử dụng Tailwind CSS cho giao diện và kiến trúc hiện đại.

- `src/`: Thư mục mã nguồn chính.
    - `assets/`: Chứa các tệp tĩnh như hình ảnh, biểu tượng SVG cho quân cờ và giao diện.
    - `components/`: Các thành phần giao diện tái sử dụng.
        - `Sidebar.jsx`: Thanh điều hướng bên trái đồng nhất giữa các trang.
    - `pages/`: Các trang chức năng chính của ứng dụng.
        - `Login.jsx`: Trang đăng nhập với hỗ trợ Google Login.
        - `Register.jsx`: Trang đăng ký tài khoản mới và xác thực OTP.
        - `MainMenu.jsx`: Trang chủ sau khi đăng nhập, nơi lựa chọn chế độ chơi.
        - `AIPlay.jsx`: Chế độ chơi cờ vua với máy (Stockfish/AI).
        - `OnlinePlay.jsx`: Chế độ chơi trực tuyến PvP, tích hợp chat và thách đấu.
        - `Profile.jsx`: Hiển thị thông tin cá nhân, cấp độ (Elo) và lịch sử đấu.
        - `Friends.jsx`: Quản lý bạn bè, tìm kiếm và xem trạng thái trực tuyến.
    - `services/`: Lớp xử lý dữ liệu và kết nối.
        - `api.js`: Cấu hình Axios instance, tự động xử lý thêm Token vào Header và Refresh Token khi hết hạn.
        - `AuthService.js`: Xử lý đăng nhập, đăng ký, OTP và giải mã JWT.
        - `FriendService.js`: Các API liên quan đến bạn bè.
        - `GameService.js`: Lấy dữ liệu ván đấu và lịch sử.
        - `UserService.js`: Lấy thông tin người dùng hiện tại và thống kê.
        - `SocketService.js`: Quản lý kết nối WebSocket (Stomp/WS) để cập nhật trạng thái thời gian thực.
- `index.css`: File cấu hình CSS chính, chứa các biến màu sắc (Glassmorphism design) và animation.
- `tailwind.config.js`: Cấu hình mở rộng cho Tailwind CSS.

## 2. Các Tiến trình Hoạt động (Processes)

### Xác thực & Bảo mật (Authentication Flow)
1. **Đăng nhập**: Người dùng gửi thông tin -> Backend trả về `accessToken` (trong body) và `refreshToken` (trong HttpOnly Cookie).
2. **Lưu trữ**: `accessToken` được lưu vào `localStorage`.
3. **Interceptor**: Mỗi request gửi đi sẽ được `api.js` tự động đính kèm `Authorization: Bearer <token>`.
4. **Auto Refresh**: Nếu API trả về lỗi 401, hệ thống tự động gọi `/api/auth/refresh` để lấy token mới và thực hiện lại request ban đầu mà người dùng không nhận ra.

### Kết nối Thời gian thực (Real-time Presence)
- Khi ứng dụng khởi chạy (trong `App.jsx`), `GlobalSocket` sẽ kích hoạt kết nối WebSocket nếu có token.
- Hệ thống lắng nghe các sự kiện: `USER_ONLINE`, `USER_OFFLINE`, `FRIEND_REQUEST`, `GAME_INVITE`.
- Trong trang `Friends`, danh sách sẽ tự động cập nhật màu sắc trạng thái dựa trên tin nhắn từ Socket.

### Luồng Chơi Game (Game Workflow)
- **Online**: Người dùng tìm trận hoặc thách đấu -> Server tạo Game ID -> Hai người dùng chuyển vào `OnlinePlay` -> Gửi nước đi qua WebSocket.
- **AI**: Logic cờ vua được xử lý trực tiếp trên trình duyệt hoặc qua Worker để đảm bảo mượt mà.

## 3. Chức năng chính (Features)
- **Hệ thống Tài khoản**: Bảo mật với JWT, xác thực qua email, hỗ trợ OAuth2 (Google).
- **Giao diện Hiện đại**: Sử dụng phong cách Glassmorphism (hiệu ứng kính mờ), hỗ trợ Responsive cho nhiều kích thước màn hình.
- **Chơi Cờ Chuyên nghiệp**: Tích hợp bàn cờ tương tác, hiển thị nước đi cuối, gợi ý nước đi và lịch sử biên bản (PGN).
- **Mạng xã hội**: Kết bạn, xem ai đang online, thách đấu trực tiếp từ danh sách bạn bè.
- **Thống kê**: Theo dõi tiến trình qua biểu đồ hoặc chỉ số Elo (Blitz, Bullet, Rapid).
