import { $, ConfirmationAlert, Waiting, Request } from '../../../lib/lib.js';

export const handleResubmit = async (docId, endorsementUrl) => {
    // Create resubmit form modal with metadata fields
    let resubmitModal;
    let researchFileInput, programFileInput, endorsementFileInput;
    let researchFile, programFile, endorsementFile;
    
    // Show loading indicator
    const loading = Waiting()
    document.body.appendChild(loading)
    
    try {
        // Fetch the specific document data from the server by ID
        const formData = new FormData();
        formData.append('getRejectedForResubmit', 'true');
        formData.append('docId', docId);
        
        const response = await fetch('/getresearch', {
            method: 'POST',
            body: formData
        });
        
        loading.remove()
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        const data = await response.json();
        
        // Check if we have data
        if (!data || !data.data) {
            throw new Error('Unable to load document data');
        }  
        console.log('API Response:', data);
        
        // Get the document - handle both array and single object
        let currentDoc;
        if (Array.isArray(data.data) && data.data.length > 0) {
            currentDoc = data.data[0];
        } else if (typeof data.data === 'object') {
            currentDoc = data.data;
        } else {
            throw new Error('Document data format is invalid');
        }
        
        // Create an object to hold updated values that can be modified
        const updatedValues = {
            title: currentDoc.title || '',
            author: currentDoc.author || '',
            presenter: currentDoc.presenter || '',
            category: currentDoc.category || '',
            center: currentDoc.center || '',
            coauthors: []
        };
        
        // Parse coauthors - handle both array and string
        if (currentDoc.coauthor) {
            if (Array.isArray(currentDoc.coauthor)) {
                updatedValues.coauthors = currentDoc.coauthor;
            } else if (typeof currentDoc.coauthor === 'string') {
                try {
                    const parsed = JSON.parse(currentDoc.coauthor);
                    updatedValues.coauthors = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    // If it's not JSON, treat as comma-separated string
                    updatedValues.coauthors = currentDoc.coauthor.split(',').map(s => s.trim()).filter(s => s);
                }
            }
        }
        
        // Format coauthors for display
        const coauthorDisplayText = updatedValues.coauthors.join(', ');
        
        // Get file URLs with proper fallbacks
        const researchFileUrl = currentDoc.research_file?.url || 
                               currentDoc.drive_view_url || 
                               '';
        
        const programFileUrl = currentDoc.program_file?.url || 
                              currentDoc.program_drive_view_url || 
                              '';
        
        const endorsementFileUrl = currentDoc.endorsement_file?.url || 
                                  currentDoc.endorsement_url || 
                                  endorsementUrl || 
                                  '';
        
        const closeModal = () => {
            if (resubmitModal) resubmitModal.remove();
        };
        
        // Create the modal with the data
        resubmitModal = createResubmitModal({
            docId,
            currentDoc,
            updatedValues,
            coauthorDisplayText,
            researchFileUrl,
            programFileUrl,
            endorsementFileUrl,
            comments: currentDoc.comments || [], // Pass comments to the modal
            closeModal
        });
        
        document.body.appendChild(resubmitModal);
        
    } catch (error) {
        loading.remove();
        console.error('Error fetching document data:', error);
        alert('Error loading document information: ' + error.message);
    }
}

