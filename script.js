// Global variables
let exerciseModal, setsModal, notesModal, clientNotesModal;
let createReportBtn, reportSection, addExerciseBtn, printReportBtn, exercisesList;
let clientNotesSection, clientNotesContent, clientNotesTextarea, saveClientNotesBtn;
let saveExerciseBtn, saveSetsBtn, saveNotesBtn;
let clientNameInput, trainerNameInput, dateInput;
let reportClientName, reportTrainerName, reportDate;
let exerciseNameInput, repsInput, weightInput, exerciseNotesInput, numSetsInput, setsCountInput;
let currentExerciseCard = null;
let currentExerciseNotes = '';

// Optimized DOM ready handler
function domReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

// Function to generate and print the report
function generateReport() {
    console.log('Generating report...');
    window.print();
}

// Initialize the app when the DOM is ready
domReady(() => {
    console.log('DOM is ready, initializing app...');
    // Set a flag to track if initialization is in progress
    let isInitialized = false;
    let initTimer = null;
    
    function initializeAll() {
        if (isInitialized || document.readyState === 'uninitialized') return;
        
        // Clear any pending initialization
        if (initTimer) {
            clearTimeout(initTimer);
            initTimer = null;
        }
        
        isInitialized = true;
        
        // Initialize app components
        initializeApp();
        
        // Initialize client notes immediately
        setupClientNotes();
        
        // Initialize modal key listeners
        if (typeof initModalKeyListeners === 'function') {
            initModalKeyListeners();
        }
    }
    
    // Use requestIdleCallback if available, otherwise use setTimeout
    if ('requestIdleCallback' in window) {
        requestIdleCallback(initializeAll, { timeout: 1000 });
    } else {
        // Fallback for browsers that don't support requestIdleCallback
        initTimer = setTimeout(initializeAll, 100);
    }
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
        if (initTimer) clearTimeout(initTimer);
    });
});

function initializeApp() {
    console.log('Initializing application...');
    
    // Get DOM elements
    createReportBtn = document.getElementById('createReportBtn');
    reportSection = document.getElementById('reportSection');
    addExerciseBtn = document.getElementById('addExerciseBtn');
    printReportBtn = document.getElementById('printReportBtn');
    exercisesList = document.getElementById('exercisesList');
    clientNotesSection = document.getElementById('clientNotesSection');
    clientNotesContent = document.getElementById('clientNotesContent');
    clientNotesTextarea = document.getElementById('clientNotesTextarea');
    saveClientNotesBtn = document.getElementById('saveClientNotesBtn');
    saveExerciseBtn = document.getElementById('saveExerciseBtn');
    saveSetsBtn = document.getElementById('saveSetsBtn');
    saveNotesBtn = document.getElementById('saveNotesBtn');
    clientNameInput = document.getElementById('clientName');
    trainerNameInput = document.getElementById('trainerName');
    dateInput = document.getElementById('sessionDate');
    reportClientName = document.getElementById('reportClientName');
    reportTrainerName = document.getElementById('reportTrainerName');
    reportDate = document.getElementById('reportDate');
    exerciseNameInput = document.getElementById('exerciseName');
    exerciseNotesInput = document.getElementById('exerciseNotes');
    setsCountInput = document.getElementById('setsCount');
    repsInput = document.getElementById('repsInput');
    weightInput = document.getElementById('weightInput');
    
    // Initialize empty state
    if (exercisesList) {
        updateExercisesEmptyState();
    }
    
    // Set up report info editing if available
    if (document.getElementById('editReportInfoBtn')) {
        setupReportInfoEditing();
    }
    
    // Add event listeners
    if (addExerciseBtn) {
        addExerciseBtn.addEventListener('click', showAddExerciseModal);
    }
    
    if (printReportBtn) {
        printReportBtn.addEventListener('click', printReport);
    }
    
    // Initialize modals
    const clientNotesModalEl = document.getElementById('clientNotesModal');
    const exerciseModalEl = document.getElementById('exerciseModal');
    const setsModalEl = document.getElementById('setModal');
    const notesModalEl = document.getElementById('notesModal');

    if (clientNotesModalEl) clientNotesModal = new bootstrap.Modal(clientNotesModalEl);
    if (exerciseModalEl) exerciseModal = new bootstrap.Modal(exerciseModalEl);
    if (setsModalEl) setsModal = new bootstrap.Modal(setsModalEl);
    if (notesModalEl) notesModal = new bootstrap.Modal(notesModalEl);

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    if (dateInput) {
        dateInput.value = today;
        dateInput.max = today; // Prevent future dates
    }
    
    // Add event listeners
    if (createReportBtn) {
        createReportBtn.removeEventListener('click', createReport);
        createReportBtn.addEventListener('click', createReport);
    }
    
    if (addExerciseBtn) {
        addExerciseBtn.removeEventListener('click', showAddExerciseModal);
        addExerciseBtn.addEventListener('click', showAddExerciseModal);
    }
    
    if (saveExerciseBtn) {
        saveExerciseBtn.removeEventListener('click', saveExercise);
        saveExerciseBtn.addEventListener('click', saveExercise);
    }
    
    if (saveSetsBtn) {
        // Remove any existing listeners to prevent duplicates
        const newSaveSetsBtn = saveSetsBtn.cloneNode(true);
        saveSetsBtn.parentNode.replaceChild(newSaveSetsBtn, saveSetsBtn);
        saveSetsBtn = newSaveSetsBtn;
        
        // Add new listener
        saveSetsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Save sets button clicked');
            saveSets();
        });
        
        // Also handle form submission if the button is inside a form
        const form = saveSetsBtn.closest('form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log('Form submitted');
                saveSets();
            });
        }
    }
    
    if (saveNotesBtn) {
        saveNotesBtn.removeEventListener('click', saveExerciseNotes);
        saveNotesBtn.addEventListener('click', saveExerciseNotes);
    }
    
    if (printReportBtn) {
        printReportBtn.removeEventListener('click', printReport);
        printReportBtn.addEventListener('click', printReport);
    }
    
    // Initialize modals
    if (document.getElementById('exerciseModal')) {
        document.getElementById('exerciseModal').addEventListener('shown.bs.modal', () => {
            if (exerciseNameInput) exerciseNameInput.focus();
        });
    }
    
    // Load any existing data
    if (typeof loadNotes === 'function') {
        loadNotes();
    }
}

