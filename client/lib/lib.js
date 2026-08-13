export const Base = () => {
    return window.location.origin
}
export const Current = () => {
    return window.location.href
}

export const Path = (dir_index) => {
    let origin = window.location.origin
    let current = window.location.href.replace(origin, '').split('/')
    return current[dir_index]
}
export const LoadLocation = (url) => {
    window.location.assign(url)
}

export const $ = ({ tag, att, text, html, child, elementHandler, style, externalStyle, event, event2, event3, event4, event5 }) => {
    let Tag
    if (externalStyle) {
        const link = document.createElement('link')
        Object.assign(link, {
            rel: 'stylesheet',
            href: externalStyle
        })
        document.head.appendChild(link)
    }
    if (tag) {
        Tag = document.createElement(tag)
    } else {
        console.log('tag is missing..!')
    }
    const events = [event, event2, event3, event4, event5].filter(e => e)
    events.forEach(evt => {
        if (evt) {
            Object.keys(evt).forEach(key => {
                if (key.startsWith('type')) {
                    const suffix = key.replace('type', '')
                    const methodKey = 'method' + suffix
                    if (evt[methodKey]) {
                        Tag.addEventListener(evt[key], evt[methodKey])
                    }
                }
            })
        }
    })

    if (text) {
        Tag.innerText = text
    }
    if (html) {
        Tag.innerHTML = html
    }
    if (att) {
        Object.assign(Tag, att)
    }
    if (elementHandler) {
        elementHandler(Tag)
    }
    if (style) {
        Object.assign(Tag.style, style)
    }
    if (child) {
        child.forEach(val => {
            if (val) Tag.appendChild(val)
        })
    }
    return Tag
}

export const Fragment = ({ child }) => {
    const fragment = document.createDocumentFragment()
    if (child) {
        child.forEach(val => {
            if (val) fragment.appendChild(val)
        })
    }
    return fragment
}

export const Ordinate = ({ width, height, ordinateX, ordinateY }) => {
    return {
        WDX: height / ordinateY,
        WDY: width / ordinateX
    }
}

export const TextAreaExpand = (value) => {
    let numberOfLineBreaks = (value.match(/\n/g) || []).length
    return 2.5 + numberOfLineBreaks * 2.5 + 2
}

export const formatSize = (bytes, decimalPoint) => {
    if (bytes === 0) return 0
    let k = 1024,
        dm = decimalPoint || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
}

export const CanvasRender = ({ pdf, canvas, fileUrl, getSource }) => {
    pdf.ctx = canvas.getContext('2d')
    let currentPage = 1

    const queRender = (num) => {
        if (pdf.Rendering) {
            pdf.pageNumberPending = num
        } else {
            renderPage(num)
        }
    }


    getSource(currentPage, pdf, queRender)


    const renderPage = (num) => {
        pdf.Rendering = true
        pdf.doc.getPage(num).then(page => {
            let viewport = page.getViewport({ scale: pdf.scale })


            canvas.width = viewport.width
            canvas.height = viewport.height


            let renderContext = {
                canvasContext: pdf.ctx,
                viewport: viewport
            }

            let renderTask = page.render(renderContext)
            renderTask.promise.then(() => {
                pdf.Rendering = false
                if (pdf.pageNumberPending !== null) {
                    renderPage(pdf.pageNumberPending)
                    pdf.pageNumberPending = null
                }
            })
        })


    }
    pdfjsLib.getDocument('/' + fileUrl).promise.then(doc => {
        pdf.doc = doc
        renderPage(pdf.pageNumber)
    })
}
export const CapsuOffice = [
    "Crop Science Research & Development Center (CSRDC)",
    "Livestock Research & Development Center (LRDC)",
    "Fisheries Research & Development Center (FRDC)",
    "Food and Industrial Technology Research & Development Center (FITRDC)",
    "Social Science Research & Development Center (SSRDC)",
    "Machinery and Agricultural Technology Engineering Center (MATEC)",
    "Coconut Research and Development Center (Coco RDC)",
    "Extension"
]

// Get center code from display name
export const getCenterCode = (displayName) => {
    if (!displayName) return ""
    if (displayName === "Extension") return "Extension"

    const match = displayName.match(/\(([^)]+)\)/)
    return match ? match[1] : displayName
}

// Get all center codes
export const getCenterCodes = () => {
    return CapsuOffice.map(center => getCenterCode(center))
}

export const Waiting = () => {
    // Check if a loading overlay already exists
    const existingLoader = document.querySelector('.mainLoaderBase');
    if (existingLoader) {
        return existingLoader;
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/lib/loaderStyleLib.css',
        att: {
            className: 'mainLoaderBase'
        },
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '9999'
        },
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'loader'
                }
            })
        ]
    }))
}

export function TextToBase64Barcode(text, prop) {
    var canvas = document.createElement("canvas")
    JsBarcode(canvas, text, prop)
    return canvas.toDataURL("image/png")
}

export function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64)
    var len = binary_string.length
    var bytes = new Uint8Array(len)
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i)
    }
    return bytes.buffer
}

export function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?)/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n)

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }

    return new File([u8arr], filename, { type: mime })
}


export const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"]

export const formatDateLong = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr.includes(' ') ? dateStr.replace(' ', 'T') : dateStr)
    const month = MONTHS[d.getMonth()]
    const day = d.getDate()
    const year = d.getFullYear()
    return `${month} ${day}, ${year}`
}

export const GeneratePDF = async (element, options = {}) => {
    if (!window.html2pdf) {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
        document.head.appendChild(script)
        await new Promise(resolve => script.onload = resolve)
    }

    const defaultOptions = {
        margin: 0,
        filename: options.filename || 'certificate.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    return html2pdf().set({ ...defaultOptions, ...options }).from(element).outputPdf('blob')
}

export const SpecialChar = (userInput) => {
    userInput.addEventListener('keypress', (event) => {
        if (!((event.keyCode >= 65) && (event.keyCode <= 90) || (event.keyCode >= 97) && (event.keyCode <= 122) || (event.keyCode >= 48) && (event.keyCode <= 57))) {
            alert("Special character is not allowed..!")
            event.returnValue = false
        }

    })
}

export const Post = async (src, form) => {
    return await fetch(src, {
        method: 'POST',
        body: form
    })
}

export class Request {
    constructor(src) {
        this.src = src
        this.isPost = false
        this.res = res => res.text()
    }

    Post(formData) {
        this.isPost = true
        this.form = new FormData()
        formData.forEach(val => {
            this.form.append(val.name, val.value)
        })

    }

    Json() {
        this.res = async (res) => {
            const text = await res.text()
            if (!text) return {}
            try {
                return JSON.parse(text)
            } catch (e) {
                console.error('Failed to parse JSON response:', e, 'Raw text:', text)
                return {}
            }
        }
    }

    async Send() {
        if (this.isPost) {
            return await fetch(this.src, {
                method: 'POST',
                body: this.form
            }).then(this.res)
        } else {
            return await fetch(this.src).then(this.res)
        }

    }

}

export const Move = ({ panel, object, getLocation }) => {
    let currentX, currentY, initialX, initialY
    let xOffset = 0
    let yOffset = 0
    let active = false
    let viewerSig = panel
    let imgHolder = object

    //================================================

    viewerSig.addEventListener("touchstart", dragStart, false)
    viewerSig.addEventListener("touchend", dragEnd, false)
    viewerSig.addEventListener("touchmove", drag, false)

    viewerSig.addEventListener("mousedown", dragStart, false)
    viewerSig.addEventListener("mouseup", dragEnd, false)
    viewerSig.addEventListener("mousemove", drag, false)

    function dragStart(e) {

        if (e.type === "touchstart") {

            initialX = e.touches[0].clientX - xOffset
            initialY = e.touches[0].clientY - yOffset
        } else {
            initialX = e.clientX - xOffset
            initialY = e.clientY - yOffset
        }

        if (e.target === imgHolder) {
            active = true
        }
    }

    function dragEnd(e) {
        initialX = currentX
        initialY = currentY

        active = false
    }

    function drag(e) {
        if (active) {
            e.preventDefault()

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX
                currentY = e.touches[0].clientY - initialY
            } else {
                currentX = e.clientX - initialX
                currentY = e.clientY - initialY
            }
            xOffset = currentX
            yOffset = currentY

            setTranslate(currentX, currentY, imgHolder)


        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)"
        getLocation(el)
    }
}