// Separate function to create the modal
function createResubmitModal(params) {
    const {
        docId,
        currentDoc,
        updatedValues,
        coauthorDisplayText,
        researchFileUrl,
        programFileUrl,
        endorsementFileUrl,
        comments,
        closeModal
    } = params;

    // Create local variables for file inputs
    let researchFile, programFile, endorsementFile;
    let researchFileInput, programFileInput, endorsementFileInput;

    // Create modal with metadata fields
    const resubmitModal = $({
        tag: 'div',
        style: {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: '10000',
            overflowY: 'auto'
        },
        child: [
            $({
                tag: 'div',
                style: {
                    width: '80%',
                    maxWidth: '1000px',
                    maxHeight: '90vh',
                    backgroundColor: '#2c3e50',
                    borderRadius: '8px',
                    padding: '20px',
                    position: 'relative',
                    overflowY: 'auto'
                },
                child: [
                    // Close button
                    $({
                        tag: 'div',
                        att: {
                            className: 'fa-solid fa-xmark'
                        },
                        style: {
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            fontSize: '1.5vw',
                            color: '#bbb',
                            cursor: 'pointer',
                            zIndex: '10001'
                        },
                        event: {
                            type: 'click',
                            method: closeModal
                        }
                    }),
                    
                    // Title
                    $({
                        tag: 'div',
                        style: {
                            fontSize: '1.5vw',
                            color: 'deepskyblue',
                            fontWeight: 'bold',
                            marginBottom: '20px',
                            textAlign: 'center',
                            paddingRight: '30px'
                        },
                        text: 'Resubmit Document'
                    }),
                    
                    // Rejection reason display
                    $({
                        tag: 'div',
                        style: {
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#e74c3c',
                            borderRadius: '4px',
                            color: 'white'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '1vw',
                                    fontWeight: 'bold',
                                    marginBottom: '5px'
                                },
                                text: 'Rejection Reason:'
                            }),
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '0.95vw'
                                },
                                text: currentDoc.rejection_reason || 'No reason provided'
                            })
                        ]
                    }),
                    
                    // Metadata Section
                    $({
                        tag: 'div',
                        style: {
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#34495e',
                            borderRadius: '4px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '1.2vw',
                                    color: 'deepskyblue',
                                    fontWeight: 'bold',
                                    marginBottom: '15px'
                                },
                                text: 'Document Information'
                            }),
                            
                            // Title
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Title'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: updatedValues.title
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                updatedValues.title = e.target.value;
                                            }
                                        }
                                    })
                                ]
                            }),
                            
                            // Author
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Author'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: updatedValues.author
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                updatedValues.author = e.target.value;
                                            }
                                        }
                                    })
                                ]
                            }),
                            
                            // Presenter
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Presenter'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: updatedValues.presenter
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                updatedValues.presenter = e.target.value;
                                            }
                                        }
                                    })
                                ]
                            }),
                            
                            // Category
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Category'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: updatedValues.category
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                updatedValues.category = e.target.value;
                                            }
                                        }
                                    })
                                ]
                            }),
                            
                            // Center
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Center'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: updatedValues.center
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                updatedValues.center = e.target.value;
                                            }
                                        }
                                    })
                                ]
                            }),
                            
                            // Coauthors
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Co-authors (comma separated)'
                                    }),
                                    $({
                                        tag: 'input',
                                        att: {
                                            type: 'text',
                                            value: coauthorDisplayText
                                        },
                                        style: {
                                            width: '100%',
                                            padding: '8px',
                                            backgroundColor: '#2c3e50',
                                            color: '#bbb',
                                            border: '1px solid #555',
                                            borderRadius: '4px',
                                            fontSize: '0.9vw'
                                        },
                                        event: {
                                            type: 'input',
                                            method: (e) => {
                                                const value = e.target.value;
                                                updatedValues.coauthors = value.split(',').map(s => s.trim()).filter(s => s);
                                            }
                                        }
                                    })
                                ]
                            })
                        ]
                    }),
                    
                    // Files Section
                    $({
                        tag: 'div',
                        style: {
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#34495e',
                            borderRadius: '4px'
                        },
                        child: [
                            $({
                                tag: 'div',
                                style: {
                                    fontSize: '1.2vw',
                                    color: 'deepskyblue',
                                    fontWeight: 'bold',
                                    marginBottom: '15px'
                                },
                                text: 'Upload New Files (leave empty to keep current)'
                            }),
                            
                            // Research File Input
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Research Paper (PDF)'
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'file',
                                                    accept: '.pdf,application/pdf'
                                                },
                                                style: {
                                                    flex: 1,
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    color: '#bbb',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px'
                                                },
                                                event: {
                                                    type: 'change',
                                                    method: (e) => {
                                                        researchFile = e.target.files[0];
                                                    }
                                                },
                                                elementHandler: (el) => {
                                                    researchFileInput = el;
                                                }
                                            }),
                                            researchFileUrl ? $({
                                                tag: 'a',
                                                att: {
                                                    href: researchFileUrl,
                                                    target: '_blank'
                                                },
                                                style: {
                                                    color: 'deepskyblue',
                                                    fontSize: '0.9vw',
                                                    textDecoration: 'none',
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    border: '1px solid deepskyblue',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap'
                                                },
                                                text: 'View Current'
                                            }) : null
                                        ].filter(Boolean)
                                    })
                                ]
                            }),
                            // Program File Input
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Program File (PDF)'
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'file',
                                                    accept: '.pdf,application/pdf'
                                                },
                                                style: {
                                                    flex: 1,
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    color: '#bbb',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px'
                                                },
                                                event: {
                                                    type: 'change',
                                                    method: (e) => {
                                                        programFile = e.target.files[0];
                                                    }
                                                },
                                                elementHandler: (el) => {
                                                    programFileInput = el;
                                                }
                                            }),
                                            programFileUrl ? $({
                                                tag: 'a',
                                                att: {
                                                    href: programFileUrl,
                                                    target: '_blank'
                                                },
                                                style: {
                                                    color: 'deepskyblue',
                                                    fontSize: '0.9vw',
                                                    textDecoration: 'none',
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    border: '1px solid deepskyblue',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap'
                                                },
                                                text: 'View Current'
                                            }) : null
                                        ].filter(Boolean)
                                    })
                                ]
                            }),
                            // Endorsement File Input
                            $({
                                tag: 'div',
                                style: {
                                    marginBottom: '15px'
                                },
                                child: [
                                    $({
                                        tag: 'label',
                                        style: {
                                            display: 'block',
                                            color: '#bbb',
                                            fontSize: '0.9vw',
                                            marginBottom: '5px'
                                        },
                                        text: 'Endorsement Letter (PDF)'
                                    }),
                                    $({
                                        tag: 'div',
                                        style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px'
                                        },
                                        child: [
                                            $({
                                                tag: 'input',
                                                att: {
                                                    type: 'file',
                                                    accept: '.pdf,application/pdf'
                                                },
                                                style: {
                                                    flex: 1,
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    color: '#bbb',
                                                    border: '1px solid #555',
                                                    borderRadius: '4px'
                                                },
                                                event: {
                                                    type: 'change',
                                                    method: (e) => {
                                                        endorsementFile = e.target.files[0];
                                                    }
                                                },
                                                elementHandler: (el) => {
                                                    endorsementFileInput = el;
                                                }
                                            }),
                                            endorsementFileUrl ? $({
                                                tag: 'a',
                                                att: {
                                                    href: endorsementFileUrl,
                                                    target: '_blank'
                                                },
                                                style: {
                                                    color: 'deepskyblue',
                                                    fontSize: '0.9vw',
                                                    textDecoration: 'none',
                                                    padding: '8px',
                                                    backgroundColor: '#2c3e50',
                                                    border: '1px solid deepskyblue',
                                                    borderRadius: '4px',
                                                    whiteSpace: 'nowrap'
                                                },
                                                text: 'View Current'
                                            }) : null
                                        ].filter(Boolean)
                                    })
                                ]
                            })
                        ]
                    }),
                    
                    // Submit Button
                    $({
                        tag: 'button',
                        style: {
                            padding: '10px 20px',
                            backgroundColor: 'deepskyblue',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '1vw',
                            cursor: 'pointer',
                            width: '100%',
                            marginTop: '10px'
                        },
                        text: 'Submit Resubmission',
                        event: {
                            type: 'click',
                            method: async () => {
                                await submitResubmit({
                                    docId,
                                    updatedValues,
                                    researchFile,
                                    programFile,
                                    endorsementFile,
                                    currentDoc,
                                    closeModal
                                });
                            }
                        }
                    })
                ]
            })
        ]
    });
    
    return resubmitModal;
}