function showAddExerciseModal() {
    if (!exerciseNameInput) return;
    exerciseNameInput.value = '';
    if (exerciseModal) exerciseModal.show();
}

function saveExercise() {
    if (!exerciseNameInput || !exerciseNameInput.value.trim()) {
        alert('Please enter an exercise name');
        return;
    }
    if (!exerciseNameInput.value.trim()) {
        alert('Please enter an exercise name');
        return;
    }
    
    // Create exercise card
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'card mb-3';
    exerciseCard.innerHTML = `
        <div class="card-body p-0">
            <div class="bg-light p-3 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">${exerciseNameInput.value}</h5>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary add-sets-btn me-2" title="Add sets">
                            Add Sets/Reps/Weight
                        </button>
                        <button class="btn btn-sm btn-outline-secondary add-notes-btn me-2" title="Add exercise notes">
                            <i class="bi bi-pencil">📝</i> Notes
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-exercise" title="Remove exercise">
                            <i class="bi bi-trash">🗑️</i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-3">
                <div class="sets-container">
                    <div class="set-header d-flex text-muted small mb-2">
                        <div class="col-2">Sets</div>
                        <div class="col-3">Reps</div>
                        <div class="col-3">Weight</div>
                        <div class="ms-auto">Actions</div>
                    </div>
                    <div class="sets-list">
                        <!-- Sets will be added here -->
                    </div>
                </div>
                <div class="exercise-notes mt-3 p-3 bg-light rounded d-none">
                    <!-- Notes will be added here -->
                </div>
            </div>
        </div>
    `;
    
    // Add sets button functionality
    const addSetsBtn = exerciseCard.querySelector('.add-sets-btn');
    addSetsBtn.addEventListener('click', () => {
        currentExerciseCard = exerciseCard;
        
        // Clear all form fields before showing the modal
        if (setsCountInput) setsCountInput.value = '';
        if (repsInput) repsInput.value = '';
        if (weightInput) weightInput.value = '';
        
        // Show the modal
        if (setsModal) {
            setsModal.show();
            
            // Focus on the sets count input after the modal is shown
            const handleShown = () => {
                if (setsCountInput) {
                    setsCountInput.focus();
                    setsCountInput.select();
                }
                // Remove the event listener to prevent multiple bindings
                const setsModalEl = document.getElementById('setModal');
                if (setsModalEl) {
                    setsModalEl.removeEventListener('shown.bs.modal', handleShown);
                }
            };
            
            // Add event listener for when modal is shown
            const setsModalEl = document.getElementById('setModal');
            if (setsModalEl) {
                setsModalEl.addEventListener('shown.bs.modal', handleShown);
            } else {
                // Fallback in case the event listener doesn't work
                setTimeout(() => {
                    if (setsCountInput) {
                        // Set default values only if fields are empty
                        if (!setsCountInput.value) setsCountInput.value = '3';
                        if (!repsInput.value) repsInput.value = '10';
                        if (weightInput) weightInput.value = '';
                        
                        setsCountInput.focus();
                        setsCountInput.select();
                    }
                }, 100);
            }
        }
    });
    
    // Add notes button functionality
    const addNotesBtn = exerciseCard.querySelector('.add-notes-btn');
    addNotesBtn.addEventListener('click', () => {
        currentExerciseCard = exerciseCard;
        const notesContainer = exerciseCard.querySelector('.exercise-notes');
        const existingNotes = notesContainer.textContent.trim();
        exerciseNotesInput.value = existingNotes;
        notesModal.show();
    });
    
    // Focus on notes input when notes modal is shown
    document.getElementById('notesModal').addEventListener('shown.bs.modal', () => {
        exerciseNotesInput.focus();
    });
    
    // Add delete exercise functionality
    const deleteExerciseBtn = exerciseCard.querySelector('.delete-exercise');
    deleteExerciseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this exercise and all its sets?')) {
            exerciseCard.remove();
            updateExercisesEmptyState();
        }
    });
    
    // Add exercise to the list
    if (exercisesList) {
        exercisesList.appendChild(exerciseCard);
        updateExercisesEmptyState();
        
        // Scroll to the new exercise
        exerciseCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Close modal
    if (exerciseModal) {
        exerciseModal.hide();
    }
}

