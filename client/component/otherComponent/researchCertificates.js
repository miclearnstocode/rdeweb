window.renderCertificates = function(container, certificatesData, eventInfo) {
    if (!container) {
        console.error('Container element not found')
        return
    }
    
    if (!certificatesData || !Array.isArray(certificatesData)) {
        container.innerHTML = '<div style="color: red; padding: 20px;">Invalid certificate data</div>'
        return
    }
    
    // Clear container
    container.innerHTML = ''
    
    // Background image path
    const backgroundImagePath = '/client/images/certBackground.png'
    
    // Sort certificates by center and category for organization
    const sortedData = [...certificatesData].sort((a, b) => {
        if (a.center !== b.center) return (a.center || '').localeCompare(b.center || '')
        if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '')
        return (a.title || '').localeCompare(b.title || '')
    })
    
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
        /* For screen viewing */
        @media screen {
            .certificate-page {
                box-shadow: 0 0 10px rgba(0,0,0,0.3);
                margin: 20px auto;
                border: 1px solid #ccc;
            }
        }
    `
    document.head.appendChild(style)
    
    // Create a certificate for each presenter
    sortedData.forEach((item) => {
        // Create certificate container
        const certDiv = document.createElement('div')
        certDiv.className = 'certificate-page'
        
        // Background image
        const background = document.createElement('div')
        background.className = 'certificate-background'
        
        const bgImg = document.createElement('img')
        bgImg.src = backgroundImagePath;
        bgImg.alt = 'Certificate Background'
        bgImg.onerror = function() {
            // Fallback if background image not found
            this.style.display = 'none';
            background.style.backgroundColor = '#f5f5f5'
            background.style.backgroundImage = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)'
            background.style.border = '2px solid #FFD700'
        }
        background.appendChild(bgImg);
        
        // Content overlay - ONLY the dynamic text that changes per certificate
        const content = document.createElement('div')
        content.className = 'certificate-content'
        
        // Format researchers list
        const researchers = item.researchers && Array.isArray(item.researchers) 
            ? item.researchers.join(', ') 
            : (item.researchers || '')
        
        // Certificate content - ONLY the dynamic parts, header and president are in background
        content.innerHTML = `
            <div style="width: 80%; margin: 150px auto 0 auto; text-align: center;">
                <!-- Presenter Name -->
                <div style="font-size: 42px; font-weight: bold; color: #2c3e50; margin-bottom: 10px; text-shadow: 2px 2px 3px rgba(255,255,255,0.8);">
                    ${item.presenter || 'Not specified'}
                </div>
                
                <div style="font-size: 16px; color: #333; margin-bottom: 20px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    PRESENTER
                </div>
                
                <!-- Research Title -->
                <div style="font-size: 22px; font-weight: bold; color: #2c3e50; max-width: 80%; margin-left: auto; margin-right: auto; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    ${item.title}
                </div>
                
                <!-- Category -->
                <div style="font-size: 18px; color: #333; margin-bottom: 20px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    ${item.category} Category
                </div>
                
                <!-- Researchers -->
                <div style="font-size: 16px; color: #666; font-style: italic; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    ${researchers}
                </div>
                
                <div style="font-size: 16px; color: #666; margin-bottom: 20px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    RESEARCHERS
                </div>
                
                <!-- Event Details -->
                <div style="font-size: 20px; font-weight: bold; color: #333; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    ${eventInfo.event}
                </div>
                
                <div style="font-size: 16px; color: #666; margin-bottom: 20px; text-shadow: 1px 1px 2px rgba(255,255,255,0.8);">
                    ${eventInfo.date || ''} at ${eventInfo.venue || ''}
                </div>
                
            </div>
        `
        
        certDiv.appendChild(background);
        certDiv.appendChild(content);
        container.appendChild(certDiv);
    })
}