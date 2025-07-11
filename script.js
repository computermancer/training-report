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
let exercises = []; // Global array to store exercises data

// Helper function to escape special regex characters
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

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
    
    // Initialize modals with proper accessibility settings
    const clientNotesModalEl = document.getElementById('clientNotesModal');
    const exerciseModalEl = document.getElementById('exerciseModal');
    const setsModalEl = document.getElementById('setModal');
    const notesModalEl = document.getElementById('notesModal');

    // Initialize modals with default options
    const modalOptions = {
        backdrop: true,
        keyboard: true,
        focus: true
    };

    // Initialize all modals
    if (clientNotesModalEl) {
        clientNotesModal = new bootstrap.Modal(clientNotesModalEl, modalOptions);
    }
    if (exerciseModalEl) {
        exerciseModal = new bootstrap.Modal(exerciseModalEl, modalOptions);
    }
    if (setsModalEl) {
        setsModal = new bootstrap.Modal(setsModalEl, modalOptions);
    }
    if (notesModalEl && exerciseNotesInput) {
        notesModal = new bootstrap.Modal(notesModalEl, modalOptions);
    }

        // Set up modal accessibility
    const setupModalAccessibility = (modalEl, modalName) => {
        if (!modalEl) return;
        
        // When modal is shown
        modalEl.addEventListener('shown.bs.modal', function() {
            // Set ARIA attributes when shown
            this.removeAttribute('aria-hidden');
            this.setAttribute('aria-modal', 'true');
            
            // Focus on the first focusable element
            const focusable = this.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])');
            if (focusable) {
                focusable.focus();
            }
        });
        
        // When modal is hidden
        modalEl.addEventListener('hidden.bs.modal', function() {
            // Clean up ARIA attributes
            this.setAttribute('aria-hidden', 'true');
            this.removeAttribute('aria-modal');
            
            // Return focus to the trigger element if possible
            const triggerElement = document.activeElement;
            if (triggerElement && (triggerElement.matches('[data-bs-toggle="modal"]') || 
                                 triggerElement.matches('[data-bs-target*="' + modalName + '"]'))) {
                triggerElement.focus();
            }
        });
    };
    
    // Set up all modals
    setupModalAccessibility(clientNotesModalEl, 'clientNotesModal');
    setupModalAccessibility(exerciseModalEl, 'exerciseModal');
    setupModalAccessibility(setsModalEl, 'setsModal');
    setupModalAccessibility(notesModalEl, 'notesModal');

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
    
    // Initialize exercise modal with proper focus management
    if (exerciseModalEl) {
        exerciseModalEl.addEventListener('shown.bs.modal', () => {
            if (exerciseNameInput) {
                exerciseNameInput.focus();
            }
        });
        
        // Clean up when modal is hidden
        exerciseModalEl.addEventListener('hidden.bs.modal', () => {
            if (document.activeElement) {
                document.activeElement.blur();
            }
            // Reset the form when modal is hidden
            if (exerciseNameInput) exerciseNameInput.value = '';
        });
    }
    
    // Load any existing data
    if (typeof loadNotes === 'function') {
        loadNotes();
    }
}

function showAddExerciseModal() {
    if (!exerciseNameInput) return;
    
    const modalElement = document.getElementById('exerciseModal');
    if (!modalElement) return;
    
    // Reset the form
    exerciseNameInput.value = '';
    
    // Set up modal instance with proper event handlers
    const modalInstance = new bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: true,
        focus: true
    });
    
    // Store the element that triggered the modal
    const triggerElement = document.activeElement;
    
    // Handle modal shown event
    const handleShown = () => {
        // Set ARIA attributes when shown
        modalElement.removeAttribute('aria-hidden');
        modalElement.setAttribute('aria-modal', 'true');
        
        // Focus on the input field
        if (exerciseNameInput) {
            exerciseNameInput.focus();
        }
        
        // Remove the event listener to prevent multiple bindings
        modalElement.removeEventListener('shown.bs.modal', handleShown);
    };
    
    // Handle modal hidden event
    const handleHidden = () => {
        // Clean up ARIA attributes
        modalElement.setAttribute('aria-hidden', 'true');
        modalElement.removeAttribute('aria-modal');
        
        // Return focus to the trigger element
        if (triggerElement && typeof triggerElement.focus === 'function') {
            triggerElement.focus();
        }
        
        // Remove the event listener
        modalElement.removeEventListener('hidden.bs.modal', handleHidden);
    };
    
    // Add event listeners
    modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });
    modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });
    
    // Show the modal
    modalInstance.show();
}