// Global variable to track the set being edited
let currentEditingSet = null;

function saveSets() {
    console.log('saveSets called');
    if (!currentExerciseCard) {
        console.error('No current exercise card');
        return;
    }
    
    // Get the values directly from the input elements
    const setsCountEl = document.getElementById('setsCount');
    const repsEl = document.getElementById('repsInput');
    const weightEl = document.getElementById('weightInput');
    
    const setsCount = setsCountEl ? setsCountEl.value.trim() : '1';
    const reps = repsEl ? repsEl.value.trim() : '';
    const weight = weightEl ? weightEl.value.trim() : '';
    
    console.log('Form values:', { setsCount, reps, weight });
    
    let setsList = currentExerciseCard.querySelector('.sets-list');
    
    // If sets list doesn't exist, create it
    if (!setsList) {
        setsList = document.createElement('div');
        setsList.className = 'sets-list';
        currentExerciseCard.appendChild(setsList);
    }
    
    if (currentEditingSet) {
        console.log('Updating existing set:', currentEditingSet);
        
        // Update the existing set directly
        const setsCell = currentEditingSet.querySelector('.set-sets');
        const repsCell = currentEditingSet.querySelector('.set-reps');
        const weightCell = currentEditingSet.querySelector('.set-weight');
        
        if (setsCell) setsCell.textContent = setsCount || '1';
        if (repsCell) repsCell.textContent = reps || '-';
        if (weightCell) weightCell.textContent = weight || '-';
        
        console.log('Updated set with new values:', { setsCount, reps, weight });
        
        // Clear the editing reference
        currentEditingSet = null;
    } else {
        console.log('Creating new set');
        // Create a new set item
        const setItem = document.createElement('div');
        setItem.className = 'set-item d-flex align-items-center mb-2';
        
        setItem.innerHTML = `
            <div class="col-2 set-sets">${setsCount || '1'}</div>
            <div class="col-3 set-reps">${reps || '-'}</div>
            <div class="col-3 set-weight">${weight || '-'}</div>
            <div class="ms-auto">
                <button class="btn btn-sm btn-outline-secondary edit-set me-1" title="Edit set">
                    <i class="bi bi-pencil">✏️</i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-set" title="Delete set">
                    <i class="bi bi-trash">🗑️</i>
                </button>
            </div>
        `;
        
        setsList.appendChild(setItem);
        setupSetItemListeners(setItem);
        
        console.log('Created new set');
    }
    
    // Reset form and close modal
    if (setsModal) {
        console.log('Hiding sets modal');
        // Hide the modal first to prevent any further interactions
        const modalInstance = bootstrap.Modal.getInstance(document.getElementById('setModal'));
        if (modalInstance) {
            modalInstance.hide();
        } else {
            setsModal.hide();
        }
        
        // Reset form fields after a small delay to ensure modal is hidden
        setTimeout(() => {
            console.log('Resetting form fields');
            // Clear the form for next use
            if (setsCountInput) setsCountInput.value = '';
            if (repsInput) repsInput.value = '';
            if (weightInput) weightInput.value = '';
            
            // Reset the save button text for next use
            const saveBtn = document.getElementById('saveSetsBtn');
            if (saveBtn) {
                saveBtn.textContent = 'Add Set';
            }
            
            // Reset the current editing set
            currentEditingSet = null;
        }, 100);
    }
}