export const TimeConvert = (time) => {
    let state
    let hour
    const [h, m, s] = time
    if (h >= 0 && h < 12) {
        state = "a.m."
        hour = h * 1
    } else {
        state = "p.m."
        if (h === 12 && m > 0) {
            hour = h * 1
        } else {
            hour = h % 12
        }
    }
    return `${hour}:${m}:${s} ${state}`
}

export const Zip = (data) => {
    const zip = new JSZip()
    zip.file("hello.txt", "Hello[p my)6cxsw2q")
    zip.generateAsync({ type: "base64" }).then(function (base64) {
        window.location = "data:application/zipbase64," + base64
    }, function (err) {
        console.log(err)
    })
}

export const ResizeImage = (imageUrl, get) => {
    let reader = new FileReader()
    reader.onload = function (e) {
        let img = document.createElement("img")
        img.onload = function (event) {
            // This line is dynamically creating a canvas element
            let canvas = document.createElement("canvas")
            var MAX_WIDTH = 196
            var MAX_HEIGHT = 196

            var width = img.width
            var height = img.height

            // Change the resizing logic
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width)
                    width = MAX_WIDTH
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height)
                    height = MAX_HEIGHT
                }
            }


            let ctx = canvas.getContext("2d")


            //This line shows the actual resizing of image
            canvas.width = width
            canvas.height = height
            ctx.drawImage(img, 0, 0, width, height)


            //This line is used to display the resized image in the body
            get(canvas.toDataURL(imageUrl.type))
        }
        img.src = e.target.result
    }
    reader.readAsDataURL(imageUrl)

}

export const Dim = (file) => {

    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)
    fileReader.onload = (e) => {
        const img = new Image()
        img.src = e.target.result
        img.onload = (eve) => {
            alert(eve.target.width + "====" + eve.target.height)
        }
    }
}

export const baseCheck = (base, dat) => {
    let key = Object.keys(dat)
    let baseKey = Object.keys(base)
    for (let x = 0; x < key.length; x++) {
        if (dat[key[x]] !== base[baseKey[x]]) {
            return true
        }
    }
    return false
}

export class CanvasPdf {
    constructor(object, pdfLib, docId) {
        this.object = object
        this.pdf = pdfLib
        this.docId = docId
    }
    getFile(file) {
        this.buffer = new Promise(async function (res, rej) {
            setTimeout(async () => {
                res(await fetch('/' + file).then((res) => res.arrayBuffer()))
                res("No data")
            }, 1000)
        })
    }
    pdfDoc() {
        this.buffer.then(async res => {
            this.pdfBuff = await this.pdf.load(res)
            this.pages = this.pdfBuff.getPages()
        })

    }

}

export const SearchMethod = ({ nodeList, textArray, display }) => {
    const list = Array.from(nodeList || []);
    
    if (!list.length) return;
    
    // Get the search text
    let searchText = textArray.map(val => {
        return val.replace('_', ' ').trim();
    });
    
    // Filter out empty search terms
    searchText = searchText.filter(val => val !== '');
    
    // If no search text, show all
    if (searchText.length === 0) {
        list.forEach(node => {
            node.style.display = display || '';
        });
        return;
    }
    
    // Batch the DOM updates
    const updates = [];
    
    // For each node, check if it contains ALL search terms
    list.forEach(node => {
        const nodeText = node.innerText.toUpperCase();
        let matchesAll = true;
        
        for (let text of searchText) {
            if (!nodeText.includes(text.toUpperCase())) {
                matchesAll = false;
                break;
            }
        }
        
        updates.push({
            node: node,
            show: matchesAll
        });
    });
    
    // Apply all updates at once using requestAnimationFrame
    requestAnimationFrame(() => {
        updates.forEach(({ node, show }) => {
            node.style.display = show ? (display || '') : 'none';
        });
    });
}

export const UnderConstruction = ({ message = "This feature is under construction", duration = 3000 }) => {
    let notificationContainer

    const getContainer = (el) => {
        notificationContainer = el

        // Auto remove after duration
        setTimeout(() => {
            if (notificationContainer && notificationContainer.remove) {
                notificationContainer.classList.add('fade-out')
                setTimeout(() => {
                    if (notificationContainer.parentNode) {
                        notificationContainer.remove()
                    }
                }, 300)
            }
        }, duration)
    }

    return ($({
        tag: 'div',
        externalStyle: '/client/lib/loaderStyleLib.css',
        att: {
            className: 'under-construction-notification'
        },
        elementHandler: getContainer,
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'notification-content'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'notification-icon'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: {
                                    className: 'fa-solid fa-tools'
                                }
                            })
                        ]
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'notification-message'
                        },
                        text: message
                    }),
                    $({
                        tag: 'div',
                        att: {
                            className: 'notification-progress'
                        },
                        child: [
                            $({
                                tag: 'div',
                                att: {
                                    className: 'progress-bar'
                                },
                                style: {
                                    animation: `shrink ${duration}ms linear forwards`
                                }
                            })
                        ]
                    })
                ]
            })
        ]
    }))
}

export const ValidatePDF = (file, maxSizeMB = 10) => {
    return new Promise((resolve) => {
        if (!file) {
            resolve({ valid: false, error: 'No file selected' })
            return
        }

        // 1. Basic Extension Check
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            resolve({ valid: false, error: 'Invalid file extension. Expected .pdf' })
            return
        }

        // 2. Size Check
        const maxSizeBytes = maxSizeMB * 1024 * 1024
        if (file.size > maxSizeBytes) {
            resolve({ valid: false, error: 'File is too large. Max size: ' + maxSizeMB + 'MB.' })
            return
        }

        // 3. Magic Number Check (%PDF)
        const reader = new FileReader()
        const blob = file.slice(0, 4)
        reader.onload = (e) => {
            const arr = new Uint8Array(e.target.result)
            let header = ''
            for (let i = 0; i < arr.length; i++) {
                header += String.fromCharCode(arr[i])
            }

            if (header !== '%PDF') {
                resolve({ valid: false, error: 'Invalid document structure (PDF header missing).' })
            } else {
                resolve({ valid: true, error: null })
            }
        }
        reader.onerror = () => resolve({ valid: false, error: 'Failed to read file.' })
        reader.readAsArrayBuffer(blob)
    })
}

