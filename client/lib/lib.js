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

export const $ = ({ tag, att, text, html, child, elementHandler, style, externalStyle, event }) => {
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
        Tag = document.createElement(tag);
    } else {
        console.log('tag is missing..!')
    }
    if (event) {
        Object.keys(event).forEach(key => {
            if (key.startsWith('type')) {
                const suffix = key.replace('type', '');
                const methodKey = 'method' + suffix;
                if (event[methodKey]) {
                    Tag.addEventListener(event[key], event[methodKey]);
                }
            }
        });
    }
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
            Tag.appendChild(val)
        })
    }
    return Tag;
}

export const Fragment = ({ child }) => {
    const fragment = document.createDocumentFragment()
    if (child) {
        child.forEach(val => {
            fragment.appendChild(val)
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
    let numberOfLineBreaks = (value.match(/\n/g) || []).length;
    return 2.5 + numberOfLineBreaks * 2.5 + 2;
}

export const formatSize = (bytes, decimalPoint) => {
    if (bytes === 0) return 0;
    let k = 1024,
        dm = decimalPoint || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm));
}

export const CanvasRender = ({ pdf, canvas, fileUrl, getSource }) => {
    pdf.ctx = canvas.getContext('2d')
    let currentPage = 1;

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
    if (!displayName) return "";
    if (displayName === "Extension") return "Extension";

    const match = displayName.match(/\(([^)]+)\)/);
    return match ? match[1] : displayName;
}

// Get all center codes
export const getCenterCodes = () => {
    return CapsuOffice.map(center => getCenterCode(center));
}

export const Waiting = () => {
    return ($({
        tag: 'div',
        externalStyle: '/client/lib/loaderStyleLib.css',
        att: {
            className: 'mainLoaderBase'
        },
        child: [
            $({
                tag: 'div',
                stt: {
                    id: 'loading-wrapper'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            id: 'loading-text'
                        },
                        text: 'Loading'
                    }),
                    $({
                        tag: 'div',
                        att: {
                            id: 'loading-content'
                        }
                    })
                ]
            })
        ]
    }))
}

export const ConfirmationAlert = (message, eventClose) => {
    let modalContainer
    let modal

    const getModalContainer = (el) => {
        modalContainer = el
    }

    const getModalMain = (el) => {
        modal = el
    }

    // Close function
    const closeModal = (e) => {
        if (e) e.stopPropagation()
        if (modalContainer && modalContainer.remove) {
            modalContainer.remove()
        }
        if (eventClose && typeof eventClose === 'function') {
            eventClose()
        }
    }

    // Close button with direct click event
    const closeButton = $({
        tag: 'div',
        att: {
            className: 'textClose'
        },
        text: 'Close',
        style: {
            cursor: 'pointer',
            padding: '10px 20px',
            textAlign: 'center',
            backgroundColor: '#00bcd4',
            color: '#fff',
            borderRadius: '5px',
            marginTop: '10px',
            userSelect: 'none',
            width: 'fit-content',
            margin: '10px auto 0'
        },
        event: {
            type: 'click',
            method: (e) => {
                e.stopPropagation()
                e.preventDefault()
                closeModal(e)
            }
        }
    })

    const messageBox = $({
        tag: 'div',
        att: {
            className: 'messageBox'
        },
        text: message,
        style: {
            padding: '20px',
            textAlign: 'center',
            color: '#fff',
            fontSize: '1.1vw',
            wordBreak: 'break-word'
        }
    })

    return ($({
        tag: 'div',
        externalStyle: '/client/lib/loaderStyleLib.css',
        att: {
            className: 'coverMOdal'
        },
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            zIndex: '10000',
            alignItems: 'center',
            justifyContent: 'center'
        },
        elementHandler: getModalContainer,
        child: [
            $({
                tag: 'div',
                att: {
                    className: 'confirmAlert'
                },
                style: {
                    background: 'linear-gradient(145deg, #2a2a2a 0%, #1a1a1a 100%)',
                    padding: '2rem',
                    borderRadius: '1vw',
                    border: '1px solid #333',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    minWidth: '300px',
                    maxWidth: '500px',
                    position: 'relative',
                    pointerEvents: 'auto'
                },
                elementHandler: getModalMain,
                child: [
                    messageBox,
                    closeButton
                ]
            })
        ]
    }))
}

export function TextToBase64Barcode(text, prop) {
    var canvas = document.createElement("canvas");
    JsBarcode(canvas, text, prop);
    return canvas.toDataURL("image/png");
}