function setupSetItemListeners(setItem) {
    // Edit set button
    const editBtn = setItem.querySelector('.edit-set');
    if (editBtn) {
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent event bubbling
            const row = e.target.closest('.set-item');
            const sets = row.querySelector('.set-sets')?.textContent.trim();
            const reps = row.querySelector('.set-reps')?.textContent.trim();
            const weight = row.querySelector('.set-weight')?.textContent.trim();
            
            // Set the modal values
            if (setsCountInput) setsCountInput.value = sets === '-' ? '' : sets;
            if (repsInput) repsInput.value = reps === '-' ? '' : reps;
            if (weightInput) weightInput.value = weight === '-' ? '' : weight;
            
            // Store the row we're editing in the global variable
            currentEditingSet = row;
            
            // Change the save button text
            const saveBtn = document.getElementById('saveSetsBtn');
            if (saveBtn) {
                saveBtn.textContent = 'Update Set';
            }
            
            // Show the modal
            if (setsModal) {
                setsModal.show();
            }
        });
    }
    
    // Delete set button
    const deleteBtn = setItem.querySelector('.delete-set');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', (e) => {
            if (confirm('Are you sure you want to delete this set?')) {
                const row = e.target.closest('.set-item');
                row.remove();
                // Update set numbers after deletion
                const setsList = currentExerciseCard?.querySelector('.sets-list');
                if (setsList) {
                    updateSetNumbers(setsList);
                }
            }
        });
    }
}

function saveExerciseNotes() {
    if (!currentExerciseCard || !exerciseNotesInput) return;
    
    const notesContainer = currentExerciseCard.querySelector('.exercise-notes');
    const notes = exerciseNotesInput.value.trim();
    
    if (notes) {
        notesContainer.innerHTML = `
            <div class="notes-header fw-bold mb-2">Notes on ${currentExerciseCard.querySelector('h4')?.textContent || 'this exercise'}:</div>
            <div class="notes-content">${notes.replace(/\n/g, '<br>')}</div>
        `;
        notesContainer.classList.remove('d-none');
    } else {
        notesContainer.innerHTML = '';
        notesContainer.classList.add('d-none');
    }
    
    if (notesModal) notesModal.hide();
}

// Update set numbers after deletion
function updateSetNumbers(setsList) {
    const setItems = setsList.querySelectorAll('.set-item');
    setItems.forEach((item, index) => {
        const numberElement = item.querySelector('.set-number');
        if (numberElement) {
            numberElement.textContent = index + 1;
        }
    });
}