export const DeleteConfirmModal = (title = "Delete Record", message = "Are you sure you want to delete this?") => {
    return new Promise((resolve) => {
        const modalId = 'modern-delete-modal-' + Date.now()

        const closeModal = (result) => {
            const overlay = document.getElementById(modalId)
            if (overlay) {
                overlay.style.opacity = '0'
                const content = overlay.querySelector('.modal-content')
                if (content) content.style.transform = 'scale(0.9) translateY(20px)'

                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
                    resolve(result)
                }, 300)
            }
        }

        const modalOverlay = $({
            tag: 'div',
            att: { id: modalId },
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '99999',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target.id === modalId) closeModal(false)
                }
            },
            child: [
                $({
                    tag: 'div',
                    att: { className: 'modal-content' },
                    style: {
                        backgroundColor: '#1e1e1e',
                        width: '90%',
                        maxWidth: '400px',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid #333',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        transform: 'scale(0.9) translateY(20px)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center'
                    },
                    child: [
                        // Warning Icon
                        $({
                            tag: 'div',
                            style: {
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '24px',
                                color: '#f44336',
                                fontSize: '32px'
                            },
                            child: [
                                $({ tag: 'span', att: { className: 'fa-solid fa-trash-can' }, style: { margin: 'auto' } })
                            ]
                        }),
                        // Title
                        $({
                            tag: 'h3',
                            text: title,
                            style: {
                                color: '#fff',
                                fontSize: '20px',
                                fontWeight: '700',
                                margin: '0 0 12px 0'
                            }
                        }),
                        // Message
                        $({
                            tag: 'p',
                            text: message,
                            style: {
                                color: '#aaa',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                margin: '0 0 32px 0'
                            }
                        }),
                        // Buttons
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '12px',
                                width: '100%'
                            },
                            child: [
                                // Cancel Button
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        flex: '1',
                                        backgroundColor: '#333',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '12px 0',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => closeModal(false),
                                        type2: 'mouseenter',
                                        method2: (e) => e.target.style.backgroundColor = '#444',
                                        type3: 'mouseleave',
                                        method3: (e) => e.target.style.backgroundColor = '#333'
                                    }
                                }),
                                // Delete Button
                                $({
                                    tag: 'button',
                                    text: 'Delete',
                                    style: {
                                        flex: '1',
                                        backgroundColor: '#f44336',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '12px 0',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => closeModal(true),
                                        type2: 'mouseenter',
                                        method2: (e) => e.target.style.backgroundColor = '#d32f2f',
                                        type3: 'mouseleave',
                                        method3: (e) => e.target.style.backgroundColor = '#f44336'
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(modalOverlay)

        // Trigger animations
        setTimeout(() => {
            modalOverlay.style.opacity = '1'
            const content = modalOverlay.querySelector('.modal-content')
            if (content) content.style.transform = 'scale(1) translateY(0)'
        }, 10)
    })
}
export const RejectCommentModal = (title = "Reject Document") => {
    return new Promise((resolve) => {
        const modalId = 'reject-comment-modal-' + Date.now()

        const closeModal = (result) => {
            const overlay = document.getElementById(modalId)
            if (overlay) {
                overlay.style.opacity = '0'
                const content = overlay.querySelector('.modal-content')
                if (content) content.style.transform = 'scale(0.9) translateY(20px)'

                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
                    resolve(result)
                }, 300)
            }
        }

        let reasonTextarea

        const handleSubmit = () => {
            const reason = reasonTextarea ? reasonTextarea.value.trim() : ''
            if (!reason) {
                // Highlight textarea if empty
                if (reasonTextarea) {
                    reasonTextarea.style.borderColor = '#f44336'
                    reasonTextarea.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.2)'
                    reasonTextarea.placeholder = 'Please enter a reason for rejection...'
                    setTimeout(() => {
                        reasonTextarea.style.borderColor = '#444'
                        reasonTextarea.style.boxShadow = 'none'
                        reasonTextarea.placeholder = 'Enter detailed reason for rejection...'
                    }, 2000)
                }
                return
            }
            closeModal({ confirmed: true, reason: reason })
        }

        // Handle Enter key to submit (Ctrl+Enter for new line)
        const handleKeydown = (e) => {
            if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
            }
        }

        const modalOverlay = $({
            tag: 'div',
            att: { id: modalId },
            style: {
                position: 'fixed',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '99999',
                opacity: '0',
                transition: 'opacity 0.3s ease',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
            },
            event: {
                type: 'click',
                method: (e) => {
                    if (e.target.id === modalId) closeModal({ confirmed: false, reason: '' })
                }
            },
            child: [
                $({
                    tag: 'div',
                    att: { className: 'modal-content' },
                    style: {
                        backgroundColor: '#1e1e1e',
                        width: '90%',
                        maxWidth: '500px',
                        borderRadius: '24px',
                        padding: '32px',
                        border: '1px solid #333',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        transform: 'scale(0.9) translateY(20px)',
                        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    child: [
                        // Header with icon
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                marginBottom: '24px'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '16px',
                                        backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#f44336',
                                        fontSize: '24px',
                                        flexShrink: '0'
                                    },
                                    child: [
                                        $({ tag: 'span', att: { className: 'fa-solid fa-xmark' }, style: { margin: 'auto' } })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    style: { flex: '1' },
                                    child: [
                                        $({
                                            tag: 'h3',
                                            text: title,
                                            style: {
                                                color: '#fff',
                                                fontSize: '18px',
                                                fontWeight: '700',
                                                margin: '0 0 4px 0'
                                            }
                                        }),
                                        $({
                                            tag: 'p',
                                            text: 'Please provide a reason for rejection',
                                            style: {
                                                color: '#888',
                                                fontSize: '13px',
                                                margin: '0'
                                            }
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Textarea
                        $({
                            tag: 'textarea',
                            style: {
                                width: '100%',
                                minHeight: '120px',
                                backgroundColor: '#2a2a2a',
                                border: '1px solid #444',
                                borderRadius: '12px',
                                color: '#fff',
                                padding: '16px',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                resize: 'vertical',
                                outline: 'none',
                                transition: 'all 0.2s ease',
                                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                                marginBottom: '8px',
                                boxSizing: 'border-box'
                            },
                            att: {
                                placeholder: 'Enter detailed reason for rejection...',
                                autofocus: true
                            },
                            elementHandler: (el) => {
                                reasonTextarea = el
                                el.addEventListener('keydown', handleKeydown)
                                el.addEventListener('focus', () => {
                                    el.style.borderColor = '#f44336'
                                    el.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)'
                                })
                                el.addEventListener('blur', () => {
                                    el.style.borderColor = '#444'
                                    el.style.boxShadow = 'none'
                                })
                            }
                        }),

                        // Character count
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                                padding: '0 4px'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Press Enter to submit, Ctrl+Enter for new line',
                                    style: {
                                        color: '#666',
                                        fontSize: '11px'
                                    }
                                }),
                                $({
                                    tag: 'span',
                                    att: { id: 'char-count' },
                                    text: '0 / 1000',
                                    style: {
                                        color: '#666',
                                        fontSize: '11px'
                                    }
                                })
                            ]
                        }),

                        // Buttons
                        $({
                            tag: 'div',
                            style: {
                                display: 'flex',
                                gap: '12px'
                            },
                            child: [
                                // Cancel Button
                                $({
                                    tag: 'button',
                                    text: 'Cancel',
                                    style: {
                                        flex: '1',
                                        backgroundColor: '#333',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '14px 0',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => closeModal({ confirmed: false, reason: '' }),
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#444'
                                            e.target.style.transform = 'translateY(-1px)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = '#333'
                                            e.target.style.transform = 'translateY(0)'
                                        }
                                    }
                                }),
                                // Reject Button
                                $({
                                    tag: 'button',
                                    text: 'Reject Document',
                                    style: {
                                        flex: '1',
                                        backgroundColor: '#f44336',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '14px 0',
                                        borderRadius: '12px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        boxShadow: '0 4px 12px rgba(244, 67, 54, 0.3)'
                                    },
                                    event: {
                                        type: 'click',
                                        method: handleSubmit,
                                        type2: 'mouseenter',
                                        method2: (e) => {
                                            e.target.style.backgroundColor = '#d32f2f'
                                            e.target.style.transform = 'translateY(-1px)'
                                            e.target.style.boxShadow = '0 6px 16px rgba(244, 67, 54, 0.4)'
                                        },
                                        type3: 'mouseleave',
                                        method3: (e) => {
                                            e.target.style.backgroundColor = '#f44336'
                                            e.target.style.transform = 'translateY(0)'
                                            e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.3)'
                                        }
                                    }
                                })
                            ]
                        })
                    ]
                })
            ]
        })

        document.body.appendChild(modalOverlay)

        // Trigger animations
        setTimeout(() => {
            modalOverlay.style.opacity = '1'
            const content = modalOverlay.querySelector('.modal-content')
            if (content) content.style.transform = 'scale(1) translateY(0)'

            // Focus textarea
            if (reasonTextarea) {
                reasonTextarea.focus()
            }
        }, 10)

        // Character count update
        if (reasonTextarea) {
            reasonTextarea.addEventListener('input', () => {
                const count = document.getElementById('char-count')
                if (count) {
                    const length = reasonTextarea.value.length
                    count.textContent = `${length} / 1000`
                    count.style.color = length > 900 ? '#f44336' : length > 750 ? '#ff9800' : '#666'
                }
            })
        }
    })
}

