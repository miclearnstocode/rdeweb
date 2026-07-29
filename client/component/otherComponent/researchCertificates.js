window.renderCertificates = function(container, certificatesData, eventInfo, customBackground = null) {
    if (!container) {
        console.error('Container element not found')
        return
    }
    
    if (!certificatesData || typeof certificatesData !== 'object') {
        container.innerHTML = '<div style="color: red; padding: 20px;">Invalid certificate data</div>'
        return
    }
    
    // Clear container
    container.innerHTML = ''
    
    // Background image path - use custom if provided, otherwise default
    const backgroundImagePath = customBackground || '/client/images/certBackground.png'
    
    // Group by category - data is already grouped from server
    const categories = Object.keys(certificatesData).sort()
    
    // Helper function to determine font size based on title length
    function getTitleFontSize(title) {
        const length = title.length;
        if (length <= 30) return '28px';
        if (length <= 50) return '24px';
        if (length <= 70) return '20px';
        if (length <= 90) return '18px';
        if (length <= 110) return '16px';
        if (length <= 130) return '14px';
        return '12px';
    }
    
    // Helper function to determine margin based on title length
    function getTitleMargin(title) {
        const length = title.length;
        if (length <= 30) return '0 auto 20px auto';
        if (length <= 50) return '0 auto 16px auto';
        if (length <= 70) return '0 auto 14px auto';
        if (length <= 90) return '0 auto 12px auto';
        if (length <= 110) return '0 auto 10px auto';
        return '0 auto 8px auto';
    }
    
    // Helper function to determine if title should use smaller margins for presenter
    function getPresenterMargin(title) {
        const length = title.length;
        if (length <= 30) return '120px auto 10px auto';
        if (length <= 50) return '100px auto 8px auto';
        if (length <= 70) return '80px auto 6px auto';
        if (length <= 90) return '60px auto 4px auto';
        return '40px auto 2px auto';
    }
    
    // page styles to ensure landscape and proper printing
    const style = document.createElement('style')
    style.textContent = `
        @page {
            size: landscape;
            margin: 0;
        }
        body {
            margin: 0;
            padding: 0;
            background: white;
        }
        .certificate-page {
            position: relative;
            width: 29.7cm;  /* A4 landscape width */
            height: 21cm;    /* A4 landscape height */
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0 auto;
            overflow: hidden;
            background: white;
        }
        .certificate-background {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        }
        .certificate-background img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }
        .certificate-content {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: 'Times New Roman', serif;
            box-sizing: border-box;
            padding: 20px;
        }
        /* Category separator page */
        .category-separator {
            position: relative;
            width: 29.7cm;
            height: 21cm;
            page-break-after: always;
            page-break-inside: avoid;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
            border: 3px solid #FFD700;
            border-radius: 10px;
        }
        .category-separator h1 {
            font-size: 48px;
            color: #2c3e50;
            font-family: 'Times New Roman', serif;
            text-transform: uppercase;
            letter-spacing: 5px;
            margin-bottom: 20px;
        }
        .category-separator .subtitle {
            font-size: 24px;
            color: #666;
            font-family: 'Times New Roman', serif;
        }
        /* Word wrap for long titles */
        .certificate-title {
            max-width: 85%;
            margin-left: auto;
            margin-right: auto;
            word-wrap: break-word;
            line-height: 1.3;
            font-weight: bold;
            color: #2c3e50;
            text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
        }
        @media screen {
            .certificate-page, .category-separator {
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
                margin: 20px auto;
                border: 1px solid #ccc;
            }
        }
    `
    document.head.appendChild(style)
    
    // Create certificates by category
    categories.forEach((category) => {
        const items = certificatesData[category]
        if (!items || !Array.isArray(items) || items.length === 0) return
        
        // Sort items by title within category
        const sortedItems = [...items].sort((a, b) => {
            return (a.title || '').localeCompare(b.title || '')
        })
        
        // Add category separator page
        const separator = document.createElement('div')
        separator.className = 'category-separator'
        separator.innerHTML = `
            <h1>${category}</h1>
            <div class="subtitle">Category</div>
        `
        container.appendChild(separator)
        
        // Create certificate for each item in this category
        sortedItems.forEach((item) => {
            // Create certificate container
            const certDiv = document.createElement('div')
            certDiv.className = 'certificate-page'
            
            // Background image
            const background = document.createElement('div')
            background.className = 'certificate-background'
            
            // Check if background is a data URL (base64) or a path
            const bgImg = document.createElement('img')
            
            // If custom background is a data URL, use it directly
            if (backgroundImagePath && backgroundImagePath.startsWith('data:image')) {
                bgImg.src = backgroundImagePath
            } else {
                bgImg.src = backgroundImagePath
            }
            
            bgImg.alt = 'Certificate Background'
            bgImg.onerror = function() {
                // Fallback if background image not found
                this.style.display = 'none';
                background.style.backgroundColor = '#f5f5f5'
                background.style.backgroundImage = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
                background.style.border = '2px solid #FFD700'
            }
            background.appendChild(bgImg);
            
            // Content overlay - with dynamic font sizing
            const content = document.createElement('div')
            content.className = 'certificate-content'
            
            // Format researchers list
            const researchers = item.researchers && Array.isArray(item.researchers) 
                ? item.researchers.join(', ') 
                : (item.researchers || '')
            
            // Get dynamic font sizes based on title length
            const titleFontSize = getTitleFontSize(item.title || '');
            const titleMargin = getTitleMargin(item.title || '');
            const presenterMargin = getPresenterMargin(item.title || '');
            
            // Determine if title is long (adjust spacing)
            const isLongTitle = (item.title || '').length > 70;
            
            // Certificate content with dynamic sizing
            content.innerHTML = `
                <div style="width: 85%; margin: ${presenterMargin}; text-align: center;">
                    <!-- Presenter Name -->
                    <div style="font-size: ${isLongTitle ? '34px' : '42px'}; font-weight: bold; color: #2c3e50; margin-bottom: ${isLongTitle ? '6px' : '10px'}; text-shadow: 2px 2px 3px rgba(255,255,255,0.8);">
                        ${item.presenter || 'Not specified'}
                    </div>
                    
                    <div style="font-size: ${isLongTitle ? '13px' : '16px'}; color: #333; margin-bottom: ${isLongTitle ? '12px' : '20px'}; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                        PRESENTER
                    </div>
                    
                    <!-- Research Title - Dynamic font size -->
                    <div class="certificate-title" style="
                        font-size: ${titleFontSize};
                        margin: ${titleMargin};
                        ${isLongTitle ? 'max-width: 90%;' : ''}
                    ">
                        ${item.title}
                    </div>
                    
                    <!-- Category - Smaller if title is long -->
                    <div style="font-size: ${isLongTitle ? '15px' : '18px'}; color: #333; margin-bottom: ${isLongTitle ? '12px' : '20px'}; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                        ${item.category} Category
                    </div>
                    
                    <!-- Researchers - Smaller if title is long -->
                    <div style="font-size: ${isLongTitle ? '12px' : '16px'}; color: #666; font-style: italic; text-shadow: 1px 1px 2px rgba(255,255,255,0.8); max-width: 90%; margin-left: auto; margin-right: auto; word-wrap: break-word;">
                        ${researchers}
                    </div>
                    
                    <div style="font-size: ${isLongTitle ? '11px' : '16px'}; color: #666; margin-bottom: ${isLongTitle ? '10px' : '20px'}; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                        RESEARCHERS
                    </div>
                    
                    <!-- Event Details - Smaller if title is long -->
                    <div style="font-size: ${isLongTitle ? '16px' : '20px'}; font-weight: bold; color: #333; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                        ${eventInfo.event}
                    </div>
                    
                    <div style="font-size: ${isLongTitle ? '12px' : '16px'}; color: #666; margin-bottom: ${isLongTitle ? '8px' : '20px'}; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                        ${eventInfo.date || ''} at ${eventInfo.venue || ''}
                    </div>
                </div>
            `
            
            certDiv.appendChild(background);
            certDiv.appendChild(content);
            container.appendChild(certDiv);
        })
    })
}