// Client Notes Section
function setupClientNotes() {
    // Early return if we've already initialized or if we're in the middle of initializing
    if (window.clientNotesInitialized) return;
    window.clientNotesInitialized = true;
    
    // Mark that we're initializing to prevent duplicate initializations
    const initKey = Symbol('clientNotesInit');
    if (window[initKey]) return;
    window[initKey] = true;
    
    // Cache DOM elements
    const addClientNoteBtn = document.getElementById('addClientNoteBtn');
    const clientNotesSection = document.getElementById('clientNotesSection');
    const clientNotesList = document.getElementById('clientNotesList');
    const clientNoteModalEl = document.getElementById('clientNotesModal');
    const saveClientNoteBtn = document.getElementById('saveClientNoteBtn');
    const clientNoteTitleInput = document.getElementById('clientNoteTitle');
    const clientNoteContentInput = document.getElementById('clientNoteContent');
    
    // Early exit if required elements don't exist
    if (!clientNoteModalEl || !saveClientNoteBtn || !clientNoteTitleInput || !clientNoteContentInput) {
        console.warn('Client notes elements not found. Skipping client notes initialization.');
        return;
    }
    
    // Initialize modal only once
    const clientNoteModal = new bootstrap.Modal(clientNoteModalEl, {
        keyboard: true,
        backdrop: true
    });
    
    let currentNoteId = null;
    let notes = [];
    
    // Ensure client notes section is visible
    if (clientNotesSection) {
        clientNotesSection.style.display = 'block';
        clientNotesSection.style.visibility = 'visible';
    }

    // Lazy load notes with requestIdleCallback
    function loadNotes() {
        if (notes.length > 0) return; // Already loaded
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback(renderNotes, { timeout: 500 });
        } else {
            setTimeout(renderNotes, 0);
        }
    }

    // Save notes (no persistence)
    function saveNotes() {
        // No need to save to localStorage
    }

    // Render all notes
    function renderNotes() {
        clientNotesList.innerHTML = '';
        
        if (notes.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'text-center p-4 bg-light rounded-3';
            emptyState.style.color = '#6c757d';
            emptyState.style.fontStyle = 'italic';
            emptyState.style.minHeight = '80px';
            emptyState.style.display = 'flex';
            emptyState.style.alignItems = 'center';
            emptyState.style.justifyContent = 'center';
            emptyState.textContent = 'No client notes added yet. Click the "Add Client Notes" button to get started.';
            clientNotesList.appendChild(emptyState);
            return;
        }
        
        notes.forEach((note, index) => {
            const noteElement = createNoteElement(note, index);
            clientNotesList.appendChild(noteElement);
        });
    }

    // Create a note element
    function createNoteElement(note, index) {
        const noteElement = document.createElement('div');
        noteElement.className = 'card mb-3';
        noteElement.innerHTML = `
            <div class="card-body p-0">
                <div class="bg-light p-3 border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">${note.title || 'Untitled Note'}</h5>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-outline-primary edit-note" data-id="${index}">
                                <i class="bi bi-pencil">✏️</i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-note" data-id="${index}">
                                <i class="bi bi-trash">🗑️</i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="p-3">
                    <p class="card-text">${note.content.replace(/\n/g, '<br>')}</p>
                </div>
            </div>
        `;
        return noteElement;
    }

    // Add new note
    function addNote(title, content) {
        const newNote = {
            id: Date.now(),
            title: title.trim(),
            content: content.trim(),
            timestamp: new Date().toISOString()
        };
        notes.push(newNote);
        saveNotes();
        renderNotes();
        
        // No need to show/hide the section as it's always visible now
    }

    // Update existing note
    function updateNote(id, title, content) {
        const noteIndex = notes.findIndex(note => note.id === id);
        if (noteIndex !== -1) {
            notes[noteIndex] = {
                ...notes[noteIndex],
                title: title.trim(),
                content: content.trim(),
                updatedAt: new Date().toISOString()
            };
            saveNotes();
            renderNotes();
        }
    }

    // Delete note
    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
    }

    // Open modal for new note
    function openNewNoteModal() {
        currentNoteId = null;
        document.getElementById('clientNoteTitle').value = '';
        document.getElementById('clientNoteContent').value = '';
        
        // Show the modal
        clientNoteModal.show();
        
        // Focus on the title field after the modal is shown
        const clientNotesModalEl = document.getElementById('clientNotesModal');
        const handleShown = () => {
            const titleInput = document.getElementById('clientNoteTitle');
            if (titleInput) {
                titleInput.focus();
            }
            // Remove the event listener to prevent multiple bindings
            clientNotesModalEl.removeEventListener('shown.bs.modal', handleShown);
        };
        
        if (clientNotesModalEl) {
            clientNotesModalEl.addEventListener('shown.bs.modal', handleShown);
        } else {
            // Fallback in case the event listener doesn't work
            setTimeout(() => {
                const titleInput = document.getElementById('clientNoteTitle');
                if (titleInput) titleInput.focus();
            }, 100);
        }
    }

    // Open modal to edit existing note
    function openEditNoteModal(id) {
        const note = notes.find(n => n.id === id);
        if (note) {
            currentNoteId = id;
            clientNoteTitleInput.value = note.title || '';
            clientNoteContentInput.value = note.content;
            clientNoteModal.show();
        }
    }

    // Event Listeners
    if (addClientNoteBtn) {
        addClientNoteBtn.addEventListener('click', openNewNoteModal);
    }

    saveClientNoteBtn.addEventListener('click', () => {
        const title = clientNoteTitleInput.value;
        const content = clientNoteContentInput.value;
        
        if (!content.trim()) {
            alert('Please enter note content');
            return;
        }
        
        if (currentNoteId === null) {
            addNote(title, content);
        } else {
            updateNote(currentNoteId, title, content);
        }
        
        clientNoteModal.hide();
    });

    // Handle edit and delete buttons
    clientNotesList.addEventListener('click', (e) => {
        const target = e.target.closest('.edit-note') || e.target.closest('.delete-note');
        if (!target) return;
        
        const id = parseInt(notes[target.dataset.id].id);
        if (target.classList.contains('edit-note')) {
            openEditNoteModal(id);
        } else if (target.classList.contains('delete-note')) {
            if (confirm('Are you sure you want to delete this note?')) {
                deleteNote(id);
            }
        }
    });

    // Initialize empty notes array
    notes = [];
    
    // Render any existing notes (though array is empty initially)
    renderNotes();
    
    // Set up the add client note button
    if (addClientNoteBtn) {
        addClientNoteBtn.addEventListener('click', openNewNoteModal);
    }
}