export function base64ToArrayBuffer(base64) {
    var binary_string = window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

export function dataURLtoFile(dataurl, filename) {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}


export const MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

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
        this.res = (res) => res.json()
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
    let xOffset = 0;
    let yOffset = 0;
    let active = false;
    let viewerSig = panel
    let imgHolder = object

    //================================================

    viewerSig.addEventListener("touchstart", dragStart, false);
    viewerSig.addEventListener("touchend", dragEnd, false);
    viewerSig.addEventListener("touchmove", drag, false);

    viewerSig.addEventListener("mousedown", dragStart, false);
    viewerSig.addEventListener("mouseup", dragEnd, false);
    viewerSig.addEventListener("mousemove", drag, false);

    function dragStart(e) {

        if (e.type === "touchstart") {

            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === imgHolder) {
            active = true;
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        active = false;
    }

    function drag(e) {
        if (active) {
            e.preventDefault();

            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }
            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX, currentY, imgHolder);


        }
    }

    function setTranslate(xPos, yPos, el) {
        el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
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
    const zip = new JSZip();
    zip.file("hello.txt", "Hello[p my)6cxsw2q");
    zip.generateAsync({ type: "base64" }).then(function (base64) {
        window.location = "data:application/zip;base64," + base64;
    }, function (err) {
        console.log(err)
    });
}

export const ResizeImage = (imageUrl, get) => {
    let reader = new FileReader();
    reader.onload = function (e) {
        let img = document.createElement("img");
        img.onload = function (event) {
            // This line is dynamically creating a canvas element
            let canvas = document.createElement("canvas");
            var MAX_WIDTH = 196;
            var MAX_HEIGHT = 196;

            var width = img.width;
            var height = img.height;

            // Change the resizing logic
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width = width * (MAX_HEIGHT / height);
                    height = MAX_HEIGHT;
                }
            }


            let ctx = canvas.getContext("2d");


            //This line shows the actual resizing of image
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);


            //This line is used to display the resized image in the body
            get(canvas.toDataURL(imageUrl.type))
        }
        img.src = e.target.result;
    }
    reader.readAsDataURL(imageUrl);

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
                res(await fetch('/' + file).then((res) => res.arrayBuffer()));
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
    const list = nodeList
    list.forEach(node => {
        node.style.display = display
    })
    let searchText = textArray.map(val => {
        return val.replace('_', ' ')
    })
    searchText.forEach(valText => {
        for (let val of list) {
            if (valText !== '') {
                if (!val.innerText.toUpperCase().includes(valText)) {
                    if (val.style.display !== 'none') {
                        val.style.display = 'none'
                    }

                } else {
                    if (val.innerText.toUpperCase().includes(valText)) {
                        if (val.style.display !== 'none') {
                            val.style.display = display
                        }

                    } else {
                        val.style.display = 'none'
                    }



                }
            }

        }
    })
    list.forEach(val => {
        searchText.forEach(text => {
            if (!val.innerText.toUpperCase().includes(text.toUpperCase())) {
                val.style.display = 'none'
            }
        })
    })
}
export const UnderConstruction = ({ message = "This feature is under construction", duration = 3000 }) => {
    let notificationContainer;

    const getContainer = (el) => {
        notificationContainer = el;

        // Auto remove after duration
        setTimeout(() => {
            if (notificationContainer && notificationContainer.remove) {
                notificationContainer.classList.add('fade-out');
                setTimeout(() => {
                    if (notificationContainer.parentNode) {
                        notificationContainer.remove();
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
            resolve({ valid: false, error: 'No file selected' });
            return;
        }

        // 1. Basic Extension Check
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            resolve({ valid: false, error: 'Invalid file extension. Expected .pdf' });
            return;
        }

        // 2. Size Check
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            resolve({ valid: false, error: 'File is too large. Max size: ' + maxSizeMB + 'MB.' });
            return;
        }

        // 3. Magic Number Check (%PDF)
        const reader = new FileReader();
        const blob = file.slice(0, 4);
        reader.onload = (e) => {
            const arr = new Uint8Array(e.target.result);
            let header = '';
            for (let i = 0; i < arr.length; i++) {
                header += String.fromCharCode(arr[i]);
            }

            if (header !== '%PDF') {
                resolve({ valid: false, error: 'Invalid document structure (PDF header missing).' });
            } else {
                resolve({ valid: true, error: null });
            }
        };
        reader.onerror = () => resolve({ valid: false, error: 'Failed to read file.' });
        reader.readAsArrayBuffer(blob);
    });
}

export const DeleteConfirmModal = (title = "Delete Record", message = "Are you sure you want to delete this?") => {
    return new Promise((resolve) => {
        const modalId = 'modern-delete-modal-' + Date.now();
        
        const closeModal = (result) => {
            const overlay = document.getElementById(modalId);
            if (overlay) {
                overlay.style.opacity = '0';
                const content = overlay.querySelector('.modal-content');
                if (content) content.style.transform = 'scale(0.9) translateY(20px)';
                
                setTimeout(() => {
                    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                    resolve(result);
                }, 300);
            }
        };

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
                    if (e.target.id === modalId) closeModal(false);
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
        });

        document.body.appendChild(modalOverlay);
        
        // Trigger animations
        setTimeout(() => {
            modalOverlay.style.opacity = '1';
            const content = modalOverlay.querySelector('.modal-content');
            if (content) content.style.transform = 'scale(1) translateY(0)';
        }, 10);
    });
};