export const FileViewerModal = (fileUrl, title = 'File Preview', accentColor = '#ff9800', options = {}) => {
    const { showOpenDrive = true, onPrint = null } = options
    const modalId = 'file-viewer-modal-' + Date.now()

    const closeModal = () => {
        const overlay = document.getElementById(modalId)
        if (overlay) {
            overlay.style.opacity = '0'
            overlay.style.transform = 'scale(1.02)'
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
            }, 250)
        }
    }

    const modalOverlay = $({
        tag: 'div',
        att: { id: modalId },
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '999999',
            opacity: '0',
            transition: 'opacity 0.25s ease, transform 0.25s ease',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        },
        event: {
            type: 'click',
            method: (e) => { if (e.target.id === modalId) closeModal() }
        },
        child: [
            // Modal container
            $({
                tag: 'div',
                style: {
                    display: 'flex',
                    flexDirection: 'column',
                    width: '92vw',
                    maxWidth: '1100px',
                    height: '90vh',
                    backgroundColor: '#1a1a1a',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 32px 64px rgba(0,0,0,0.6)',
                    border: '1px solid #333'
                },
                child: [
                    // Header bar
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 20px',
                            backgroundColor: '#222',
                            borderBottom: `3px solid ${accentColor}`,
                            flexShrink: '0'
                        },
                        child: [
                            // Title
                            $({
                                tag: 'div',
                                style: { display: 'flex', alignItems: 'center', gap: '12px' },
                                child: [
                                    $({
                                        tag: 'span',
                                        att: { className: 'fa-solid fa-file-lines' },
                                        style: { color: accentColor, fontSize: '18px' }
                                    }),
                                    $({
                                        tag: 'span',
                                        text: title,
                                        style: {
                                            color: '#fff',
                                            fontSize: '15px',
                                            fontWeight: '600',
                                            letterSpacing: '0.3px'
                                        }
                                    })
                                ]
                            }),
                            // Action buttons
                            $({
                                tag: 'div',
                                style: { display: 'flex', gap: '10px', alignItems: 'center' },
                                child: [
                                    // Print button
                                    onPrint ? $({
                                        tag: 'button',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '7px 14px',
                                            backgroundColor: 'rgba(33, 150, 243, 0.1)',
                                            border: '1px solid rgba(33, 150, 243, 0.3)',
                                            borderRadius: '8px',
                                            color: '#2196F3',
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease'
                                        },
                                        child: [
                                            $({ tag: 'span', att: { className: 'fa-solid fa-print' }, style: { fontSize: '11px' } }),
                                            $({ tag: 'span', text: 'Print' })
                                        ],
                                        event: {
                                            type: 'click',
                                            method: () => {
                                                const iframe = document.getElementById(modalId + '-iframe')
                                                onPrint(iframe)
                                            },
                                            type2: 'mouseenter',
                                            method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.2)' },
                                            type3: 'mouseleave',
                                            method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(33, 150, 243, 0.1)' }
                                        }
                                    }) : null,
                                    // Open in new tab button
                                    showOpenDrive ? $({
                                        tag: 'a',
                                        att: { href: fileUrl, target: '_blank', rel: 'noopener noreferrer' },
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '7px 14px',
                                            backgroundColor: 'rgba(255,255,255,0.08)',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: '#ccc',
                                            fontSize: '12px',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            transition: 'all 0.2s ease'
                                        },
                                        child: [
                                            $({ tag: 'span', att: { className: 'fa-solid fa-external-link-alt' }, style: { fontSize: '11px' } }),
                                            $({ tag: 'span', text: 'Open in Drive' })
                                        ],
                                        event: {
                                            type: 'mouseenter',
                                            method: (e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'; e.currentTarget.style.color = '#fff' },
                                            type2: 'mouseleave',
                                            method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#ccc' }
                                        }
                                    }) : null,
                                    // Close button
                                    $({
                                        tag: 'button',
                                        style: {
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: 'rgba(255,255,255,0.05)',
                                            border: '1px solid #444',
                                            borderRadius: '8px',
                                            color: '#888',
                                            fontSize: '16px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease'
                                        },
                                        child: [
                                            $({ tag: 'span', att: { className: 'fa-solid fa-xmark' } })
                                        ],
                                        event: {
                                            type: 'click',
                                            method: closeModal,
                                            type2: 'mouseenter',
                                            method2: (e) => { e.currentTarget.style.backgroundColor = 'rgba(244,67,54,0.15)'; e.currentTarget.style.borderColor = '#f44336'; e.currentTarget.style.color = '#f44336' },
                                            type3: 'mouseleave',
                                            method3: (e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#444'; e.currentTarget.style.color = '#888' }
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    // Iframe viewer
                    $({
                        tag: 'iframe',
                        att: {
                            id: modalId + '-iframe',
                            src: fileUrl,
                            frameborder: '0',
                            allowfullscreen: true,
                            loading: 'lazy'
                        },
                        style: {
                            flex: '1',
                            width: '100%',
                            border: 'none',
                            backgroundColor: '#111'
                        }
                    })
                ]
            })
        ]
    })

    document.body.appendChild(modalOverlay)

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalOverlay.style.opacity = '1'
        })
    })

    // ESC key to close
    const handleKey = (e) => {
        if (e.key === 'Escape') {
            closeModal()
            document.removeEventListener('keydown', handleKey)
        }
    }
    document.addEventListener('keydown', handleKey)
}