function createReport() {
    console.log('createReport function called');
    
    if (!clientNameInput || !trainerNameInput || !dateInput || !reportClientName || !reportTrainerName || !reportDate) {
        alert('Please fill in all required fields');
        return;
    }
    
    // Update report info
    updateReportInfo(clientNameInput.value, trainerNameInput.value, dateInput.value);
    
    // Get the initial card and report section
    const initialCard = document.querySelector('.info-card');
    console.log('Initial card element:', initialCard);
    
    // First, prepare the report section (hidden but taking up space)
    if (reportSection) {
        reportSection.style.visibility = 'hidden';
        reportSection.style.position = 'absolute';
        reportSection.style.opacity = '0';
        reportSection.style.width = '100%';
        reportSection.classList.remove('d-none');
    }
    
    if (initialCard) {
        console.log('Starting fade out animation for initial card');
        // Start the fade out animation
        initialCard.style.transition = 'opacity 0.3s ease-out, height 0.3s ease-out, margin 0.3s ease-out, padding 0.3s ease-out';
        
        // Apply the fade out
        initialCard.style.opacity = '0';
        initialCard.style.height = '0';
        initialCard.style.margin = '0';
        initialCard.style.padding = '0';
        initialCard.style.overflow = 'hidden';
        
        // After the animation completes, hide the element completely
        // and show the report section
        setTimeout(() => {
            initialCard.classList.add('d-none');
            console.log('Initial card hidden');
            
            if (reportSection) {
                reportSection.style.removeProperty('position');
                reportSection.style.removeProperty('visibility');
                reportSection.style.opacity = '0';
                
                // Trigger reflow
                void reportSection.offsetWidth;
                
                // Fade in the report section
                reportSection.style.transition = 'opacity 0.3s ease-in';
                reportSection.style.opacity = '1';
            }
        }, 300);
    } else {
        console.log('Could not find initial card element');
        // If no initial card, just show the report section
        if (reportSection) {
            reportSection.classList.remove('d-none');
            reportSection.style.opacity = '1';
        }
    }

    
    // Show client notes section
    if (clientNotesSection) {
        console.log('Showing client notes section');
        clientNotesSection.classList.remove('d-none');
    } else {
        console.log('Client notes section not found');
    }
    
    // Show print button
    if (printReportBtn) {
        console.log('Showing print button');
        printReportBtn.classList.remove('d-none');
    } else {
        console.log('Print button not found');
    }
}

// Update report information display
function updateReportInfo(clientName, trainerName, dateString) {
    reportClientName.textContent = clientName;
    reportTrainerName.textContent = trainerName;
    
    // Format date - use the input string directly to avoid timezone issues
    const date = new Date(dateString);
    // Adjust for timezone offset to prevent date shifting
    const adjustedDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    reportDate.textContent = adjustedDate.toLocaleDateString('en-US', options);
    
    // Update the original input fields for form submission
    if (clientNameInput) clientNameInput.value = clientName;
    if (trainerNameInput) trainerNameInput.value = trainerName;
    if (dateInput) dateInput.value = dateString;
}

