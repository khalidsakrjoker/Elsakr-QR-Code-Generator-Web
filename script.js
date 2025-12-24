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

    let currentType = 'url';
    let logoImage = null;
    let qrCode = null;

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
            
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding inputs
            Object.keys(inputContainers).forEach(key => {
                inputContainers[key].classList.add('hidden');
            });
            inputContainers[type].classList.remove('hidden');
            
            currentType = type;
        });
    });

    // Reset Colors
    resetColorsBtn.addEventListener('click', function() {
        fgColorPicker.value = '#000000';
        bgColorPicker.value = '#ffffff';
        fgColorLabel.textContent = '#000000';
        bgColorLabel.textContent = '#FFFFFF';
        // Regenerate to apply changes
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
        
        // Clear previous QR code
        qrContainer.innerHTML = '';
        
        // Create new QR code using qrcodejs library
        qrCode = new QRCode(qrContainer, {
            text: data,
            width: 256,
            height: 256,
            colorDark: fgColor,
            colorLight: bgColor,
            correctLevel: QRCode.CorrectLevel.H
        });
        
        // Add logo overlay after QR is rendered
        if (logoImage) {
            setTimeout(() => {
                addLogoToQR(bgColor);
            }, 100);
        }
    }
    
    function addLogoToQR(bgColor) {
        const qrImg = qrContainer.querySelector('img');
        const qrCanvas = qrContainer.querySelector('canvas');
        
        if (qrCanvas && logoImage) {
            const ctx = qrCanvas.getContext('2d');
            const logoSize = qrCanvas.width * 0.25;
            const logoX = (qrCanvas.width - logoSize) / 2;
            const logoY = (qrCanvas.height - logoSize) / 2;
            
            // Draw background for logo
            ctx.fillStyle = bgColor;
            ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8);
            
            // Draw logo
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
            
            // Update the image element too if it exists
            if (qrImg) {
                qrImg.src = qrCanvas.toDataURL('image/png');
            }
        }
    }

    // Download PNG
    downloadPngBtn.addEventListener('click', function() {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'elsakr-qrcode.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        } else {
            alert('Please generate a QR code first!');
        }
    });

    // Download SVG (fallback to PNG for this library)
    downloadSvgBtn.addEventListener('click', function() {
        const canvas = qrContainer.querySelector('canvas');
        if (canvas) {
            // qrcodejs doesn't support SVG, so we download as PNG with .svg extension
            // Alternatively, convert canvas to SVG
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
        const canvas = qrContainer.querySelector('canvas');
        if (!canvas) {
            alert('Please generate a QR code first!');
            return;
        }
        
        try {
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            
            // Visual feedback
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