export const ConfirmationAlert = (message, eventClose, options = {}) => {
    const { 
        title = 'Success', 
        icon = 'fa-circle-check',
        iconColor = '#4caf50',
        buttonText = 'OK',
        buttonColor = '#4caf50',
        type = 'success',
        duration = 4000,
        position = 'top-right'
    } = options;
    
    let toastElement = null;
    let timeoutId = null;
    let isClosed = false;

    // Close function
    const closeToast = (e) => {
        if (isClosed) return;
        isClosed = true;
        
        if (e) e.stopPropagation();
        if (timeoutId) clearTimeout(timeoutId);
        
        if (toastElement) {
            toastElement.classList.remove('active');
            toastElement.classList.add('closing');
            
            setTimeout(() => {
                if (toastElement && toastElement.parentNode) {
                    toastElement.parentNode.removeChild(toastElement);
                }
                // Remove container if empty
                const container = document.getElementById('confirmation-toast-container');
                if (container && container.children.length === 0) {
                    container.remove();
                }
                if (eventClose && typeof eventClose === 'function') {
                    eventClose();
                }
            }, 400);
        } else {
            if (eventClose && typeof eventClose === 'function') {
                eventClose();
            }
        }
    };

    // Get icon HTML - Using Font Awesome
    const getIconHtml = () => {
        // Font Awesome icons mapping
        const icons = {
            'fa-circle-check': `<i class="fa-solid fa-circle-check" style="font-size: 24px; color: ${iconColor};"></i>`,
            'fa-circle-check': `<i class="fa-regular fa-circle-check" style="font-size: 24px; color: ${iconColor};"></i>`,
            'fa-check-circle': `<i class="fa-solid fa-check-circle" style="font-size: 24px; color: ${iconColor};"></i>`,
            'fa-circle-xmark': `<i class="fa-solid fa-circle-xmark" style="font-size: 24px; color: ${iconColor};"></i>`,
            'fa-triangle-exclamation': `<i class="fa-solid fa-triangle-exclamation" style="font-size: 24px; color: ${iconColor};"></i>`,
            'fa-circle-info': `<i class="fa-solid fa-circle-info" style="font-size: 24px; color: ${iconColor};"></i>`
        };
        
        // Check if using Font Awesome icon
        if (icon && icon.startsWith('fa-')) {
            return icons[icon] || icons['fa-circle-check'];
        }
        
        // Fallback: use SVG
        const svgIcons = {
            'check-circle': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="${iconColor}"/>
            </svg>`,
            'error': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="${iconColor}"/>
            </svg>`,
            'warning': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="${iconColor}"/>
            </svg>`,
            'info': `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:24px;height:24px;">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="${iconColor}"/>
            </svg>`
        };
        return svgIcons[icon] || svgIcons['check-circle'];
    };

    // Position styles
    const positionStyles = {
        'top-right': { top: '20px', right: '20px', transform: 'translateX(calc(100% + 20px))' },
        'top-left': { top: '20px', left: '20px', transform: 'translateX(calc(-100% - 20px))' },
        'bottom-right': { bottom: '20px', right: '20px', transform: 'translateX(calc(100% + 20px))' },
        'bottom-left': { bottom: '20px', left: '20px', transform: 'translateX(calc(-100% - 20px))' },
        'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%) translateY(-100px)' },
        'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%) translateY(100px)' }
    };

    const pos = positionStyles[position] || positionStyles['top-right'];

    // Create toast container if it doesn't exist
    let container = document.getElementById('confirmation-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'confirmation-toast-container';
        container.className = 'confirmation-toast-container';
        container.style.cssText = `
            position: fixed;
            z-index: 99999;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            gap: 12px;
            max-width: 450px;
            width: 100%;
            ${position === 'top-right' || position === 'top-left' || position === 'top-center' ? 'top: 20px;' : 'bottom: 20px;'}
            ${position === 'top-right' || position === 'bottom-right' ? 'right: 20px;' : ''}
            ${position === 'top-left' || position === 'bottom-left' ? 'left: 20px;' : ''}
            ${position === 'top-center' || position === 'bottom-center' ? 'left: 50%; transform: translateX(-50%);' : ''}
        `;
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `confirmation-toast confirmation-toast-${type}`;
    toast.style.cssText = `
        background: #ffffff;
        border-radius: 14px;
        padding: 18px 22px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12);
        border-left: 5px solid ${iconColor};
        display: flex;
        align-items: flex-start;
        gap: 14px;
        pointer-events: auto;
        opacity: 0;
        transform: ${pos.transform};
        transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        max-width: 100%;
        position: relative;
        overflow: hidden;
        border: 1px solid #f1f3f5;
    `;

    // Icon wrapper
    const iconWrapper = document.createElement('div');
    iconWrapper.className = 'confirmation-toast-icon';
    iconWrapper.style.cssText = `
        flex-shrink: 0;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: ${iconColor}12;
        border-radius: 50%;
    `;
    
    // Use Font Awesome icon
    if (icon && icon.startsWith('fa-')) {
        const faIcon = document.createElement('i');
        faIcon.className = icon;
        faIcon.style.cssText = `font-size: 20px; color: ${iconColor};`;
        iconWrapper.appendChild(faIcon);
    } else {
        iconWrapper.innerHTML = getIconHtml();
    }

    // Content
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'confirmation-toast-content';
    contentWrapper.style.cssText = `
        flex: 1;
        min-width: 0;
        padding-top: 2px;
    `;

    let titleHtml = '';
    if (title) {
        titleHtml = `<div class="confirmation-toast-title" style="font-weight:600;font-size:15px;color:#1a1a2e;margin-bottom:3px;">${title}</div>`;
    }

    contentWrapper.innerHTML = `
        ${titleHtml}
        <div class="confirmation-toast-message" style="font-size:13px;color:#495057;line-height:1.6;word-wrap:break-word;">${message}</div>
    `;

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'confirmation-toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        font-size: 22px;
        color: #adb5bd;
        cursor: pointer;
        padding: 0 4px;
        flex-shrink: 0;
        line-height: 1;
        transition: all 0.2s ease;
        margin-top: -2px;
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.color = '#495057';
        closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.color = '#adb5bd';
        closeBtn.style.transform = 'scale(1)';
    });
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeToast(e);
    });

    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'confirmation-toast-progress';
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: #e9ecef;
    `;
    
    const progressInner = document.createElement('div');
    progressInner.className = 'confirmation-toast-progress-inner';
    progressInner.style.cssText = `
        height: 100%;
        width: 100%;
        background: ${iconColor};
        animation: progress-shrink ${duration}ms linear forwards;
        border-radius: 0 0 0 2px;
    `;
    progressBar.appendChild(progressInner);

    // Build toast
    toast.appendChild(iconWrapper);
    toast.appendChild(contentWrapper);
    toast.appendChild(closeBtn);
    toast.appendChild(progressBar);

    // Add to container
    container.appendChild(toast);
    toastElement = toast;

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.classList.add('active');
            toast.style.opacity = '1';
            if (position === 'top-right' || position === 'bottom-right' || position === 'top-left' || position === 'bottom-left') {
                toast.style.transform = 'translateX(0)';
            } else if (position === 'top-center') {
                toast.style.transform = 'translateX(-50%) translateY(0)';
            } else if (position === 'bottom-center') {
                toast.style.transform = 'translateX(-50%) translateY(0)';
            }
        });
    });

    // Auto close
    if (duration > 0) {
        timeoutId = setTimeout(() => {
            closeToast();
        }, duration);
    }

    // Click on toast to dismiss
    toast.addEventListener('click', (e) => {
        if (e.target === toast) {
            closeToast(e);
        }
    });

    // Return close function
    return {
        close: closeToast,
        element: toast
    };
};

export const ConfirmationModal = ({ title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel', type = 'info' }) => {
    let modalInstance

    const footer = ({ closeModal }) => {
        // If there's no onCancel provided, only show the confirm button
        if (!onCancel && type !== 'confirm') {
            return $({
                tag: 'div',
                style: { display: 'flex', gap: '12px', justifyContent: 'center' },
                child: [
                    $({
                        tag: 'button',
                        text: confirmText,
                        style: {
                            padding: '10px 30px',
                            backgroundColor: getButtonColor(),
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'all 0.2s ease'
                        },
                        event: {
                            type: 'click',
                            method: () => {
                                closeModal()
                                if (onConfirm) onConfirm()
                            }
                        }
                    })
                ]
            })
        }
        
        return $({
            tag: 'div',
            style: { display: 'flex', gap: '12px', justifyContent: 'flex-end' },
            child: [
                $({
                    tag: 'button',
                    text: cancelText,
                    style: {
                        padding: '8px 20px',
                        backgroundColor: '#444',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            closeModal()
                            if (onCancel) onCancel()
                        }
                    }
                }),
                $({
                    tag: 'button',
                    text: confirmText,
                    style: {
                        padding: '8px 24px',
                        backgroundColor: getButtonColor(),
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            closeModal()
                            if (onConfirm) onConfirm()
                        }
                    }
                })
            ]
        })
    }
    
    // Helper function to get button color based on type
    const getButtonColor = () => {
        switch(type) {
            case 'success':
                return '#4CAF50' // Green
            case 'error':
                return '#f44336' // Red
            case 'warning':
                return '#ff9800' // Orange
            case 'confirm':
                return '#2196F3' // Blue
            default:
                return '#4CAF50' // Default green for info/success
        }
    }
    
    // Helper function to get icon based on type
    const getIcon = () => {
        switch(type) {
            case 'success':
                return { icon: 'fas fa-check-circle', color: '#4CAF50' }
            case 'error':
                return { icon: 'fas fa-times-circle', color: '#f44336' }
            case 'warning':
                return { icon: 'fas fa-exclamation-triangle', color: '#ff9800' }
            case 'confirm':
                return { icon: 'fas fa-question-circle', color: '#2196F3' }
            default:
                return { icon: 'fas fa-info-circle', color: '#4CAF50' }
        }
    }

    const iconData = getIcon()
    const content = $({
        tag: 'div',
        style: { textAlign: 'center', padding: '20px 0' },
        child: [
            $({ 
                tag: 'i', 
                att: { className: iconData.icon }, 
                style: { fontSize: '48px', color: iconData.color, marginBottom: '16px', display: 'block' } 
            }),
            $({ tag: 'p', text: message, style: { color: '#ccc', fontSize: '15px', lineHeight: '1.5', margin: 0 } })
        ]
    })

    modalInstance = CustomModal({
        title,
        content,
        footer,
        size: 'small',
        closeOnOverlayClick: false
    })

    return modalInstance
}