export async function submitResubmit(params) {
    const {
        docId,
        updatedValues,
        researchFile,
        programFile,
        endorsementFile,
        currentDoc,
        closeModal
    } = params;

    // Check if any changes were made
    const originalCoauthorStr = JSON.stringify(updatedValues.coauthors);
    const currentCoauthorStr = JSON.stringify(currentDoc.coauthor ? 
        (Array.isArray(currentDoc.coauthor) ? currentDoc.coauthor : 
        (typeof currentDoc.coauthor === 'string' ? 
            (() => {
                try {
                    const parsed = JSON.parse(currentDoc.coauthor);
                    return Array.isArray(parsed) ? parsed : [];
                } catch {
                    return currentDoc.coauthor.split(',').map(s => s.trim()).filter(s => s);
                }
            })() : [])) : []);
    
    if (!researchFile && !programFile && !endorsementFile && 
        updatedValues.title === currentDoc.title && 
        updatedValues.author === currentDoc.author && 
        updatedValues.presenter === currentDoc.presenter && 
        updatedValues.category === currentDoc.category && 
        updatedValues.center === currentDoc.center && 
        originalCoauthorStr === currentCoauthorStr) {
        alert('No changes made. Please update at least one field or file.');
        return;
    }
    
    if (!confirm('Are you sure you want to resubmit this document?')) {
        return;
    }
    
    const submitLoading = Waiting();
    document.body.appendChild(submitLoading);
    
    try {
        const formData = new FormData();
        formData.append('resubmitDocument', 'true');
        formData.append('docId', docId);
        
        // Add updated metadata
        formData.append('title', updatedValues.title || '');
        formData.append('author', updatedValues.author || '');
        formData.append('presenter', updatedValues.presenter || '');
        formData.append('category', updatedValues.category || '');
        formData.append('center', updatedValues.center || '');
        formData.append('coauthor', JSON.stringify(updatedValues.coauthors || []));
        
        // Add files if changed
        if (researchFile) {
            formData.append('researchDoc', researchFile);
        }
        if (programFile) {
            formData.append('programFile', programFile);
        }
        if (endorsementFile) {
            formData.append('endorsementFile', endorsementFile);
        }
        
        const response = await fetch('/getresearch', {
            method: 'POST',
            body: formData
        });
        
        submitLoading.remove();
        closeModal();
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status) {
                document.body.appendChild(ConfirmationAlert(data.message, () => {
                    window.location.reload();
                }));
            } else {
                alert('Error: ' + data.message);
            }
        } else {
            alert('Failed to resubmit document');
        }
    } catch (error) {
        submitLoading.remove();
        console.error('Resubmit error:', error);
        alert('Error resubmitting document: ' + error.message);
    }
}