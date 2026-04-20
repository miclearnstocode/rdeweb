import { $, ConfirmationAlert, Request, TimeConvert, Waiting } from '../../../../lib/lib.js'
import { Error as ErrorComponent } from "../../../../error.js";
import { Print } from "../../../otherComponent/comment.js";
import { handleResubmit } from '../resubmit.js';

const isGoogleDriveUrl = (url) => {
    if (!url) return false
    return url.includes('drive.google.com') ||
        url.includes('drive.google.com/file/d/') ||
        (url.startsWith('https://') && url.includes('google.com'))
}

const CreateNew = () => {
    const data = {
        endorsement: '',
        event: '',
        research: []
    }

    // Add form validation state as plain
    const formState = {
        isValid: false,
        errors: {
            title: false,
            category: false,
            center: false,
            author: false,
            presenter: false,
            attachment: false, program: false, endorsement: false, event: false, coAuthors: false
        },
        touched: {
            title: false,
            category: false,
            center: false,
            author: false,
            presenter: false,
            attachment: false,
            program: false,
            endorsement: false,
            event: false
        }
    }

    // Store submit button reference
    let submitButtonRef = null;

    // Validation function
    const validateForm = () => {
        const errors = {
            title: !Temp.title || Temp.title.trim() === '',
            category: !Temp.category || Temp.category === '',
            center: !Temp.center || Temp.center === '',
            author: !Temp.author || Temp.author.trim() === '',
            presenter: !Temp.presenter || Temp.presenter.trim() === '',
            attachment: !Temp.attachment,
            program: !Temp.program,
            endorsement: !data.endorsement,
            event: !data.event || data.event === '',
            coAuthors: Temp.coAuhtor.some(coAuth => !coAuth.trim())
        };

        const isValid = !Object.values(errors).some(error => error === true);

        // Update formState
        formState.isValid = isValid;
        formState.errors = errors;

        // Update submit button state
        if (submitButtonRef) {
            if (isValid) {
                submitButtonRef.style.opacity = '1';
                submitButtonRef.style.backgroundColor = 'deepskyblue';
                submitButtonRef.style.cursor = 'pointer';
                submitButtonRef.style.pointerEvents = 'auto';
                submitButtonRef.removeAttribute('disabled');
            } else {
                submitButtonRef.style.opacity = '0.5';
                submitButtonRef.style.backgroundColor = '#666';
                submitButtonRef.style.cursor = 'not-allowed';
                submitButtonRef.style.pointerEvents = 'none';
                submitButtonRef.setAttribute('disabled', 'disabled');
            }
        }

        return isValid;
    };

    // Touch field handler
    const touchField = (fieldName) => {
        formState.touched[fieldName] = true;
        validateForm();

        // Update field styling
        const field = document.querySelector(`[name="${fieldName}"], [id="${fieldName}Select"], [data-field="${fieldName}"]`);
        if (field && formState.errors[fieldName]) {
            field.style.border = '1px solid #ff6b6b';
            field.style.boxShadow = '0 0 5px #ff6b6b';
        }
    };

    //mapping object at the top of CreateNew() function, after the data declaration
    const centerCategoryMapping = {
        "Crop Science Research & Developement Center (CSRDC)": ["Natural / Biological"],
        "Livestock Research & Development Center (LRDC)": ["Natural / Biological"],
        "Fisheries Research & Development Center (FRDC)": ["Natural / Biological"],
        "Food and Industrial Technology Research & Development Center (FITRDC)": ["Food"],
        "Social Science Research & Development Center (SSRDC)": ["Social Science"],
        "Machinery and Agricultural Technology Engineering Center (MATEC)": ["Industrial", "Engineering", "Information Technology", "Development", "Agricultural Machinery"],
        "Coconut Research and Development Center (Coco RDC)": ["Natural / Biological"],
        "Extension (Extension)": ["Extension"]
    }

    // Reverse mapping for quick lookup
    const categoryToCenters = {};
    Object.entries(centerCategoryMapping).forEach(([center, categories]) => {
        categories.forEach(category => {
            if (!categoryToCenters[category]) {
                categoryToCenters[category] = [];
            }
            categoryToCenters[category].push(center);
        })
    })

    const getDataMethod = {
        getEndorsement: (value) => {
            data.endorsement = value;
            validateForm();
            touchField('endorsement');
        },
        getResearch: (value) => {
            data.research.push(value);
            validateForm();
        },
        getEvent: (value) => {
            data.event = value;
            validateForm();
            touchField('event');
        }
    }

    const resetTemp = () => {
        return {
            title: '',
            category: '',
            center: '',
            author: '',
            attachment: '',
            program: '',
            coAuhtor: [],
            presenter: ''
        }
    }

    let Temp = resetTemp();

    // UI Elements references
    let TitleEl, SelCat, getAuth, coAuth, centerSelect, cov, coAuthList, presenterInput
    let researchCover, programCover, researchFileInput, programFileInput, endorsementFileInput

    // Handler functions
    const getResearchCover = (el) => {
        researchCover = el
    }

    const getProgramCover = (el) => {
        programCover = el
    }

    const getCategory = (el) => {
        SelCat = el
    }

    const getTitle = (el) => {
        TitleEl = el
    }

    const getAuthor = (el) => {
        getAuth = el
    }

    const getCoAuth = (el) => {
        coAuth = el
    }
    const getPresenter = (el) => {
        presenterInput = el
    }

    const labelRes = $({
        tag: 'div',
        att: { className: 'form-header' },
        style: {
            fontFamily: 'arial black,sans-serif',
            color: '#bbb',
            textAlign: 'center',
            marginTop: '1vh',
            fontSize: '1.3vw'
        },
        text: 'Add Document'
    })

    const addResearch = () => {
        const Title = () => {
            const leb = $({
                tag: 'div',
                text: 'Document Title',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    margin: 'auto 0 auto auto',
                    fontSize: '1.1vw',
                }
            })

            const input = $({
                tag: 'textarea',
                style: {
                    height: '6vh',
                    width: '99%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    color: '#bbb',
                    resize: 'none',
                    fontSize: "1vw",
                },
                att: {
                    placeholder: 'Insert text here',
                    required: true,
                    'data-field': 'title',
                    name: 'title'
                },
                event: {
                    type: 'input',
                    method: (event) => {
                        Temp.title = event.target.value;
                        validateForm();

                        // Update border color based on validation
                        if (formState.touched.title && !Temp.title) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else if (formState.touched.title && Temp.title) {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        } else {
                            event.target.style.border = 'none';
                            event.target.style.boxShadow = 'none';
                        }
                    },
                    blur: (event) => {
                        touchField('title');
                        if (!Temp.title) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    }
                },
                elementHandler: getTitle
            })

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: 'auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw'
                },
                att: { className: 'form-section' },
                child: [leb, input]
            }))
        }

        const Category = () => {
            const option = (val) => {
                return ($({
                    tag: 'option',
                    text: val,
                    style: {
                        color: 'black',
                        fontSize: '1.1vw',
                        backgroundColor: 'grey'
                    }
                }));
            };

            const select = $({
                tag: 'select',
                style: {
                    width: '60%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    marginTop: '1vh',
                    cursor: 'pointer'
                },
                att: {
                    required: true,
                    id: 'categorySelect',
                    'data-field': 'category'
                },
                event: {
                    type: 'change',
                    method: (event) => {
                        const selectedCategory = event.target.value;
                        Temp.category = selectedCategory;

                        // Update center options based on selected category
                        if (centerSelect) {
                            updateCenterOptions(centerSelect, selectedCategory);
                        }

                        // Reset center selection
                        Temp.center = '';
                        validateForm();
                        touchField('category');

                        // Update border
                        if (selectedCategory) {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    },
                    blur: () => touchField('category')
                },
                elementHandler: (el) => {
                    // Populate options
                    el.appendChild($({
                        tag: 'option',
                        text: '- - Select Category - -',
                        style: {
                            color: 'black',
                            fontSize: '1.1vw',
                        },
                        att: {
                            disabled: true,
                            selected: true,
                            value: ''
                        }
                    }));

                    const categories = [
                        "Social Science",
                        "Natural / Biological",
                        "Food",
                        "Development",
                        "Extension",
                        "Agricultural Machinery",
                        "Industrial",
                        "Engineering",
                        "Information Technology"
                    ];

                    categories.forEach(cat => {
                        el.appendChild(option(cat));
                    });

                    getCategory(el);
                }
            });

            const leb = $({
                tag: 'div',
                text: 'Select Category',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    margin: 'auto 0 auto auto',
                    fontSize: '1.1vw',
                }
            });

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center'
                },
                child: [leb, select]
            }));
        }

        const Center = () => {
            const select = $({
                tag: 'select',
                style: {
                    width: '60%',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    marginTop: '1vh',
                    cursor: 'pointer'
                },
                att: {
                    required: true,
                    id: 'centerSelect',
                    'data-field': 'center'
                },
                event: {
                    type: 'change',
                    method: (event) => {
                        Temp.center = event.target.value;
                        validateForm();
                        touchField('center');

                        // Update border
                        if (event.target.value) {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    },
                    blur: () => touchField('center')
                },
                elementHandler: (el) => {
                    // Store reference
                    centerSelect = el;

                    // Initial population - show all centers
                    updateCenterOptions(el, null);
                }
            });

            const leb = $({
                tag: 'div',
                text: 'Select Center',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    margin: 'auto 0 auto auto',
                    fontSize: '1.1vw',
                }
            });

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center'
                },
                child: [leb, select]
            }));
        }
        // Helper function to update center options based on category
        const updateCenterOptions = (selectElement, selectedCategory) => {
            if (!selectElement) return;

            // Clear existing options
            selectElement.innerHTML = '';

            // Add default option
            selectElement.appendChild($({
                tag: 'option',
                text: '- - Select Center - -',
                style: {
                    color: 'black',
                    fontSize: '1.1vw',
                },
                att: {
                    disabled: true,
                    selected: true,
                    value: ''
                }
            }));

            // Determine which centers to show
            let centersToShow = [];
            if (selectedCategory && categoryToCenters[selectedCategory]) {
                // Show only centers that match the selected category
                centersToShow = categoryToCenters[selectedCategory];

                // If no matching centers, show message
                if (centersToShow.length === 0) {
                    selectElement.appendChild($({
                        tag: 'option',
                        text: 'No centers available for this category',
                        style: {
                            color: '#ff6b6b',
                            fontSize: '1.1vw',
                        },
                        att: {
                            disabled: true
                        }
                    }));
                    return;
                }
            } else {
                // Show all centers if no category selected
                centersToShow = Object.keys(centerCategoryMapping);
            }

            // Add center options
            centersToShow.forEach(center => {
                selectElement.appendChild($({
                    tag: 'option',
                    text: center,
                    style: {
                        color: 'black',
                        fontSize: '1.1vw',
                        backgroundColor: 'grey'
                    },
                    att: {
                        value: center
                    }
                }));
            });
        }

        const Author = () => {
            const leb = $({
                tag: 'div',
                text: 'Main Author : ',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    fontSize: '1.2vw',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                }
            })

            const authorInput = $({
                tag: 'input',
                style: {
                    height: '4vh',
                    marginLeft: '.5vw',
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    fontSize: '1vw',
                    color: '#bbb',
                    paddingLeft: '1vw'
                },
                att: {
                    placeholder: 'Enter text here',
                    required: true,
                    'data-field': 'author',
                    name: 'author'
                },
                event: {
                    type: 'input',
                    method: (event) => {
                        Temp.author = event.target.value;
                        validateForm();

                        // Update border
                        if (formState.touched.author && !Temp.author) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else if (formState.touched.author && Temp.author) {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    },
                    blur: (event) => {
                        touchField('author');
                        if (!Temp.author) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    }
                },
                elementHandler: getAuthor
            })

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center',
                    display: 'flex',
                    whiteSpace: 'nowrap'
                },
                child: [leb, authorInput]
            }))
        }

        const CoAuthor = () => {
            let listCo, coInput

            const perListCo = (val) => {
                let main
                return ($({
                    tag: 'div',
                    style: {
                        margin: '1vh auto auto',
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        fontSize: '1.3vw',
                        color: '#bbb',
                        width: '90%',
                        textAlign: 'left',
                        display: 'flex',
                        border: 'solid thin rgba(200,200,200,0.3)',
                        paddingRight: '.5vw',
                        paddingLeft: '.5vw',
                        height: 'fit-content'
                    },
                    elementHandler: (el) => {
                        main = el
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: val,
                            style: {
                                width: '100%',
                                textAlign: 'left',
                                margin: 'auto'
                            }
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-trash-can'
                            },
                            style: {
                                margin: 'auto',
                                cursor: 'pointer'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    main.remove();
                                    Temp.coAuhtor = Temp.coAuhtor.filter((item) => { return item !== val });
                                    validateForm();
                                }
                            }
                        })
                    ]
                }))
            }

            const leb = $({
                tag: 'div',
                text: 'Co-Author : ',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    fontSize: '1.2vw',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                }
            })

            const bot = $({
                tag: 'div',
                style: {
                    display: 'flex',
                    alignItems: 'center',
                    margin: 'auto',
                    marginLeft: '1vw',
                    cursor: 'pointer'
                },
                child: [
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-user-plus addCo',
                            title: 'Add as co-author?'
                        },
                        style: {
                            fontSize: '1.2vw',
                            border: 'solid thin deepskyblue',
                            padding: '.3rem',
                        }
                    }),
                    $({
                        tag: 'span',
                        text: 'Add Co-author',
                        style: {
                            fontFamily: 'arial,sans-serif',
                            fontSize: '0.9vw',
                            color: 'deepskyblue',
                            marginLeft: '0.5vw',
                            whiteSpace: 'nowrap'
                        }
                    })
                ],
                event: {
                    type: 'click',
                    method: () => {
                        if (coInput.value.trim()) {
                            Temp.coAuhtor.push(coInput.value.trim());
                            listCo.innerHTML = '';
                            Temp.coAuhtor.forEach(val => {
                                listCo.appendChild(perListCo(val));
                            });
                            coInput.value = '';
                            validateForm();
                        }
                    }
                }
            })

            const CoauthorInput = $({
                tag: 'input',
                style: {
                    height: '4vh',
                    marginLeft: '.5vw',
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    fontSize: '1vw',
                    color: '#bbb',
                    paddingLeft: '1vw'
                },
                att: {
                    placeholder: 'Input all authors here one by one and click the add icon ->',
                    title: 'To add more authors click the add icon',
                    'data-field': 'coAuthor'
                },
                elementHandler: (el) => {
                    coInput = el
                    getCoAuth(el)
                }
            })

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: '100%',
                            borderBottom: 'solid thin grey',
                            paddingBottom: '.5vw'
                        },
                        child: [leb, CoauthorInput, bot]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            width: '100%',
                        },
                        elementHandler: (el) => {
                            listCo = el
                            coAuthList = el
                        }
                    })
                ]
            }))
        }

        const Presenter = () => {
            const leb = $({
                tag: 'div',
                text: 'Presenter : ',
                style: {
                    fontFamily: 'arial,sans-serif',
                    fontWeight: 'bolder',
                    color: '#bbb',
                    fontSize: '1.2vw',
                    marginTop: 'auto',
                    marginBottom: 'auto'
                }
            })

            const presenterInput = $({
                tag: 'input',
                style: {
                    height: '4vh',
                    marginLeft: '.5vw',
                    width: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    backgroundImage: 'linear-gradient(15deg,transparent,black)',
                    fontSize: '1vw',
                    color: '#bbb',
                    paddingLeft: '1vw'
                },
                att: {
                    placeholder: 'Presenter of the research or extension program (Full Name)',
                    required: true,
                    'data-field': 'presenter',
                    name: 'presenter'
                },
                event: {
                    type: 'input',
                    method: (event) => {
                        Temp.presenter = event.target.value;
                        validateForm();

                        // Update border
                        if (formState.touched.presenter && !Temp.presenter) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else if (formState.touched.presenter && Temp.presenter) {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    },
                    blur: (event) => {
                        touchField('presenter');
                        if (!Temp.presenter) {
                            event.target.style.border = '1px solid #ff6b6b';
                            event.target.style.boxShadow = '0 0 5px #ff6b6b';
                        } else {
                            event.target.style.border = '1px solid #4caf50';
                            event.target.style.boxShadow = '0 0 5px #4caf50';
                        }
                    }
                },
                elementHandler: getPresenter
            })

            return ($({
                tag: 'div',
                style: {
                    height: 'fit-content',
                    width: '95%',
                    margin: '1vh auto',
                    backgroundColor: 'rgba(200,200,200,0.1)',
                    padding: '.4rem',
                    borderRadius: '.5vw',
                    textAlign: 'center',
                    display: 'flex',
                    whiteSpace: 'nowrap'
                },
                child: [leb, presenterInput]
            }))
        }

        const Attachment = () => {
            const file = $({
                tag: 'input',
                att: {
                    type: 'file',
                    accept: '.pdf,application/pdf',
                    required: true,
                    'data-field': 'attachment',
                    id: 'attachment'
                },
                style: {
                    opacity: '0',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                },
                elementHandler: (el) => {
                    researchFileInput = el;
                    setTimeout(() => {
                        setupFileInputValidation(el, researchCover, 'Research Paper', (file) => {
                            Temp.attachment = file;
                            validateForm();
                            touchField('attachment');

                            // Update border of parent
                            const parent = el.parentElement;
                            if (parent) {
                                parent.style.border = '2px solid #4caf50';
                                parent.style.boxShadow = '0 0 5px #4caf50';
                            }
                        });
                    }, 100);
                }
            });

            const cover = $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    fontFamily: 'monospace',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease'
                },
                att: {
                    innerHTML: `<div style="margin: auto; font-family: monospace" class="fa-solid fa-file-pdf"> Upload research or extension proposal/paper in pdf format</div>`
                },
                elementHandler: getResearchCover
            });

            return ($({
                tag: 'div',
                att: {
                    className: 'resAtt'
                },
                style: {
                    height: '6vh',
                    width: '70%',
                    margin: '2vh auto',
                    borderRadius: '.5vw',
                    position: 'relative',
                    backgroundColor: '#333',
                    border: formState.touched.attachment && formState.errors.attachment ? '2px solid #ff6b6b' : 'none'
                },
                child: [cover, file]
            }));
        }

        const Program = () => {
            const file = $({
                tag: 'input',
                att: {
                    type: 'file',
                    accept: '.pdf,application/pdf',
                    required: true,
                    'data-field': 'program',
                    id: 'program'
                },
                style: {
                    opacity: '0',
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                },
                elementHandler: (el) => {
                    programFileInput = el;
                    setTimeout(() => {
                        setupFileInputValidation(el, programCover, 'Program File', (file) => {
                            Temp.program = file;
                            validateForm();
                            touchField('program');

                            // Update border of parent
                            const parent = el.parentElement;
                            if (parent) {
                                parent.style.border = '2px solid #4caf50';
                                parent.style.boxShadow = '0 0 5px #4caf50';
                            }
                        });
                    }, 100);
                }
            });

            const cover = $({
                tag: 'div',
                style: {
                    width: '100%',
                    height: '100%',
                    fontFamily: 'monospace',
                    color: 'deepskyblue',
                    fontSize: '1vw',
                    textAlign: 'center',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'color 0.3s ease'
                },
                att: {
                    innerHTML: `<div style="margin: auto; font-family: monospace" class="fa-solid fa-file-pdf"> Upload Local in House-Review/Symposium Program</div>`
                },
                elementHandler: getProgramCover
            });

            return ($({
                tag: 'div',
                att: {
                    className: 'resAtt'
                },
                style: {
                    height: '6vh',
                    width: '70%',
                    margin: '2vh auto',
                    borderRadius: '.5vw',
                    position: 'relative',
                    backgroundColor: '#333',
                    border: formState.touched.program && formState.errors.program ? '2px solid #ff6b6b' : 'none'
                },
                child: [cover, file]
            }));
        }

        return ($({
            tag: 'div',
            att: { className: 'form-main-content' },
            style: {
                height: 'fit-content',
                paddingTop: '1vh',
                paddingBottom: '1vh',
                width: '80%',
                border: 'solid thin deepskyblue',
                margin: 'auto',
                borderRadius: '.5vw'
            },
            child: [
                Title(),
                Category(),
                Center(),
                Author(),
                CoAuthor(),
                Presenter(),
                Attachment(),
                Program()
            ]
        }))
    }

    const attachContainer = () => {
        let cov, endorsementFileInput

        const getcover = (el) => {
            cov = el
        }

        const file = $({
            tag: 'input',
            att: {
                type: 'file',
                accept: '.pdf,application/pdf',
                required: true,
                'data-field': 'endorsement',
                id: 'endorsement'
            },
            style: {
                opacity: '0',
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: '2',
                cursor: 'pointer'
            },
            elementHandler: (el) => {
                endorsementFileInput = el;
                setTimeout(() => {
                    setupFileInputValidation(el, cov, 'Endorsement Letter', (file) => {
                        getDataMethod.getEndorsement(file);
                        validateForm();
                        touchField('endorsement');

                        // Update border of parent
                        const parent = el.parentElement;
                        if (parent) {
                            parent.style.border = '2px solid #4caf50';
                            parent.style.boxShadow = '0 0 5px #4caf50';
                        }
                    });
                }, 100);
            }
        });

        const cover = $({
            tag: 'div',
            style: {
                width: '100%',
                height: '100%',
                fontFamily: 'monospace',
                color: 'deepskyblue',
                fontSize: '1vw',
                textAlign: 'center',
                display: 'flex',
                justifyContent: 'center',
                backgroundColor: '#333',
                borderRadius: '.5vw'
            },
            att: {
                innerHTML: `<div style="margin: auto; font-family: monospace" class="fa-solid fa-file-pdf"> upload attachment in pdf format</div>`,
            },
            elementHandler: getcover
        })

        const label = $({
            tag: 'div',
            att: {
                className: 'fa-solid fa-file-lines',
            },
            style: {
                color: '#bbb',
                margin: 'auto',
                width: 'fit-content ',
                display: 'flex',
                justifyContent: 'center',
                marginLeft: '1vw',
                marginRight: '.5vw'
            },
            child: [
                $({
                    tag: 'div',
                    text: ' Endorsement Letter: ',
                    style: {
                        whiteSpace: 'nowrap',
                        fontSize: '1vw',
                        margin: 'auto',
                        marginLeft: '.5vw',
                        height: 'fit-content',
                        fontFamily: 'arial ,sans-serif',
                        color: '#bbb'
                    }
                })
            ]
        })

        return ($({
            tag: 'div',
            style: {
                display: 'flex',
                width: '80%',
                margin: '2vh auto auto',
                borderRadius: '.5vw'
            },
            att: {
                className: 'cover'
            },
            child: [
                label,
                $({
                    tag: 'div',
                    style: {
                        height: '4vh',
                        width: '100%',
                        margin: 'auto',
                        marginLeft: '0',
                        position: 'relative',
                        backgroundImage: 'linear-gradient(to right,transparent,rgba(0,0,0,0.5),black)',
                        border: formState.touched.endorsement && formState.errors.endorsement ? '2px solid #ff6b6b' : 'none',
                        borderRadius: '.5vw'
                    },
                    child: [cover, file]
                })
            ]
        }))
    }

    const EventType = () => {
        return ($({
            tag: 'div',
            style: {
                margin: '2vh auto auto',
                width: '40%',
                borderRadius: '.5vw',
                cursor: 'pointer',
                height: '4vh',
                display: 'flex',
                justifyContent: 'center'
            },
            att: {
                className: 'selectEv'
            },
            child: [
                $({
                    tag: 'select',
                    style: {
                        width: '100%',
                        border: formState.touched.event && formState.errors.event ? '1px solid #ff6b6b' : 'none',
                        boxShadow: formState.touched.event && formState.errors.event ? '0 0 5px #ff6b6b' : 'none',
                        outline: 'none',
                        color: 'deepskyblue',
                        backgroundColor: 'transparent',
                        textAlign: 'center',
                        margin: 'auto',
                        fontSize: '1vw',
                        cursor: 'pointer'
                    },
                    att: {
                        required: true,
                        'data-field': 'event',
                        id: 'eventSelect'
                    },
                    event: {
                        type: 'change',
                        method: (event) => {
                            getDataMethod.getEvent(event.target.value);
                            validateForm();
                            touchField('event');

                            // Update border
                            if (event.target.value) {
                                event.target.style.border = '1px solid #4caf50';
                                event.target.style.boxShadow = '0 0 5px #4caf50';
                            }
                        },
                        blur: () => touchField('event')
                    },
                    elementHandler: async (el) => {
                        el.appendChild($({
                            tag: 'option',
                            text: '-- Select Event Name --',
                            att: {
                                disabled: true,
                                selected: true,
                                value: ''
                            }
                        }))

                        const form = new FormData()
                        form.append('getEvent', 'true')

                        try {
                            const response = await fetch('/eventRequest', {
                                method: 'POST',
                                body: form
                            })

                            if (response.ok) {
                                const data = await response.json()
                                data.forEach(val => {
                                    el.appendChild($({
                                        tag: 'option',
                                        text: val.name,
                                        style: {
                                            backgroundColor: '#222',
                                            fontSize: '1.4vw'
                                        },
                                        att: {
                                            id: val.id,
                                            value: val.name
                                        }
                                    }))
                                })
                            }
                        } catch (error) {
                            console.error('Error fetching events:', error)
                        }
                    }
                })
            ]
        }))
    }

    const Filter = (dataM) => {
        const fil = {
            message: '',
            state: true
        }

        if (!dataM.endorsement) {
            fil.message = "Endorsement is missing..!"
            fil.state = false
            return fil
        }

        if (!dataM.event) {
            fil.message = "Event Type is missing..!"
            fil.state = false
            return fil
        }

        return fil
    }

    //helper function at the top of CreateNew() function
    const validatePdfFile = (file, fieldName, coverElement, fileInputElement) => {
        // Validate file exists
        if (!file) return false;

        // Validate file type
        if (file.type !== 'application/pdf') {
            alert(`Error: ${fieldName} must be a PDF file. You selected: ${file.name || 'unknown format'}`);
            if (coverElement) {
                coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #ff6b6b" class="fa-solid fa-exclamation-triangle"> ${fieldName} - Please select PDF only</div>`;
            }
            if (fileInputElement) {
                fileInputElement.value = ''; // Clear the input
            }
            return false;
        }

        // Validate file extension
        const fileName = file.name || '';
        const fileExtension = fileName.split('.').pop().toLowerCase();
        if (fileExtension !== 'pdf') {
            alert(`Error: ${fieldName} must have .pdf extension. You selected: .${fileExtension} file`);
            if (coverElement) {
                coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #ff6b6b" class="fa-solid fa-exclamation-triangle"> ${fieldName} - .pdf extension required</div>`;
            }
            if (fileInputElement) {
                fileInputElement.value = ''; // Clear the input
            }
            return false;
        }

        // Validate file size (optional: max 10MB)
        if (file.size > 50 * 1024 * 1024) {
            alert(`Error: ${fieldName} file size too large! Maximum size is 10MB. Your file: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
            if (coverElement) {
                coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #ff6b6b" class="fa-solid fa-file-pdf"> ${fieldName} - Max 10MB allowed</div>`;
            }
            if (fileInputElement) {
                fileInputElement.value = ''; // Clear the input
            }
            return false;
        }

        return true;
    }

    //helper function to validate file on input change
    const setupFileInputValidation = (fileInput, coverElement, fieldName, setTempFunction) => {
        if (!fileInput) return;

        // Remove any existing listeners by cloning and replacing
        const newFileInput = fileInput.cloneNode(true);
        fileInput.parentNode.replaceChild(newFileInput, fileInput);

        // Add change event listener
        newFileInput.addEventListener('change', (event) => {
            const fileInput = event.target;
            const files = fileInput.files;

            if (files.length > 0) {
                const file = files[0];

                // Real-time validation - show file type immediately
                const fileName = file.name || '';
                const fileExtension = fileName.split('.').pop().toLowerCase();

                // Update cover to show selected file name and type
                if (coverElement) {
                    coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #ffd700" class="fa-solid fa-file"> Selected: ${fileName}</div>`;
                }

                // Validate PDF
                if (validatePdfFile(file, fieldName, coverElement, fileInput)) {
                    // Valid PDF - update with success styling
                    if (coverElement) {
                        coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #4caf50" class="fa-solid fa-file-pdf"> ✓ ${file.name}</div>`;
                    }
                    setTempFunction(file);
                } else {
                    // Invalid file - clear the temp value
                    setTempFunction(null);
                }
            } else {
                // No file selected
                if (coverElement) {
                    coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: deepskyblue" class="fa-solid fa-file-pdf"> ${fieldName} - upload PDF format</div>`;
                }
                setTempFunction(null);
            }
        });

        // Add drag and drop prevention
        newFileInput.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });

        newFileInput.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                const fileName = file.name || '';
                const fileExtension = fileName.split('.').pop().toLowerCase();

                if (fileExtension !== 'pdf' || file.type !== 'application/pdf') {
                    alert(`Error: ${fieldName} must be a PDF file. You dropped: ${fileName}`);
                    if (coverElement) {
                        coverElement.innerHTML = `<div style="margin: auto; font-family: monospace; color: #ff6b6b" class="fa-solid fa-exclamation-triangle"> ${fieldName} - PDF only</div>`;
                    }
                    newFileInput.value = '';
                    setTempFunction(null);
                    return false;
                }
            }
        });

        return newFileInput;
    }

    const Submit = () => {
        return ($({
            tag: 'div',
            att: {
                className: 'subEn',
                id: 'submitButton'
            },
            text: 'Submit',
            elementHandler: (el) => {
                submitButtonRef = el;
            },
            event: {
                type: 'click',
                method: async () => {
                    if (!formState.isValid) {
                        alert("Please fill all required fields!");

                        // Show all missing fields
                        Object.keys(formState.errors).forEach(field => {
                            if (formState.errors[field]) {
                                const fieldEl = document.querySelector(`[data-field="${field}"], #${field}Select, #${field}`);
                                if (fieldEl) {
                                    fieldEl.style.border = '1px solid #ff6b6b';
                                    fieldEl.style.boxShadow = '0 0 5px #ff6b6b';
                                }
                            }
                        });
                        return;
                    }

                    // Get all required fields
                    const requiredInputs = document.querySelectorAll('[required]');
                    let isValid = true;
                    let firstInvalidField = null;

                    // Check each required field
                    requiredInputs.forEach(field => {
                        if (!field.value || (field.type === 'file' && !field.files.length)) {
                            isValid = false;
                            if (!firstInvalidField) {
                                firstInvalidField = field;
                            }

                            field.style.border = '1px solid red';
                            field.style.boxShadow = '0 0 5px red';

                            const removeError = () => {
                                field.style.border = '';
                                field.style.boxShadow = '';
                                field.removeEventListener('input', removeError);
                            };
                            field.addEventListener('input', removeError);
                        }
                    });

                    if (!isValid) {
                        // Focus on first invalid field
                        if (firstInvalidField) {
                            firstInvalidField.focus();
                        }

                        alert("Please fill all required fields!");
                        return;
                    }

                    // Additional validations
                    if (!Temp.title) {
                        alert("Title is missing..!")
                        TitleEl.focus();
                        return;
                    }
                    if (!Temp.category) {
                        alert("Category is missing..!")
                        return;
                    }
                    if (!Temp.center) {
                        alert("Center is missing")
                        return;
                    }
                    if (!Temp.author) {
                        alert("Author is missing..!")
                        getAuth.focus();
                        return;
                    }
                    if (Temp.attachment) {
                        if (!validatePdfFile(Temp.attachment, 'Research Paper', researchCover, researchFileInput)) {
                            alert('Research attachment must be a valid PDF file. Please check and try again.');
                            return;
                        }
                    }

                    if (Temp.program) {
                        if (!validatePdfFile(Temp.program, 'Program File', programCover, programFileInput)) {
                            alert('Program attachment must be a valid PDF file. Please check and try again.');
                            return;
                        }
                    }

                    if (data.endorsement) {
                        if (!validatePdfFile(data.endorsement, 'Endorsement Letter', cov, endorsementFileInput)) {
                            alert('Endorsement letter must be a valid PDF file. Please check and try again.');
                            return;
                        }
                    }

                    // Validate co-authors (if any)
                    if (Temp.coAuhtor && Temp.coAuhtor.length > 0) {
                        const invalidCoAuthors = Temp.coAuhtor.filter(coAuth => !coAuth.trim());
                        if (invalidCoAuthors.length > 0) {
                            alert("Some co-authors have empty names. Please fix or remove them.");
                            return;
                        }
                    }

                    const fl = Filter(data)
                    if (fl.state) {
                        data.research.push({ ...Temp })
                        const form = new FormData();
                        form.append('uploadedFileEndorsement', data.endorsement)
                        form.append('eventType', data.event)
                        const researchEntry = data.research[0];
                        form.append('researchDoc', researchEntry.attachment)
                        form.append('programFile', researchEntry.program)
                        form.append('title', researchEntry.title)
                        form.append('category', researchEntry.category)
                        form.append('center', researchEntry.center)
                        form.append('author', researchEntry.author)
                        form.append('coAuthor', JSON.stringify(researchEntry.coAuhtor || []))
                        form.append('presenter', researchEntry.presenter)
                        form.append('uploadResearch', 'true')

                        // Show loading indicator
                        let loading = Waiting()
                        document.body.appendChild(loading)

                        const remove = () => {
                            loading.remove()
                        }

                        try {
                            const response = await fetch('/getresearch', {
                                method: 'POST',
                                body: form
                            });

                            // Check if response is OK
                            if (!response.ok) {
                                throw new Error(`HTTP error! Status: ${response.status}`);
                            }

                            // Parse response as JSON
                            const dat = await response.json();

                            remove();

                            if (dat.status) {
                                document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                    window.location.reload()
                                }))
                            } else {
                                document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                    window.location.reload()
                                }))
                            }
                        } catch (err) {
                            remove();
                            console.error('Error uploading research:', err);

                            // User-friendly error message
                            alert('Error uploading document: ' + (err.message || 'Unknown error'));
                        }
                    } else {
                        alert(fl.message)
                    }
                }
            }
        }))
    }

    const newContent = () => {
        return ($({
            tag: 'div',
            style: {
                width: '80%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.5)',
                margin: 'auto',
                overflowY: 'auto',
            },
            child: [
                labelRes,
                addResearch(),
                attachContainer(),
                EventType(),
                Submit()
            ]
        }))
    }

    // Initialize validation on first render
    setTimeout(() => {
        validateForm();
    }, 100);

    return ($({
        tag: 'div',
        att: {
            className: 'createPan'
        },
        child: [newContent()]
    }))
}