export const CustomModal = ({
    title = 'Modal',
    content = null,
    size = 'medium',
    onClose = null,
    showCloseButton = true,
    closeOnOverlayClick = true,
    footer = null
}) => {
    const modalId = 'custom-modal-' + Date.now()

    // Size configurations
    const sizes = {
        small: { width: '400px', maxWidth: '90%' },
        medium: { width: '800px', maxWidth: '90%' },
        large: { width: '1100px', maxWidth: '95%' },
        full: { width: '95%', maxWidth: '95%', height: '90vh' }
    }

    const selectedSize = sizes[size] || sizes.medium

    const closeModal = () => {
        const overlay = document.getElementById(modalId)
        if (overlay) {
            overlay.style.opacity = '0'
            overlay.style.transform = 'scale(0.98)'
            setTimeout(() => {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay)
                if (onClose && typeof onClose === 'function') onClose()
            }, 250)
        }
    }

    const modalOverlay = $({
        tag: 'div',
        att: { id: modalId },
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1003',
            opacity: '0',
            transform: 'scale(0.98)',
            transition: 'opacity 0.25s ease, transform 0.25s ease'
        },
        event: closeOnOverlayClick ? {
            type: 'click',
            method: (e) => { if (e.target.id === modalId) closeModal() }
        } : {}
    })

    // Modal container - Modern white styling
    const modalContainer = $({
        tag: 'div',
        style: {
            display: 'flex',
            flexDirection: 'column',
            width: selectedSize.width,
            maxWidth: selectedSize.maxWidth,
            height: selectedSize.height || 'auto',
            maxHeight: '85vh',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid #e8ecf0'
        }
    })

    // Header - Modern white styling
    const headerEl = $({
        tag: 'div',
        style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 28px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e8ecf0',
            flexShrink: '0'
        },
        child: [
            $({
                tag: 'h3',
                text: title,
                style: {
                    color: '#1a2a3a',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    letterSpacing: '-0.2px'
                }
            }),
            showCloseButton ? $({
                tag: 'button',
                style: {
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e8ecf0',
                    borderRadius: '10px',
                    color: '#94a3b8',
                    fontSize: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                },
                child: [
                    $({ tag: 'span', html: '&times;', style: { fontSize: '22px', lineHeight: '1', fontWeight: '400' } })
                ],
                event: {
                    type: 'click',
                    method: closeModal,
                    type2: 'mouseenter',
                    method2: (e) => {
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.borderColor = '#fecaca';
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.transform = 'scale(1.02)';
                    },
                    type3: 'mouseleave',
                    method3: (e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.borderColor = '#e8ecf0';
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.transform = 'scale(1)';
                    }
                }
            }) : null
        ]
    })

    // Content area - Modern white styling
    const contentArea = $({
        tag: 'div',
        style: {
            flex: '1',
            overflow: 'auto',
            padding: '28px',
            backgroundColor: '#ffffff',
            color: '#334155'
        }
    })

    if (content) {
        if (typeof content === 'function') {
            const contentResult = content({ closeModal })
            if (contentResult && typeof contentResult === 'object' && (contentResult.tagName || contentResult.appendChild)) {
                contentArea.appendChild(contentResult)
            } else if (contentResult && typeof contentResult === 'string') {
                contentArea.innerHTML = contentResult
            }
        } else if (content.tagName || content.appendChild) {
            contentArea.appendChild(content)
        } else if (typeof content === 'string') {
            contentArea.innerHTML = content
        }
    }

    modalContainer.appendChild(headerEl)
    modalContainer.appendChild(contentArea)

    // Footer - Modern white styling - FIXED null check
    if (footer !== null && footer !== undefined) {
        const footerEl = $({
            tag: 'div',
            style: {
                padding: '16px 28px',
                borderTop: '1px solid #e8ecf0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                backgroundColor: '#ffffff',
                flexShrink: '0'
            }
        })

        if (typeof footer === 'function') {
            const footerResult = footer({ closeModal })
            if (footerResult && typeof footerResult === 'object' && (footerResult.tagName || footerResult.appendChild)) {
                footerEl.appendChild(footerResult)
            } else if (footerResult && typeof footerResult === 'string') {
                footerEl.innerHTML = footerResult
            }
        } else if (footer && typeof footer === 'object') {
            // Check if it's a DOM element
            if (footer.tagName || footer.appendChild) {
                footerEl.appendChild(footer)
            } 
            // Check if it's an array
            else if (Array.isArray(footer)) {
                footer.forEach(btn => {
                    if (btn) footerEl.appendChild(btn)
                })
            }
        } else if (typeof footer === 'string') {
            footerEl.innerHTML = footer
        }

        modalContainer.appendChild(footerEl)
    }

    modalOverlay.appendChild(modalContainer)
    document.body.appendChild(modalOverlay)

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalOverlay.style.opacity = '1'
            modalOverlay.style.transform = 'scale(1)'
        })
    })

    // ESC key to close
    const handleKey = (e) => {
        if (e.key === 'Escape') {
            closeModal()
            document.removeEventListener('keydown', handleKey)
        }
    }
    document.addEventListener('keydown', handleKey)

    return { closeModal, modalId, element: modalOverlay }
}

export const AlertModal = ({ title, message, onClose, buttonText = 'OK' }) => {
    const footer = ({ closeModal }) => {
        return $({
            tag: 'div',
            style: { display: 'flex', justifyContent: 'center' },
            child: [
                $({
                    tag: 'button',
                    text: buttonText,
                    style: {
                        padding: '8px 32px',
                        backgroundColor: '#2196F3',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease'
                    },
                    event: {
                        type: 'click',
                        method: () => {
                            closeModal()
                            if (onClose) onClose()
                        }
                    }
                })
            ]
        })
    }

    const content = $({
        tag: 'div',
        style: { textAlign: 'center', padding: '20px 0' },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-info-circle' }, style: { fontSize: '48px', color: '#2196F3', marginBottom: '16px', display: 'block' } }),
            $({ tag: 'p', text: message, style: { color: '#ccc', fontSize: '15px', lineHeight: '1.5', margin: 0 } })
        ]
    })

    return CustomModal({
        title,
        content,
        footer,
        size: 'small',
        closeOnOverlayClick: false
    })
}

export const LoadingModal = ({ title = 'Loading...', message = 'Please wait...' }) => {
    const content = $({
        tag: 'div',
        style: { textAlign: 'center', padding: '40px 20px' },
        child: [
            $({ tag: 'i', att: { className: 'fas fa-spinner fa-pulse' }, style: { fontSize: '48px', color: '#2196F3', marginBottom: '16px', display: 'block' } }),
            $({ tag: 'p', text: message, style: { color: '#ccc', fontSize: '14px', margin: 0 } })
        ]
    })

    return CustomModal({
        title,
        content,
        size: 'small',
        showCloseButton: false,
        closeOnOverlayClick: false,
        footer: null
    })
}