function saveExercise() {
    if (!exerciseNameInput || !exerciseNameInput.value.trim()) {
        alert('Please enter an exercise name');
        if (exerciseNameInput) exerciseNameInput.focus();
        return;
    }
    
    const exerciseName = exerciseNameInput.value.trim();
    
    // Close the modal before creating the exercise card
    const modalElement = document.getElementById('exerciseModal');
    if (modalElement) {
        // First, blur any focused element inside the modal
        const focusedElement = document.activeElement;
        if (focusedElement && modalElement.contains(focusedElement)) {
            focusedElement.blur();
        }
        
        // Then hide the modal
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        } else {
            // If no instance exists, hide the modal manually
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.remove();
            }
            // Ensure ARIA attributes are reset
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
        }
    }
    
    // Create exercise card
    const exerciseCard = document.createElement('div');
    exerciseCard.className = 'card mb-3 rounded-3';
    exerciseCard.innerHTML = `
        <div class="card-body p-0">
            <div class="bg-success bg-opacity-10 p-3 border-bottom rounded-top-3">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <h5 class="card-title mb-0 exercise-title">${exerciseNameInput.value}</h5>
                        <button class="btn btn-sm btn-outline-secondary edit-exercise-name ms-2" style="width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; transition: all 0.2s;" title="Edit exercise name">
                            <i class="bi bi-pencil" style="color: #6c757d; transition: color 0.2s;"></i>
                        </button>
                        <div class="edit-exercise-input d-none d-flex align-items-center gap-2" style="width: 100%; max-width: 100%;">
                            <input type="text" class="form-control form-control-sm flex-grow-1" value="${exerciseNameInput.value}" style="min-width: 400px;">
                            <button class="btn btn-sm btn-primary save-edit">Save</button>
                            <button class="btn btn-sm btn-outline-secondary cancel-edit">Cancel</button>
                        </div>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                        <button class="btn btn-sm btn-outline-success add-sets-btn">
                            <i class="bi bi-plus-circle"></i> Add Sets/Reps
                        </button>
                        <button class="btn btn-sm btn-outline-success add-notes-btn">
                            <i class="bi bi-pencil"></i> Add Notes
                        </button>
                        <button class="btn btn-sm btn-outline-danger delete-exercise" style="min-width: 120px;" data-id="${exercisesList.children.length}">
                            <i class="bi bi-trash"></i>&nbsp;Remove Exercise
                        </button>
                    </div>
                </div>
            </div>
            <div class="p-3">
                <div class="sets-container">
                    <div class="set-header d-flex align-items-center text-muted small mb-2">
                        <div class="col-2">Sets</div>
                        <div class="col-3">Reps</div>
                        <div class="col-3">Weight</div>
                        <div class="ms-auto pe-3">Actions</div>
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
    
    // Set up event listeners for the new exercise card
    const addSetsBtn = exerciseCard.querySelector('.add-sets-btn');
    const editBtn = exerciseCard.querySelector('.edit-exercise-name');
    const editContainer = exerciseCard.querySelector('.edit-exercise-input');
    const saveEditBtn = exerciseCard.querySelector('.save-edit');
    const cancelEditBtn = exerciseCard.querySelector('.cancel-edit');
    const exerciseTitle = exerciseCard.querySelector('.exercise-title');
    const exerciseInput = exerciseCard.querySelector('.edit-exercise-input input');
    const addNotesBtn = exerciseCard.querySelector('.add-notes-btn');
    const deleteBtn = exerciseCard.querySelector('.delete-exercise');
    
    // Edit exercise name
    if (editBtn && editContainer && saveEditBtn && cancelEditBtn) {
        editBtn.addEventListener('click', () => {
            exerciseTitle.classList.add('d-none');
            editBtn.classList.add('d-none');
            editContainer.classList.remove('d-none');
            exerciseInput.focus();
            // Select all text in the input for easier editing
            exerciseInput.select();
        });
        
        const saveEdit = () => {
            const newName = exerciseInput.value.trim();
            if (newName) {
                const oldName = exerciseTitle.textContent;
                exerciseTitle.textContent = newName;
                // Update the input value to match the saved name
                exerciseInput.value = newName;
                
                // Update the exercise name in any existing notes for this exercise
                const exerciseNotes = exerciseCard.querySelector('.exercise-notes');
                if (exerciseNotes) {
                    // Find the notes content element (excluding the buttons)
                    const notesContent = exerciseNotes.querySelector('.notes-content');
                    if (notesContent) {
                        const notesText = notesContent.textContent.trim();
                        if (notesText) {
                            // Update the notes to remove the exercise name
                            const newNotes = notesText.replace(
                                /^Notes for .+?:\s*/i, 
                                ''
                            ).trim();
                            notesContent.textContent = newNotes;
                        }
                    }
                    
                    // Also update the exercise name in the exercises array if it exists there
                    const exerciseId = exerciseCard.id.replace('exercise-', '');
                    const exercise = exercises.find(ex => ex.id === exerciseId);
                    if (exercise) {
                        exercise.name = newName;
                        // Update notes in the exercise object if they exist
                        if (exercise.notes) {
                            exercise.notes = exercise.notes.replace(
                                /^Notes for .+?:\s*/i,
                                ''
                            ).trim();
                        }
                    }
                }
            }
            editContainer.classList.add('d-none');
            exerciseTitle.classList.remove('d-none');
            editBtn.classList.remove('d-none');
        };
        
        saveEditBtn.addEventListener('click', saveEdit);
        
        // Handle Enter key to save
        exerciseInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveEdit();
            }
        });
        
        // Handle Escape key to cancel
        exerciseInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                editContainer.classList.add('d-none');
                exerciseTitle.classList.remove('d-none');
                editBtn.classList.remove('d-none');
            }
        });
        
        cancelEditBtn.addEventListener('click', (e) => {
            e.preventDefault();
            editContainer.classList.add('d-none');
            exerciseTitle.classList.remove('d-none');
            editBtn.classList.remove('d-none');
            // Reset input to current title
            exerciseInput.value = exerciseTitle.textContent.trim();
        });
    }
    
    // Add sets button functionality
    addSetsBtn.addEventListener('click', () => {
        const modalElement = document.getElementById('setModal');
        if (!modalElement) return;
        
        currentExerciseCard = exerciseCard;
        currentEditingSet = null; // Reset editing state
        
        // Clear all form fields before showing the modal
        if (setsCountInput) {
            setsCountInput.value = '';
            setsCountInput.setAttribute('autocomplete', 'off');
        }
        if (repsInput) {
            repsInput.value = '';
            repsInput.setAttribute('autocomplete', 'off');
        }
        if (weightInput) {
            weightInput.value = '';
            weightInput.setAttribute('autocomplete', 'off');
        }
        
        // Update modal title and button text
        const modalTitle = document.getElementById('setModalLabel');
        const saveBtn = document.getElementById('saveSetsBtn');
        if (modalTitle) modalTitle.textContent = 'Add Sets';
        if (saveBtn) saveBtn.textContent = 'Add Sets';
        
        // Set up modal instance with proper event handlers
        const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        
        // Store the element that triggered the modal
        const triggerElement = document.activeElement;
        
        // Handle modal shown event
        const handleShown = () => {
            // Set ARIA attributes when shown
            modalElement.removeAttribute('aria-hidden');
            modalElement.setAttribute('aria-modal', 'true');
            
            // Focus on the sets count input
            if (setsCountInput) {
                setTimeout(() => {
                    setsCountInput.focus();
                    setsCountInput.select();
                }, 50);
            }
        };
        
        // Handle modal hidden event
        const handleHidden = () => {
            // Clean up ARIA attributes
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Blur any focused element inside the modal
            const focusedElement = document.activeElement;
            if (focusedElement && modalElement.contains(focusedElement)) {
                focusedElement.blur();
            }
            
            // Return focus to the trigger element
            if (triggerElement && typeof triggerElement.focus === 'function') {
                triggerElement.focus();
            }
            
            // Clear form fields
            if (setsCountInput) setsCountInput.value = '';
            if (repsInput) repsInput.value = '';
            if (weightInput) weightInput.value = '';
        };
        
        // Add event listeners
        modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });
        modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });
        
        // Show the modal
        modalInstance.show();
    });
    
    // Add notes button functionality
    addNotesBtn.addEventListener('click', () => {
        currentExerciseCard = exerciseCard;
        const notesContainer = exerciseCard.querySelector('.exercise-notes');
        const contentElement = notesContainer.querySelector('.notes-content');
        // If we have a content element, get its text content, otherwise get all text content
        const existingNotes = contentElement ? 
            contentElement.textContent.trim() : 
            notesContainer.textContent.replace(/^Notes:\s*/, '').trim();
        exerciseNotesInput.value = existingNotes;
        notesModal.show();
    });
    
    // Handle save notes button click
    const saveNotesBtn = exerciseCard.querySelector('#saveNotesBtn');
    if (saveNotesBtn) {
        saveNotesBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const notes = exerciseNotesInput ? exerciseNotesInput.value.trim() : '';
            if (notes) {
                saveExerciseNotes(notes, exerciseCard);
            }
        });
    }
    
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
    
    const modalElement = document.getElementById('setModal');
    const isEditMode = !!currentEditingSet;
    
    if (isEditMode) {
        console.log('Updating existing set:', currentEditingSet);
        
        // Update the existing set by replacing its content
        currentEditingSet.className = 'set-item d-flex align-items-center mb-2';
        currentEditingSet.innerHTML = `
            <div class="col-2 set-sets">${setsCount || '1'}</div>
            <div class="col-3 set-reps">${reps || '-'}</div>
            <div class="col-3 set-weight">${weight || '-'}</div>
            <div class="ms-auto pe-2">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-set" title="Edit set">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-set" title="Delete set">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        // Reattach event listeners
        setupSetItemListeners(currentEditingSet);
        
        console.log('Updated set with new values:', { setsCount, reps, weight });
    } else {
        console.log('Creating new set');
        // Create a new set item
        const setItem = document.createElement('div');
        setItem.className = 'set-item d-flex align-items-center mb-2';
        
        setItem.innerHTML = `
            <div class="col-2 set-sets">${setsCount || '1'}</div>
            <div class="col-3 set-reps">${reps || '-'}</div>
            <div class="col-3 set-weight">${weight || '-'}</div>
            <div class="ms-auto pe-2">
                <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary edit-set" title="Edit set">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger delete-set" title="Delete set">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        setsList.appendChild(setItem);
        setupSetItemListeners(setItem);
        
        console.log('Created new set');
    }
    
    // Close the modal and reset state
    if (modalElement) {
        // First, blur any focused element inside the modal
        const focusedElement = document.activeElement;
        if (focusedElement && modalElement.contains(focusedElement)) {
            focusedElement.blur();
        }
        
        // Then hide the modal
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        } else {
            // If no instance exists, hide the modal manually
            modalElement.style.display = 'none';
            document.body.classList.remove('modal-open');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modalBackdrop) {
                modalBackdrop.remove();
            }
            // Ensure ARIA attributes are reset
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
        }
        
        // Reset the form and button text
        const modalTitle = document.getElementById('setModalLabel');
        const saveBtn = document.getElementById('saveSetsBtn');
        if (modalTitle) modalTitle.textContent = 'Add Sets';
        if (saveBtn) saveBtn.textContent = 'Add Set';
        
        // Clear the editing reference
        currentEditingSet = null;
        
        // Clear the form fields
        if (setsCountInput) setsCountInput.value = '';
        if (repsInput) repsInput.value = '';
        if (weightInput) weightInput.value = '';
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
            
            // Update modal title and button text
            const modalTitle = document.getElementById('setModalLabel');
            const saveBtn = document.getElementById('saveSetsBtn');
            if (modalTitle) modalTitle.textContent = 'Edit Set';
            if (saveBtn) saveBtn.textContent = 'Update Set';
            
            // Show the edit modal with the set's current values
            const modalElement = document.getElementById('setModal');
            if (!modalElement) return;
            
            // Set up modal instance with proper event handlers
            const modalInstance = new bootstrap.Modal(modalElement, {
                backdrop: 'static',
                keyboard: true,
                focus: true
            });
            
            // Store the element that triggered the modal
            const triggerElement = document.activeElement;
            
            // Handle modal shown event
            const handleShown = () => {
                // Set ARIA attributes when shown
                modalElement.removeAttribute('aria-hidden');
                modalElement.setAttribute('aria-modal', 'true');
                
                // Focus on the first input field
                if (setsCountInput) {
                    setsCountInput.focus();
                    setsCountInput.select();
                }
            };
            
            // Handle modal hidden event
            const handleHidden = () => {
                // Clean up ARIA attributes
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                
                // Blur any focused element inside the modal
                const focusedElement = document.activeElement;
                if (focusedElement && modalElement.contains(focusedElement)) {
                    focusedElement.blur();
                }
                
                // Return focus to the trigger element
                if (triggerElement && typeof triggerElement.focus === 'function') {
                    triggerElement.focus();
                }
                
                // Clear form fields
                if (setsCountInput) setsCountInput.value = '';
                if (repsInput) repsInput.value = '';
                if (weightInput) weightInput.value = '';
                
                // Reset editing state
                currentEditingSet = null;
            };
            
            // Add event listeners
            modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });
            modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });
            
            // Show the modal
            modalInstance.show();
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

function saveExerciseNotes(notes, exerciseCard = null) {
    const targetCard = exerciseCard || currentExerciseCard;
    if (!targetCard || !exerciseNotesInput) return;
    
    const notesContainer = targetCard.querySelector('.exercise-notes');
    const notesButton = targetCard.querySelector('.add-notes-btn');
    const exerciseName = targetCard.querySelector('.exercise-title')?.textContent || 'this exercise';
    const notesContent = typeof notes === 'string' ? notes : exerciseNotesInput.value.trim();
    
    // Update notes button text based on whether we have notes
    if (notesButton) {
        if (notesContent) {
            notesButton.classList.add('d-none');
        } else {
            notesButton.classList.remove('d-none');
        }
    }
    
    // Clear existing content but preserve the header if it exists
    const existingHeader = notesContainer.querySelector('.notes-header');
    notesContainer.innerHTML = '';
    
    if (notesContent) {
        // Add header with action buttons
        const header = document.createElement('div');
        header.className = 'notes-header d-flex justify-content-between align-items-center mb-2';
        
        const headerText = document.createElement('span');
        headerText.className = 'fw-bold';
        headerText.textContent = 'Notes:';
        
        // Create button group
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'btn-group';
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-outline-primary';
        editButton.title = 'Edit notes';
        editButton.innerHTML = '<i class="bi bi-pencil"></i>';
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            currentExerciseCard = targetCard;
            exerciseNotesInput.value = notesContent;
            if (notesModal) notesModal.show();
        });
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-sm btn-outline-danger';
        deleteButton.title = 'Delete notes';
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete these notes?')) {
                saveExerciseNotes('', targetCard);
                if (notesButton) notesButton.classList.remove('d-none');
            }
        });
        
        buttonGroup.appendChild(editButton);
        buttonGroup.appendChild(deleteButton);
        
        header.appendChild(headerText);
        header.appendChild(buttonGroup);
        
        // Add notes content
        const content = document.createElement('div');
        content.className = 'notes-content';
        content.innerHTML = notesContent.replace(/\n/g, '<br>');
        
        // Append elements
        notesContainer.appendChild(header);
        notesContainer.appendChild(content);
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
    clientNoteTitleInput = document.getElementById('clientNoteTitle');
    clientNoteContentInput = document.getElementById('clientNoteContent');
    
    // Early exit if required elements don't exist
    if (!clientNoteModalEl || !saveClientNoteBtn || !clientNoteTitleInput || !clientNoteContentInput) {
        console.warn('Client notes elements not found. Skipping client notes initialization.');
        return;
    }
    
    // Initialize client notes modal with accessibility in mind
    const clientNoteModal = new bootstrap.Modal(clientNoteModalEl, {
        backdrop: 'static',
        keyboard: true,
        focus: true
    });
    
    // Add accessibility event listeners for client notes modal
    clientNoteModalEl.addEventListener('show.bs.modal', function() {
        this.removeAttribute('aria-hidden');
        this.setAttribute('aria-modal', 'true');
        if (!this.getAttribute('role')) {
            this.setAttribute('role', 'dialog');
        }
    });
    
    clientNoteModalEl.addEventListener('shown.bs.modal', function() {
        const focusable = this.querySelector('input, textarea, button:not([disabled])');
        if (focusable) {
            focusable.focus();
        }
    });
    
    clientNoteModalEl.addEventListener('hidden.bs.modal', function() {
        const triggerElement = document.activeElement;
        if (triggerElement && triggerElement.matches('[data-bs-target*="clientNotesModal"]')) {
            triggerElement.focus();
        }
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
        noteElement.className = 'card mb-3 rounded-3';
        noteElement.innerHTML = `
            <div class="card-body p-0">
                <div class="bg-success bg-opacity-10 p-3 border-bottom rounded-top-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="card-title mb-0">${note.title || 'Untitled Note'}</h5>
                        <div class="d-flex flex-wrap gap-2">
                            <button class="btn btn-sm btn-outline-success edit-note" data-id="${index}">
                                <i class="bi bi-pencil"></i> Edit Note
                            </button>
                            <button class="btn btn-sm btn-outline-danger delete-note" data-id="${index}">
                                <i class="bi bi-trash"></i> Remove Note
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
        const modalElement = document.getElementById('clientNotesModal');
        if (!modalElement) return;
        
        currentNoteId = null;
        clientNoteTitleInput.value = '';
        clientNoteContentInput.value = '';
        
        // Update modal title
        const modalTitle = document.getElementById('clientNotesModalLabel');
        if (modalTitle) modalTitle.textContent = 'Add Client Note';
        
        // Set up modal instance with proper event handlers
        const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        
        // Store the element that triggered the modal
        const triggerElement = document.activeElement;
        
        // Handle modal shown event
        const handleShown = () => {
            // Set ARIA attributes when shown
            modalElement.removeAttribute('aria-hidden');
            modalElement.setAttribute('aria-modal', 'true');
            
            // Focus on the title field
            if (clientNoteTitleInput) {
                clientNoteTitleInput.focus();
            }
            
            // Remove the event listener to prevent multiple bindings
            modalElement.removeEventListener('shown.bs.modal', handleShown);
        };
        
        // Handle modal hidden event
        const handleHidden = () => {
            // Clean up ARIA attributes
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Return focus to the trigger element
            if (triggerElement && typeof triggerElement.focus === 'function') {
                triggerElement.focus();
            }
        };
        
        // Add event listeners
        modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });
        modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });
        
        // Show the modal
        modalInstance.show();
    }

    // Open modal to edit existing note
    function openEditNoteModal(id) {
        const modalElement = document.getElementById('clientNotesModal');
        if (!modalElement) return;
        
        const note = notes.find(n => n.id === id);
        if (!note) return;
        
        currentNoteId = id;
        clientNoteTitleInput.value = note.title || '';
        clientNoteContentInput.value = note.content;
        
        // Update modal title
        const modalTitle = document.getElementById('clientNotesModalLabel');
        if (modalTitle) modalTitle.textContent = 'Edit Client Note';
        
        // Set up modal instance with proper event handlers
        const modalInstance = new bootstrap.Modal(modalElement, {
            backdrop: 'static',
            keyboard: true,
            focus: true
        });
        
        // Store the element that triggered the modal
        const triggerElement = document.activeElement;
        
        // Handle modal shown event
        const handleShown = () => {
            // Set ARIA attributes when shown
            modalElement.removeAttribute('aria-hidden');
            modalElement.setAttribute('aria-modal', 'true');
            
            // Focus on the title field
            if (clientNoteTitleInput) {
                clientNoteTitleInput.focus();
            }
            
            // Remove the event listener to prevent multiple bindings
            modalElement.removeEventListener('shown.bs.modal', handleShown);
        };
        
        // Handle modal hidden event
        const handleHidden = () => {
            // Clean up ARIA attributes
            modalElement.setAttribute('aria-hidden', 'true');
            modalElement.removeAttribute('aria-modal');
            
            // Return focus to the trigger element
            if (triggerElement && typeof triggerElement.focus === 'function') {
                triggerElement.focus();
            }
        };
        
        // Add event listeners
        modalElement.addEventListener('shown.bs.modal', handleShown, { once: true });
        modalElement.addEventListener('hidden.bs.modal', handleHidden, { once: true });
        
        // Show the modal
        modalInstance.show();
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
        
        // Get the modal instance and hide it
        const modalElement = document.getElementById('clientNotesModal');
        if (modalElement) {
            // First, blur any focused element inside the modal
            const focusedElement = document.activeElement;
            if (focusedElement && modalElement.contains(focusedElement)) {
                focusedElement.blur();
            }
            
            // Then hide the modal
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                // If no instance exists, hide the modal manually
                modalElement.style.display = 'none';
                document.body.classList.remove('modal-open');
                const modalBackdrop = document.querySelector('.modal-backdrop');
                if (modalBackdrop) {
                    modalBackdrop.remove();
                }
                // Ensure ARIA attributes are reset
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
            }
        }
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
        
        // Clear existing exercises data
        exercises = [];
        
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
        
        // Clear existing exercises
        exercises = [];
        
        // Get exercises data from DOM
        document.querySelectorAll('#exercisesList > .card').forEach(card => {
            const name = card.querySelector('.card-title')?.textContent.trim() || 'Exercise';
            const notesElement = card.querySelector('.exercise-notes');
            let notes = notesElement ? notesElement.textContent.trim() : '';
            // Remove any existing 'Notes:' prefix if present
            notes = notes.replace(/^Notes:\s*/i, '').trim();
            
            const sets = [];
            card.querySelectorAll('.sets-list > div').forEach((setItem, index) => {
                const reps = setItem.querySelector('.col-3')?.textContent.trim() || '0';
                const weight = setItem.querySelectorAll('.col-3')[1]?.textContent.trim() || '0';
                
                if (reps || weight) {
                    sets.push({
                        weight: weight,
                        reps: reps,
                        setNumber: index + 1
                    });
                }
            });
            
            exercises.push({
                name: name,
                sets: sets,
                notes: notes
            });
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
            <title>Training Session Report - ${clientName}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { 
                    padding: 40px 20px; 
                    font-family: Arial, sans-serif; 
                    max-width: 800px;
                    margin: 0 auto;
                }
                .report-header { 
                    margin-bottom: 30px;
                    text-align: left;
                }
                .session-title, .section-title {
                    font-size: 12pt !important;
                    font-weight: bold;
                    margin: 10px 0 8px !important;
                    color: #333;
                    text-align: left;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .info-table, .exercise-table, .client-notes-section table {
                    width: 100%;
                    max-width: 100%;
                    margin: 0 auto;
                    border: 1px solid #000;
                    border-collapse: collapse;
                    font-family: Arial, sans-serif;
                    table-layout: fixed;
                }
                .info-table tr, .exercise-table tr {
                    height: 32px;
                }
                .info-table td {
                    padding: 4px 8px;
                    border: 1px solid #000;
                    vertical-align: middle;
                }
                .info-table td:first-child {
                    font-weight: bold;
                    width: 25%;
                    background-color: #f0f0f0;
                }
                
                /* Exercises Table Styles */
                .client-notes-section {
                    margin-top: 20px;
                    width: 100%;
                }
                .client-notes-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 15px;
                }
                .client-notes-table .note-title {
                    background-color: #f8f9fa;
                    border: 1px solid #000;
                    border-bottom: none;
                    padding: 6px 12px;
                    font-size: 10pt;
                    font-weight: bold;
                    color: #2c3e50;
                    text-align: left;
                    height: 32px;
                }
                .client-notes-table .note-content {
                    border: 1px solid #000;
                    padding: 8px 12px;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
                .exercises-section {
                    margin-top: 40px;
                }
                .exercise-table-container {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .exercise-header {
                    background-color: #f8f9fa;
                    border: 1px solid #000;
                    border-bottom: none;
                    padding: 6px 12px;
                    font-size: 10pt;
                    font-weight: bold;
                    color: #2c3e50;
                    text-align: left;
                    margin: 0;
                    height: 32px;
                    display: flex;
                    align-items: center;
                }
                .exercise-table {
                    width: 100%;
                    max-width: 300px;
                    margin: 10px 0 20px;
                    border-collapse: collapse;
                    border: 1px solid #000;
                }
                .exercise-name {
                    text-align: left;
                    padding: 8px 12px;
                    font-weight: bold;
                    background-color: #f8f9fa;
                    font-size: 11pt;
                    border-bottom: 1px solid #000;
                }
                .exercise-table th {
                    background-color: #f0f0f0;
                    padding: 8px;
                    border: 1px solid #000;
                    text-align: center;
                    font-weight: bold;
                }
                .exercise-table td {
                    padding: 8px;
                    border: 1px solid #000;
                    text-align: center;
                }
                .exercise-notes-label {
                    font-weight: bold;
                }
                .exercise-table th {
                    background-color: #f0f0f0;
                    font-weight: bold;
                }
                .exercise-notes {
                    max-width: 500px;
                    margin: 10px auto 0;
                    padding: 10px;
                    background-color: #f8f9fa;
                    border-left: 3px solid #2c3e50;
                    font-size: 14px;
                }
                @media print {
                    @page {
                        margin: 0.5cm;
                        size: letter;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    body {
                        padding: 5px !important;
                        margin: 0 !important;
                        font-size: 9pt !important;
                        line-height: 1.2 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        width: 100% !important;
                    }
                    .container {
                        width: 100% !important;
                        max-width: 100% !important;
                        padding: 0 5px !important;
                        margin: 0 auto !important;
                    }
                    .report-header {
                        margin-bottom: 5px !important;
                    }
                    .session-title {
                        font-size: 12pt !important;
                        margin: 0 0 5px 0 !important;
                    }
                    .info-table {
                        width: 100% !important;
                        margin: 0 auto 5px !important;
                        font-size: 8pt !important;
                        border: 1px solid #000 !important;
                        table-layout: fixed !important;
                    }
                    .info-table td {
                        padding: 4px 6px !important;
                        height: 28px !important;
                        min-height: 28px !important;
                        border: 1px solid #000 !important;
                    }
                    .info-table td:first-child {
                        width: 25% !important;
                        background-color: #f0f0f0 !important;
                    }
                    .info-table td {
                        padding: 2px 6px !important;
                        border: 1px solid #000 !important;
                    }
                    .info-table td:first-child {
                        background-color: #f0f0f0 !important;
                        width: 100px !important;
                    }
                    .exercises-section, .client-notes-section {
                        margin-top: 10px !important;
                    }
                    .exercise-table-container {
                        page-break-inside: avoid !important;
                        break-inside: avoid !important;
                        margin-bottom: 8px !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .exercise-header {
                        padding: 3px 6px !important;
                        font-size: 9pt !important;
                        margin: 0 !important;
                        border: 1px solid #000 !important;
                        border-bottom: none !important;
                    }
                    .exercise-table {
                        width: 100% !important;
                        max-width: 100% !important;
                        font-size: 8pt !important;
                        border: 1px solid #000 !important;
                        border-top: none !important;
                        margin: 0 !important;
                        table-layout: fixed !important;
                    }
                    .exercise-table th,
                    .exercise-table td {
                        width: 33.33% !important;
                        padding: 4px 6px !important;
                        height: 28px !important;
                        min-height: 28px !important;
                        border: 1px solid #000 !important;
                    }
                    .exercise-table th, 
                    .exercise-table td {
                        padding: 2px 4px !important;
                        border: 1px solid #000 !important;
                    }
                    .exercise-table th {
                        background-color: #f0f0f0 !important;
                    }
                    .exercise-table tfoot td {
                        padding: 4px 6px !important;
                        font-size: 8.5pt !important;
                    }
                    .client-notes-section table {
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .client-notes-section td {
                        padding: 4px 6px !important;
                    }
                    .no-print { 
                        display: none !important; 
                    }
                    }
                    .info-table td {
                        border: 1px solid #000 !important;
                    }
                    .info-table td:first-child {
                        background-color: #f0f0f0 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="report-header text-center mb-4">
                    <h1 class="session-title mb-3">Training Session Report</h1>
                    <table class="info-table" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                        <tr>
                            <td><strong>Client:</strong></td>
                            <td>${clientName}</td>
                        </tr>
                        <tr>
                            <td><strong>Trainer:</strong></td>
                            <td>${trainerName}</td>
                        </tr>
                        <tr>
                            <td><strong>Date:</strong></td>
                            <td>${date}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Exercises Section -->
                <div class="exercises-section">
                    <h3 class="section-title">Exercises</h3>
                    ${exercises.length > 0 ? exercises.map(exercise => `
                        <table class="exercise-table">
                            <thead>
                                <tr>
                                    <th colspan="3" class="exercise-name">${exercise.name}</th>
                                </tr>
                                <tr>
                                    <th>Set</th>
                                    <th>Reps</th>
                                    <th>Weight</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${exercise.sets && exercise.sets.length > 0 ? exercise.sets.map(set => `
                                    <tr>
                                        <td style="text-align: center;">${set.setNumber || ''}</td>
                                        <td style="text-align: center;">${set.reps || ''}</td>
                                        <td style="text-align: center;">${set.weight || ''}</td>
                                    </tr>
                                `).join('') : `
                                    <tr>
                                        <td colspan="3" style="text-align: center; padding: 8px;">No sets recorded</td>
                                    </tr>
                                `}
                            </tbody>
                        </table>
                    `).join('') : `
                        <div style="text-align: center; color: #6c757d; font-style: italic; margin: 20px 0;">
                            No exercises recorded
                        </div>
                    `}
                </div>
                </div>
                
                ${clientNotes.length > 0 ? `
                <div class="client-notes-section">
                    <h3 class="section-title">Client Notes</h3>
                    <table class="client-notes-table">
                        ${clientNotes.map(note => `
                            <tr>
                                <td class="note-title">${note.title}</td>
                            </tr>
                            <tr>
                                <td class="note-content">${note.content ? note.content.replace(/\n/g, '\n') : ''}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
                ` : ''}
            </div>
            
            <script>
                // Print will only happen when the user clicks the print button
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