//for viewing submitted files and display comment
const Submitted = () => {
    let mainPanel
    const getMain = (mainElement) => {
        mainPanel = mainElement
        const url = window.location.href.replace(window.location.origin, '')

        /* Checking the url and appending the appropriate panel to the mainPanel. */
        switch (url.split('/')[4]) {
            case 'submittedFiles':
                mainPanel.appendChild(MessagePanel())
                break;
            case 'viewFile=':
                mainPanel.appendChild(FilePanel(sessionStorage.getItem('viewFile')))
                break;
            default:
                mainPanel.appendChild(ErrorComponent())
        }
    }

    //for viewing submitted files and display comment
    const FilePanel = (fileUrl) => {
        const controlBar = () => {
            return ($({
                tag: 'div',
                att: {
                    className: 'viewerTool'
                }
            }))
        }
        const frame = $({
            tag: 'object',
            att: {
                className: 'frameViewer',
                data: fileUrl,
                type: 'application/pdf'
            }
        })
        return ($({
            tag: 'div',
            att: {
                className: 'fileViewerPanelRes'
            },
            child: [
                frame,
                controlBar()
            ]
        }))
    }
    // For submitted files list
    const MessagePanel = () => {
        let bodCo
        const searchBox = () => {

            const searchInput = $({
                tag: 'td',
                att: {
                    className: 'searchBoxTd'
                },
                child: [
                    $({
                        tag: 'span',
                        att: {
                            className: 'fa fa-search serIc'
                        },
                        style: { verticalAlign: 'middle' }
                    }),
                    $({
                        tag: 'input',
                        att: {
                            type: 'search',
                            className: 'searchInputRes',
                            id: 'search-input-res',
                            name: 'searchInputres',
                            placeholder: 'Search documents'
                        },
                        event: {
                            type: 'input',
                            method: (ev) => {
                                const child = bodCo.childNodes
                                let hasVisibleResults = false;

                                /* Check if child nodes exist */
                                if (!child || child.length === 0) {
                                    // Show "no results" message
                                    showNoResultsMessage();
                                    return;
                                }

                                /* Searching for the value of the input field and displaying the results. */
                                for (let x = 0; x < child.length; x++) { // Fixed: Added condition x < child.length
                                    if (child[x] && child[x].innerText) { // Added check for element existence
                                        const text = child[x].innerText || '';
                                        if (!text.toUpperCase().replace(' ', '').includes(ev.target.value.toUpperCase().replace(' ', ''))) {
                                            child[x].style.display = 'none'
                                        } else {
                                            child[x].style.display = 'block'
                                        }
                                    }
                                }
                                // Show/hide "no results" message
                                if (!hasVisibleResults && ev.target.value.trim() !== '') {
                                    showNoResultsMessage();
                                } else {
                                    hideNoResultsMessage();
                                }
                            }
                        }
                    })
                ]
            })
            //"no results" message element
            let noResultsMessage;
            const showNoResultsMessage = () => {
                if (!noResultsMessage) {
                    noResultsMessage = $({
                        tag: 'div',
                        style: {
                            textAlign: 'center',
                            color: '#999',
                            fontSize: '1.2vw',
                            fontFamily: 'arial, sans-serif',
                            marginTop: '2vh',
                            padding: '2vh',
                            display: 'none'
                        },
                        text: 'No matching documents found'
                    });
                    bodCo.appendChild(noResultsMessage);
                }
                noResultsMessage.style.display = 'block';
            };

            const hideNoResultsMessage = () => {
                if (noResultsMessage) {
                    noResultsMessage.style.display = 'none';
                }
            };

            return ($({
                tag: 'table',
                att: {
                    className: 'searchBoxRes'
                },
                child: [
                    $({
                        tag: 'tr',
                        child: [
                            searchInput,
                            $({
                                tag: 'td',
                                style: {
                                    width: '100%',
                                }
                            })
                        ]
                    })
                ]
            }))
        }
        const listDiv = ({ date, presenter, author, category, title, status, file, id, eventType, drive_view_url, drive_file_id, drive_download_url }) => {
            const Row = ({ span, label, text }) => {
                const getRowmin = (rw) => {
                    if (span) {
                        rw.appendChild($({
                            tag: 'td',
                            att: {
                                rowSpan: '2'
                            },
                            style: {
                                width: '5vw',
                                textAlign: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-file-pdf'
                                    },
                                    style: {
                                        fontSize: '3vw',
                                        textShadow: '-.2vw -.2vh .2vw #888,.2vw .2vh .2vw #444',
                                        color: '#333'
                                    }
                                })
                            ]
                        }))
                    }
                    rw.appendChild($({
                        tag: 'td',
                        style: {
                            fontWeight: 'bold',
                            fontFamily: 'arial,sanserif',
                            color: 'deepskyblue',
                            width: '5vw',
                            textAlign: 'right',
                            fontSize: '1vw'
                        },
                        text: label
                    }))
                    rw.appendChild($({
                        tag: 'td',
                        text: text,
                        style: {
                            fontFamily: 'arial,sanserif',
                            color: '#bbb',
                            paddingLeft: '1vw',
                            fontSize: '1vw'
                        }
                    }))
                }
                return ($({
                    tag: 'tr',
                    elementHandler: getRowmin
                }))
            }
            const Title = () => {
                return ($({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                colSpan: '3',
                                innerHTML: `<i>" ${title} "</i>`
                            },
                            style: {
                                fontFamily: 'monospace',
                                color: '#bbb',
                                fontSize: '1vw',
                                textDecoration: 'underline',
                                textDecorationColor: 'deepskyblue',
                                textAlign: 'center'
                            },

                        })
                    ]
                }))
            }
            const PresenterRow = () => {
                return ($({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                colSpan: '3'
                            },
                            style: {
                                textAlign: 'center',
                                padding: '0.5vh 0'
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    style: {
                                        fontFamily: 'arial,sans-serif',
                                        fontWeight: 'bold',
                                        color: 'deepskyblue',
                                        fontSize: '1vw',
                                        marginRight: '0.5vw'
                                    },
                                    text: 'Presenter: '
                                }),
                                $({
                                    tag: 'span',
                                    style: {
                                        fontFamily: 'arial,sans-serif',
                                        color: '#bbb',
                                        fontSize: '1vw'
                                    },
                                    text: presenter || 'Not specified'
                                })
                            ]
                        })
                    ]
                }))
            }
            const Viewer = () => {
                let viewerMain
                const getViewer = (el) => {
                    viewerMain = el
                }

                const closeView = $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        margin: 'auto',
                        marginTop: '1vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: ' Close',
                            att: {
                                className: 'fa-solid fa-right-from-bracket',
                            },
                            style: {
                                fontSize: '2vw',
                                cursor: 'pointer',
                                color: 'deepskyblue'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    viewerMain.remove()
                                }
                            }
                        })
                    ],
                })

                // Check if it's a Google Drive URL
                const isGoogleDriveUrl = file && file.includes('drive.google.com')

                let frame

                if (isGoogleDriveUrl) {
                    // Create a container for the viewer
                    frame = $({
                        tag: 'div',
                        style: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            marginTop: '1vh'
                        },
                        elementHandler: (el) => {
                            // Create the embed URL properly
                            const fileIdMatch = file.match(/\/d\/([a-zA-Z0-9_-]+)/)

                            if (fileIdMatch && fileIdMatch[1]) {
                                const fileId = fileIdMatch[1]
                                const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`

                                // Create iframe with proper attributes
                                const iframe = document.createElement('iframe')
                                iframe.src = embedUrl
                                iframe.style.width = '100%'
                                iframe.style.height = '100%'
                                iframe.style.border = 'none'
                                iframe.allow = 'autoplay'
                                iframe.title = 'Google Drive Document Viewer'

                                iframe.onerror = () => {
                                    // If iframe fails, show alternative options
                                    el.innerHTML = `
                                        <div style="
                                            color: white; 
                                            font-family: Arial, sans-serif; 
                                            padding: 20px;
                                            text-align: center;
                                            background: rgba(0,0,0,0.7);
                                            border-radius: 10px;
                                            margin: 20px;
                                        ">
                                            <h3>Document Access Required</h3>
                                            <p>This Google Drive document requires permission to view.</p>
                                            <div style="margin: 20px 0;">
                                                <a href="${file}" 
                                                target="_blank" 
                                                style="
                                                    display: inline-block;
                                                    padding: 10px 20px;
                                                    background: deepskyblue;
                                                    color: white;
                                                    text-decoration: none;
                                                    border-radius: 5px;
                                                    margin: 5px;
                                                ">
                                                    Open in Google Drive
                                                </a>
                                                <button onclick="location.reload()" 
                                                        style="
                                                            padding: 10px 20px;
                                                            background: #555;
                                                            color: white;
                                                            border: none;
                                                            border-radius: 5px;
                                                            margin: 5px;
                                                            cursor: pointer;
                                                        ">
                                                    Try Again
                                                </button>
                                            </div>
                                            <p><small>You may need to request access or sign in with the appropriate account</small></p>
                                        </div>
                                    `
                                }

                                el.appendChild(iframe)
                            } else {
                                // Invalid Google Drive URL format
                                el.innerHTML = `
                                    <div style="
                                        color: white; 
                                        text-align: center;
                                        padding: 20px;
                                    ">
                                        <p>Invalid Google Drive URL format</p>
                                        <a href="${file}" 
                                        target="_blank" 
                                        style="color: deepskyblue;">
                                            Open link directly
                                        </a>
                                    </div>
                                `
                            }
                        }
                    })
                } else {
                    // For local PDF files
                    frame = $({
                        tag: 'object',
                        att: {
                            className: 'frameViewer',
                            data: '/' + file,
                            type: 'application/pdf'
                        },
                        style: {
                            width: '80%',
                            height: '90%',
                            margin: 'auto',
                            marginTop: '1vh'
                        }
                    })
                }

                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        zIndex: '3',
                        backgroundColor: '#333',
                        top: '0',
                        left: '0',
                        textAlign: 'center'
                    },
                    elementHandler: getViewer,
                    child: [
                        frame,
                        closeView,
                    ]
                }))
            }
            const Controller = () => {
                const Status = $({
                    tag: 'div',
                    att: {
                        className: "fa-solid fa-comments viewListRes"
                    },
                    style: {
                        fontSize: '1vw',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                fontFamily: 'arial,sanserif',
                                fontWeight: 'bold',
                                margin: 'auto',
                                marginLeft: '.5vw'
                            },
                            text: 'Comments'
                        }),
                    ]
                })

                const View = $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-eye  viewListRes'
                    },
                    style: {
                        fontSize: '1vw',
                        margin: 'auto',
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'skyblue'
                    },
                    child: [
                        $({
                            tag: 'span',
                            style: {
                                fontFamily: 'arial,sanserif',
                                fontWeight: 'bold',
                                margin: 'auto',
                                marginLeft: '.5vw'
                            },
                            text: 'View Docs'
                        }),
                    ],
                    event: {
                        type: 'click',
                        method: () => {
                            // Check if we have the data object
                            if (typeof fileData === 'object' && fileData.drive_view_url) {
                                mainPanel.appendChild(Viewer(fileData))
                            } else {
                                // Fallback: try to construct data object
                                mainPanel.appendChild(Viewer({
                                    file: file,
                                    drive_view_url: file,
                                    drive_file_id: null
                                }))
                            }
                        }
                    }
                })

                const Delete = $({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-trash-can delRes'
                    },
                    style: {
                        paddingLeft: '1vw',
                        paddingRight: '1vw',
                        cursor: 'pointer'
                    },
                    event: {
                        type: 'click',
                        method: async () => {
                            if (confirm("Delete this File?")) {
                                const form = new FormData()
                                form.append('delResearch', 'true')
                                form.append('docId', id)
                                // Use Google Drive URL instead of local file
                                form.append('fileUrl', drive_view_url || file)
                                let loading = Waiting()
                                document.body.appendChild(loading)
                                const remove = () => {
                                    loading.remove()
                                }
                                await fetch('/uploadResearchFile', {
                                    method: 'POST',
                                    body: form
                                }).then(res => {
                                    if (res.ok) {
                                        remove()
                                        return res.json()
                                    }
                                }).then(dat => {
                                    alert(dat)
                                    if (dat.status) {
                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                            window.location.reload()
                                        }))
                                    } else {
                                        document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                            window.location.reload()
                                        }))
                                    }
                                })
                            }
                        }
                    }
                })

                return ($({
                    tag: 'tr',
                    child: [
                        $({
                            tag: 'td',
                            att: {
                                colSpan: '3'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        display: 'flex',
                                        justifyContent: 'center',
                                        width: '30vw',
                                        margin: 'auto',
                                        marginTop: '1vh'
                                    },
                                    child: [
                                        Status,
                                        View,
                                        Delete
                                    ]
                                })
                            ]
                        })
                    ]
                }))
            }
            return ($({
                tag: 'table',
                style: {
                    borderBottom: `solid thin ${(status) ? "ghostwhite" : "deepskyblue"}`,
                    width: '99%',
                    margin: 'auto'
                },
                att: {
                    className: 'listRes'
                },
                child: [
                    Row({
                        span: true,
                        label: 'Author: ',
                        text: author
                    }),
                    Row({
                        label: 'Category: ',
                        text: category
                    }),
                    PresenterRow(),
                    Title(),
                    Controller()
                ]
            }))
        }
        let panelAlllist
        const Endorsement = ({ date, researchPaper, endorsement, docId, eventType, status }) => {

            let getResPanelHideEl
            const getResPanelHide = (el) => {
                getResPanelHideEl = el
            }
            let endo

            const getEnd = (el) => {
                endo = el
            }

            const month = new Date(date.split(' ')[0]).toLocaleString('default', { month: 'long' });
            const dt = date.split(' ')[0].split('-')
            const time = date.split(' ')[1].split(':')

            const ViewEn = () => {
                let viewerMain

                const getViewer = (el) => {
                    viewerMain = el
                }

                const closeView = $({
                    tag: 'div',
                    style: {
                        width: '80%',
                        margin: 'auto',
                        marginTop: '1vh'
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: ' Close',
                            att: {
                                className: 'fa-solid fa-right-from-bracket',
                            },
                            style: {
                                fontSize: '2vw',
                                cursor: 'pointer',
                                color: 'deepskyblue'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    viewerMain.remove()
                                }
                            }
                        })
                    ],
                })

                // Create a function to render the file viewer based on file type
                const renderFileViewer = (fileUrl) => {
                    // Check if it's a Google Drive URL
                    const isGoogleDrive = isGoogleDriveUrl(fileUrl)

                    if (isGoogleDrive) {
                        // Handle Google Drive URL
                        const fileIdMatch = fileUrl.match(/\/d\/([a-zA-Z0-9_-]+)/)
                        let embedUrl = fileUrl

                        // If not already an embed URL, convert it
                        if (fileIdMatch && fileIdMatch[1] && !fileUrl.includes('/preview')) {
                            const fileId = fileIdMatch[1]
                            embedUrl = `https://drive.google.com/file/d/${fileId}/preview`
                        }

                        // Create iframe for Google Drive
                        return $({
                            tag: 'iframe',
                            att: {
                                src: embedUrl,
                                title: 'Google Drive Document Viewer'
                            },
                            style: {
                                width: '100%',
                                height: '100%',
                                border: 'none'
                            }
                        })
                    } else {
                        // Handle local file (prepend '/' if needed)
                        const localFileUrl = fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl

                        return $({
                            tag: 'object',
                            att: {
                                data: localFileUrl,
                                type: 'application/pdf',
                                className: 'frameViewer'
                            },
                            style: {
                                width: '100%',
                                height: '100%'
                            }
                        })
                    }
                }
                let endorseBody, resb, resState = false

                const reason = ({ message, by }) => {
                    return ($({
                        tag: 'div',
                        style: {
                            width: '40vw',
                            height: '70vh',
                            backgroundColor: '#444',
                            position: 'absolute',
                            top: '-70vh',
                            left: '0',
                            borderRadius: '0 .5vw .5vw 0',
                            boxShadow: '.3vw -.8vh 1vw rgba(0,0,0,0.5)',
                            display: 'flex',
                            justifyContent: 'center'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '90%',
                                    margin: 'auto',
                                    height: 'fit-content',
                                    maxHeight: '80%',
                                },
                                child: [
                                    $({
                                        tag: 'div',
                                        text: 'Correction',
                                        style: {
                                            fontFamily: 'arial black, sans-serif',
                                            fontSize: '2vw',
                                            color: '#999',
                                            textDecoration: 'underline'
                                        }
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            height: 'fit-content',
                                            maxHeight: '55vh',
                                            margin: 'uto',
                                            overflowY: 'auto',
                                            fontSize: '1.2w',
                                            color: '#bbb',
                                            fontFamily: 'arial black, sans-serif',
                                        },
                                        text: (message !== '') ? message : 'No Data available'
                                    })
                                ]
                            })
                        ],
                        elementHandler: (el) => {
                            resb = el
                        }
                    }))
                }

                const Contrl = $({
                    tag: 'div',
                    style: {
                        height: '8%',
                        width: '100%',
                        backgroundColor: 'grey',
                        justifyContent: 'center',
                        display: 'flex',
                        position: 'relative'
                    },
                    elementHandler: (el) => {
                        endorseBody = el
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '70%', // Increased width to accommodate 3 buttons
                                height: '100%',
                                margin: 'auto',
                                display: 'flex',
                                justifyContent: 'center',
                                marginLeft: '0',
                                backgroundColor: '#222'
                            },
                            child: [
                                // View Correction Button
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '33.33%', // Equal width for 3 buttons
                                        height: '90%',
                                        margin: 'auto',
                                        paddingRight: '1vw',
                                        paddingLeft: '1vw',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '.5vw'
                                    },
                                    att: {
                                        className: 'endorsCnt'
                                    },
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            const form = new FormData()
                                            form.append('rejectRequest', 'true')
                                            form.append('dicId', docId)
                                            await fetch('/getresearch', {
                                                method: 'POST',
                                                body: form
                                            }).then(res => res.json())
                                                .then(data => {
                                                    resState = !resState
                                                    if (resState) {
                                                        endorseBody.appendChild(reason({ message: data.message }))
                                                    } else {
                                                        resb.remove()
                                                    }
                                                })
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'View Correction',
                                            style: {
                                                fontFamily: 'arial black,sans-serif',
                                                fontSize: '1.1vw', // Slightly smaller
                                                width: 'fit-content',
                                                height: 'fit-content',
                                                margin: 'auto'
                                            }
                                        }),
                                    ]
                                }),

                                // Resubmit Button (NEW)
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '33.33%', // Equal width for 3 buttons
                                        height: '90%',
                                        margin: 'auto',
                                        paddingRight: '1vw',
                                        paddingLeft: '1vw',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '.5vw',
                                        backgroundColor: 'rgba(255, 165, 0, 0.2)' // Orange tint for visibility
                                    },
                                    att: {
                                        className: 'endorsCnt'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            if (researchPaper && researchPaper.length > 0) {
                                                const researchFileId = researchPaper[0].docId; // Get the researchfile ID
                                                handleResubmit(docId, endorsement, researchFileId);
                                            } else {
                                                // Fallback to just endorsement ID
                                                handleResubmit(docId, endorsement);
                                            }
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Resubmit',
                                            style: {
                                                fontFamily: 'arial black,sans-serif',
                                                fontSize: '1.1vw', // Slightly smaller
                                                width: 'fit-content',
                                                height: 'fit-content',
                                                margin: 'auto',
                                                color: '#FFA500' // Orange color
                                            }
                                        }),
                                    ]
                                }),

                                // Delete Button
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '33.33%', // Equal width for 3 buttons
                                        height: '90%',
                                        margin: 'auto',
                                        paddingRight: '1vw',
                                        paddingLeft: '1vw',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        borderRadius: '.5vw'
                                    },
                                    att: {
                                        className: 'endorsCnt'
                                    },
                                    event: {
                                        type: 'click',
                                        method: async () => {
                                            if (confirm("Are you sure you want to delete this file?")) {
                                                const filrUrl = [];
                                                researchPaper.forEach(val => {
                                                    filrUrl.push(val.researchFile)
                                                })
                                                let loading = Waiting()
                                                document.body.appendChild(loading)
                                                const remove = () => {
                                                    loading.remove()
                                                }
                                                const form = new FormData()
                                                form.append('docId', docId)
                                                form.append('fileUrl', endorsement)
                                                form.append('researchFileUrl', JSON.stringify(filrUrl))
                                                form.append('deleteEndorsement', 'true')
                                                await fetch('/getresearch', {
                                                    method: 'POST',
                                                    body: form
                                                }).then(res => {
                                                    if (res.ok) {
                                                        remove()
                                                        return res.json()
                                                    }
                                                })
                                                    .then(dat => {
                                                        if (dat.status) {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                window.location.reload()
                                                            }))
                                                        } else {
                                                            document.body.appendChild(ConfirmationAlert(dat.message, () => {
                                                                window.location.reload()
                                                            }))
                                                        }
                                                    })
                                            }
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            text: 'Delete',
                                            style: {
                                                fontFamily: 'arial black,sans-serif',
                                                fontSize: '1.1vw', // Slightly smaller
                                                width: 'fit-content',
                                                height: 'fit-content',
                                                margin: 'auto'
                                            }
                                        }),
                                    ]
                                }),
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-right-from-bracket'
                            },
                            style: {
                                fontSize: '2vw',
                                width: 'fit-content',
                                margin: 'auto'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    viewerMain.remove()
                                }
                            },
                            child: [
                                $({
                                    tag: 'span',
                                    text: 'Exit',
                                    style: {
                                        fontFamily: 'arial black,sans-serif'
                                    }
                                })
                            ]
                        })
                    ]
                })

                return ($({
                    tag: 'div',
                    style: {
                        width: '100%',
                        height: '100%',
                        backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        display: 'flex',
                        flexDirection: 'column'
                    },
                    elementHandler: getViewer,
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                height: '92%',
                                width: '100%',
                                display: 'flex',
                                justifyContent: 'center'
                            },
                            elementHandler: (el) => {
                                // Directly use the endorsement URL passed to the function
                                // The URL should already be correct (either Google Drive or local)
                                el.appendChild(renderFileViewer(endorsement))
                            }
                        }),
                        Contrl
                    ]
                }))
            }

            const DateFormat = $({
                tag: 'div',
                style: {
                    color: '#bbb',
                    textShadow: '-.1vw .1vh .1vw black',
                    fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                    fontSize: '1vw',
                    margin: 'auto',
                    marginLeft: '1vw',
                    fontWeight: 'bold'

                },
                text: dt[0] + ' ' + month + ', ' + dt[2] + ' | ' + TimeConvert(time)
            })
            const EventType = $({
                tag: 'div',
                style: {
                    color: 'black',
                    textShadow: '0 0 .5vw white',
                    fontFamily: 'arial black,sans-serif',
                    fontSize: '1.3vw',
                },
                text: eventType,
                elementHandler: (el) => {
                    if (status === 'rejected') {
                        el.style.backgroundImage = 'linear-gradient(to right,#faa,transparent)';
                        el.style.color = '#d32f2f';
                    } else if (status === null || status === '') {
                        el.style.backgroundImage = 'linear-gradient(to right,#FF9800,transparent)';
                        el.style.color = '#FF9800';
                    } else {
                        el.style.backgroundImage = 'linear-gradient(to right,#4CAF50,transparent)';
                        el.style.color = '#2E7D32';
                    }
                }
            })

            //notification based on status
            setTimeout(() => {
                // Check if popup container exists, if not create it
                let popupContainer = document.querySelector('.popup-container');
                if (!popupContainer) {
                    popupContainer = $({
                        tag: 'div',
                        att: {
                            className: 'popup-container'
                        },
                        style: {
                            position: 'fixed',
                            top: '10vh',
                            right: '2vw',
                            zIndex: '10000',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end',
                            gap: '0.8vw'
                        }
                    });
                    document.body.appendChild(popupContainer);
                }

                // Remove any existing popup for this document (to avoid duplicates)
                const existingPopups = document.querySelectorAll('.status-popup');
                existingPopups.forEach(popup => {
                    if (popup.getAttribute('data-doc-id') === docId) {
                        popup.remove();
                    }
                });

                if (status === 'rejected') {
                    const popup = createPopup({
                        type: 'rejected',
                        title: 'Document Rejected',
                        message: 'View your correction and resubmit',
                        docId: docId
                    });
                    popupContainer.appendChild(popup);

                } else if (status === 'accepted' || status === 'approved') {
                    const successPopup = createPopup({
                        type: 'success',
                        title: 'Document Accepted',
                        message: 'Your document has been approved',
                        docId: docId
                    });
                    popupContainer.appendChild(successPopup);

                } else if (status === null || status === '') {
                    const pendingPopup = createPopup({
                        type: 'pending',
                        title: 'Document Pending',
                        message: 'Waiting for review and acceptance',
                        docId: docId
                    });
                    popupContainer.appendChild(pendingPopup);
                }
            }, 300);

            // Helper function to create consistent popups
            function createPopup({ type, title, message, icon, docId }) {
                const popup = $({
                    tag: 'div',
                    att: {
                        className: `status-popup ${type}-popup`,
                        'data-doc-id': docId
                    },
                    style: {
                        background: (type === 'rejected') ? 'linear-gradient(45deg, #ff4444, #cc0000)' :
                            (type === 'success') ? 'linear-gradient(45deg, #4CAF50, #2E7D32)' :
                                'linear-gradient(45deg, #FF9800, #F57C00)',
                        color: 'white',
                        padding: '1vw 1.5vw',
                        borderRadius: '0.5vw',
                        boxShadow: (type === 'rejected') ? '0 0.5vw 1vw rgba(255, 68, 68, 0.3)' :
                            (type === 'success') ? '0 0.5vw 1vw rgba(76, 175, 80, 0.3)' :
                                '0 0.5vw 1vw rgba(255, 152, 0, 0.3)',
                        maxWidth: '25vw',
                        minWidth: '20vw',
                        borderLeft: (type === 'rejected') ? '0.5vw solid #ff8888' :
                            (type === 'success') ? '0.5vw solid #81C784' :
                                '0.5vw solid #FFB74D',
                        fontFamily: "'arial', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1vw',
                        animation: 'slideInRight 0.3s ease-out',
                        margin: '0'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                fontSize: '1.5vw',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '1.5vw'
                            },
                            text: icon
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'popup-content'
                            },
                            style: {
                                display: 'flex',
                                flexDirection: 'column',
                                flex: '1',
                                minWidth: '0'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'popup-title'
                                    },
                                    style: {
                                        fontWeight: 'bold',
                                        fontSize: '1.1vw',
                                        marginBottom: '0.2vw',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    },
                                    text: title
                                }),
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'popup-message'
                                    },
                                    style: {
                                        fontSize: '0.9vw',
                                        opacity: '0.9',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    },
                                    text: message
                                })
                            ]
                        }),
                        $({
                            tag: 'div',
                            att: {
                                className: 'fa-solid fa-xmark popup-close'
                            },
                            style: {
                                marginLeft: 'auto',
                                cursor: 'pointer',
                                fontSize: '1vw',
                                opacity: '0.8',
                                transition: 'opacity 0.2s',
                                minWidth: '1vw'
                            },
                            event: {
                                type: 'click',
                                method: () => {
                                    popup.classList.add('fade-out');
                                    setTimeout(() => popup.remove(), 500);
                                }
                            }
                        })
                    ]
                });

                // Auto-remove after appropriate time
                const autoRemoveTime = (type === 'rejected') ? 10000 : 5000;
                setTimeout(() => {
                    if (popup.parentNode) {
                        popup.classList.add('fade-out');
                        setTimeout(() => popup.remove(), 500);
                    }
                }, autoRemoveTime);

                return popup;
            }

            const ViewEndorsement = $({
                tag: 'div',
                att: {
                    className: 'fa-solid fa-eye viewerBotEndorseMain'
                },
                style: {
                    fontSize: '1vw',
                    justifyContent: 'center',
                    display: 'flex',
                    color: 'skyblue'
                },
                event: {
                    type: 'click',
                    method: () => {
                        mainPanel.appendChild(ViewEn())
                    }
                },
                child: [
                    $({
                        tag: 'div',
                        text: (status === 'rejected') ? 'View Correction' :
                            (status === null || status === '') ? 'Waiting for Acceptance' : "Accepted",
                        style: {
                            fontFamily: 'arial,sans-serif',
                            marginLeft: '.5vw',
                        },
                        elementHandler: (el) => {
                            if (status === 'rejected') {
                                el.style.color = '#f33';
                                el.style.fontWeight = 'bold';
                                el.style.animation = 'shake 0.5s ease-in-out';
                                setTimeout(() => {
                                    el.style.animation = '';
                                }, 500);
                            } else if (status === null || status === '') {
                                el.style.color = '#FF9800';
                                el.style.fontWeight = 'bold';
                                el.style.textShadow = '0 0 0.5vw rgba(255, 152, 0, 0.5)';
                                el.style.fontStyle = 'italic';
                            } else {
                                el.style.color = '#4CAF50';
                                el.style.fontWeight = 'bold';
                                el.style.textShadow = '0 0 0.5vw rgba(76, 175, 80, 0.5)';
                            }
                        }
                    })
                ]
            })

            const researchDocs = ({ resTitle, author, coAuthor, category, file, resId, drive_view_url, drive_file_id, presenter }) => {
                let mainIndiv
                const getlistIndiv = (el) => {
                    mainIndiv = el

                    el.appendChild(label("Title: ", resTitle))
                    el.append(label("Category: ", category))
                    el.appendChild(label("Presenter: ", presenter || 'Not specified'))
                    el.append(label("Author: ", author))
                    el.append(label("Co-Author(s) ", ""))
                    JSON.parse(coAuthor).forEach((val, i) => {
                        el.appendChild(label(`${i + 1}.)`, val))
                    })
                    el.append(control())
                }
                const label = (label, text) => {
                    return ($({
                        tag: 'div',
                        style: {
                            paddingRight: '.5vw',
                            paddingLeft: '.5vw',
                        },
                        att: {
                            innerHTML: `<span style="font-weight: bold; font-family: Arial,sans-serif;color: deepskyblue;font-size: 1vw">${label}</span> <span style="font-family: Arial,sans-serif;color: #bbb;font-size: 1vw; user-select: text">${text}</span>`
                        }
                    }))
                }
                let resDo
                const getResDo = async (el) => {
                    resDo = el
                }
                const control = () => {
                    let resNode
                    const getResason = (el) => {
                        resNode = el
                    }
                    const button = ({ icon, text, method }) => {
                        return ($({
                            tag: 'div',
                            att: {
                                className: icon,
                            },
                            style: {
                                fontSize: '1vw',
                                justifyContent: 'flex',
                                whiteSpace: 'nowrap',
                                margin: 'auto',
                                cursor: 'pointer',
                            },
                            event: method,
                            child: [
                                $({
                                    tag: 'span',
                                    text: text,
                                    style: {
                                        fontFamily: 'arial,sans-serif'
                                    }
                                })
                            ]
                        }))
                    }

                    const ResearchDocPan = (fileHolder, isGoogleDrive = false, driveFileId = null) => {
                        let docViewer;

                        if (isGoogleDrive && isGoogleDriveUrl(fileHolder)) {
                            // Get embed URL for Google Drive
                            let embedUrl = fileHolder;
                            if (!fileHolder.includes('/preview')) {
                                const fileId = driveFileId || (fileHolder.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]);
                                if (fileId) {
                                    embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
                                }
                            }

                            docViewer = $({
                                tag: 'iframe',
                                att: {
                                    src: embedUrl,
                                    type: 'application/pdf',
                                    sandbox: 'allow-same-origin allow-scripts allow-popups allow-forms',
                                    allow: 'autoplay'
                                },
                                style: {
                                    width: '65%',
                                    height: '100%',
                                    border: 'none',
                                    backgroundColor: 'white'
                                }
                            });
                        } else {
                            // Local file (fallback)
                            docViewer = $({
                                tag: 'object',
                                att: {
                                    data: '/' + fileHolder,
                                    type: 'application/pdf'
                                },
                                style: {
                                    width: '65%',
                                    height: '100%',
                                }
                            });
                        }

                        return ($({
                            tag: 'div',
                            style: {
                                margin: '1vh auto',
                                width: '100%',
                                height: '90%',
                                display: 'flex',
                                justifyContent: 'center'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '35%',
                                        height: '100%',
                                        overflowY: 'auto',
                                        backgroundColor: '#222'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                width: '98%',
                                                margin: 'auto',
                                                height: 'fit-content',
                                                overflowWrap: 'break-word'
                                            },
                                            elementHandler: (el) => {
                                                const comment = (data) => {
                                                    return ($({
                                                        tag: 'div',
                                                        elementHandler: (elCom) => {
                                                            const evalName = $({
                                                                tag: 'div',
                                                                style: {
                                                                    color: 'black',
                                                                    marginTop: '2vh',
                                                                    marginBottom: '1vh',
                                                                    borderBottom: 'solid thin rgba(200,200,200,0.5)',
                                                                    width: '50%'
                                                                },
                                                                child: [
                                                                    $({
                                                                        tag: 'span',
                                                                        style: {
                                                                            fontFamily: 'arial ,sans-serif',
                                                                            fontSize: '1.1vw',
                                                                        },
                                                                        text: "Evaluator :"
                                                                    }),
                                                                    $({
                                                                        tag: 'span',
                                                                        style: {
                                                                            fontFamily: 'arial ,sans-serif',
                                                                            fontSize: '1.1vw'
                                                                        },
                                                                        text: data.evalName
                                                                    })
                                                                ]
                                                            })
                                                            const perCommentBody = (title, textContent) => {
                                                                return ($({
                                                                    tag: 'div',
                                                                    style: {
                                                                        width: '95%',
                                                                        margin: 'auto',
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'div',
                                                                            text: title + ' :',
                                                                            style: {
                                                                                fontFamily: 'arial black, sans-serif',
                                                                                fontSize: '1vw',
                                                                                color: 'black',
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            att: {
                                                                                innerHTML: textContent + '\n\n',
                                                                            },
                                                                            style: {
                                                                                fontFamily: 'monospace',
                                                                                fontSize: '1vw',
                                                                                color: 'black'
                                                                            }
                                                                        })
                                                                    ]
                                                                }))
                                                            }
                                                            elCom.appendChild(evalName)
                                                            if (typeof data === 'object') {
                                                                if (data.title !== null && data.title !== '') {
                                                                    elCom.appendChild(perCommentBody("Title", data.title.replace('<br>', '')))
                                                                }
                                                                if (data.intro !== null && data.intro !== '') {
                                                                    elCom.appendChild(perCommentBody("Introduction", data.intro.replace('<br>', '')))
                                                                }
                                                                if (data.abstract !== null && data.abstract !== '') {
                                                                    elCom.appendChild(perCommentBody("Abstract", data.abstract))
                                                                }
                                                                if (data.objective !== null && data.objective !== '') {
                                                                    elCom.appendChild(perCommentBody("Objective", data.objective))
                                                                }
                                                                if (data.methodology !== null && data.methodology !== '') {
                                                                    elCom.appendChild(perCommentBody("Methodology", data.methodology))
                                                                }
                                                                if (data.results !== null && data.results !== '') {
                                                                    elCom.appendChild(perCommentBody("Result and Discussion", data.results))
                                                                }
                                                                if (data.recommendation !== null && data.recommendation !== '') {
                                                                    elCom.appendChild(perCommentBody("Recommendation and Conclusion", data.recommendation))
                                                                }
                                                                if (data.literature !== null && data.literature !== '') {
                                                                    elCom.appendChild(perCommentBody("Literature", data.literature))
                                                                }
                                                                if (data.other !== null && data.other !== '') {
                                                                    elCom.appendChild(perCommentBody("Other Comments", data.other))
                                                                }
                                                            }

                                                        },
                                                        style: {
                                                            borderBottom: 'solid thin grey',
                                                            marginBottom: '1vh',
                                                            backgroundColor: 'white'
                                                        }
                                                    }))
                                                }

                                                const form = new FormData()
                                                form.append('commentRequest', 'true')
                                                form.append('docId', resId)
                                                fetch('/uploadResearchFile', {
                                                    method: 'POST',
                                                    body: form
                                                }).then(res => res.json())
                                                    .then(data => {
                                                        if (data.length > 0) {
                                                            data.forEach(val => {
                                                                el.appendChild(comment(val))
                                                            })
                                                        } else {
                                                            el.appendChild($({
                                                                tag: 'div',
                                                                style: {
                                                                    width: '100%',
                                                                    height: '50vh',
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                },
                                                                child: [
                                                                    $({
                                                                        tag: 'div',
                                                                        text: 'No comment/reviews available...',
                                                                        style: {
                                                                            margin: 'auto',
                                                                            width: 'fit-content',
                                                                            height: 'ft-content',
                                                                            color: '#999',
                                                                            fontSize: '1.3vw',
                                                                            fontFamily: 'monospace ',
                                                                        }
                                                                    })
                                                                ]
                                                            }))
                                                        }

                                                    })
                                            }
                                        })
                                    ]
                                }),
                                docViewer
                            ]
                        }))
                    }
                    const comments = (Review, campusName) => {
                        let comm
                        const getComment = (el) => {
                            comm = el
                        }
                        let printBody

                        const Controller = () => {
                            const bot = ({ label, eventHandler, style, icon }) => {
                                return ($({
                                    tag: 'div',
                                    style: style,
                                    event: {
                                        type: 'click',
                                        method: eventHandler
                                    },
                                    att: {
                                        className: 'botPr'
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            style: {
                                                margin: 'auto',
                                                color: 'deepskyblue',
                                                fontSize: '1.1vw',
                                                display: 'flex',
                                                width: '100%',
                                                height: '100%'
                                            },
                                            child: [
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        margin: 'auto',
                                                        width: 'fit-content',
                                                        height: 'fit-content',
                                                        marginLeft: '.5vw',
                                                        marginRight: 'auto'
                                                    },
                                                    att: {
                                                        className: icon
                                                    }
                                                }),
                                                $({
                                                    tag: 'div',
                                                    style: {
                                                        margin: 'auto',
                                                        width: 'fit-content',
                                                        height: 'fit-content',
                                                        marginLeft: '.5vw',
                                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                                        marginRight: '100%'
                                                    },
                                                    text: label
                                                })
                                            ]
                                        })
                                    ]
                                }))
                            }

                            return ($({
                                tag: 'div',
                                style: {
                                    backgroundColor: '#555',
                                    width: '10%',
                                    height: '100%',
                                    margin: 'auto',
                                    marginLeft: '0',
                                    position: 'relative'
                                },
                                child: [
                                    bot({
                                        icon: 'fa-solid fa-print',
                                        label: 'Print',
                                        eventHandler: () => {
                                            const printPage = document.getElementById('commentPDF')
                                            let WinPrint = window.open('', '', 'toolbar=0,scrollbars=0,status=0');
                                            WinPrint.document.write('<head><link rel="stylesheet" media="print" href="/client/component/otherComponent/style/review.css"></head>')
                                            WinPrint.document.write(printPage.innerHTML);
                                            WinPrint.document.close();
                                            WinPrint.focus();
                                            WinPrint.print();
                                            WinPrint.close();
                                        },
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: '5vh',
                                            top: 'auto',
                                            height: '5vh',
                                            backgroundColor: '#444',
                                            width: '100%',
                                            cursor: 'pointer'
                                        }

                                    }),
                                    bot({
                                        icon: "fa-solid fa-rectangle-xmark",
                                        label: 'Close',
                                        eventHandler: () => {
                                            comm.remove()
                                        },
                                        style: {
                                            display: 'flex',
                                            justifyContent: 'center',
                                            position: 'absolute',
                                            bottom: '0',
                                            top: 'auto',
                                            height: '5vh',
                                            backgroundColor: '#444',
                                            width: '100%',
                                            cursor: 'pointer'
                                        },
                                    })
                                ]
                            }))
                        }


                        const print = $({
                            tag: 'div',
                            style: {
                                height: '100%',
                                justifyContent: 'center',
                                display: 'flex',
                                width: '100%',
                                overflowY: 'auto',
                                userSelect: 'text'
                            },


                            child: [
                                Print({
                                    title: resTitle,
                                    campus: campusName,
                                    author: author,
                                    category: category,
                                    date: '1-21-2022',
                                    review: Review,
                                    getHandler: (el) => {
                                        printBody = el
                                    }
                                }),
                                /*
                                Main({
                                    evalName: reviews.evalName,
                                    title: title,
                                    author: author,
                                    campus: '',
                                    category: reviews.category,
                                    date: '',
                                    intro: reviews.intro,
                                    abstract: reviews.abstract,
                                    objective: reviews.objective,
                                    methodology: reviews.methodology,
                                    results: reviews.results,
                                    recommendation: reviews.recommendation,
                                    literature: reviews.literature,
                                    other: reviews.other,

                                })
                                 */
                            ]
                        })
                        return ($({
                            tag: 'div',
                            style: {
                                position: 'absolute',
                                left: '0',
                                top: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#333',
                                justifyContent: 'center',
                                display: 'flex',
                                zIndex: '9999999'
                            },
                            elementHandler: getComment,
                            child: [
                                Controller(),
                                print
                            ]
                        }))
                    }
                    const resBody = () => {
                        const remover = $({
                            tag: 'div',
                            style: {
                                height: '8%',
                                width: '100%',
                                backgroundColor: '#333',
                                justifyContent: 'center',
                                display: 'flex'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-right-from-bracket comP'
                                    },
                                    style: {

                                        fontSize: '1.2vw',
                                        width: 'fit-content',
                                        margin: 'auto',
                                        cursor: 'pointer',
                                        marginLeft: '.5vw'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {
                                            resDo.remove()
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: 'Exit',
                                            style: {
                                                fontFamily: 'arial black,sans-serif'
                                            }
                                        })
                                    ]
                                }),
                                $({
                                    tag: 'div',
                                    att: {
                                        className: 'fa-solid fa-print comP'
                                    },
                                    style: {
                                        fontSize: '1.2vw',
                                        width: 'fit-content',
                                        margin: 'auto',
                                        cursor: 'pointer',
                                        marginLeft: '.5vw',
                                        marginRight: '70%'
                                    },
                                    event: {
                                        type: 'click',
                                        method: () => {

                                            const req = new Request('/uploadResearchFile')
                                            req.Post([
                                                {
                                                    name: 'commentRequest',
                                                    value: 'true'
                                                },
                                                {
                                                    name: 'docId',
                                                    value: resId
                                                }
                                            ])
                                            req.Json()
                                            req.Send().then(data => {
                                                const campusName = data.length > 0 ? data[0].campus : "No campus specified";
                                                bodCo.appendChild(comments(data, campusName))
                                            })
                                        }
                                    },
                                    child: [
                                        $({
                                            tag: 'span',
                                            text: 'Print Comments',
                                            style: {
                                                fontFamily: 'arial black,sans-serif'
                                            }
                                        })
                                    ]
                                }),
                            ]
                        })
                        // Determine if it's a Google Drive file
                        const fileUrl = drive_view_url || file
                        const isDriveFile = isGoogleDriveUrl(fileUrl)

                        return ($({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '100%',
                                backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                position: 'absolute',
                                top: '0',
                                left: '0',
                            },
                            elementHandler: getResDo,
                            child: [
                                ResearchDocPan(fileUrl, isDriveFile, drive_file_id),
                                remover,
                            ]
                        }))
                    }

                    return ($({
                        tag: 'div',
                        style: {
                            height: '4vh',
                            width: '95%',
                            //    backgroundColor:'grey',
                            margin: '1vh auto auto resBotIndi',
                            display: 'flex',
                            justifyContent: 'center',

                        },
                        child: [
                            button({
                                icon: 'fa-solid fa-file resBotIndi contr',
                                text: 'View Document',
                                method: {
                                    type: 'click',
                                    method: () => {
                                        mainPanel.appendChild(resBody())

                                    }
                                }
                            }),
                        ]
                    }))
                }

                return ($({
                    tag: 'div',
                    style: {
                        width: '95%',
                        height: 'fit-content',
                        margin: '1vh auto',
                        border: 'solid thin rgba(200,200,200,0.3)',
                        padding: '.2rem',
                        borderRadius: '.5vw'
                    },
                    elementHandler: getlistIndiv,
                    att: {
                        className: 'resListInn'
                    },

                }))
            }

            const OpenResearchers = () => {
                return ($({
                    tag: 'div',
                    att: {
                        className: 'fa-solid fa-eye viewerBotEndorseMain'
                    },
                    style: {
                        fontSize: '1vw',
                        justifyContent: 'center',
                        display: 'flex',
                        color: 'skyblue',
                        margin: 'auto'
                    },
                    event: {
                        type: 'click',
                        method: (event) => {
                            if (!getResPanelHideEl.className.includes('resHiderOpen')) {
                                getResPanelHideEl.className += ' resHiderOpen'
                                researchPaper.forEach(val => {
                                    getResPanelHideEl.appendChild(researchDocs({
                                        resTitle: val.title,
                                        author: val.author,
                                        presenter: val.presenter,
                                        coAuthor: val.coauthor,
                                        category: val.category,
                                        resId: val.docId,
                                        file: val.researchFile,
                                        drive_view_url: val.drive_view_url || val.researchFile,
                                        drive_file_id: val.drive_file_id,
                                        drive_download_url: val.drive_download_url
                                    }))
                                })
                                event.target.style.color = 'red'
                            } else {
                                getResPanelHideEl.className = getResPanelHideEl.className.replace(' resHiderOpen', '')
                                getResPanelHideEl.innerHTML = ''
                                event.target.style.removeProperty('color')
                            }

                        }
                    },
                    child: [
                        $({
                            tag: 'div',
                            text: 'Open Entry list',
                            style: {
                                fontFamily: 'arial,sans-serif',
                                marginLeft: '.5vw',
                                color: 'ghostwhite'
                            }
                        })
                    ]
                }))
            }

            const ResearchPanelHide = () => {
                return ($({
                    tag: 'div',
                    att: {
                        className: 'resHiderclose'
                    },
                    elementHandler: getResPanelHide,


                }))
            }

            return ($({
                tag: 'div',
                style: {
                    paddingTop: '1vh',
                    paddingBottom: '1vh',
                    margin: '.5vw auto',
                    paddingLeft: '1vw',
                    paddingRight: '1vw',
                    border: 'solid thin rgba(100,100,100,0.3)',
                    width: '90%',
                    cursor: 'pointer',
                    borderRadius: '.5vw'
                },
                elementHandler: (el) => {
                    el.addEventListener('mouseenter', function () {
                        this.style.backgroundColor = 'rgba(0,0,0,0.5)'
                        this.style.transition = '.3s'
                    })
                    el.addEventListener('mouseleave', function () {
                        this.style.backgroundColor = 'transparent'
                    })
                },

                child: [
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            width: 'fit-content',
                            //  backgroundImage:'linear-gradient(to right,grey,transparent)',
                            padding: '.2rem',
                            borderRadius: '1vw 0 0 1vw',
                            paddingLeft: '1vw',
                            paddingRight: '1vw'
                        },
                        elementHandler: (el) => {
                            if (status !== 'rejected') {
                                el.style.backgroundImage = 'linear-gradient(to right,grey,transparent)'
                            } else {
                                el.style.backgroundImage = 'linear-gradient(to right,#faa,transparent)'
                            }
                        },
                        child: [
                            EventType,
                            DateFormat,
                        ]
                    }),
                    $({
                        tag: 'div',
                        style: {
                            display: 'flex',
                            justifyContent: 'center',
                            marginTop: '1vh',

                        },
                        child: [
                            ViewEndorsement,
                            OpenResearchers(),

                        ]
                    }),
                    ResearchPanelHide()
                ]
            }))
        }
        const getListPanel = async (panel) => {
            bodCo = panel
            panelAlllist = panel
            const form = new FormData()
            form.append('researchReviewed', 'true')
            await fetch('/uploadResearchFile', {
                method: 'POST',
                body: form
            }).then(res => res.json())
                .then(data => {
                    data.list.forEach(val => {
                        panel.insertBefore(Endorsement({
                            date: val.date,
                            eventType: val.eventType,
                            researchPaper: val.ResearchDocs,
                            status: val.status,
                            endorsement: val.endorsementFile,
                            docId: val.id,
                        }), panel.childNodes[0])
                    })
                })
        }

        const listPanel = () => {

            return ($({
                tag: 'div',
                att: {
                    className: 'listPRes'
                },
                elementHandler: getListPanel
            }))
        }

        const ownPanel = () => {
            return ($({
                tag: 'div',
                style: {
                    width: '60%',
                    height: '100%',
                    margin: 'auto'
                },
                child: [
                    searchBox(),
                    listPanel()
                ]
            }))
        }
        const allPanel = () => {
            let MainBody

            const group = ({ text, id }) => {
                let StateBot = false, lebBot, bod

                const eventId = id;
                const cleanEventName = text.replace(/\s*\(ID:\s*\d+\)/i, '').trim();
                const ListCampus = (content, resList) => {
                    const Panel = (docID, fileUrl = null, fileType = 'local') => {
                        let mainP
                        const file = (url, type) => {
                            let fileViewer

                            if (type === 'drive') {
                                // For Google Drive files, open in new tab
                                window.open(url, '_blank');
                                return null;
                            } else {
                                // For local files, show in iframe/object
                                const isGoogleDriveUrl = url.includes('drive.google.com')

                                if (isGoogleDriveUrl) {
                                    fileViewer = $({
                                        tag: 'iframe',
                                        att: {
                                            src: url,
                                            type: 'application/pdf'
                                        },
                                        style: {
                                            width: '100%',
                                            height: '100%',
                                            border: 'none'
                                        }
                                    })
                                } else {
                                    fileViewer = $({
                                        tag: 'object',
                                        att: {
                                            data: '/' + url,
                                            type: 'application/pdf'
                                        },
                                        style: {
                                            width: '100%',
                                            height: '100%'
                                        }
                                    })
                                }

                                return ($({
                                    tag: 'div',
                                    style: {
                                        margin: 'auto',
                                        width: '80%',
                                        height: '98%',
                                        position: 'relative',
                                    },
                                    child: [
                                        $({
                                            tag: 'div',
                                            att: {
                                                className: 'fa-solid fa-circle-xmark'
                                            },
                                            style: {
                                                fontSize: '3vw',
                                                position: 'absolute',
                                                left: '-4vw',
                                                color: 'deepskyblue',
                                                cursor: 'pointer'
                                            },
                                            event: {
                                                type: 'click',
                                                method: () => {
                                                    mainP.remove()
                                                }
                                            },
                                        }),
                                        fileViewer
                                    ]
                                }))
                            }
                        }

                        if (fileType === 'drive') {
                            // For drive files, just open in new tab
                            window.open(fileUrl, '_blank');
                            return null;
                        }

                        return ($({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '100%',
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                display: 'flex',
                                justifyContent: 'center'
                            },
                            elementHandler: (el) => {
                                mainP = el

                                if (fileUrl) {
                                    // If file URL is provided directly, use it
                                    const viewer = file(fileUrl, fileType)
                                    if (viewer) el.appendChild(viewer)
                                } else {
                                    // Otherwise fetch from server
                                    const req = new Request('/uploadResearchFile')
                                    const reqList = []
                                    reqList.push({
                                        name: 'researchFile',
                                        value: 'true'
                                    })
                                    reqList.push({
                                        name: 'docId',
                                        value: docID
                                    })
                                    req.Post(reqList)
                                    req.Send().then(data => {
                                        const viewer = file(data, fileType)
                                        if (viewer) el.appendChild(viewer)
                                    }).catch(res => {
                                        console.log(res)
                                    })
                                }
                            }
                        }))
                    }

                    let bodEl, campState = false
                    const fileListName = ({ author, name, id, file, file_type, drive_file_id, drive_download_url, presenter }) => {
                        return ($({
                            tag: 'div',
                            style: {
                                textAlign: 'left',
                                width: '98%',
                                margin: 'auto',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                overflow: 'hidden',
                                paddingTop: '.5vh',
                                paddingBottom: '.5vh',
                                cursor: 'pointer'
                            },
                            att: {
                                title: `${name} - ${author} | Presenter: ${presenter || 'Not specified'}`,
                                className: 'perRes'
                            },
                            elementHandler: (el) => {
                                el.innerHTML = `<span style="font-size: 1.4vw" class="fa-solid fa-file-pdf"> &nbsp</span> ${name}`;
                            },
                            event: {
                                type: 'click',
                                method: async () => {
                                    let loading = Waiting()
                                    bodEl.appendChild(loading)
                                    const remove = () => {
                                        loading.remove()
                                    }

                                    const form = new FormData()
                                    form.append("checkAccess", "true")
                                    form.append("docId", id)

                                    try {
                                        const response = await fetch('/requestDocs', {
                                            method: 'POST',
                                            body: form
                                        })

                                        if (response.ok) {
                                            const dat = await response.json();
                                            remove();

                                            if (dat.status === 'allowed') {
                                                // Handle file opening based on file type
                                                if (file_type === 'drive' && file) {
                                                    // Open Google Drive file in new tab
                                                    window.open(file, '_blank');
                                                } else if (file) {
                                                    // Open local file in viewer
                                                    bodEl.appendChild(Panel(id, file, file_type));
                                                } else {
                                                    alert('File not found or unavailable');
                                                }
                                            } else if (dat.status === 'requested') {
                                                bodEl.appendChild(ConfirmationAlert("Request was sent. Please wait for the response..!", () => {
                                                    window.location.reload();
                                                }));
                                            } else {
                                                setTimeout(() => {
                                                    if (confirm("You don't have permission to open this file.\nDo you want to send a request?")) {
                                                        const req = new Request('/requestDocs');
                                                        const formReq = [];
                                                        formReq.push({
                                                            name: 'sendRequest',
                                                            value: 'true'
                                                        });
                                                        formReq.push({
                                                            name: 'docId',
                                                            value: id
                                                        });
                                                        req.Post(formReq);
                                                        req.Json();
                                                        req.Send().then(data => {
                                                            bodEl.appendChild(ConfirmationAlert(data.message, () => {
                                                                window.location.reload();
                                                            }))
                                                        })
                                                    }
                                                }, 50)
                                            }
                                        }
                                    } catch (error) {
                                        remove()
                                        console.error('Error checking access:', error)
                                    }
                                }
                            }
                        }))
                    }

                    return ($({
                        tag: 'div',
                        att: {
                            className: 'listCampEv'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                },
                                text: content,
                                event: {
                                    type: 'click',
                                    method: () => {
                                        campState = !campState
                                        if (campState) {
                                            resList.forEach(val => {
                                                bodEl.appendChild(fileListName({
                                                    author: val.author,
                                                    id: val.id,
                                                    name: val.title,
                                                    file: val.file,
                                                    file_type: val.file_type,
                                                    drive_file_id: val.drive_file_id,
                                                    drive_download_url: val.drive_download_url
                                                }));
                                            });
                                        } else {
                                            bodEl.innerHTML = ''
                                        }
                                    }
                                }
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    width: '100%',
                                    height: 'fit-content',
                                },
                                elementHandler: (el) => {
                                    bodEl = el
                                },
                            })
                        ]
                    }))
                }

                return ($({
                    tag: 'div',
                    style: {
                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                        width: '95%',
                        paddingBottom: '1vh',
                        paddingTop: '1vh',
                        border: 'solid thin grey',
                        margin: 'auto',
                        marginTop: '2vh',
                        borderRadius: '.5vw',
                        color: 'ghostwhite'
                    },
                    att: {
                        className: 'campDivBot'
                    },
                    child: [
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: '100%',
                                textAlign: 'center',
                                fontSize: '1vw',
                                cursor: 'pointer'
                            },
                            text: text, // This still shows the full text with ID
                            elementHandler: (el) => {
                                lebBot = el
                            },
                            event: {
                                type: 'click',
                                method: async (event) => {
                                    StateBot = !StateBot

                                    // Abort controller for cancelling requests
                                    const abortController = new AbortController();

                                    if (window.currentFileRequest) {
                                        window.currentFileRequest.abort();
                                    }
                                    window.currentFileRequest = abortController;

                                    // Show loading
                                    bod.innerHTML = '<div style="color: #bbb; font-family: arial; font-size: 1.2vw; margin: auto;">Loading files...</div>';

                                    try {
                                        const form = new FormData();
                                        form.append('researchFile', 'true');

                                        // Use the stored eventId directly instead of parsing from text
                                        if (!eventId) {
                                            throw new Error('Event ID is not available');
                                        }

                                        form.append('eventId', eventId);
                                        const response = await fetch('/uploadResearchFile', {
                                            method: 'POST',
                                            body: form,
                                            signal: abortController.signal
                                        });

                                        if (window.currentFileRequest === abortController) {
                                            window.currentFileRequest = null;
                                        }

                                        if (response.ok) {
                                            const data = await response.json();

                                            if (!abortController.signal.aborted) {
                                                bod.innerHTML = '';

                                                if (StateBot && data.status) {
                                                    if (data.list && data.list.length > 0) {
                                                        // Use event_id from response to determine center-based
                                                        const isCenterBased = data.event_id >= 13;

                                                        data.list.forEach(item => {
                                                            bod.style.marginTop = '2vh';

                                                            if (isCenterBased) {
                                                                // Use center display function for new events
                                                                if (typeof ListCenter === 'function') {
                                                                    bod.appendChild(ListCenter(item.name, item.list));
                                                                } else {
                                                                    // Fallback to campus display with label
                                                                    bod.appendChild(ListCampus(item.name + ' (Center)', item.list));
                                                                }
                                                            } else {
                                                                // Use campus display for old events
                                                                bod.appendChild(ListCampus(item.name, item.list));
                                                            }
                                                        });
                                                    } else {
                                                        bod.innerHTML = '<div style="color: #bbb; font-family: arial; font-size: 1.2vw; margin: auto;">No files found for this event</div>';
                                                        bod.style.marginTop = '2vh';
                                                    }
                                                } else {
                                                    bod.innerHTML = '';
                                                    bod.style.marginTop = '0';
                                                }
                                            }
                                        } else {
                                            let errorText = await response.text();
                                            console.error('HTTP error response:', errorText);

                                            if (!abortController.signal.aborted) {
                                                try {
                                                    const errorData = JSON.parse(errorText);
                                                    bod.innerHTML = '<div style="color: red; font-family: arial; font-size: 1.2vw; margin: auto;">Error: ' + (errorData.message || 'Unknown error') + '</div>';
                                                } catch {
                                                    bod.innerHTML = '<div style="color: red; font-family: arial; font-size: 1.2vw; margin: auto;">Error loading files (HTTP ' + response.status + '). Please try again.</div>';
                                                }
                                            }
                                        }
                                    } catch (error) {
                                        if (error.name !== 'AbortError' && !abortController.signal.aborted) {
                                            bod.innerHTML = '<div style="color: red; font-family: arial; font-size: 1.2vw; margin: auto;">Error: ' + error.message + '</div>';
                                            console.error('Error:', error);
                                        }
                                    } finally {
                                        if (window.currentFileRequest === abortController) {
                                            window.currentFileRequest = null;
                                        }
                                    }
                                }
                            },
                        }),
                        $({
                            tag: 'div',
                            style: {
                                width: '100%',
                                height: 'fit-content',
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                color: '#bbb'
                            },
                            elementHandler: (el) => {
                                bod = el
                            }
                        })
                    ]
                }))
            }
            const search = () => {
                const searchInput = $({
                    tag: 'td',
                    att: {
                        className: 'searchBoxTd' // Use the same class as left panel
                    },
                    style: {
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '30px',
                        padding: '4px 8px 4px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    },
                    child: [
                        $({
                            tag: 'span',
                            att: {
                                className: 'fa fa-search serIc' // Match left panel icon class
                            },
                            style: { verticalAlign: 'middle' }
                        }),
                        $({
                            tag: 'input',
                            att: {
                                type: 'search',
                                className: 'searchInputRes', // Use the same class as left panel
                                id: 'search-All-File',
                                name: 'searchAllFile',
                                placeholder: 'Search file name'
                            },
                            event: {
                                type: 'focus',
                                method: (ev) => {
                                    ev.target.style.width = '300px';
                                }
                            },
                            event: {
                                type: 'blur',
                                method: (ev) => {
                                    ev.target.style.width = '200px';
                                }
                            },
                            event: {
                                type: 'input',
                                method: async (ev) => {
                                    const searchTerm = ev.target.value.trim();
                                    const searchInput = ev.target;

                                    clearTimeout(searchInput._searchTimeout);

                                    searchInput._searchTimeout = setTimeout(async () => {
                                        if (MainBody) {
                                            MainBody.innerHTML = '';
                                        }

                                        if (searchTerm === '') {
                                            loadAllEvents();
                                            return;
                                        }

                                        MainBody.innerHTML = '<div style="color: #bbb; font-family: arial; font-size: 14px; margin: 20px auto; text-align: center;">Searching...</div>';

                                        try {
                                            const searchForm = new FormData();
                                            searchForm.append('searchResearch', 'true');
                                            searchForm.append('searchTerm', searchTerm);

                                            const searchResponse = await fetch('/uploadResearchFile', {
                                                method: 'POST',
                                                body: searchForm
                                            });

                                            if (searchResponse.ok) {
                                                const searchData = await searchResponse.json();
                                                MainBody.innerHTML = '';

                                                if (searchData.status && searchData.list && searchData.list.length > 0) {
                                                    displaySearchResults(searchData.list, searchTerm);
                                                } else {
                                                    MainBody.innerHTML = `<div style="color: #bbb; font-family: arial; font-size: 14px; margin: 20px auto; text-align: center;">No files found matching "${searchTerm}"</div>`;
                                                }
                                            } else {
                                                MainBody.innerHTML = `<div style="color: #f87171; font-family: arial; font-size: 14px; margin: 20px auto; text-align: center;">Search failed. Please try again.</div>`;
                                            }
                                        } catch (error) {
                                            console.error('Search error:', error);
                                            MainBody.innerHTML = `<div style="color: #f87171; font-family: arial; font-size: 14px; margin: 20px auto; text-align: center;">Search error: ${error.message}</div>`;
                                        }
                                    }, 500);
                                }
                            }
                        })
                    ]
                });

                return ($({
                    tag: 'table',
                    att: {
                        className: 'searchBoxRes' // Use the same class as left panel
                    },
                    style: {
                        margin: '16px',
                        width: 'auto',
                        flexShrink: '0'
                    },
                    child: [
                        $({
                            tag: 'tr',
                            child: [
                                searchInput,
                                $({
                                    tag: 'td',
                                    style: {
                                        width: '100%'
                                    }
                                })
                            ]
                        })
                    ]
                }));
            }
            const displaySearchResults = (searchResults, searchTerm) => {
                searchResults.forEach(eventGroup => {
                    if (eventGroup.list && eventGroup.list.length > 0) {
                        // Group files by campus within each event
                        const campusGroups = {};
                        eventGroup.list.forEach(file => {
                            const campus = file.campus || 'Unknown Campus';
                            if (!campusGroups[campus]) {
                                campusGroups[campus] = {
                                    name: campus,
                                    list: []
                                };
                            }
                            campusGroups[campus].list.push(file);
                        });

                        const campusArray = Object.values(campusGroups);
                        const totalFiles = campusArray.reduce((sum, campus) => sum + campus.list.length, 0);

                        // Create event group
                        const eventGroupElement = $({
                            tag: 'div',
                            style: {
                                fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                width: '95%',
                                paddingBottom: '1vh',
                                paddingTop: '1vh',
                                border: 'solid thin grey',
                                margin: 'auto',
                                marginTop: '2vh',
                                borderRadius: '.5vw'
                            },
                            att: {
                                className: 'campDivBot'
                            },
                            child: [
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: '100%',
                                        textAlign: 'center',
                                        fontSize: '1vw',
                                        fontWeight: 'bold',
                                        color: 'deepskyblue',
                                        cursor: 'pointer'
                                    },
                                    text: `${eventGroup.name} (${totalFiles} results)`,
                                    event: {
                                        type: 'click',
                                        method: (event) => {
                                            const nextDiv = event.target.parentElement.querySelector('.search-results-container');
                                            if (nextDiv) {
                                                if (nextDiv.style.display === 'none') {
                                                    nextDiv.style.display = 'block';
                                                    event.target.style.color = 'red';
                                                } else {
                                                    nextDiv.style.display = 'none';
                                                    event.target.style.color = 'deepskyblue';
                                                }
                                            }
                                        }
                                    }
                                }),
                                $({
                                    tag: 'div',
                                    style: {
                                        width: '100%',
                                        height: 'fit-content',
                                        fontFamily: 'Segoe UI Historic, Segoe UI, Helvetica, Arial, sans-serif',
                                        color: '#bbb',
                                        display: 'none',
                                        marginTop: '1vh'
                                    },
                                    att: {
                                        className: 'search-results-container'
                                    },
                                    elementHandler: (el) => {
                                        // Add campus groups
                                        campusArray.forEach(campusGroup => {
                                            // Create campus section
                                            const campusSection = $({
                                                tag: 'div',
                                                style: {
                                                    marginBottom: '1vh',
                                                    padding: '0.5vw',
                                                    backgroundColor: 'rgba(0,0,0,0.2)',
                                                    borderRadius: '0.5vw'
                                                },
                                                child: [
                                                    $({
                                                        tag: 'div',
                                                        style: {
                                                            fontWeight: 'bold',
                                                            color: '#bbb',
                                                            marginBottom: '0.5vh',
                                                            cursor: 'pointer'
                                                        },
                                                        text: `Campus: ${campusGroup.name} (${campusGroup.list.length} files)`,
                                                        event: {
                                                            type: 'click',
                                                            method: (e) => {
                                                                const fileList = e.target.parentElement.querySelector('.file-list-container');
                                                                if (fileList) {
                                                                    if (fileList.style.display === 'none') {
                                                                        fileList.style.display = 'block';
                                                                        e.target.style.color = 'orange';
                                                                    } else {
                                                                        fileList.style.display = 'none';
                                                                        e.target.style.color = '#bbb';
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }),
                                                    $({
                                                        tag: 'div',
                                                        style: {
                                                            paddingLeft: '1vw',
                                                            display: 'none'
                                                        },
                                                        att: {
                                                            className: 'file-list-container'
                                                        },
                                                        elementHandler: (fileContainer) => {
                                                            // Create a ListCampus function for search results
                                                            const SearchListCampus = (content, resList) => {
                                                                let bodEl, campState = false
                                                                const fileListName = ({ author, name, id, file, file_type, drive_file_id, drive_download_url }) => {
                                                                    return ($({
                                                                        tag: 'div',
                                                                        style: {
                                                                            textAlign: 'left',
                                                                            width: '98%',
                                                                            margin: 'auto',
                                                                            whiteSpace: 'nowrap',
                                                                            textOverflow: 'ellipsis',
                                                                            overflow: 'hidden',
                                                                            paddingTop: '.5vh',
                                                                            paddingBottom: '.5vh',
                                                                            cursor: 'pointer',
                                                                            color: '#e1e1e1'
                                                                        },
                                                                        att: {
                                                                            title: `${name} - ${author}`,
                                                                            className: 'perRes'
                                                                        },
                                                                        elementHandler: (el) => {
                                                                            el.innerHTML = `<span style="font-size: 1.4vw" class="fa-solid fa-file-pdf"> &nbsp</span> ${name}`;
                                                                        },
                                                                        event: {
                                                                            type: 'click',
                                                                            method: async () => {
                                                                                let loading = Waiting()
                                                                                bodEl.appendChild(loading)
                                                                                const remove = () => {
                                                                                    loading.remove()
                                                                                }

                                                                                const form = new FormData()
                                                                                form.append("checkAccess", "true")
                                                                                form.append("docId", id)

                                                                                try {
                                                                                    const response = await fetch('/requestDocs', {
                                                                                        method: 'POST',
                                                                                        body: form
                                                                                    })

                                                                                    if (response.ok) {
                                                                                        const dat = await response.json();
                                                                                        remove();

                                                                                        if (dat.status === 'allowed') {
                                                                                            // Handle file opening based on file type
                                                                                            if (file_type === 'drive' && file) {
                                                                                                // Open Google Drive file in new tab
                                                                                                window.open(file, '_blank');
                                                                                            } else if (file) {
                                                                                                // Open local file in viewer
                                                                                                const Panel = createPanelFunction();
                                                                                                bodEl.appendChild(Panel(id, file, file_type));
                                                                                            } else {
                                                                                                alert('File not found or unavailable');
                                                                                            }
                                                                                        } else if (dat.status === 'requested') {
                                                                                            bodEl.appendChild(ConfirmationAlert("Request was sent. Please wait for the response..!", () => {
                                                                                                window.location.reload();
                                                                                            }));
                                                                                        } else {
                                                                                            setTimeout(() => {
                                                                                                if (confirm("You don't have permission to open this file.\nDo you want to send a request?")) {
                                                                                                    const req = new Request('/requestDocs');
                                                                                                    const formReq = [];
                                                                                                    formReq.push({
                                                                                                        name: 'sendRequest',
                                                                                                        value: 'true'
                                                                                                    });
                                                                                                    formReq.push({
                                                                                                        name: 'docId',
                                                                                                        value: id
                                                                                                    });
                                                                                                    req.Post(formReq);
                                                                                                    req.Json();
                                                                                                    req.Send().then(data => {
                                                                                                        bodEl.appendChild(ConfirmationAlert(data.message, () => {
                                                                                                            window.location.reload();
                                                                                                        }))
                                                                                                    })
                                                                                                }
                                                                                            }, 50)
                                                                                        }
                                                                                    }
                                                                                } catch (error) {
                                                                                    remove()
                                                                                    console.error('Error checking access:', error)
                                                                                }
                                                                            }
                                                                        }
                                                                    }))
                                                                }

                                                                return ($({
                                                                    tag: 'div',
                                                                    att: {
                                                                        className: 'listCampEv'
                                                                    },
                                                                    child: [
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                width: '100%',
                                                                                cursor: 'pointer',
                                                                                fontWeight: 'bold',
                                                                                color: '#dcdcdc'
                                                                            },
                                                                            text: content,
                                                                            event: {
                                                                                type: 'click',
                                                                                method: () => {
                                                                                    campState = !campState
                                                                                    if (campState) {
                                                                                        resList.forEach(val => {
                                                                                            bodEl.appendChild(fileListName({
                                                                                                author: val.author,
                                                                                                id: val.id,
                                                                                                name: val.title,
                                                                                                file: val.file,
                                                                                                file_type: val.file_type,
                                                                                                drive_file_id: val.drive_file_id,
                                                                                                drive_download_url: val.drive_download_url
                                                                                            }));
                                                                                        });
                                                                                    } else {
                                                                                        bodEl.innerHTML = ''
                                                                                    }
                                                                                }
                                                                            }
                                                                        }),
                                                                        $({
                                                                            tag: 'div',
                                                                            style: {
                                                                                width: '100%',
                                                                                height: 'fit-content',
                                                                            },
                                                                            elementHandler: (el) => {
                                                                                bodEl = el
                                                                            },
                                                                        })
                                                                    ]
                                                                }))
                                                            }

                                                            // Helper function to create Panel function
                                                            const createPanelFunction = () => {
                                                                return (docID, fileUrl = null, fileType = 'local') => {
                                                                    let mainP
                                                                    const file = (url, type) => {
                                                                        let fileViewer

                                                                        if (type === 'drive') {
                                                                            window.open(url, '_blank');
                                                                            return null;
                                                                        } else {
                                                                            const isGoogleDriveUrl = url.includes('drive.google.com')

                                                                            if (isGoogleDriveUrl) {
                                                                                fileViewer = $({
                                                                                    tag: 'iframe',
                                                                                    att: {
                                                                                        src: url,
                                                                                        type: 'application/pdf'
                                                                                    },
                                                                                    style: {
                                                                                        width: '100%',
                                                                                        height: '100%',
                                                                                        border: 'none'
                                                                                    }
                                                                                })
                                                                            } else {
                                                                                fileViewer = $({
                                                                                    tag: 'object',
                                                                                    att: {
                                                                                        data: '/' + url,
                                                                                        type: 'application/pdf'
                                                                                    },
                                                                                    style: {
                                                                                        width: '100%',
                                                                                        height: '100%'
                                                                                    }
                                                                                })
                                                                            }

                                                                            return ($({
                                                                                tag: 'div',
                                                                                style: {
                                                                                    margin: 'auto',
                                                                                    width: '80%',
                                                                                    height: '98%',
                                                                                    position: 'relative',
                                                                                },
                                                                                child: [
                                                                                    $({
                                                                                        tag: 'div',
                                                                                        att: {
                                                                                            className: 'fa-solid fa-circle-xmark'
                                                                                        },
                                                                                        style: {
                                                                                            fontSize: '3vw',
                                                                                            position: 'absolute',
                                                                                            left: '-4vw',
                                                                                            color: 'deepskyblue',
                                                                                            cursor: 'pointer'
                                                                                        },
                                                                                        event: {
                                                                                            type: 'click',
                                                                                            method: () => {
                                                                                                mainP.remove()
                                                                                            }
                                                                                        },
                                                                                    }),
                                                                                    fileViewer
                                                                                ]
                                                                            }))
                                                                        }
                                                                    }

                                                                    if (fileType === 'drive') {
                                                                        window.open(fileUrl, '_blank');
                                                                        return null;
                                                                    }

                                                                    return ($({
                                                                        tag: 'div',
                                                                        style: {
                                                                            width: '100%',
                                                                            height: '100%',
                                                                            position: 'absolute',
                                                                            top: '0',
                                                                            left: '0',
                                                                            backgroundImage: 'radial-gradient(rgba(100,100,100,0.5),black)',
                                                                            display: 'flex',
                                                                            justifyContent: 'center'
                                                                        },
                                                                        elementHandler: (el) => {
                                                                            mainP = el

                                                                            if (fileUrl) {
                                                                                const viewer = file(fileUrl, fileType)
                                                                                if (viewer) el.appendChild(viewer)
                                                                            } else {
                                                                                const req = new Request('/uploadResearchFile')
                                                                                const reqList = []
                                                                                reqList.push({
                                                                                    name: 'researchFile',
                                                                                    value: 'true'
                                                                                })
                                                                                reqList.push({
                                                                                    name: 'docId',
                                                                                    value: docID
                                                                                })
                                                                                req.Post(reqList)
                                                                                req.Send().then(data => {
                                                                                    const viewer = file(data, fileType)
                                                                                    if (viewer) el.appendChild(viewer)
                                                                                }).catch(res => {
                                                                                    console.log(res)
                                                                                })
                                                                            }
                                                                        }
                                                                    }))
                                                                }
                                                            }

                                                            // Add files to container
                                                            const fileGroup = SearchListCampus(`Files from ${campusGroup.name}`, campusGroup.list);
                                                            fileContainer.appendChild(fileGroup);
                                                        }
                                                    })
                                                ]
                                            })
                                            el.appendChild(campusSection);
                                        })
                                    }
                                })
                            ]
                        })

                        MainBody.appendChild(eventGroupElement);
                    }
                })
            }

            // Helper function to load all events
            const loadAllEvents = async () => {
                if (!MainBody) return;

                MainBody.innerHTML = '<div style="color: #bbb; font-family: arial; font-size: 1.2vw; margin: auto;">Loading...</div>';

                try {
                    const form = new FormData();
                    form.append('getEventAdmin', 'true');

                    const response = await fetch('/eventRequest', {
                        method: 'POST',
                        body: form
                    });

                    if (response.ok) {
                        const data = await response.json();
                        MainBody.innerHTML = '';

                        data.forEach(val => {
                            MainBody.appendChild(group({
                                text: val.name,
                                id: val.id
                            }));
                        });
                    }
                } catch (error) {
                    console.error('Error loading events:', error);
                    MainBody.innerHTML = `<div style="color: red; font-family: arial; font-size: 1.2vw; margin: auto;">Error loading events</div>`;
                }
            }

            const bodyContainer = () => {
                return ($({
                    tag: 'div',
                    style: {
                        height: '94%',
                        width: '100%',
                        overflowY: 'auto',
                        textAlign: 'center',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                    },
                    elementHandler: async (el) => {
                        MainBody = el
                        loadAllEvents();
                    }
                }))
            }
            return ($({
                tag: 'div',
                style: {
                    width: '49%',
                    height: '100%',
                    margin: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                },
                child: [
                    $({
                        tag: 'div',
                        style: {
                            height: 'auto',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0',
                            flexShrink: '0'
                        },
                        child: [search()]
                    }),
                    bodyContainer()
                ]
            }))
        }

        return ($({
            tag: 'div',
            att: {
                className: 'messagePanelRes'
            },
            child: [
                ownPanel(),
                allPanel()
            ]
        }))
    }

    return ($({
        tag: 'div',
        style: {
            position: 'relative'
        },
        att: {
            className: 'createPan sumittedPan'
        },
        elementHandler: getMain
    }))
}

