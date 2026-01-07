// Elsakr QR Code Generator - JavaScript Logic

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const tabButtons = document.querySelectorAll('.tab-btn');
    const generateBtn = document.getElementById('generate-btn');
    const downloadPngBtn = document.getElementById('download-png');
    const downloadSvgBtn = document.getElementById('download-svg');
    const copyBtn = document.getElementById('copy-btn');
    const fgColorPicker = document.getElementById('fg-color');
    const bgColorPicker = document.getElementById('bg-color');
    const fgColorLabel = document.getElementById('fg-color-label');
    const bgColorLabel = document.getElementById('bg-color-label');
    const logoInput = document.getElementById('logo-input');
    const logoDropzone = document.getElementById('logo-dropzone');
    const logoPlaceholder = document.getElementById('logo-placeholder');
    const logoPreviewContainer = document.getElementById('logo-preview-container');
    const logoPreview = document.getElementById('logo-preview');
    const removeLogoBtn = document.getElementById('remove-logo');
    const qrContainer = document.getElementById('qr-container');
    const resetColorsBtn = document.getElementById('reset-colors-btn');
    const enableFrameCheckbox = document.getElementById('enable-frame');
    const frameTextInput = document.getElementById('frame-text');
    const frameOptions = document.getElementById('frame-options');
    
    // New color pickers for frame
    const logoBgColorPicker = document.getElementById('logo-bg-color');
    const textColorPicker = document.getElementById('text-color');
    const textBgColorPicker = document.getElementById('text-bg-color');

    let currentType = 'url';
    let logoImage = null;
    let qrCode = null;
    let finalCanvas = null;

    // Input containers
    const inputContainers = {
        url: document.getElementById('url-inputs'),
        text: document.getElementById('text-inputs'),
        wifi: document.getElementById('wifi-inputs'),
        email: document.getElementById('email-inputs'),
        sms: document.getElementById('sms-inputs')
    };

    // Tab switching
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            Object.keys(inputContainers).forEach(key => {
                inputContainers[key].classList.add('hidden');
            });
            inputContainers[type].classList.remove('hidden');
            
            currentType = type;
        });
    });

    // Frame checkbox toggle
    enableFrameCheckbox.addEventListener('change', function() {
        frameOptions.style.opacity = this.checked ? '1' : '0.5';
        frameTextInput.disabled = !this.checked;
        if (qrCode) generateQR();
    });

    // Reset Colors
    resetColorsBtn.addEventListener('click', function() {
        fgColorPicker.value = '#000000';
        bgColorPicker.value = '#ffffff';
        fgColorLabel.textContent = '#000000';
        bgColorLabel.textContent = '#FFFFFF';
        if (logoBgColorPicker) logoBgColorPicker.value = '#ffffff';
        if (textColorPicker) textColorPicker.value = '#ffffff';
        if (textBgColorPicker) textBgColorPicker.value = '#000000';
        if (qrCode) generateQR();
    });

    // Color picker updates
    fgColorPicker.addEventListener('input', function() {
        fgColorLabel.textContent = this.value.toUpperCase();
    });
    
    bgColorPicker.addEventListener('input', function() {
        bgColorLabel.textContent = this.value.toUpperCase();
    });

    // Logo upload
    logoDropzone.addEventListener('click', () => logoInput.click());
    
    logoDropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        logoDropzone.style.borderColor = '#8b5cf6';
    });
    
    logoDropzone.addEventListener('dragleave', () => {
        logoDropzone.style.borderColor = '';
    });
    
    logoDropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        logoDropzone.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleLogoUpload(file);
        }
    });
    
    logoInput.addEventListener('change', function() {
        if (this.files[0]) {
            handleLogoUpload(this.files[0]);
        }
    });

    function handleLogoUpload(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            logoImage = new Image();
            logoImage.onload = function() {
                logoPreview.src = e.target.result;
                logoPlaceholder.classList.add('hidden');
                logoPreviewContainer.classList.remove('hidden');
            };
            logoImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    removeLogoBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        logoImage = null;
        logoInput.value = '';
        logoPreview.src = '';
        logoPlaceholder.classList.remove('hidden');
        logoPreviewContainer.classList.add('hidden');
    });

    // Generate QR Code
    generateBtn.addEventListener('click', generateQR);

    function getQRData() {
        switch (currentType) {
            case 'url':
                return document.getElementById('url-input').value || 'https://elsakr.company';
            
            case 'text':
                return document.getElementById('text-input').value || 'Hello from Elsakr!';
            
            case 'wifi':
                const ssid = document.getElementById('wifi-ssid').value;
                const password = document.getElementById('wifi-password').value;
                const encryption = document.getElementById('wifi-encryption').value;
                return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
            
            case 'email':
                const emailAddr = document.getElementById('email-address').value;
                const subject = document.getElementById('email-subject').value;
                const body = document.getElementById('email-body').value;
                let mailtoUrl = `mailto:${emailAddr}`;
                const params = [];
                if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
                if (body) params.push(`body=${encodeURIComponent(body)}`);
                if (params.length) mailtoUrl += '?' + params.join('&');
                return mailtoUrl;
            
            case 'sms':
                const smsPhone = document.getElementById('sms-phone').value;
                const smsMessage = document.getElementById('sms-message').value;
                return smsMessage ? `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}` : `sms:${smsPhone}`;
            
            default:
                return 'https://elsakr.company';
        }
    }

    function generateQR() {
        const data = getQRData();
        const fgColor = fgColorPicker.value;
        const bgColor = bgColorPicker.value;
        const enableFrame = enableFrameCheckbox.checked;
        const frameText = frameTextInput.value || 'SCAN ME';
        
        // Frame colors
        const logoBgColor = logoBgColorPicker ? logoBgColorPicker.value : '#ffffff';
        const textColor = textColorPicker ? textColorPicker.value : '#ffffff';
        const textBgColor = textBgColorPicker ? textBgColorPicker.value : '#000000';
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Create hidden div for QR generation
        const tempDiv = document.createElement('div');
        tempDiv.style.display = 'none';
        document.body.appendChild(tempDiv);
        
        qrCode = new QRCode(tempDiv, {
            text: data,
            width: 256,
            height: 256,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Process after QR is rendered
        setTimeout(() => {
            const qrCanvas = tempDiv.querySelector('canvas');
            if (!qrCanvas) {
                document.body.removeChild(tempDiv);
                return;
            }
            
            if (enableFrame) {
                // Create framed QR with logo on top
                createFramedQR(qrCanvas, fgColor, bgColor, frameText, logoBgColor, textColor, textBgColor);
            } else {
                // Just show QR code (with optional center logo for backward compatibility)
                finalCanvas = document.createElement('canvas');
                finalCanvas.width = qrCanvas.width;
                finalCanvas.height = qrCanvas.height;
                const ctx = finalCanvas.getContext('2d');
                ctx.drawImage(qrCanvas, 0, 0);
                
                finalCanvas.style.maxWidth = '100%';
                finalCanvas.style.borderRadius = '16px';
                qrContainer.appendChild(finalCanvas);
            }
            
            document.body.removeChild(tempDiv);
        }, 150);
    }
    
    function createFramedQR(qrCanvas, fgColor, bgColor, frameText, logoBgColor, textColor, textBgColor) {
        const padding = 20;
        const borderWidth = 10;
        const borderRadius = 20;
        const textHeight = 50;
        const logoAreaHeight = logoImage ? 80 : 0;
        const logoSize = 60;
        
        const totalWidth = qrCanvas.width + (padding * 2) + (borderWidth * 2);
        const totalHeight = qrCanvas.height + (padding * 2) + (borderWidth * 2) + textHeight + logoAreaHeight;
        
        const framedCanvas = document.createElement('canvas');
        framedCanvas.width = totalWidth;
        framedCanvas.height = totalHeight;
        
        const ctx = framedCanvas.getContext('2d');
        
        // Draw outer frame (border color)
        ctx.fillStyle = fgColor;
        roundedRect(ctx, 0, 0, totalWidth, totalHeight, borderRadius);
        ctx.fill();
        
        // Draw inner background
        ctx.fillStyle = bgColor;
        roundedRect(ctx, borderWidth, borderWidth, totalWidth - (borderWidth * 2), totalHeight - (borderWidth * 2), borderRadius - 5);
        ctx.fill();
        
        let currentY = borderWidth + padding;
        
        // Draw logo at top if present
        if (logoImage) {
            // Draw logo background (for transparent logos)
            const logoBgX = (totalWidth - logoSize - 20) / 2;
            const logoBgY = currentY;
            ctx.fillStyle = logoBgColor;
            roundedRect(ctx, logoBgX, logoBgY, logoSize + 20, logoSize + 10, 8);
            ctx.fill();
            
            // Draw logo centered
            const logoX = (totalWidth - logoSize) / 2;
            const logoY = currentY + 5;
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
            
            currentY += logoSize + 20;
        }
        
        // Draw QR code
        const qrX = borderWidth + padding;
        const qrY = currentY;
        ctx.drawImage(qrCanvas, qrX, qrY);
        
        currentY += qrCanvas.height + 5;
        
        // Draw text background
        const textBgPadding = 10;
        ctx.fillStyle = textBgColor;
        const textBgWidth = totalWidth - (borderWidth * 2) - (padding * 2) + (textBgPadding * 2);
        const textBgX = borderWidth + padding - textBgPadding;
        const textBgY = currentY;
        roundedRect(ctx, textBgX, textBgY, textBgWidth, textHeight - 10, 8);
        ctx.fill();
        
        // Draw frame text
        ctx.fillStyle = textColor;
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const textY = currentY + (textHeight - 10) / 2;
        ctx.fillText(frameText.toUpperCase(), totalWidth / 2, textY);
        
        // Store and display
        finalCanvas = framedCanvas;
        framedCanvas.style.maxWidth = '100%';
        framedCanvas.style.borderRadius = '16px';
        qrContainer.appendChild(framedCanvas);
    }

    function roundedRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // Download PNG
    downloadPngBtn.addEventListener('click', function() {
        const canvas = finalCanvas || qrContainer.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'elsakr-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert('Please generate a QR code first!');
        }
    });

    // Download SVG
    downloadSvgBtn.addEventListener('click', function() {
        const canvas = finalCanvas || qrContainer.querySelector('canvas');
        if (canvas) {
            const svgData = canvasToSVG(canvas);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'elsakr-qrcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        } else {
            alert('Please generate a QR code first!');
        }
    });
    
    function canvasToSVG(canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${canvas.width}" height="${canvas.height}">
    <image xlink:href="${dataUrl}" width="${canvas.width}" height="${canvas.height}"/>
</svg>`;
    }

    // Copy to clipboard
    copyBtn.addEventListener('click', async function() {
        const canvas = finalCanvas || qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('Please generate a QR code first!');
            return;
        }
        
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ Copied!';
            copyBtn.style.background = '#10b981';
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Copy failed. Try downloading instead.');
        }
    });

    // Generate initial QR code
    generateQR();
});