export const DragDropUpload = ({
    label = 'Upload File',
    accept = '.pdf,.jpg,.jpeg,.png,.gif,.webp',
    multiple = false,
    required = false,
    currentFiles = [],
    onFileSelect = null,
    onFileRemove = null,
    onFileView = null, 
    maxSizeMB = 10,
    description = null,
    showPreview = true,
    className = '',
    id = 'file-upload-' + Date.now()
}) => {
    // Generate unique IDs
    const inputId = 'file-input-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const dropZoneId = 'drop-zone-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const previewId = 'preview-container-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);
    const fileCountId = 'file-count-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

    let fileList = [...currentFiles];
    let containerElement = null;
    let dropZoneElement = null;
    let previewContainer = null;
    let fileCountElement = null;

    // Determine if file is image
    const isImageFile = (file) => {
        if (typeof file === 'string') {
            return /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(file);
        }
        return file.type && file.type.startsWith('image/');
    };

    // Determine file icon
    const getFileIcon = (file) => {
        const name = typeof file === 'string' ? file : file.name;
        if (/\.(pdf)$/i.test(name)) return 'fa-file-pdf';
        if (/\.(doc|docx)$/i.test(name)) return 'fa-file-word';
        if (/\.(xls|xlsx)$/i.test(name)) return 'fa-file-excel';
        if (/\.(ppt|pptx)$/i.test(name)) return 'fa-file-powerpoint';
        if (/\.(zip|rar|7z)$/i.test(name)) return 'fa-file-archive';
        if (/\.(mp4|avi|mov|wmv)$/i.test(name)) return 'fa-file-video';
        if (/\.(mp3|wav|aac)$/i.test(name)) return 'fa-file-audio';
        if (/\.(txt|log|md)$/i.test(name)) return 'fa-file-lines';
        if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(name)) return 'fa-file-image';
        return 'fa-file';
    };

    // Get file color
    const getFileColor = (file) => {
        const name = typeof file === 'string' ? file : file.name;
        if (/\.(pdf)$/i.test(name)) return '#ea4335';
        if (/\.(doc|docx)$/i.test(name)) return '#4285f4';
        if (/\.(xls|xlsx)$/i.test(name)) return '#0f9d58';
        if (/\.(ppt|pptx)$/i.test(name)) return '#ff6d00';
        if (/\.(zip|rar|7z)$/i.test(name)) return '#795548';
        if (/\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(name)) return '#34a853';
        return '#64748b';
    };

    // Format file size
    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Update file count
    const updateFileCount = () => {
        if (fileCountElement) {
            const count = fileList.length;
            fileCountElement.textContent = `${count} file${count !== 1 ? 's' : ''}`;
        }
    };

    // Open file viewer with CustomModal
    const openFileViewer = (file, fileName) => {
        if (onFileView && typeof onFileView === 'function') {
            onFileView(file);
            return;
        }
    };

    // Render preview items
    const renderPreviews = () => {
        updateFileCount();
        
        if (!previewContainer) return;
        previewContainer.innerHTML = '';

        if (fileList.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.style.cssText = `
                text-align: center;
                padding: 20px;
                color: #94a3b8;
                font-size: 13px;
            `;
            emptyMsg.textContent = 'No files uploaded yet';
            previewContainer.appendChild(emptyMsg);
            return;
        }

        fileList.forEach((file, index) => {
            const isImage = isImageFile(file);
            const fileName = typeof file === 'string' ? file.split('/').pop() : file.name;
            const fileSize = typeof file === 'string' ? 0 : file.size;
            const fileIcon = getFileIcon(file);
            const fileColor = getFileColor(file);
            
            let fileUrl = typeof file === 'string' ? file : URL.createObjectURL(file);

            const previewItem = document.createElement('div');
            previewItem.style.cssText = `
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 14px;
                background: #f8fafc;
                border-radius: 10px;
                border: 1px solid #e8ecf0;
                transition: all 0.2s ease;
                position: relative;
                cursor: pointer;
            `;

            const thumb = document.createElement('div');
            thumb.style.cssText = `
                width: 44px;
                height: 44px;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                background: ${isImage ? 'transparent' : `${fileColor}15`};
                overflow: hidden;
            `;

            if (isImage) {
                const img = document.createElement('img');
                const src = typeof file === 'string' ? file : URL.createObjectURL(file);
                img.src = src;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 8px;
                `;
                img.alt = fileName;
                thumb.appendChild(img);
            } else {
                const icon = document.createElement('i');
                icon.className = `fa-solid ${fileIcon}`;
                icon.style.cssText = `
                    font-size: 22px;
                    color: ${fileColor};
                `;
                thumb.appendChild(icon);
            }

            const info = document.createElement('div');
            info.style.cssText = `
                flex: 1;
                min-width: 0;
            `;

            const nameEl = document.createElement('div');
            nameEl.style.cssText = `
                font-size: 13px;
                font-weight: 500;
                color: #1a2a3a;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            nameEl.textContent = fileName;

            const sizeEl = document.createElement('div');
            sizeEl.style.cssText = `
                font-size: 11px;
                color: #94a3b8;
                margin-top: 2px;
            `;
            sizeEl.textContent = fileSize ? formatSize(fileSize) : '';

            info.appendChild(nameEl);
            info.appendChild(sizeEl);

            const previewBtn = document.createElement('button');
            previewBtn.style.cssText = `
                width: 32px;
                height: 32px;
                border: none;
                border-radius: 50%;
                background: transparent;
                color: #94a3b8;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            `;
            const previewIcon = document.createElement('i');
            previewIcon.className = 'fa-solid fa-eye';
            previewIcon.style.cssText = 'font-size: 14px;';
            previewBtn.appendChild(previewIcon);

            previewBtn.addEventListener('mouseenter', () => {
                previewBtn.style.backgroundColor = '#e8f0fe';
                previewBtn.style.color = '#1a73e8';
            });
            previewBtn.addEventListener('mouseleave', () => {
                previewBtn.style.backgroundColor = 'transparent';
                previewBtn.style.color = '#94a3b8';
            });

            previewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openFileViewer(file, fileName);
            });

            const removeBtn = document.createElement('button');
            removeBtn.style.cssText = `
                width: 28px;
                height: 28px;
                border: none;
                border-radius: 50%;
                background: transparent;
                color: #94a3b8;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
            `;
            const removeIcon = document.createElement('i');
            removeIcon.className = 'fa-solid fa-xmark';
            removeIcon.style.cssText = 'font-size: 16px;';
            removeBtn.appendChild(removeIcon);

            removeBtn.addEventListener('mouseenter', () => {
                removeBtn.style.backgroundColor = '#fee2e2';
                removeBtn.style.color = '#ef4444';
            });
            removeBtn.addEventListener('mouseleave', () => {
                removeBtn.style.backgroundColor = 'transparent';
                removeBtn.style.color = '#94a3b8';
            });

            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                fileList.splice(index, 1);
                renderPreviews();
                updateFileCount();
                if (onFileRemove) onFileRemove(file, index, fileList);
            });

            previewItem.appendChild(thumb);
            previewItem.appendChild(info);
            previewItem.appendChild(previewBtn);
            previewItem.appendChild(removeBtn);

            previewItem.addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                openFileViewer(file, fileName);
            });

            previewItem.addEventListener('mouseenter', () => {
                previewItem.style.borderColor = '#cbd5e1';
                previewItem.style.backgroundColor = '#f1f5f9';
            });
            previewItem.addEventListener('mouseleave', () => {
                previewItem.style.borderColor = '#e8ecf0';
                previewItem.style.backgroundColor = '#f8fafc';
            });

            previewContainer.appendChild(previewItem);
        });
    };

    // Handle file selection
    const handleFiles = (files) => {
        const validFiles = [];
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        for (const file of files) {
            if (file.size > maxSizeBytes) {
                if (window.showNotification) {
                    window.showNotification(`File "${file.name}" exceeds ${maxSizeMB}MB limit`, 'error');
                } else {
                    alert(`File "${file.name}" exceeds ${maxSizeMB}MB limit`);
                }
                continue;
            }
            validFiles.push(file);
        }

        if (validFiles.length === 0) return;

        if (multiple) {
            fileList = [...fileList, ...validFiles];
        } else {
            fileList = validFiles;
        }

        renderPreviews();
        updateFileCount();

        if (onFileSelect) {
            onFileSelect(validFiles, fileList);
        }
    };

    // Create the container
    const container = $({
        tag: 'div',
        att: { id: id, className: `drag-drop-upload ${className}` },
        style: {
            width: '100%',
            fontFamily: 'Segoe UI, system-ui, sans-serif'
        },
        elementHandler: (el) => {
            containerElement = el;
        },
        child: [
            // Label
            label ? $({
                tag: 'label',
                text: label,
                style: {
                    display: 'block',
                    marginBottom: '8px',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: '600',
                    letterSpacing: '0.3px'
                }
            }) : null,

            // Drop Zone
            $({
                tag: 'div',
                att: { id: dropZoneId },
                style: {
                    border: '2px dashed #d1d5db',
                    borderRadius: '12px',
                    padding: '28px 20px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#fafbfc',
                    position: 'relative',
                    minHeight: '100px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                },
                elementHandler: (el) => {
                    dropZoneElement = el;
                },
                child: [
                    // Hidden file input
                    $({
                        tag: 'input',
                        att: {
                            type: 'file',
                            id: inputId,
                            accept: accept,
                            multiple: multiple,
                            required: required
                        },
                        style: { display: 'none' },
                        event: {
                            type: 'change',
                            method: (e) => {
                                const files = Array.from(e.target.files);
                                if (files.length > 0) {
                                    handleFiles(files);
                                }
                                e.target.value = '';
                            }
                        }
                    }),

                    // Upload icon
                    $({
                        tag: 'span',
                        att: { className: 'fa-solid fa-cloud-arrow-up' },
                        style: {
                            fontSize: '36px',
                            color: '#94a3b8',
                            marginBottom: '4px'
                        }
                    }),

                    // Main text
                    $({
                        tag: 'div',
                        text: description || 'Drag & drop files here or click to browse',
                        style: {
                            fontSize: '14px',
                            color: '#475569',
                            fontWeight: '500'
                        }
                    }),

                    // Supported formats
                    $({
                        tag: 'div',
                        text: `Supported: ${accept.replace(/\*/g, '').replace(/\./g, '').toUpperCase()}`,
                        style: {
                            fontSize: '12px',
                            color: '#94a3b8'
                        }
                    }),

                    // File count badge - HIDE when showPreview is false
                    showPreview ? $({
                        tag: 'div',
                        style: {
                            marginTop: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        },
                        child: [
                            $({
                                tag: 'span',
                                att: { className: 'fa-solid fa-paperclip' },
                                style: { fontSize: '12px', color: '#94a3b8' }
                            }),
                            $({
                                tag: 'span',
                                att: { id: fileCountId },
                                text: `${fileList.length} file${fileList.length !== 1 ? 's' : ''}`,
                                style: {
                                    fontSize: '12px',
                                    color: '#94a3b8',
                                    fontWeight: '500'
                                },
                                elementHandler: (el) => {
                                    fileCountElement = el;
                                    updateFileCount();
                                }
                            })
                        ]
                    }) : null
                ],
                event: {
                    type: 'click',
                    method: () => {
                        const input = document.getElementById(inputId);
                        if (input) input.click();
                    },
                    type2: 'dragover',
                    method2: (e) => {
                        e.preventDefault();
                        if (dropZoneElement) {
                            dropZoneElement.style.borderColor = '#3b82f6';
                            dropZoneElement.style.backgroundColor = '#eff6ff';
                            dropZoneElement.style.transform = 'scale(1.01)';
                            dropZoneElement.style.boxShadow = '0 4px 20px rgba(59, 130, 246, 0.1)';
                        }
                    },
                    type3: 'dragleave',
                    method3: (e) => {
                        e.preventDefault();
                        if (dropZoneElement) {
                            dropZoneElement.style.borderColor = '#d1d5db';
                            dropZoneElement.style.backgroundColor = '#fafbfc';
                            dropZoneElement.style.transform = 'scale(1)';
                            dropZoneElement.style.boxShadow = 'none';
                        }
                    },
                    type4: 'drop',
                    method4: (e) => {
                        e.preventDefault();
                        if (dropZoneElement) {
                            dropZoneElement.style.borderColor = '#d1d5db';
                            dropZoneElement.style.backgroundColor = '#fafbfc';
                            dropZoneElement.style.transform = 'scale(1)';
                            dropZoneElement.style.boxShadow = 'none';
                        }

                        const files = Array.from(e.dataTransfer.files);
                        if (files.length > 0) {
                            handleFiles(files);
                        }
                    }
                }
            }),

            // Preview container
            showPreview ? $({
                tag: 'div',
                att: { id: previewId },
                style: {
                    marginTop: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    paddingRight: '4px'
                },
                elementHandler: (el) => {
                    previewContainer = el;
                    setTimeout(renderPreviews, 0);
                }
            }) : null
        ]
    });

    // Public API
    return {
        element: container,
        getFiles: () => [...fileList],
        setFiles: (files) => {
            fileList = files || [];
            renderPreviews();
            updateFileCount();
        },
        clearFiles: () => {
            fileList = [];
            renderPreviews();
            updateFileCount();
        },
        removeFile: (index) => {
            if (index >= 0 && index < fileList.length) {
                fileList.splice(index, 1);
                renderPreviews();
                updateFileCount();
            }
        },
        renderPreviews
    };
};