// Set up report info editing
function setupReportInfoEditing() {
    const editBtn = document.getElementById('editReportInfoBtn');
    const cancelBtn = document.getElementById('cancelEditReportInfo');
    const saveBtn = document.getElementById('saveReportInfo');
    const displayDiv = document.getElementById('reportInfoDisplay');
    const editDiv = document.getElementById('reportInfoEdit');
    const editClientName = document.getElementById('editClientName');
    const editTrainerName = document.getElementById('editTrainerName');
    const editSessionDate = document.getElementById('editSessionDate');
    
    if (!editBtn || !saveBtn || !cancelBtn || !displayDiv || !editDiv) return;
    
    // Toggle edit mode
    const toggleEditMode = (isEditing) => {
        displayDiv.classList.toggle('d-none', isEditing);
        editDiv.classList.toggle('d-none', !isEditing);
        
        if (isEditing) {
            // Populate edit fields with current values
            if (editClientName) editClientName.value = reportClientName.textContent;
            if (editTrainerName) editTrainerName.value = reportTrainerName.textContent;
            if (editSessionDate && dateInput) editSessionDate.value = dateInput.value;
            
            // Focus on first field
            setTimeout(() => {
                if (editClientName) editClientName.focus();
            }, 100);
        }
    };
    
    // Save changes
    const saveChanges = () => {
        if (!editClientName || !editTrainerName || !editSessionDate) return;
        
        const newClientName = editClientName.value.trim();
        const newTrainerName = editTrainerName.value.trim();
        const newDate = editSessionDate.value;
        
        if (!newClientName || !newTrainerName || !newDate) {
            alert('Please fill in all fields');
            return;
        }
        
        updateReportInfo(newClientName, newTrainerName, newDate);
        toggleEditMode(false);
    };
    
    // Event listeners
    editBtn.addEventListener('click', () => toggleEditMode(true));
    cancelBtn.addEventListener('click', () => toggleEditMode(false));
    saveBtn.addEventListener('click', saveChanges);
    
    // Handle Enter/Escape keys in edit mode
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            saveChanges();
        } else if (e.key === 'Escape') {
            toggleEditMode(false);
        }
    };
    
    editDiv.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            e.preventDefault();
            saveChanges();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (!editDiv.classList.contains('d-none') && e.key === 'Escape') {
            toggleEditMode(false);
        }
    });
}

