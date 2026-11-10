# 📝Text Editor

![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-100%25-f7df1e?style=flat-square&logo=javascript&logoColor=black)
![Zero Dependencies](https://img.shields.io/badge/Dependencies-None-22c55e?style=flat-square)
![Responsive](https://img.shields.io/badge/Mobile-Responsive-3b82f6?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-15803d?style=flat-square)

**Rich Text Editor (Vanilla JS)** là bộ công cụ soạn thảo văn bản trực quan (WYSIWYG) nhẹ, mạnh mẽ và hoàn toàn độc lập, được xây dựng 100% bằng **HTML, CSS và JavaScript thuần** mà không phụ thuộc vào bất kỳ thư viện bên thứ ba nào (không cần jQuery, npm hay trình đóng gói phức tạp).

Thiết kế tối ưu để tích hợp nhanh vào mọi dự án Web thuần, PHP, **Laravel (Blade)**, **Bootstrap Modal** và các ứng dụng sử dụng Ajax/Fetch.

---

## ✨ Tính Năng Nổi Bật

- ⚡ **100% Vanilla JS & Siêu nhẹ**: Chỉ gồm 1 file `.css` và 1 file `.js`, tự động khởi tạo (`Auto-init`) ngay khi DOM sẵn sàng.
- 🔄 **Two-way Sync Tự Động (Property Interceptor Hook)**:
  - Khi người dùng gõ trong trình soạn thảo, dữ liệu tự động đồng bộ sang `<textarea>` gốc và kích hoạt sự kiện `input` / `change`.
  - Khi gán giá trị bằng JavaScript (`textarea.value = '...'`), khung soạn thảo trực quan **tự động cập nhật ngay lập tức** mà không cần gọi hàm API riêng.
- ✍️ **Định dạng văn bản toàn diện**:
  - Tiêu đề (`H1`, `H2`, `H3`), Đoạn văn (`P`), Trích dẫn (`Blockquote`), Khối mã (`Pre/Code`).
  - Cỡ chữ (`12px` – `30px`), In đậm, In nghiêng, Gạch chân, Gạch ngang, Chỉ số trên/dưới (`x²`, `x₂`), Xóa định dạng.
  - Bảng chọn **Màu chữ (Text Color)** và **Màu nền/Đánh dấu (Highlight Color)**.
  - Căn lề (Trái, Giữa, Phải, Đều 2 bên), Danh sách dấu chấm/đánh số, Tăng/Giảm thụt lề.
- 🖼️ **Quản lý Đa phương tiện thông minh**:
  - Tải ảnh từ thiết bị (chuyển đổi sang Base64 Data URI tự động), kéo thả file ảnh hoặc **dán ảnh trực tiếp từ Clipboard (`Ctrl + V`)**.
  - Di chuyển vị trí ảnh bằng thao tác kéo thả ngay trong bài viết mà không bị nhân bản ảnh.
  - **Thanh công cụ nổi (Floating Image Toolbar)**: Căn lề ảnh (Trôi trái, Căn giữa, Trôi phải), đổi kích thước (`25%`, `50%`, `75%`, `100%`), thêm chú thích (`<figure>` / `<figcaption>`) và xóa ảnh.
  - Nhúng video **YouTube** tự động chuẩn khung hình Responsive `16:9`.
- 📊 **Bảng biểu & Khối nội dung nâng cao**:
  - Tạo bảng dữ liệu tùy chọn số hàng/cột; thêm/xóa hàng, thêm/xóa cột, xóa bảng trực tiếp tại vị trí con trỏ.
  - Chèn khối thông báo (**Callout Box**: Success, Warning, Info, Danger), nhãn **Badges** và bảng **Emoji** nhanh.
- 🎙️ **Soạn thảo bằng Giọng nói Tiếng Việt**: Tích hợp Web Speech API giúp chuyển giọng nói thành văn bản theo thời gian thực.
- 🌙 **Chế độ Nâng cao & Xuất bản**:
  - Chuyển đổi chế độ **Dark Mode** (Giao diện tối), **Fullscreen** (Toàn màn hình), và xem/sửa **Mã nguồn HTML thô**.
  - Hộp thoại **Xem trước (Preview Modal)**, **Tìm kiếm & Thay thế**, **In ấn (`Ctrl + P`)**, xuất file **Microsoft Word (`.doc`)** và file **`.html`**.
  - Thanh trạng thái thống kê trực tiếp: **Số ký tự**, **Số từ**, và **Thời gian đọc ước tính**.

---

## 📂 Cấu Trúc Thư Mục

```text
text-editor-opensource/
├── rich-text-editor.css        # Toàn bộ giao diện, responsive & dark mode của Editor
├── rich-text-editor.js         # Nhân xử lý WYSIWYG, Two-way Sync & các tiện ích mở rộng
├── rich-text-editor-guide.html # Trang tài liệu hướng dẫn chi tiết kèm Live Demo trực quan
└── README.md                   # Tài liệu giới thiệu dự án trên GitHub
```

---

## 🚀 Cài Đặt Nhanh Trong 3 Bước

### Bước 1: Nhúng file CSS vào thẻ `<head>`

```html
<link rel="stylesheet" href="path/to/rich-text-editor.css">
```

### Bước 2: Nhúng file JS trước thẻ đóng `</body>`

```html
<script src="path/to/rich-text-editor.js"></script>
```

### Bước 3: Thêm class `rich-editor` vào thẻ `<textarea>`

```html
<textarea
    name="noi_dung"
    class="rich-editor"
    data-height="280px"
    placeholder="Nhập nội dung bài viết tại đây...">
</textarea>
```

> 💡 **Tự động khởi tạo**: Ngay khi trang tải xong (`DOMContentLoaded`), trình soạn thảo sẽ tự động quét mọi thẻ `<textarea class="rich-editor">` hoặc `<textarea data-rich-editor>` để dựng giao diện mà không cần viết thêm bất kỳ dòng JS nào.

---

## ⚙️ Các Thuộc Tính Cấu Hình (HTML Attributes)

| Thuộc tính | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `class="rich-editor"` | Class | `-` | Class kích hoạt tự động nhận diện và khởi tạo trình soạn thảo. |
| `data-rich-editor` | Attribute | `-` | Thuộc tính kích hoạt thay thế cho class `rich-editor`. |
| `data-height="300px"` | String | `260px` | Chiều cao tối thiểu của vùng soạn thảo (ví dụ: `200px`, `350px`). |
| `placeholder="..."` | String | `Nhập nội dung chi tiết tại đây...` | Văn bản gợi ý hiển thị mờ khi vùng soạn thảo đang trống. |
| `name="..."` | String | `-` | Tên trường dữ liệu gửi lên Server khi submit Form. |

---

## 🛠️ Bảng Hàm JavaScript (Programmatic API)

### Khởi tạo hoặc lấy Instance

```javascript
// Cách 1: Khởi tạo thủ công cho một textarea cụ thể
const editor = new RichTextEditor('#myTextarea', {
    height: '320px',
    placeholder: 'Nhập nội dung bài viết...'
});

// Cách 2: Lấy instance đã được tự động khởi tạo trước đó
const editor = RichTextEditor.getInstance('#myTextarea');
```

### Các phương thức hỗ trợ

| Phương thức | Tham số | Mô tả chức năng |
| :--- | :--- | :--- |
| `getContent()` | `-` | Trả về chuỗi mã HTML hiện tại trong khung soạn thảo. |
| `setContent(html)` | `html: string` | Gán nội dung HTML mới vào editor và đồng bộ sang `<textarea>`. |
| `insertHTML(html)` | `html: string` | Chèn một đoạn mã HTML hoặc văn bản ngay tại vị trí con trỏ. |
| `syncToTextarea()` | `-` | Ép đồng bộ dữ liệu hiện tại sang thẻ `<textarea>` gốc. |
| `toggleDarkMode()` | `-` | Bật / tắt giao diện chế độ tối (Dark Mode). |
| `toggleFullscreen()` | `-` | Bật / thoát chế độ toàn màn hình. |
| `toggleSourceView()` | `-` | Chuyển đổi qua lại giữa chế độ trực quan (WYSIWYG) và mã nguồn HTML. |
| `openPreview()` | `-` | Mở hộp thoại xem trước nội dung bài viết. |
| `exportWordDocument()` | `-` | Xuất và tải xuống nội dung dưới dạng file Microsoft Word (`.doc`). |

---

## 🔄 Cơ Chế Two-Way Sync Với Ajax & Bootstrap Modal

Nhờ kỹ thuật **Property Interceptor Hook** trên `HTMLTextAreaElement.prototype`, bạn có thể gán dữ liệu trực tiếp vào thuộc tính `.value` của `<textarea>` như một ô nhập liệu thông thường:

```javascript
// Ví dụ: Tải dữ liệu bài viết qua Fetch/Ajax và đổ vào Modal chỉnh sửa
fetch('/api/posts/1')
    .then(res => res.json())
    .then(post => {
        // Chỉ cần gán trực tiếp vào textarea.value
        document.getElementById('edit_post_noi_dung').value = post.noi_dung || '';

        // Khung soạn thảo trực quan sẽ TỰ ĐỘNG cập nhật ngay lập tức!
    });
```

---

## 🎨 Tùy Biến Màu Sắc Thương Hiệu (Theme Customization)

Bạn có thể dễ dàng thay đổi màu chủ đạo của trình soạn thảo bằng cách ghi đè biến CSS `:root`:

```css
:root {
    --rte-primary: #2563eb;       /* Màu chủ đạo mới (ví dụ: Xanh dương) */
    --rte-primary-hover: #1d4ed8; /* Màu khi di chuột */
    --rte-primary-light: #eff6ff; /* Màu nền phụ nhạt */
    --rte-border-focus: #2563eb;  /* Màu viền khi focus */
}
```

---

## 🧪 Xem Hướng Dẫn & Dùng Thử Trực Tiếp (Live Demo)

Mở trực tiếp file [`rich-text-editor-guide.html`](./rich-text-editor-guide.html) trên trình duyệt để xem toàn bộ tài liệu hướng dẫn chi tiết và trải nghiệm khung soạn thảo mẫu (Sandbox Playground).

---

## 📄 Giấy Phép (License)

Dự án được phát hành dưới giấy phép **MIT License** — bạn hoàn toàn tự do sử dụng, chỉnh sửa và tích hợp vào cả dự án cá nhân lẫn thương mại.

- **Tác giả**: [PMN (nhut-share-code)](https://github.com/nhut-share-code/)

