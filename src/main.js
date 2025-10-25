import BpmnModeler from './modeler/BpmnModeler.js';
import UserStoryManager from './stories/UserStoryManager.js';
import DataStore from './stores/DataStore.js';

class BpmnApp {
    constructor() {
        this.store = new DataStore();
        this.modeler = null;
        this.storyManager = null;
        this.currentElementId = null;

        this.init();
    }

    async init() {
        // Initialize BPMN Modeler
        this.modeler = new BpmnModeler('bpmn-canvas', this.store);
        await this.modeler.init();

        // Initialize User Story Manager
        this.storyManager = new UserStoryManager(this.store, this.modeler);
        this.storyManager.init();

        // Setup event listeners
        this.setupEventListeners();

        // Load saved data
        this.loadSavedData();
    }

    setupEventListeners() {
        // Header actions
        document.getElementById('new-process-btn').addEventListener('click', () => {
            if (confirm('Create a new process? This will clear the current canvas.')) {
                this.modeler.createNewDiagram();
            }
        });

        document.getElementById('save-process-btn').addEventListener('click', () => {
            this.saveProcess();
        });

        document.getElementById('export-process-btn').addEventListener('click', () => {
            this.exportBpmn();
        });

        document.getElementById('import-process-btn').addEventListener('click', () => {
            document.getElementById('import-file-input').click();
        });

        document.getElementById('import-file-input').addEventListener('change', (e) => {
            this.importBpmn(e);
        });

        // Context menu for BPMN elements
        this.setupContextMenu();

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('story-selector-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    setupContextMenu() {
        const canvas = document.getElementById('bpmn-canvas');
        const contextMenu = document.getElementById('context-menu');

        canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();

            const element = this.modeler.getElementAtPosition(e.clientX, e.clientY);
            if (element) {
                this.currentElementId = element.id;
                contextMenu.style.display = 'block';
                contextMenu.style.left = e.pageX + 'px';
                contextMenu.style.top = e.pageY + 'px';
            }
        });

        document.addEventListener('click', () => {
            contextMenu.style.display = 'none';
        });

        document.getElementById('link-story-menu').addEventListener('click', () => {
            this.showStorySelector();
        });

        document.getElementById('view-links-menu').addEventListener('click', () => {
            this.viewElementLinks();
        });
    }

    showStorySelector() {
        const modal = document.getElementById('story-selector-modal');
        const listContainer = document.getElementById('story-selector-list');

        // Clear previous content
        listContainer.innerHTML = '';

        // Get all user stories
        const stories = this.store.getUserStories();

        if (stories.length === 0) {
            listContainer.innerHTML = '<p>No user stories available. Create some first!</p>';
        } else {
            stories.forEach(story => {
                const isLinked = this.store.isStoryLinkedToElement(story.id, this.currentElementId);

                const item = document.createElement('div');
                item.className = 'story-selector-item';
                item.innerHTML = `
                    <label>
                        <input type="checkbox" value="${story.id}" ${isLinked ? 'checked' : ''}>
                        <span>${story.title}</span>
                    </label>
                `;
                listContainer.appendChild(item);
            });
        }

        modal.style.display = 'block';

        // Setup modal buttons
        document.getElementById('confirm-link-btn').onclick = () => {
            this.confirmStoryLinks();
            modal.style.display = 'none';
        };

        document.getElementById('cancel-link-btn').onclick = () => {
            modal.style.display = 'none';
        };

        document.getElementById('close-modal').onclick = () => {
            modal.style.display = 'none';
        };
    }

    confirmStoryLinks() {
        const checkboxes = document.querySelectorAll('#story-selector-list input[type="checkbox"]');
        const selectedStoryIds = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        // Get element details
        const element = this.modeler.getElementByBusinessObject(this.currentElementId);
        const elementData = {
            id: this.currentElementId,
            name: element?.businessObject?.name || 'Unnamed Element',
            type: element?.type || 'unknown'
        };

        // Update links in store
        this.store.updateElementStoryLinks(this.currentElementId, selectedStoryIds, elementData);

        // Highlight the element to show it has links
        if (selectedStoryIds.length > 0) {
            this.modeler.highlightElement(this.currentElementId, true);
        } else {
            this.modeler.highlightElement(this.currentElementId, false);
        }

        alert('Story links updated successfully!');
    }

    viewElementLinks() {
        const links = this.store.getElementLinks(this.currentElementId);
        const stories = this.store.getUserStories();

        const linkedStories = stories.filter(s => links.includes(s.id));

        if (linkedStories.length === 0) {
            alert('No user stories linked to this element.');
        } else {
            const storyTitles = linkedStories.map(s => `- ${s.title}`).join('\n');
            alert(`Linked User Stories:\n\n${storyTitles}`);
        }
    }

    saveProcess() {
        this.modeler.saveXML().then(({ xml }) => {
            this.store.saveBpmnXml(xml);
            alert('Process saved successfully!');
        }).catch(err => {
            console.error('Error saving process:', err);
            alert('Error saving process. Check console for details.');
        });
    }

    exportBpmn() {
        this.modeler.saveXML().then(({ xml }) => {
            const blob = new Blob([xml], { type: 'application/xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'process.bpmn';
            link.click();
            URL.revokeObjectURL(url);
        }).catch(err => {
            console.error('Error exporting BPMN:', err);
            alert('Error exporting BPMN. Check console for details.');
        });
    }

    importBpmn(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const xml = e.target.result;
            this.modeler.importXML(xml).then(() => {
                alert('BPMN imported successfully!');
            }).catch(err => {
                console.error('Error importing BPMN:', err);
                alert('Error importing BPMN. Check console for details.');
            });
        };
        reader.readAsText(file);

        // Reset file input
        event.target.value = '';
    }

    loadSavedData() {
        const savedXml = this.store.getBpmnXml();
        if (savedXml) {
            this.modeler.importXML(savedXml).then(() => {
                // Highlight elements that have story links
                const allLinks = this.store.getAllElementLinks();
                Object.keys(allLinks).forEach(elementId => {
                    if (allLinks[elementId].storyIds.length > 0) {
                        this.modeler.highlightElement(elementId, true);
                    }
                });
            }).catch(err => {
                console.error('Error loading saved process:', err);
            });
        }
    }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BpmnApp();
    });
} else {
    new BpmnApp();
}