export const showToast = (message, type = 'success', duration = 3500) => {
    const colors = {
        success: {
            bg: '#4caf50',
            icon: '✅',
            border: '#43a047',
            glow: 'rgba(76, 175, 80, 0.3)',
            title: 'Success'
        },
        error: {
            bg: '#f99393',
            icon: '❌',
            border: '#d32f2f',
            glow: 'rgba(239, 83, 80, 0.3)',
            title: 'Error'
        },
        warning: {
            bg: '#ffa726',
            icon: '⚠️',
            border: '#f57c00',
            glow: 'rgba(255, 167, 38, 0.3)',
            title: 'Warning'
        },
        info: {
            bg: '#42a5f5',
            icon: 'ℹ️',
            border: '#1e88e5',
            glow: 'rgba(66, 165, 245, 0.3)',
            title: 'Info'
        },
        confirm: {
            bg: '#4caf50',
            icon: '✅',
            border: '#43a047',
            glow: 'rgba(76, 175, 80, 0.3)',
            title: 'Completed'
        },
        not_presented: {
            bg: '#f99393',
            icon: '❌',
            border: '#d32f2f',
            glow: 'rgba(239, 83, 80, 0.3)',
            title: 'Not Presented'
        }
    };

    const config = colors[type] || colors.success;
    
    // Create toast container
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 28px;
        right: 28px;
        background: ${config.bg};
        border-left: 5px solid ${config.bg};
        border-radius: 14px;
        padding: 18px 22px 18px 18px;
        color: #ffffff;
        box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 60px ${config.glow};
        z-index: 999999;
        font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        font-size: 14px;
        max-width: 440px;
        min-width: 320px;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        transform: translateX(120%);
        opacity: 0;
        transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.5s ease;
        border: 1px solid rgba(255, 255, 255, 0.06);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
    `;
    
    // Icon container with pulse animation
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        position: relative;
    `;
    
    // Pulse ring
    const pulseRing = document.createElement('div');
    pulseRing.style.cssText = `
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.3);
        opacity: 0;
        animation: toastPulse 2s ease-out infinite;
    `;
    iconContainer.appendChild(pulseRing);
    
    const iconSpan = document.createElement('span');
    iconSpan.style.cssText = `
        font-size: 20px;
        line-height: 1;
        position: relative;
        z-index: 1;
    `;
    iconSpan.textContent = config.icon;
    iconContainer.appendChild(iconSpan);
    
    // Content
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
    `;
    
    const titleSpan = document.createElement('span');
    titleSpan.style.cssText = `
        font-weight: 700;
        font-size: 15px;
        color: #ffffff;
        letter-spacing: -0.2px;
    `;
    titleSpan.textContent = config.title;
    
    const messageSpan = document.createElement('span');
    messageSpan.style.cssText = `
        color: rgba(255, 255, 255, 0.9);
        font-size: 13px;
        line-height: 1.6;
        word-wrap: break-word;
    `;
    messageSpan.textContent = message;
    
    contentDiv.appendChild(titleSpan);
    contentDiv.appendChild(messageSpan);
    
    // Close button with hover effect
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.1);
        border: none;
        color: rgba(255, 255, 255, 0.6);
        cursor: pointer;
        font-size: 14px;
        padding: 4px 8px;
        border-radius: 6px;
        flex-shrink: 0;
        transition: all 0.2s ease;
        line-height: 1;
        margin-top: -2px;
    `;
    closeBtn.textContent = '✕';
    closeBtn.onmouseenter = () => {
        closeBtn.style.color = '#fff';
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.color = 'rgba(255, 255, 255, 0.6)';
        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    };
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 0 0 0 14px;
        width: 100%;
        transition: width ${duration}ms linear;
    `;
    
    toast.appendChild(iconContainer);
    toast.appendChild(contentDiv);
    toast.appendChild(closeBtn);
    toast.appendChild(progressBar);
    document.body.appendChild(toast);
    
    // Add keyframe animation for pulse
    if (!document.getElementById('toast-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'toast-pulse-style';
        style.textContent = `
            @keyframes toastPulse {
                0% {
                    transform: scale(1);
                    opacity: 0.6;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Force a reflow before triggering animation
    void toast.offsetHeight;
    
    // Trigger entrance animation - slide in from right to left
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
    
    // Start progress bar animation
    requestAnimationFrame(() => {
        progressBar.style.width = '0%';
    });
    
    // Auto close
    let timeoutId = setTimeout(() => {
        closeToast();
    }, duration);
    
    // Close function - slide out to right
    const closeToast = () => {
        if (toast.dataset.closing === 'true') return;
        toast.dataset.closing = 'true';
        
        toast.style.transform = 'translateX(120%)';
        toast.style.opacity = '0';
        clearTimeout(timeoutId);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 500);
    };
    
    // Close on button click
    closeBtn.addEventListener('click', closeToast);
    
    // Close on Escape key
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            closeToast();
            document.removeEventListener('keydown', handleKeyDown);
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    
    // Pause on hover
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
        progressBar.style.transition = 'none';
        progressBar.style.width = '0%';
    });
    
    toast.addEventListener('mouseleave', () => {
        const remaining = progressBar.style.width || '0%';
        const remainingTime = (parseFloat(remaining) / 100) * duration;
        progressBar.style.transition = `width ${remainingTime}ms linear`;
        progressBar.style.width = '0%';
        
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            closeToast();
        }, remainingTime || duration);
    });
    
    return { close: closeToast, element: toast };
};

export const Toast = {
    success: (message, duration) => showToast(message, 'success', duration),
    error: (message, duration) => showToast(message, 'error', duration),
    warning: (message, duration) => showToast(message, 'warning', duration),
    info: (message, duration) => showToast(message, 'info', duration),
    confirm: (message, duration) => showToast(message, 'confirm', duration),
    notPresented: (message, duration) => showToast(message, 'not_presented', duration)
};