export const Research = () => {

    const tabButton = ({ label, url }) => {
        const current = window.location.href
        const isActive = url.split('/')[3] === current.replace(window.location.origin, '').split('/')[3]
        const getBot = (bot) => {
            if (isActive) {
                bot.className += ' tabActive'
            }
        }
        return ($({
            tag: 'td',
            att: {
                className: 'tabsres'
            },
            text: label,
            elementHandler: getBot,
            event: {
                type: 'click',
                method: () => {
                    window.location.assign(url)
                }
            }
        }))
    }
    const tabsPage = []
    tabsPage.push({
        url: '/user/research/submittedDocs/submittedFiles',
        tab: tabButton({
            label: 'Uploaded Documents',
            url: '/user/research/submittedDocs/submittedFiles'
        }),
        page: Submitted
    })
    tabsPage.push({
        url: '/user/research/createNewFle',
        tab: tabButton({
            label: 'Upload Event File',
            url: '/user/research/createNewFle'
        }),
        page: CreateNew
    })

    const tabs = ({ getRow }) => {
        return ($({
            tag: 'table',
            att: {
                className: 'tabsHeader'
            },
            child: [
                $({
                    tag: 'tr',
                    elementHandler: getRow
                })
            ]
        }))
    }

    const tabFrame = ({ getFrame }) => {
        return ($({
            tag: 'div',
            att: {
                className: 'tabFrame'
            },
            elementHandler: getFrame
        }))
    }
    const getTabsTable = (table) => {
        tabsPage.forEach(val => {
            table.appendChild(val.tab)
        })
        table.appendChild($({
            tag: 'td',
            style: {
                width: 'auto'
            }
        }))
    }
    const getResFrame = (frame) => {
        tabsPage.forEach(val => {
            const current = window.location.href
            const isActive = val.url.split('/')[3] === current.replace(window.location.origin, '').split('/')[3]
            if (isActive) {
                frame.appendChild(val.page())
            }
        })
    }
    return ($({
        externalStyle: '/client/component/userComponent/userComponentStyle/researchStyle.css',
        tag: 'div',
        att: {
            className: 'researchPanel'
        },
        child: [
            tabs({ getRow: getTabsTable }),
            tabFrame({ getFrame: getResFrame })
        ]
    }))
}