function printReport() {
    try {
        // Get client and trainer info
        const clientName = document.getElementById('reportClientName').textContent || 'Client Name';
        const trainerName = document.getElementById('reportTrainerName').textContent || 'Trainer Name';
        const date = document.getElementById('reportDate').textContent || new Date().toLocaleDateString();
        
        // Get all exercises data
        const exercises = [];
        
        // Get client notes
        const clientNotes = [];
        document.querySelectorAll('#clientNotesList .card').forEach(noteCard => {
            const title = noteCard.querySelector('.card-title')?.textContent.trim() || '';
            const content = noteCard.querySelector('.card-text')?.textContent.trim() || '';
            const timestamp = noteCard.querySelector('.text-muted')?.textContent.trim() || new Date().toLocaleString();
            
            clientNotes.push({
                title,
                content,
                timestamp
            });
        });
        
        // Get exercises data
        document.querySelectorAll('.exercise-card').forEach(card => {
            const name = card.querySelector('.exercise-header h4')?.textContent || 'Exercise';
            const notesElement = card.querySelector('.exercise-notes');
            const notes = notesElement ? notesElement.textContent.replace('NOTES:', '').trim() : '';
            
            const sets = [];
            card.querySelectorAll('.sets-list .set-item').forEach(setItem => {
                const cols = setItem.querySelectorAll('div');
                if (cols.length >= 3) {
                    const weight = cols[1].textContent.trim();
                    const reps = cols[2].textContent.trim();
                    if (weight && reps) {
                        sets.push({
                            weight: weight || '0',
                            reps: reps || '0'
                        });
                    }
                }
            });
            
            if (name || sets.length > 0) {
                exercises.push({
                    name,
                    sets,
                    notes
                });
            }
        });
        
        // Create a new window with the report
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Popup was blocked. Please allow popups for this site.');
        }
        
        // Generate the HTML for the report
        let reportHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Training Report - ${clientName}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.0/font/bootstrap-icons.css">
            <style>
                body { padding: 20px; font-family: Arial, sans-serif; }
                .report-header { margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .exercise { margin-bottom: 20px; }
                .exercise-header { font-weight: bold; margin-bottom: 10px; }
                .set { margin-left: 20px; margin-bottom: 5px; }
                .notes { margin-top: 10px; font-style: italic; color: #666; }
                .client-notes { margin-top: 30px; }
                .signature-line { border-top: 1px solid #000; width: 200px; margin: 50px 0 10px; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none !important; }
                    .page-break { page-break-after: always; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="report-header text-center mb-4">
                    <h2>Training Report</h2>
                    <div class="row">
                        <div class="col-md-4">
                            <strong>Client:</strong> ${clientName}
                        </div>
                        <div class="col-md-4">
                            <strong>Trainer:</strong> ${trainerName}
                        </div>
                        <div class="col-md-4">
                            <strong>Date:</strong> ${date}
                        </div>
                    </div>
                </div>
                
                <h4>Exercises</h4>
                ${exercises.length > 0 ? 
                    exercises.map(exercise => `
                        <div class="exercise">
                            <div class="exercise-header">${exercise.name}</div>
                            ${exercise.sets.length > 0 ? 
                                `<div class="sets">
                                    ${exercise.sets.map((set, index) => 
                                        `<div class="set">Set ${index + 1}: ${set.weight} x ${set.reps}</div>`
                                    ).join('')}
                                </div>` : ''
                            }
                            ${exercise.notes ? `<div class="notes">Notes: ${exercise.notes}</div>` : ''}
                        </div>
                    `).join('') : 
                    '<p>No exercises recorded.</p>'
                }
                
                ${clientNotes.length > 0 ? `
                    <div class="client-notes">
                        <h4>Client Notes</h4>
                        ${clientNotes.map(note => `
                            <div class="note mb-3">
                                <strong>${note.title || 'Note'}</strong>
                                <div>${note.content}</div>
                                <small class="text-muted">${note.timestamp}</small>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                <div class="signature-section mt-5">
                    <div class="signature-line"></div>
                    <div>Trainer's Signature</div>
                </div>
                
                <div class="signature-section mt-5">
                    <div class="signature-line"></div>
                    <div>Client's Signature</div>
                </div>
                
                <div class="text-center mt-4 no-print">
                    <button onclick="window.print()" class="btn btn-primary">
                        <i class="bi bi-printer"></i> Print Report
                    </button>
                </div>
            </div>
            
            <script>
                // Removed auto-print functionality
                // Print will only happen when the user clicks the print button
                
                // Optional: Add a close button handler
                function closeWindow() {
                    window.close();
                }
            </script>
        </body>
        </html>`;

        // Write the HTML to the new window
        printWindow.document.open();
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        
    } catch (error) {
        console.error('Error generating report:', error);
        alert('An error occurred while generating the report. Please check the console for details.');
    }
};

// Initialize key event listeners for modals
function initModalKeyListeners() {
    // Allow Enter key to save exercise in modal
    const exerciseModalEl = document.getElementById('exerciseModal');
    if (exerciseModalEl) {
        exerciseModalEl.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveExercise();
                }
            });
        });
    }
}

// Update exercises empty state
function updateExercisesEmptyState() {
    if (!exercisesList) {
        exercisesList = document.getElementById('exercisesList');
        if (!exercisesList) return;
    }
    
    const hasExercises = exercisesList.children.length > 0;
    let emptyState = exercisesList.querySelector('.empty-state-message');
    
    if (!hasExercises) {
        if (!emptyState) {
            emptyState = document.createElement('div');
            emptyState.className = 'empty-state-message text-center p-4 bg-light rounded-3';
            emptyState.style.color = '#6c757d';
            emptyState.style.fontStyle = 'italic';
            emptyState.style.minHeight = '80px';
            emptyState.style.display = 'flex';
            emptyState.style.alignItems = 'center';
            emptyState.style.justifyContent = 'center';
            emptyState.textContent = 'No exercises added yet. Click the "Add Exercise" button to get started.';
            exercisesList.appendChild(emptyState);
        }
    } else if (emptyState) {
        emptyState.remove();
    }
}

// Initialize empty state after the app is fully loaded
function checkExercisesEmptyState() {
    console.log('Checking exercises empty state...');
    
    // Try to get the exercises list if not already set
    if (!exercisesList) {
        console.log('exercisesList not set, trying to find it...');
        exercisesList = document.getElementById('exercisesList');
        console.log('Found exercisesList:', exercisesList);
    }
    
    if (exercisesList) {
        console.log('exercisesList children:', exercisesList.children.length);
        updateExercisesEmptyState();
    } else {
        console.error('exercisesList not found in the DOM');
        // Try again after a short delay
        setTimeout(checkExercisesEmptyState, 500);
    }
}

// Run the check after the app is fully initialized
function initializeEmptyState() {
    console.log('Initializing empty state check...');
    // Initial check after a short delay
    setTimeout(checkExercisesEmptyState, 100);
    
    // Also check when the report section becomes visible
    const reportSectionEl = document.getElementById('reportSection');
    if (reportSectionEl) {
        console.log('Setting up MutationObserver on report section');
        const observer = new MutationObserver(checkExercisesEmptyState);
        observer.observe(reportSectionEl, { 
            attributes: true, 
            childList: true, 
            subtree: true 
        });
    }
}


