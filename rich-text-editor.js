/**
 * ==========================================================================
 * RICH TEXT EDITOR - VANILLA JS (ENTERPRISE EDITION V2)
 * Dùng chung cho toàn bộ dự án Laravel (Vĩnh Long Odyssey)
 *
 * Tính năng mở rộng:
 * - Menubar cấp cao: Tệp, Chỉnh sửa, Hiển thị, Chèn, Định dạng, Bảng
 * - Dropdown chọn Tiêu đề (Paragraph, H1, H2, H3, Trích dẫn, Khối mã)
 * - Dropdown chọn Cỡ chữ (12px - 32px)
 * - Định dạng: Bold, Italic, Underline, Strike, Indent, Outdent, Remove Format
 * - Màu chữ (Palette 🎨) & Màu nền (Paint Bucket 🪣)
 * - Đa phương tiện: Tải ảnh từ máy, Kéo thả/Paste ảnh, Nhúng Video YouTube (16:9)
 * - Tiện ích du lịch: Hộp lưu ý / Callout Box (Xanh, Vàng, Xanh dương, Đỏ)
 * - Bảng chọn Emoji & Ký hiệu nhanh (🌴, 🛶, 📍, 🍜, ⭐, ₫,...)
 * - Quản lý Bảng nâng cao (Thêm/xóa hàng, thêm/xóa cột, xóa bảng)
 * - Xuất bản: Xem trước (Preview), Xuất file Word (.doc), Xuất HTML, In ấn
 * - Thống kê: Số ký tự, số từ, thời gian đọc ước tính (~X phút)
 * - Two-way Sync 100% với <textarea> & tương thích Bootstrap Modal
 * ==========================================================================
 */

class RichTextEditor {
    constructor(textareaElement, options = {}) {
        if (!textareaElement) return;

        this.textarea =
            typeof textareaElement === "string"
                ? document.querySelector(textareaElement)
                : textareaElement;

        if (!this.textarea || this.textarea.dataset.rteInitialized) {
            return this.textarea ? this.textarea._rte : null;
        }

        const customHeight =
            this.textarea.dataset.height ||
            (this.textarea.style.height && this.textarea.style.height !== "auto"
                ? this.textarea.style.height
                : null) ||
            options.height ||
            "260px";

        this.options = Object.assign(
            {
                placeholder:
                    this.textarea.getAttribute("placeholder") ||
                    "Nhập nội dung chi tiết tại đây...",
                height: customHeight,
            },
            options,
        );

        this.savedSelection = null;
        this.isSourceView = false;
        this.isFullscreen = false;

        this.init();
    }

    /**
     * Khởi tạo giao diện DOM và thiết lập Two-way Data Binding
     */
    init() {
        this.textarea.dataset.rteInitialized = "true";
        this.textarea._rte = this;
        this.textarea.style.display = "none";

        // 1. Tạo cấu trúc DOM
        this.createEditorDOM();

        // 2. Nạp dữ liệu ban đầu từ textarea
        const initialContent = this.textarea.value || "";
        this.editorArea.innerHTML = initialContent;
        this.sourceArea.value = initialContent;

        // 3. Can thiệp vào getter/setter của textarea.value để tự động cập nhật khi JS gán giá trị
        this.hookTextareaValue();

        // 4. Gắn các sự kiện tương tác
        this.bindEvents();
        this.updateStats();
    }

    /**
     * Intercept getter & setter của textarea.value
     */
    hookTextareaValue() {
        const self = this;
        const proto = HTMLTextAreaElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");

        if (descriptor && descriptor.get && descriptor.set) {
            Object.defineProperty(this.textarea, "value", {
                get: function () {
                    return self.getContent();
                },
                set: function (val) {
                    descriptor.set.call(this, val);
                    self.setContent(val);
                },
                configurable: true,
            });
        }
    }

    /**
     * Lấy nội dung HTML hiện tại
     */
    getContent() {
        return this.isSourceView
            ? this.sourceArea.value
            : this.editorArea.innerHTML;
    }

    /**
     * Cập nhật nội dung mới vào Editor
     */
    setContent(html) {
        const safeHTML = html || "";
        if (this.editorArea) {
            this.editorArea.innerHTML = safeHTML;
        }
        if (this.sourceArea) {
            this.sourceArea.value = safeHTML;
        }
        this.updateStats();
    }

