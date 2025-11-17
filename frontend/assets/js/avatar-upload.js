/**
 * 大頭貼上傳管理器
 */
class AvatarUploadManager {
    constructor() {
        this.maxFileSize = 2 * 1024 * 1024; // 2MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.targetSize = 300; // 目標尺寸 300x300
    }

    /**
     * 壓縮並裁切圖片為正方形
     */
    async compressAndCropImage(file) {
        return new Promise((resolve, reject) => {
            // 驗證文件類型
            if (!this.allowedTypes.includes(file.type)) {
                reject(new Error('不支援的圖片格式。請使用 JPG, PNG, GIF 或 WEBP'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    try {
                        // 創建 canvas
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // 計算裁切尺寸（正方形）
                        const minDimension = Math.min(img.width, img.height);
                        const sx = (img.width - minDimension) / 2;
                        const sy = (img.height - minDimension) / 2;

                        // 設置 canvas 尺寸為目標大小
                        canvas.width = this.targetSize;
                        canvas.height = this.targetSize;

                        // 裁切並縮放圖片
                        ctx.drawImage(
                            img,
                            sx, sy, minDimension, minDimension,  // 源裁切區域
                            0, 0, this.targetSize, this.targetSize  // 目標區域
                        );

                        // 轉換為 Blob，使用較高的品質
                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    // 如果壓縮後仍超過 2MB，降低品質
                                    if (blob.size > this.maxFileSize) {
                                        canvas.toBlob(
                                            (smallerBlob) => {
                                                if (smallerBlob && smallerBlob.size <= this.maxFileSize) {
                                                    resolve(smallerBlob);
                                                } else {
                                                    reject(new Error('無法將圖片壓縮到 2MB 以下'));
                                                }
                                            },
                                            'image/jpeg',
                                            0.7
                                        );
                                    } else {
                                        resolve(blob);
                                    }
                                } else {
                                    reject(new Error('圖片壓縮失敗'));
                                }
                            },
                            'image/jpeg',
                            0.85
                        );
                    } catch (error) {
                        reject(error);
                    }
                };

                img.onerror = () => reject(new Error('圖片載入失敗'));
                img.src = e.target.result;
            };

            reader.onerror = () => reject(new Error('文件讀取失敗'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 上傳大頭貼到伺服器
     */
    async uploadAvatar(userId, imageBlob) {
        const formData = new FormData();
        formData.append('userId', userId);
        formData.append('avatar', imageBlob, 'avatar.jpg');

        const apiUrl = window.APP_CONFIG ? window.APP_CONFIG.API_BASE_URL : 'http://localhost:3000/api';

        const response = await fetch(`${apiUrl}/leaderboard/avatar`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || '上傳失敗');
        }

        return await response.json();
    }

    /**
     * 顯示圖片預覽
     */
    showPreview(imageBlob, previewElement) {
        const url = URL.createObjectURL(imageBlob);
        previewElement.src = url;

        // 清理 URL
        previewElement.onload = () => {
            URL.revokeObjectURL(url);
        };
    }

    /**
     * 創建文件選擇器並處理上傳
     */
    async selectAndUpload(userId, onProgress, onSuccess, onError) {
        try {
            // 創建文件輸入
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = this.allowedTypes.join(',');

            input.onchange = async (e) => {
                try {
                    const file = e.target.files[0];
                    if (!file) return;

                    if (onProgress) onProgress('正在處理圖片...');

                    // 壓縮並裁切圖片
                    const compressedBlob = await this.compressAndCropImage(file);

                    if (onProgress) onProgress('正在上傳...');

                    // 上傳到伺服器
                    const result = await this.uploadAvatar(userId, compressedBlob);

                    if (onSuccess) onSuccess(result);

                } catch (error) {
                    console.error('Upload error:', error);
                    if (onError) onError(error);
                }
            };

            // 觸發文件選擇
            input.click();

        } catch (error) {
            console.error('Select file error:', error);
            if (onError) onError(error);
        }
    }
}

// 創建全局實例
window.avatarUploadManager = new AvatarUploadManager();