    /**
     * Tạo toàn bộ giao diện HTML cho Editor
     */
    createEditorDOM() {
        this.container = document.createElement("div");
        this.container.className = "rte-container";

        this.container.innerHTML = `
            <!-- 1. MENUBAR CẤP CAO -->
            <div class="rte-menubar">
                <!-- Menu File -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="file">Tệp (File)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-action="new-doc">Tài liệu mới</button>
                        <button type="button" class="rte-dropdown-item" data-action="print-doc">In ấn (Print) <span class="shortcut">Ctrl+P</span></button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-action="export-doc">Tải file Word (.doc)</button>
                        <button type="button" class="rte-dropdown-item" data-action="export-html">Tải file HTML</button>
                    </div>
                </div>

                <!-- Menu Edit -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="edit">Chỉnh sửa (Edit)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-cmd="undo">Hoàn tác <span class="shortcut">Ctrl+Z</span></button>
                        <button type="button" class="rte-dropdown-item" data-cmd="redo">Làm lại <span class="shortcut">Ctrl+Y</span></button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-cmd="selectAll">Chọn tất cả <span class="shortcut">Ctrl+A</span></button>
                        <button type="button" class="rte-dropdown-item" data-action="find-replace">Tìm kiếm & Thay thế...</button>
                        <button type="button" class="rte-dropdown-item" data-action="clear-all">Xóa toàn bộ</button>
                    </div>
                </div>

                <!-- Menu View -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="view">Hiển thị (View)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-action="preview">Xem trước (Preview)</button>
                        <button type="button" class="rte-dropdown-item" data-action="toggle-source">Mã nguồn HTML</button>
                        <button type="button" class="rte-dropdown-item" data-action="toggle-fullscreen">Toàn màn hình</button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-action="toggle-dark-mode">Giao diện Tối (Dark Mode)</button>
                    </div>
                </div>

                <!-- Menu Insert -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="insert">Chèn (Insert)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-action="upload-image">Tải ảnh từ máy tính...</button>
                        <button type="button" class="rte-dropdown-item" data-action="insert-video">Nhúng Video YouTube...</button>
                        <button type="button" class="rte-dropdown-item" data-action="insert-link">Liên kết (Link)...</button>
                        <button type="button" class="rte-dropdown-item" data-action="insert-table">Chèn Bảng mới...</button>
                        <button type="button" class="rte-dropdown-item" data-action="insert-callout">Khối Lưu ý / Thông báo...</button>
                        <button type="button" class="rte-dropdown-item" data-action="insert-badge">Huy hiệu &amp; Nhãn giá (Badges)...</button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-cmd="insertHorizontalRule">Đường phân cách ngang</button>
                    </div>
                </div>

                <!-- Menu Table -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="table">Bảng (Table)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-action="table-add-row-below">Thêm hàng phía dưới</button>
                        <button type="button" class="rte-dropdown-item" data-action="table-add-col-right">Thêm cột bên phải</button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-action="table-delete-row">Xóa hàng hiện tại</button>
                        <button type="button" class="rte-dropdown-item" data-action="table-delete-col">Xóa cột hiện tại</button>
                        <button type="button" class="rte-dropdown-item" data-action="table-delete-table">Xóa toàn bộ bảng</button>
                    </div>
                </div>

                <!-- Menu Format -->
                <div class="rte-menu-item">
                    <button type="button" class="rte-menu-btn" data-menu="format">Định dạng (Format)</button>
                    <div class="rte-dropdown">
                        <button type="button" class="rte-dropdown-item" data-cmd="bold">In đậm <span class="shortcut">Ctrl+B</span></button>
                        <button type="button" class="rte-dropdown-item" data-cmd="italic">In nghiêng <span class="shortcut">Ctrl+I</span></button>
                        <button type="button" class="rte-dropdown-item" data-cmd="underline">Gạch chân <span class="shortcut">Ctrl+U</span></button>
                        <button type="button" class="rte-dropdown-item" data-cmd="strikeThrough">Gạch ngang chữ</button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-cmd="superscript">Chỉ số trên (x²)</button>
                        <button type="button" class="rte-dropdown-item" data-cmd="subscript">Chỉ số dưới (x₂)</button>
                        <div class="rte-dropdown-divider"></div>
                        <button type="button" class="rte-dropdown-item" data-cmd="removeFormat">Xóa sạch định dạng</button>
                    </div>
                </div>
            </div>

            <!-- 2. THANH CÔNG CỤ TOOLBAR -->
            <div class="rte-toolbar">
                <!-- Dropdown Chọn Tiêu đề / Heading -->
                <div class="rte-tool-group">
                    <select class="rte-select rte-select-block" title="Định dạng khối văn bản">
                        <option value="p">Đoạn văn (P)</option>
                        <option value="h1">Tiêu đề 1 (H1)</option>
                        <option value="h2">Tiêu đề 2 (H2)</option>
                        <option value="h3">Tiêu đề 3 (H3)</option>
                        <option value="blockquote">Trích dẫn (Quote)</option>
                        <option value="pre">Khối mã (Code)</option>
                    </select>
                </div>

                <!-- Dropdown Chọn Cỡ chữ -->
                <div class="rte-tool-group">
                    <select class="rte-select rte-select-size" title="Cỡ chữ">
                        <option value="">Cỡ chữ</option>
                        <option value="12px">12px</option>
                        <option value="14px">14px</option>
                        <option value="15px">15px (Chuẩn)</option>
                        <option value="17px">17px</option>
                        <option value="20px">20px</option>
                        <option value="24px">24px</option>
                        <option value="30px">30px</option>
                    </select>
                </div>

                <div class="rte-divider"></div>

                <!-- Undo / Redo -->
                <div class="rte-tool-group">
                    <button type="button" class="rte-btn" data-cmd="undo" title="Hoàn tác (Ctrl+Z)">
                        <svg viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="redo" title="Làm lại (Ctrl+Y)">
                        <svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </button>
                </div>

                <div class="rte-divider"></div>

                <!-- Định dạng chữ cơ bản: Bold, Italic, Underline, Strike -->
                <div class="rte-tool-group">
                    <button type="button" class="rte-btn" data-cmd="bold" title="In đậm (Ctrl+B)">
                        <svg viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="italic" title="In nghiêng (Ctrl+I)">
                        <svg viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="underline" title="Gạch chân (Ctrl+U)">
                        <svg viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 0 0 12 0V3"></path><line x1="4" y1="21" x2="20" y2="21"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="strikeThrough" title="Gạch ngang chữ">
                        <svg viewBox="0 0 24 24"><path d="M16 4H9a3 3 0 0 0-2.83 4"></path><path d="M14 12v.01"></path><path d="M17.83 16A3 3 0 0 1 15 20H8"></path><line x1="4" y1="12" x2="20" y2="12"></line></svg>
                    </button>
                </div>

                <div class="rte-divider"></div>

                <!-- MÀU CHỮ & MÀU NỀN -->
                <div class="rte-tool-group">
                    <!-- Text Color (Bảng pha màu - Palette) -->
                    <div class="rte-color-wrapper" title="Màu chữ (Text Color)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6h2c3.1 0 5.6-2.5 5.6-5.6C22 6.5 17.5 2 12 2Z"></path>
                            <circle cx="7.5" cy="11.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="10.5" cy="7.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="14.5" cy="7.5" r="1.5" fill="currentColor"></circle>
                            <circle cx="17.5" cy="11.5" r="1.5" fill="currentColor"></circle>
                        </svg>
                        <div class="rte-color-bar rte-text-color-bar" style="background-color: #000000;"></div>
                        <input type="color" class="rte-input-color-text" value="#000000">
                    </div>

                    <!-- Background Color (Xô sơn / Paint Bucket) -->
                    <div class="rte-color-wrapper" title="Màu nền / Đánh dấu (Fill / Highlight Color)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m19 11-8-8-8.6 8.6a2 2 0 0 0 0 2.8l5.2 5.2c.8.8 2 .8 2.8 0L19 11Z"></path>
                            <path d="m5 2 5 5"></path>
                            <path d="M2 13h15"></path>
                            <path d="M22 20a2 2 0 1 1-4 0c0-1.6 2-3 2-3s2 1.4 2 3Z" fill="currentColor"></path>
                        </svg>
                        <div class="rte-color-bar rte-bg-color-bar" style="background-color: #ffff00;"></div>
                        <input type="color" class="rte-input-color-bg" value="#ffff00">
                    </div>
                </div>

                <div class="rte-divider"></div>

                <!-- Căn lề -->
                <div class="rte-tool-group">
                    <button type="button" class="rte-btn" data-cmd="justifyLeft" title="Căn trái">
                        <svg viewBox="0 0 24 24"><line x1="17" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="justifyCenter" title="Căn giữa">
                        <svg viewBox="0 0 24 24"><line x1="18" y1="10" x2="6" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="18" y1="18" x2="6" y2="18"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="justifyRight" title="Căn phải">
                        <svg viewBox="0 0 24 24"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="justifyFull" title="Căn đều 2 bên">
                        <svg viewBox="0 0 24 24"><line x1="21" y1="10" x2="3" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="3" y2="18"></line></svg>
                    </button>
                </div>

                <div class="rte-divider"></div>

                <!-- Danh sách & Thụt lề -->
                <div class="rte-tool-group">
                    <button type="button" class="rte-btn" data-cmd="insertUnorderedList" title="Danh sách dấu chấm">
                        <svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><circle cx="4" cy="6" r="1.5" fill="currentColor"></circle><circle cx="4" cy="12" r="1.5" fill="currentColor"></circle><circle cx="4" cy="18" r="1.5" fill="currentColor"></circle></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="insertOrderedList" title="Danh sách đánh số">
                        <svg viewBox="0 0 24 24"><line x1="10" y1="6" x2="21" y2="6"></line><line x1="10" y1="12" x2="21" y2="12"></line><line x1="10" y1="18" x2="21" y2="18"></line><path d="M4 6h1v4"></path><path d="M4 10h2"></path><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="outdent" title="Giảm thụt lề">
                        <svg viewBox="0 0 24 24"><polyline points="7 8 3 12 7 16"></polyline><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="18" x2="11" y2="18"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-cmd="indent" title="Tăng thụt lề">
                        <svg viewBox="0 0 24 24"><polyline points="3 8 7 12 3 16"></polyline><line x1="21" y1="6" x2="11" y2="6"></line><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="18" x2="11" y2="18"></line></svg>
                    </button>
                </div>

                <div class="rte-divider"></div>

                <!-- Chèn Đa phương tiện & Tiện ích Du lịch -->
                <div class="rte-tool-group" style="position: relative;">
                    <button type="button" class="rte-btn" data-action="upload-image" title="Tải ảnh lên từ thiết bị">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="insert-video" title="Nhúng Video YouTube">
                        <svg viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor"></polygon></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="insert-link" title="Chèn liên kết">
                        <svg viewBox="0 0 24 24"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="insert-table" title="Chèn bảng dữ liệu">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"></rect><path d="M3 9h18"></path><path d="M3 15h18"></path><path d="M9 3v18"></path><path d="M15 3v18"></path></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="insert-callout" title="Chèn Khối Thông Báo / Lưu Ý">
                        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="toggle-emoji" title="Chèn Biểu tượng / Emoji">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    </button>
                    <button type="button" class="rte-btn rte-btn-mic" data-action="toggle-mic" title="Soạn thảo bằng giọng nói tiếng Việt">
                        <svg viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                    </button>
                    <button type="button" class="rte-btn" data-action="toggle-dark-mode" title="Bật/Tắt Giao diện Tối (Dark Mode)">
                        <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
                    </button>

                    <!-- Popover Emoji -->
                    <div class="rte-popover rte-emoji-popover">
                        <button type="button" class="rte-popover-btn" data-emoji="🌴">🌴</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🛶">🛶</button>
                        <button type="button" class="rte-popover-btn" data-emoji="📍">📍</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🏛️">🏛️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🍜">🍜</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🍲">🍲</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🎒">🎒</button>
                        <button type="button" class="rte-popover-btn" data-emoji="☀️">☀️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🚗">🚗</button>
                        <button type="button" class="rte-popover-btn" data-emoji="✈️">✈️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="⭐">⭐</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🚩">🚩</button>
                        <button type="button" class="rte-popover-btn" data-emoji="💡">💡</button>
                        <button type="button" class="rte-popover-btn" data-emoji="⚠️">⚠️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="✅">✅</button>
                        <button type="button" class="rte-popover-btn" data-emoji="❌">❌</button>
                        <button type="button" class="rte-popover-btn" data-emoji="📞">📞</button>
                        <button type="button" class="rte-popover-btn" data-emoji="💵">💵</button>
                        <button type="button" class="rte-popover-btn" data-emoji="₫">₫</button>
                        <button type="button" class="rte-popover-btn" data-emoji="❤️">❤️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="👍">👍</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🕒">🕒</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🏖️">🏖️</button>
                        <button type="button" class="rte-popover-btn" data-emoji="🏨">🏨</button>
                    </div>
                </div>

                <div class="rte-divider"></div>

                <!-- Xóa định dạng -->
                <div class="rte-tool-group">
                    <button type="button" class="rte-btn" data-cmd="removeFormat" title="Xóa sạch định dạng về mặc định">
                        <svg viewBox="0 0 24 24"><path d="m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21"></path><path d="M22 21H7"></path><path d="m5 11 9 9"></path></svg>
                    </button>
                </div>

                <!-- Input ẩn để upload file ảnh từ máy -->
                <input type="file" class="rte-file-input" accept="image/*" style="display: none;">

                <!-- Nút XEM TRƯỚC (PREVIEW) -->
                <button type="button" class="rte-btn rte-btn-preview" data-action="preview" title="Xem trước bài viết">
                    <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    <span>Xem trước</span>
                </button>
            </div>

            <!-- 3. VÙNG SOẠN THẢO CONTENTEDITABLE -->
            <div class="rte-editor-area" 
                 contenteditable="true" 
                 data-placeholder="${this.options.placeholder}"></div>

            <!-- 4. VÙNG MÃ NGUỒN HTML -->
            <textarea class="rte-source-area" spellcheck="false"></textarea>

            <!-- 5. FOOTER STATUS -->
            <div class="rte-footer">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="rte-mode-label">Mã nguồn mở: <a href="https://github.com/nhut-share-code/">PMN</a></span>
                </div>
                <span class="rte-stats">0 ký tự | 0 từ | ~1 phút đọc</span>
            </div>

            <!-- 6. MODAL XEM TRƯỚC (PREVIEW LIGHTBOX) -->
            <div class="rte-modal-overlay">
                <div class="rte-modal-content">
                    <div class="rte-modal-header">
                        <div class="rte-modal-title">Xem trước nội dung hiển thị</div>
                        <button type="button" class="rte-modal-close" title="Đóng">&times;</button>
                    </div>
                    <div class="rte-modal-body"></div>
                    <div class="rte-modal-footer">
                        <button type="button" class="rte-btn-secondary" data-modal-action="print">In trang này</button>
                        <button type="button" class="rte-btn-secondary" data-modal-action="close">Đóng lại</button>
                    </div>
                </div>
            </div>

            <!-- 7. THANH CÔNG CỤ NỔI CHO HÌNH ẢNH (IMAGE FLOATING CONTROLS) -->
            <div class="rte-image-toolbar">
                <button type="button" class="rte-img-btn" data-img-align="left" title="Trôi bên trái (Chữ bao quanh bên phải)">
                    <svg viewBox="0 0 24 24"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="11" y2="12"></line><line x1="21" y1="18" x2="11" y2="18"></line><rect x="3" y="10" width="6" height="8" rx="1"></rect></svg>
                    <span>Trôi trái</span>
                </button>
                <button type="button" class="rte-img-btn" data-img-align="center" title="Căn giữa dòng">
                    <svg viewBox="0 0 24 24"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="18" x2="3" y2="18"></line><rect x="7" y="9" width="10" height="6" rx="1"></rect></svg>
                    <span>Căn giữa</span>
                </button>
                <button type="button" class="rte-img-btn" data-img-align="right" title="Trôi bên phải (Chữ bao quanh bên trái)">
                    <svg viewBox="0 0 24 24"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="13" y1="12" x2="3" y2="12"></line><line x1="13" y1="18" x2="3" y2="18"></line><rect x="15" y="10" width="6" height="8" rx="1"></rect></svg>
                    <span>Trôi phải</span>
                </button>
                <div class="rte-img-divider"></div>
                <button type="button" class="rte-img-btn" data-img-size="25%" title="Kích thước 25%">25%</button>
                <button type="button" class="rte-img-btn" data-img-size="50%" title="Kích thước 50%">50%</button>
                <button type="button" class="rte-img-btn" data-img-size="75%" title="Kích thước 75%">75%</button>
                <button type="button" class="rte-img-btn" data-img-size="100%" title="Kích thước 100%">100%</button>
                <div class="rte-img-divider"></div>
                <button type="button" class="rte-img-btn" data-img-action="caption" title="Thêm chú thích ảnh">
                    <svg viewBox="0 0 24 24"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    <span>Chú thích</span>
                </button>
                <button type="button" class="rte-img-btn rte-img-btn-del" data-img-action="delete" title="Xóa hình ảnh này">
                    <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;

        this.textarea.parentNode.insertBefore(
            this.container,
            this.textarea.nextSibling,
        );

        // Lưu trữ các DOM references
        this.editorArea = this.container.querySelector(".rte-editor-area");
        this.sourceArea = this.container.querySelector(".rte-source-area");
        this.fileInput = this.container.querySelector(".rte-file-input");
        this.textColorBar = this.container.querySelector(".rte-text-color-bar");
        this.bgColorBar = this.container.querySelector(".rte-bg-color-bar");
        this.textColorInput = this.container.querySelector(
            ".rte-input-color-text",
        );
        this.bgColorInput = this.container.querySelector(".rte-input-color-bg");
        this.statsElement = this.container.querySelector(".rte-stats");
        this.modeLabel = this.container.querySelector(".rte-mode-label");
        this.modal = this.container.querySelector(".rte-modal-overlay");
        this.modalBody = this.container.querySelector(".rte-modal-body");
        this.emojiPopover = this.container.querySelector(".rte-emoji-popover");
        this.selectBlock = this.container.querySelector(".rte-select-block");
        this.selectSize = this.container.querySelector(".rte-select-size");
        this.imageToolbar = this.container.querySelector(".rte-image-toolbar");
        this.selectedImage = null;
        this.draggedImage = null;

        if (this.options.height) {
            this.editorArea.style.minHeight = this.options.height;
            this.sourceArea.style.minHeight = this.options.height;
        }
    }

    /**
     * Đồng bộ nội dung sang <textarea> ẩn
     */
    syncToTextarea() {
        const content = this.getContent();
        const proto = HTMLTextAreaElement.prototype;
        const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
        if (descriptor && descriptor.set) {
            descriptor.set.call(this.textarea, content);
        } else {
            this.textarea.value = content;
        }
        this.textarea.dispatchEvent(new Event("input", { bubbles: true }));
        this.textarea.dispatchEvent(new Event("change", { bubbles: true }));
    }

    /**
     * Lưu Selection/Range hiện tại
     */
    saveSelection() {
        const sel = window.getSelection();
        if (sel.rangeCount > 0) {
            this.savedSelection = sel.getRangeAt(0);
        }
    }

    /**
     * Khôi phục Selection/Range
     */
    restoreSelection() {
        if (this.savedSelection) {
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this.savedSelection);
        }
    }

    /**
     * Thực thi lệnh document.execCommand
     */
    executeCommand(cmd, value = null) {
        if (this.isSourceView) return;
        document.execCommand(cmd, false, value);
        this.editorArea.focus();
        this.syncToTextarea();
        this.updateToolbarState();
        this.updateStats();
    }

    /**
     * Chèn HTML tại vị trí con trỏ
     */
    insertHTML(html) {
        this.restoreSelection();
        document.execCommand("insertHTML", false, html);
        this.editorArea.focus();
        this.syncToTextarea();
        this.updateStats();
    }

    /**
     * Cập nhật trạng thái các nút bấm trên Toolbar & Dropdown Heading
     */
    updateToolbarState() {
        if (this.isSourceView) return;
        const buttons = this.container.querySelectorAll(".rte-btn[data-cmd]");
        buttons.forEach((btn) => {
            const cmd = btn.getAttribute("data-cmd");
            try {
                if (document.queryCommandState(cmd)) {
                    btn.classList.add("is-active");
                } else {
                    btn.classList.remove("is-active");
                }
            } catch (e) {}
        });

        // Cập nhật giá trị thẻ Heading đang đứng
        try {
            const block = document
                .queryCommandValue("formatBlock")
                .toLowerCase();
            if (block && this.selectBlock) {
                const found = Array.from(this.selectBlock.options).some(
                    (o) => o.value === block,
                );
                this.selectBlock.value = found ? block : "p";
            }
        } catch (e) {}
    }

    /**
     * Thống kê ký tự, số từ & ước tính thời gian đọc bài
     */
    updateStats() {
        const text = this.editorArea ? this.editorArea.innerText.trim() : "";
        const chars = text.length;
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
        const readMinutes = Math.max(1, Math.ceil(words / 200));
        if (this.statsElement) {
            this.statsElement.textContent = `${chars} ký tự | ${words} từ | ~${readMinutes} phút đọc`;
        }
    }

    /**
     * Đóng tất cả các menu dropdown & popover
     */
    closeAllMenus() {
        this.container
            .querySelectorAll(".rte-menu-item.is-open")
            .forEach((el) => {
                el.classList.remove("is-open");
                const drop = el.querySelector(".rte-dropdown");
                if (drop) {
                    drop.style.left = "";
                    drop.style.right = "";
                }
            });
        if (this.emojiPopover) {
            this.emojiPopover.classList.remove("is-open");
            this.emojiPopover.style.left = "";
            this.emojiPopover.style.right = "";
        }
    }

    /**
     * Hiển thị thanh công cụ nổi căn chỉnh vị trí & kích thước ảnh
     */
    showImageToolbar(img) {
        if (!img || !this.imageToolbar) return;
        this.selectedImage = img;
        this.editorArea
            .querySelectorAll("img")
            .forEach((el) => el.classList.remove("rte-img-selected"));
        img.classList.add("rte-img-selected");

        const containerRect = this.container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();

        const top = imgRect.top - containerRect.top - 45;
        const left = imgRect.left - containerRect.left + imgRect.width / 2;

        this.imageToolbar.style.top = `${Math.max(10, top)}px`;
        this.imageToolbar.style.left = `${left}px`;
        this.imageToolbar.style.transform = "translateX(-50%)";
        this.imageToolbar.style.right = "";
        this.imageToolbar.classList.add("is-visible");

        // Ngăn thanh công cụ ảnh tràn viền trái / phải màn hình
        const tbRect = this.imageToolbar.getBoundingClientRect();
        if (tbRect.left < containerRect.left + 6) {
            this.imageToolbar.style.transform = "none";
            this.imageToolbar.style.left = "6px";
        } else if (tbRect.right > containerRect.right - 6) {
            this.imageToolbar.style.transform = "none";
            this.imageToolbar.style.left = "auto";
            this.imageToolbar.style.right = "6px";
        }

        // Cập nhật trạng thái active của nút căn lề
        const styleFloat = img.style.float;
        const styleDisplay = img.style.display;
        this.imageToolbar
            .querySelectorAll("[data-img-align]")
            .forEach((btn) => {
                const align = btn.getAttribute("data-img-align");
                if (
                    align === "center" &&
                    styleDisplay === "block" &&
                    styleFloat !== "left" &&
                    styleFloat !== "right"
                ) {
                    btn.classList.add("is-active");
                } else if (align === styleFloat) {
                    btn.classList.add("is-active");
                } else {
                    btn.classList.remove("is-active");
                }
            });

        // Cập nhật trạng thái active của kích thước
        const currentWidth = img.style.width;
        this.imageToolbar.querySelectorAll("[data-img-size]").forEach((btn) => {
            btn.classList.toggle(
                "is-active",
                btn.getAttribute("data-img-size") === currentWidth,
            );
        });
    }

    /**
     * Ẩn thanh công cụ nổi của ảnh
     */
    hideImageToolbar() {
        this.selectedImage = null;
        if (this.imageToolbar) {
            this.imageToolbar.classList.remove("is-visible");
            this.imageToolbar.style.transform = "";
            this.imageToolbar.style.right = "";
        }
        if (this.editorArea) {
            this.editorArea
                .querySelectorAll("img")
                .forEach((el) => el.classList.remove("rte-img-selected"));
        }
    }

    /**
     * XỬ LÝ UPLOAD ẢNH (Đọc Base64 đưa vào HTML)
     */
    handleImageUpload(file) {
        if (!file || !file.type.startsWith("image/")) {
            alert(
                "Vui lòng chọn một file hình ảnh hợp lệ (PNG, JPG, WEBP, GIF, SVG).",
            );
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Url = e.target.result;
            const imgHTML = `<p><img src="${base64Url}" alt="${file.name}" style="max-width: 100%; height: auto; border-radius: 6px;"></p><p><br></p>`;
            this.insertHTML(imgHTML);
        };
        reader.readAsDataURL(file);
    }

    /**
     * Nhúng Video YouTube với Iframe 16:9 Responsive
     */
    insertYouTubeVideo() {
        this.saveSelection();
        const url = prompt(
            "Nhập link video YouTube (ví dụ: https://www.youtube.com/watch?v=... hoặc https://youtu.be/...):",
        );
        if (!url || !url.trim()) return;

        let videoId = "";
        const regExp =
            /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.trim().match(regExp);

        if (match && match[2].length === 11) {
            videoId = match[2];
        } else {
            alert("Đường dẫn YouTube không hợp lệ. Vui lòng kiểm tra lại!");
            return;
        }

        const embedHTML = `
            <div class="rte-video-wrapper">
                <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen loading="lazy"></iframe>
            </div>
            <p><br></p>
        `;
        this.insertHTML(embedHTML);
    }

    /**
     * Chèn Khối Lưu Ý / Callout Box
     */
    insertCalloutBox() {
        this.saveSelection();
        const type = prompt(
            "Chọn loại khối thông báo cần chèn:\n1: Xanh lá (Lưu ý tour bao gồm / Điểm nổi bật)\n2: Vàng cam (Lưu ý quan trọng)\n3: Xanh dương (Thông tin hướng dẫn)\n4: Đỏ (Cảnh báo / Quy định hoàn hủy)",
            "1",
        );

        let calloutClass = "rte-callout-success";
        let defaultTitle = "💡 Điểm nổi bật & Dịch vụ bao gồm:";

        if (type === "2") {
            calloutClass = "rte-callout-warning";
            defaultTitle = "⚠️ Lưu ý quan trọng khi tham quan:";
        } else if (type === "3") {
            calloutClass = "rte-callout-info";
            defaultTitle = "ℹ️ Thông tin hướng dẫn chuyến đi:";
        } else if (type === "4") {
            calloutClass = "rte-callout-danger";
            defaultTitle = "❌ Điều khoản & Quy định cần biết:";
        }

        const html = `
            <div class="rte-callout ${calloutClass}">
                <strong>${defaultTitle}</strong>
                <p>Nhập nội dung chi tiết tại đây...</p>
            </div>
            <p><br></p>
        `;
        this.insertHTML(html);
    }

    /**
     * Chèn Huy Hiệu & Nhãn Giá (Tour Badges)
     */
    insertBadge() {
        this.saveSelection();
        const choice = prompt(
            "Chọn loại huy hiệu muốn chèn:\n1: 🌿 Du lịch sinh thái (Xanh lá)\n2: 🔥 Tour Bán Chạy (Đỏ)\n3: ⭐ Ưu Đãi -20% (Cam)\n4: ✓ Trọn Gói Vé & Ăn Uống (Xanh dương)",
            "1",
        );

        let badgeHTML =
            '<span class="rte-badge rte-badge-green">🌿 Du lịch sinh thái</span>&nbsp;';
        if (choice === "2") {
            badgeHTML =
                '<span class="rte-badge rte-badge-red">🔥 Tour Bán Chạy</span>&nbsp;';
        } else if (choice === "3") {
            badgeHTML =
                '<span class="rte-badge rte-badge-orange">⭐ Ưu Đãi -20%</span>&nbsp;';
        } else if (choice === "4") {
            badgeHTML =
                '<span class="rte-badge rte-badge-blue">✓ Trọn Gói Vé &amp; Ăn Uống</span>&nbsp;';
        }
        this.insertHTML(badgeHTML);
    }

    /**
     * Bật / Tắt Giao diện Tối (Dark Mode Toggle)
     */
    toggleDarkMode() {
        this.container.classList.toggle("rte-dark-theme");
    }

    /**
     * Bật / Tắt Nhận diện giọng nói (Voice Typing tiếng Việt)
     */
    toggleVoiceTyping() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert(
                "Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Google Chrome hoặc Microsoft Edge để trải nghiệm tính năng này!",
            );
            return;
        }

        if (this.isRecording) {
            this.stopVoiceTyping();
        } else {
            this.startVoiceTyping();
        }
    }

    startVoiceTyping() {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.lang = "vi-VN";
        this.recognition.continuous = true;
        this.recognition.interimResults = false;

        this.recognition.onstart = () => {
            this.isRecording = true;
            const micBtn = this.container.querySelector(
                '[data-action="toggle-mic"]',
            );
            if (micBtn) micBtn.classList.add("is-recording");
        };

        this.recognition.onresult = (e) => {
            const lastResult = e.results[e.results.length - 1];
            if (lastResult.isFinal) {
                const text = lastResult[0].transcript.trim();
                if (text) {
                    this.insertHTML(" " + text + ". ");
                }
            }
        };

        this.recognition.onerror = () => {
            this.stopVoiceTyping();
        };

        this.recognition.onend = () => {
            if (this.isRecording) {
                try {
                    this.recognition.start();
                } catch (err) {}
            } else {
                this.stopVoiceTyping();
            }
        };

        try {
            this.recognition.start();
        } catch (err) {
            this.stopVoiceTyping();
        }
    }

    stopVoiceTyping() {
        this.isRecording = false;
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (err) {}
            this.recognition = null;
        }
        const micBtn = this.container.querySelector(
            '[data-action="toggle-mic"]',
        );
        if (micBtn) micBtn.classList.remove("is-recording");
    }

    /**
     * Thao tác Bảng: Lấy ô TD hiện tại đang chứa con trỏ
     */
    getCurrentTableCell() {
        const sel = window.getSelection();
        if (!sel.rangeCount) return null;
        let node = sel.getRangeAt(0).startContainer;
        while (node && node !== this.editorArea) {
            if (node.nodeName === "TD" || node.nodeName === "TH") {
                return node;
            }
            node = node.parentNode;
        }
        return null;
    }

    /**
     * Thao tác Bảng: Thêm hàng phía dưới
     */
    tableAddRowBelow() {
        const cell = this.getCurrentTableCell();
        if (!cell) {
            alert(
                "Vui lòng đặt con trỏ vào bên trong ô của Bảng trước khi thực hiện.",
            );
            return;
        }
        const row = cell.closest("tr");
        const colCount = row.children.length;
        const newRow = document.createElement("tr");
        for (let i = 0; i < colCount; i++) {
            const td = document.createElement("td");
            td.innerHTML = "&nbsp;";
            newRow.appendChild(td);
        }
        row.parentNode.insertBefore(newRow, row.nextSibling);
        this.syncToTextarea();
    }

    /**
     * Thao tác Bảng: Thêm cột bên phải
     */
    tableAddColRight() {
        const cell = this.getCurrentTableCell();
        if (!cell) {
            alert(
                "Vui lòng đặt con trỏ vào bên trong ô của Bảng trước khi thực hiện.",
            );
            return;
        }
        const row = cell.closest("tr");
        const cellIndex = Array.from(row.children).indexOf(cell);
        const table = cell.closest("table");

        table.querySelectorAll("tr").forEach((tr) => {
            const td = document.createElement(
                tr.children[0].nodeName === "TH" ? "th" : "td",
            );
            td.innerHTML = "&nbsp;";
            const targetCell = tr.children[cellIndex];
            if (targetCell) {
                tr.insertBefore(td, targetCell.nextSibling);
            } else {
                tr.appendChild(td);
            }
        });
        this.syncToTextarea();
    }

    /**
     * Thao tác Bảng: Xóa hàng
     */
    tableDeleteRow() {
        const cell = this.getCurrentTableCell();
        if (!cell) {
            alert("Vui lòng đặt con trỏ vào bên trong ô của Bảng.");
            return;
        }
        const row = cell.closest("tr");
        const table = cell.closest("table");
        row.remove();
        if (table.querySelectorAll("tr").length === 0) {
            table.remove();
        }
        this.syncToTextarea();
    }

    /**
     * Thao tác Bảng: Xóa cột
     */
    tableDeleteCol() {
        const cell = this.getCurrentTableCell();
        if (!cell) {
            alert("Vui lòng đặt con trỏ vào bên trong ô của Bảng.");
            return;
        }
        const row = cell.closest("tr");
        const cellIndex = Array.from(row.children).indexOf(cell);
        const table = cell.closest("table");

        table.querySelectorAll("tr").forEach((tr) => {
            if (tr.children[cellIndex]) {
                tr.children[cellIndex].remove();
            }
        });

        if (
            table.querySelector("tr") &&
            table.querySelector("tr").children.length === 0
        ) {
            table.remove();
        }
        this.syncToTextarea();
    }

    /**
     * Thao tác Bảng: Xóa toàn bộ bảng
     */
    tableDeleteTable() {
        const cell = this.getCurrentTableCell();
        if (!cell) {
            alert("Vui lòng đặt con trỏ vào bên trong ô của Bảng.");
            return;
        }
        const table = cell.closest("table");
        if (confirm("Bạn có chắc muốn xóa toàn bộ bảng này?")) {
            table.remove();
            this.syncToTextarea();
        }
    }

    /**
     * Xuất file Microsoft Word (.doc)
     */
    exportWordDocument() {
        const content = this.getContent();
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>Tài liệu Vĩnh Long Odyssey</title>
            <style>
                body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; }
                table { border-collapse: collapse; width: 100%; margin: 12px 0; }
                table, th, td { border: 1px solid #333; padding: 8px; }
                img { max-width: 100%; height: auto; }
            </style>
            </head><body>
        `;
        const footer = "</body></html>";
        const sourceHTML = header + content + footer;

        const blob = new Blob(["\ufeff" + sourceHTML], {
            type: "application/msword",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `VinhLongOdyssey_Doc_${Date.now()}.doc`;
        link.click();
    }

    /**
     * Tìm kiếm và Thay thế (Find & Replace)
     */
    findAndReplace() {
        const findStr = prompt("Nhập từ/cụm từ cần tìm kiếm:");
        if (!findStr) return;
        const replaceStr = prompt(`Thay thế "${findStr}" bằng:`, "");
        if (replaceStr === null) return;

        const html = this.editorArea.innerHTML;
        const regex = new RegExp(
            findStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            "gi",
        );
        const newHtml = html.replace(regex, replaceStr);

        this.editorArea.innerHTML = newHtml;
        this.syncToTextarea();
        this.updateStats();
        alert(`Đã hoàn tất tìm và thay thế cho cụm từ "${findStr}".`);
    }

    /**
     * Mở hộp thoại Preview (Xem trước)
     */
    openPreview() {
        const content = this.getContent();
        this.modalBody.innerHTML =
            content ||
            '<p style="color:#94a3b8; font-style:italic;">(Chưa có nội dung soạn thảo)</p>';
        this.modal.classList.add("is-visible");
    }

    /**
     * Đóng hộp thoại Preview
     */
    closePreview() {
        this.modal.classList.remove("is-visible");
    }

    /**
     * Chuyển đổi giữa Soạn thảo trực quan & Xem Mã HTML
     */
    toggleSourceView() {
        this.isSourceView = !this.isSourceView;
        if (this.isSourceView) {
            this.sourceArea.value = this.editorArea.innerHTML;
            this.container.classList.add("show-source");
            this.modeLabel.textContent = "Chế độ Mã nguồn HTML";
        } else {
            this.editorArea.innerHTML = this.sourceArea.value;
            this.container.classList.remove("show-source");
            this.modeLabel.textContent = "Chế độ WYSIWYG";
        }
        this.syncToTextarea();
        this.updateStats();
    }

    /**
     * Chuyển đổi chế độ Toàn màn hình (Fullscreen)
     */
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.container.classList.toggle("rte-fullscreen", this.isFullscreen);
        document.body.style.overflow = this.isFullscreen ? "hidden" : "";
    }

    /**
     * Đăng ký tất cả các sự kiện tương tác
     */
    bindEvents() {
        document.execCommand("defaultParagraphSeparator", false, "p");

        // 1. Quản lý mở/đóng Dropdown Menu cấp cao
        this.container
            .querySelector(".rte-menubar")
            .addEventListener("click", (e) => {
                const menuBtn = e.target.closest(".rte-menu-btn");
                if (menuBtn) {
                    e.stopPropagation();
                    const menuItem = menuBtn.closest(".rte-menu-item");
                    const isOpen = menuItem.classList.contains("is-open");
                    this.closeAllMenus();
                    if (!isOpen) {
                        menuItem.classList.add("is-open");
                        const dropdown =
                            menuItem.querySelector(".rte-dropdown");
                        if (dropdown) {
                            dropdown.style.left = "";
                            dropdown.style.right = "";
                            const rect = dropdown.getBoundingClientRect();
                            if (rect.right > window.innerWidth - 8) {
                                dropdown.style.left = "auto";
                                dropdown.style.right = "0";
                            }
                        }
                    }
                    return;
                }

                const dropItem = e.target.closest(".rte-dropdown-item");
                if (dropItem) {
                    this.closeAllMenus();
                    const cmd = dropItem.getAttribute("data-cmd");
                    const action = dropItem.getAttribute("data-action");

                    if (cmd) {
                        this.executeCommand(cmd);
                    } else if (action) {
                        this.handleAction(action);
                    }
                }
            });

        // Đóng dropdown, popover & image toolbar khi click ra ngoài
        document.addEventListener("click", (e) => {
            if (!this.container.contains(e.target)) {
                this.closeAllMenus();
                this.hideImageToolbar();
            }
        });

        // Xử lý các nút trên Thanh điều khiển nổi của Hình ảnh (Image Floating Toolbar)
        if (this.imageToolbar) {
            this.imageToolbar.addEventListener("mousedown", (e) =>
                e.preventDefault(),
            );
            this.imageToolbar.addEventListener("click", (e) => {
                const btn = e.target.closest(".rte-img-btn");
                if (!btn || !this.selectedImage) return;
                e.stopPropagation();

                const align = btn.getAttribute("data-img-align");
                const size = btn.getAttribute("data-img-size");
                const action = btn.getAttribute("data-img-action");

                if (align === "left") {
                    this.selectedImage.style.float = "left";
                    this.selectedImage.style.display = "inline-block";
                    this.selectedImage.style.margin = "8px 16px 8px 0";
                } else if (align === "right") {
                    this.selectedImage.style.float = "right";
                    this.selectedImage.style.display = "inline-block";
                    this.selectedImage.style.margin = "8px 0 8px 16px";
                } else if (align === "center") {
                    this.selectedImage.style.float = "none";
                    this.selectedImage.style.display = "block";
                    this.selectedImage.style.margin = "14px auto";
                }

                if (size) {
                    this.selectedImage.style.width = size;
                    this.selectedImage.style.height = "auto";
                }

                if (action === "caption") {
                    const captionText = prompt(
                        "Nhập nội dung chú thích cho hình ảnh:",
                        "Ảnh: Cảnh đẹp du lịch Vĩnh Long",
                    );
                    if (captionText) {
                        const img = this.selectedImage;
                        let figure = img.closest("figure");
                        if (!figure) {
                            figure = document.createElement("figure");
                            figure.style.display = "inline-block";
                            figure.style.margin = "14px auto";
                            figure.style.maxWidth = "100%";
                            figure.style.textAlign = "center";
                            img.parentNode.insertBefore(figure, img);
                            figure.appendChild(img);
                        }
                        let figcaption = figure.querySelector("figcaption");
                        if (!figcaption) {
                            figcaption = document.createElement("figcaption");
                            figure.appendChild(figcaption);
                        }
                        figcaption.textContent = captionText;
                        this.hideImageToolbar();
                    }
                } else if (action === "delete") {
                    const img = this.selectedImage;
                    this.hideImageToolbar();
                    if (img.closest("figure")) {
                        img.closest("figure").remove();
                    } else {
                        img.remove();
                    }
                } else {
                    setTimeout(
                        () => this.showImageToolbar(this.selectedImage),
                        30,
                    );
                }

                this.syncToTextarea();
                this.updateStats();
            });
        }

        // Click vào ảnh để chọn & hiện thanh điều khiển, click ra ngoài để bỏ chọn
        this.editorArea.addEventListener("click", (e) => {
            if (e.target && e.target.nodeName === "IMG") {
                e.stopPropagation();
                this.showImageToolbar(e.target);
            } else {
                this.hideImageToolbar();
            }
        });

        // Tự động định vị lại thanh điều khiển khi cuộn vùng soạn thảo
        this.editorArea.addEventListener("scroll", () => {
            if (this.selectedImage) {
                this.showImageToolbar(this.selectedImage);
            }
        });

        // 2. Toolbar clicks (Ngăn mất selection)
        this.container
            .querySelector(".rte-toolbar")
            .addEventListener("mousedown", (e) => {
                if (
                    e.target.closest(".rte-btn") ||
                    e.target.closest(".rte-color-wrapper") ||
                    e.target.closest(".rte-popover-btn")
                ) {
                    e.preventDefault();
                }
            });

        this.container
            .querySelector(".rte-toolbar")
            .addEventListener("click", (e) => {
                const btn = e.target.closest(".rte-btn");
                if (!btn) return;

                const cmd = btn.getAttribute("data-cmd");
                const action = btn.getAttribute("data-action");

                if (cmd) {
                    this.executeCommand(cmd);
                } else if (action) {
                    this.handleAction(action);
                }
            });

        // 3. Dropdown Chọn Heading (formatBlock)
        this.selectBlock.addEventListener("change", (e) => {
            const tag = e.target.value;
            this.restoreSelection();
            if (tag === "pre") {
                this.executeCommand("formatBlock", "<pre>");
            } else if (tag === "blockquote") {
                this.executeCommand("formatBlock", "<blockquote>");
            } else {
                this.executeCommand("formatBlock", `<${tag}>`);
            }
        });

        // 4. Dropdown Chọn Cỡ chữ
        this.selectSize.addEventListener("change", (e) => {
            const size = e.target.value;
            if (!size) return;
            this.restoreSelection();
            const sel = window.getSelection();
            if (sel.rangeCount > 0 && !sel.isCollapsed) {
                const range = sel.getRangeAt(0);
                const span = document.createElement("span");
                span.style.fontSize = size;
                span.appendChild(range.extractContents());
                range.insertNode(span);
                this.editorArea.focus();
                this.syncToTextarea();
            }
            this.selectSize.value = "";
        });

        // 5. Màu chữ (Text Color)
        this.textColorInput.addEventListener("input", (e) => {
            this.restoreSelection();
            const color = e.target.value;
            this.textColorBar.style.backgroundColor = color;
            this.executeCommand("foreColor", color);
        });

        // 6. Màu nền chữ (Fill / Highlight Color)
        this.bgColorInput.addEventListener("input", (e) => {
            this.restoreSelection();
            const color = e.target.value;
            this.bgColorBar.style.backgroundColor = color;
            if (!document.execCommand("hiliteColor", false, color)) {
                document.execCommand("backColor", false, color);
            }
            this.editorArea.focus();
            this.syncToTextarea();
        });

        [
            this.textColorInput,
            this.bgColorInput,
            this.selectBlock,
            this.selectSize,
        ].forEach((input) => {
            input.addEventListener("focus", () => this.saveSelection());
            input.addEventListener("mousedown", () => this.saveSelection());
        });

        // 7. Popover chọn Emoji
        this.emojiPopover.addEventListener("click", (e) => {
            const emojiBtn = e.target.closest(".rte-popover-btn");
            if (emojiBtn) {
                const emoji = emojiBtn.getAttribute("data-emoji");
                this.insertHTML(emoji);
                this.closeAllMenus();
            }
        });

        // 8. Upload ảnh từ thiết bị
        this.fileInput.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleImageUpload(file);
                this.fileInput.value = "";
            }
        });

        // 9. KÉO VÀ THẢ ẢNH (DRAG & DROP - DI CHUYỂN VỊ TRÍ, KHÔNG BỊ NHÂN BẢN)
        this.editorArea.addEventListener("dragstart", (e) => {
            if (e.target && e.target.nodeName === "IMG") {
                this.draggedImage = e.target;
                this.draggedImage.style.opacity = "0.4";
                e.dataTransfer.effectAllowed = "move";
                try {
                    e.dataTransfer.setData("text/plain", "");
                } catch (err) {}
                this.hideImageToolbar();
            } else {
                this.draggedImage = null;
            }
        });

        this.editorArea.addEventListener("dragover", (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
        });

        this.editorArea.addEventListener("drop", (e) => {
            e.preventDefault();

            // Trường hợp 1: Thả file ảnh mới từ bên ngoài máy tính vào
            if (
                e.dataTransfer &&
                e.dataTransfer.files &&
                e.dataTransfer.files.length > 0
            ) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith("image/")) {
                    this.handleImageUpload(file);
                }
                this.draggedImage = null;
                return;
            }

            // Trường hợp 2: Kéo di chuyển vị trí ảnh đang có sẵn bên trong bài viết
            if (this.draggedImage) {
                let range = null;
                if (document.caretRangeFromPoint) {
                    range = document.caretRangeFromPoint(e.clientX, e.clientY);
                } else if (e.rangeParent) {
                    range = document.createRange();
                    range.setStart(e.rangeParent, e.rangeOffset);
                }

                if (range) {
                    const targetImg = this.draggedImage;
                    targetImg.style.opacity = "1";

                    // QUAN TRỌNG: Xóa ảnh ở vị trí cũ để triệt tiêu việc nhân bản ảnh!
                    targetImg.remove();

                    // Chèn chính xác vào vị trí con trỏ thả chuột mới
                    range.insertNode(targetImg);
                    range.setStartAfter(targetImg);
                    range.collapse(true);

                    const sel = window.getSelection();
                    sel.removeAllRanges();
                    sel.addRange(range);

                    this.showImageToolbar(targetImg);
                }
                this.draggedImage = null;
                this.syncToTextarea();
                this.updateStats();
            }
        });

        this.editorArea.addEventListener("dragend", () => {
            if (this.draggedImage) {
                this.draggedImage.style.opacity = "1";
                this.draggedImage = null;
            }
        });

        // 10. Dán ảnh trực tiếp từ Clipboard (Ctrl + V)
        this.editorArea.addEventListener("paste", (e) => {
            const clipboardData =
                e.clipboardData || e.originalEvent?.clipboardData;
            if (clipboardData && clipboardData.items) {
                for (let item of clipboardData.items) {
                    if (
                        item.kind === "file" &&
                        item.type.startsWith("image/")
                    ) {
                        const file = item.getAsFile();
                        this.handleImageUpload(file);
                        e.preventDefault();
                        break;
                    }
                }
            }
        });

        // 11. Tương tác với vùng soạn thảo
        this.editorArea.addEventListener("keyup", () => {
            this.saveSelection();
            this.updateToolbarState();
            this.updateStats();
            this.syncToTextarea();
        });

        this.editorArea.addEventListener("mouseup", () => {
            this.saveSelection();
            this.updateToolbarState();
        });

        this.editorArea.addEventListener("input", () => {
            this.syncToTextarea();
            this.updateStats();
        });

        this.sourceArea.addEventListener("input", () => {
            this.syncToTextarea();
            this.updateStats();
        });

        // 12. Modal Preview Controls
        this.modal
            .querySelector(".rte-modal-close")
            .addEventListener("click", () => this.closePreview());
        this.modal
            .querySelector('[data-modal-action="close"]')
            .addEventListener("click", () => this.closePreview());
        this.modal
            .querySelector('[data-modal-action="print"]')
            .addEventListener("click", () => {
                const printWin = window.open("", "_blank");
                printWin.document.write(`
                <html>
                <head>
                    <title>In nội dung bài viết</title>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; padding: 30px; }
                        img { max-width: 100%; height: auto; }
                        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
                        table, th, td { border: 1px solid #ccc; padding: 8px; }
                        .rte-callout { padding: 12px; margin: 10px 0; border-left: 4px solid #16a34a; background: #f0fdf4; }
                        .rte-video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; }
                        .rte-video-wrapper iframe { position: absolute; width: 100%; height: 100%; }
                    </style>
                </head>
                <body>${this.modalBody.innerHTML}</body>
                </html>
            `);
                printWin.document.close();
                printWin.focus();
                printWin.print();
                printWin.close();
            });

        // Phím tắt ESC
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                this.closePreview();
                this.closeAllMenus();
            }
        });

        this.modal.addEventListener("click", (e) => {
            if (e.target === this.modal) this.closePreview();
        });

        // 13. Tự động đồng bộ trước khi Form Submit
        const form = this.textarea.closest("form");
        if (form) {
            form.addEventListener("submit", () => {
                this.syncToTextarea();
            });
        }
    }

    /**
     * Điều phối các hành động đặc biệt
     */
    handleAction(action) {
        switch (action) {
            case "upload-image":
                this.saveSelection();
                this.fileInput.click();
                break;

            case "insert-video":
                this.insertYouTubeVideo();
                break;

            case "insert-badge":
                this.insertBadge();
                break;

            case "toggle-dark-mode":
                this.toggleDarkMode();
                break;

            case "toggle-mic":
                this.toggleVoiceTyping();
                break;

            case "insert-callout":
                this.insertCalloutBox();
                break;

            case "toggle-emoji":
                this.saveSelection();
                if (this.emojiPopover) {
                    const isOpen =
                        this.emojiPopover.classList.contains("is-open");
                    this.closeAllMenus();
                    if (!isOpen) {
                        this.emojiPopover.classList.add("is-open");
                        this.emojiPopover.style.left = "";
                        this.emojiPopover.style.right = "";
                        const rect = this.emojiPopover.getBoundingClientRect();
                        if (rect.right > window.innerWidth - 8) {
                            this.emojiPopover.style.left = "auto";
                            this.emojiPopover.style.right = "0";
                        }
                    }
                }
                break;

            case "insert-link":
                this.saveSelection();
                const url = prompt(
                    "Nhập đường dẫn liên kết (URL):",
                    "https://",
                );
                if (url && url.trim() !== "" && url !== "https://") {
                    this.restoreSelection();
                    this.executeCommand("createLink", url.trim());
                }
                break;

            case "insert-table":
                this.saveSelection();
                const rows = parseInt(prompt("Nhập số hàng:", "3"), 10);
                const cols = parseInt(prompt("Nhập số cột:", "3"), 10);
                if (rows > 0 && cols > 0) {
                    let tableHTML = "<table><tbody>";
                    for (let r = 0; r < rows; r++) {
                        tableHTML += "<tr>";
                        for (let c = 0; c < cols; c++) {
                            tableHTML += `<td>Ô ${r + 1}-${c + 1}</td>`;
                        }
                        tableHTML += "</tr>";
                    }
                    tableHTML += "</tbody></table><p><br></p>";
                    this.insertHTML(tableHTML);
                }
                break;

            case "table-add-row-below":
                this.tableAddRowBelow();
                break;

            case "table-add-col-right":
                this.tableAddColRight();
                break;

            case "table-delete-row":
                this.tableDeleteRow();
                break;

            case "table-delete-col":
                this.tableDeleteCol();
                break;

            case "table-delete-table":
                this.tableDeleteTable();
                break;

            case "preview":
                this.openPreview();
                break;

            case "toggle-source":
                this.toggleSourceView();
                break;

            case "toggle-fullscreen":
                this.toggleFullscreen();
                break;

            case "new-doc":
                if (
                    confirm(
                        "Bạn có chắc muốn tạo mới? Toàn bộ nội dung hiện tại sẽ bị xóa.",
                    )
                ) {
                    this.setContent("<p><br></p>");
                    this.syncToTextarea();
                }
                break;

            case "clear-all":
                if (confirm("Xóa sạch nội dung trong khung soạn thảo?")) {
                    this.setContent("<p><br></p>");
                    this.syncToTextarea();
                }
                break;

            case "print-doc":
                this.openPreview();
                break;

            case "export-doc":
                this.exportWordDocument();
                break;

            case "find-replace":
                this.findAndReplace();
                break;

            case "export-html":
                const content = this.getContent();
                const blob = new Blob([content], {
                    type: "text/html;charset=utf-8",
                });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `document_${Date.now()}.html`;
                link.click();
                break;
        }
    }

    /**
     * Lấy instance RTE từ một textarea bất kỳ
     */
    static getInstance(target) {
        const el =
            typeof target === "string"
                ? document.querySelector(target)
                : target;
        return el ? el._rte : null;
    }

    /**
     * Khởi tạo tự động
     */
    static init(
        target = "textarea.rich-editor, textarea[data-rich-editor]",
        options = {},
    ) {
        const elements =
            typeof target === "string"
                ? document.querySelectorAll(target)
                : target.length !== undefined
                  ? target
                  : [target];

        const instances = [];
        elements.forEach((el) => {
            if (!el._rte) {
                instances.push(new RichTextEditor(el, options));
            }
        });
        return instances;
    }
}

// Tự động khởi tạo cho tất cả các <textarea class="rich-editor"> khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
    RichTextEditor.init("textarea.rich-editor, textarea[data-rich-editor]");
});

// Xuất ra window
window.RichTextEditor = RichTextEditor;
