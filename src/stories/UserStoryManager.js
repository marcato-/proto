class UserStoryManager {
    constructor(dataStore, modeler) {
        this.dataStore = dataStore;
        this.modeler = modeler;
        this.currentStory = null;
    }

    init() {
        this.setupEventListeners();
        this.renderStories();
    }

    setupEventListeners() {
        // Add story button
        document.getElementById('add-story-btn').addEventListener('click', () => {
            this.createNewStory();
        });

        // Save story button
        document.getElementById('save-story-btn').addEventListener('click', () => {
            this.saveCurrentStory();
        });

        // Delete story button
        document.getElementById('delete-story-btn').addEventListener('click', () => {
            this.deleteCurrentStory();
        });

        // Cancel button
        document.getElementById('cancel-story-btn').addEventListener('click', () => {
            this.hideStoryDetails();
        });
    }

    createNewStory() {
        this.currentStory = {
            id: this.generateId(),
            title: '',
            description: '',
            acceptanceCriteria: '',
            linkedElements: []
        };

        this.showStoryDetails(this.currentStory);
    }

    editStory(storyId) {
        const story = this.dataStore.getUserStory(storyId);
        if (story) {
            this.currentStory = { ...story };
            this.showStoryDetails(this.currentStory);
        }
    }

    showStoryDetails(story) {
        const detailsPanel = document.getElementById('story-details');
        detailsPanel.style.display = 'block';

        // Populate form
        document.getElementById('story-id').value = story.id;
        document.getElementById('story-title').value = story.title || '';
        document.getElementById('story-description').value = story.description || '';
        document.getElementById('story-acceptance').value = story.acceptanceCriteria || '';

        // Show linked elements
        this.renderLinkedElements(story.id);
    }

    hideStoryDetails() {
        const detailsPanel = document.getElementById('story-details');
        detailsPanel.style.display = 'none';
        this.currentStory = null;

        // Clear form
        document.getElementById('story-id').value = '';
        document.getElementById('story-title').value = '';
        document.getElementById('story-description').value = '';
        document.getElementById('story-acceptance').value = '';
    }

    saveCurrentStory() {
        const title = document.getElementById('story-title').value.trim();
        const description = document.getElementById('story-description').value.trim();
        const acceptanceCriteria = document.getElementById('story-acceptance').value.trim();

        if (!title) {
            alert('Please enter a story title');
            return;
        }

        const story = {
            id: this.currentStory.id,
            title,
            description,
            acceptanceCriteria,
            linkedElements: this.currentStory.linkedElements || []
        };

        this.dataStore.saveUserStory(story);
        this.hideStoryDetails();
        this.renderStories();
    }

    deleteCurrentStory() {
        if (!this.currentStory) return;

        if (confirm('Are you sure you want to delete this user story?')) {
            this.dataStore.deleteUserStory(this.currentStory.id);
            this.hideStoryDetails();
            this.renderStories();

            // Remove highlights from linked elements
            const linkedElements = this.currentStory.linkedElements || [];
            linkedElements.forEach(elementId => {
                const links = this.dataStore.getElementLinks(elementId);
                if (links.length === 0) {
                    this.modeler.highlightElement(elementId, false);
                }
            });
        }
    }

    renderStories() {
        const container = document.getElementById('user-stories-list');
        const stories = this.dataStore.getUserStories();

        if (stories.length === 0) {
            container.innerHTML = '<p class="empty-state">No user stories yet. Click "+ Add Story" to create one.</p>';
            return;
        }

        container.innerHTML = '';

        stories.forEach(story => {
            const storyCard = document.createElement('div');
            storyCard.className = 'story-card';

            const linkedCount = this.dataStore.getStoryLinkedElements(story.id).length;

            storyCard.innerHTML = `
                <div class="story-card-header">
                    <h4>${this.escapeHtml(story.title)}</h4>
                </div>
                <div class="story-card-body">
                    <p>${this.escapeHtml(story.description || 'No description')}</p>
                    ${linkedCount > 0 ? `<div class="story-badge">${linkedCount} linked element(s)</div>` : ''}
                </div>
            `;

            storyCard.addEventListener('click', () => {
                this.editStory(story.id);
            });

            container.appendChild(storyCard);
        });
    }

    renderLinkedElements(storyId) {
        const container = document.getElementById('linked-elements-list');
        const linkedElements = this.dataStore.getStoryLinkedElements(storyId);

        if (linkedElements.length === 0) {
            container.innerHTML = '<p class="empty-state-small">No linked BPMN elements. Right-click on elements in the diagram to link them.</p>';
            return;
        }

        container.innerHTML = '';

        linkedElements.forEach(elementData => {
            const elementTag = document.createElement('div');
            elementTag.className = 'linked-element-tag';
            elementTag.innerHTML = `
                <span class="element-type">${this.getElementTypeLabel(elementData.type)}</span>
                <span class="element-name">${this.escapeHtml(elementData.name)}</span>
                <button class="remove-link-btn" data-element-id="${elementData.id}">&times;</button>
            `;

            const removeBtn = elementTag.querySelector('.remove-link-btn');
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.unlinkElement(storyId, elementData.id);
            });

            container.appendChild(elementTag);
        });
    }

    unlinkElement(storyId, elementId) {
        if (confirm('Remove this link?')) {
            this.dataStore.unlinkStoryFromElement(storyId, elementId);
            this.renderLinkedElements(storyId);

            // Update highlight if no more stories linked
            const links = this.dataStore.getElementLinks(elementId);
            if (links.length === 0) {
                this.modeler.highlightElement(elementId, false);
            }
        }
    }

    getElementTypeLabel(type) {
        const typeMap = {
            'bpmn:Task': 'Task',
            'bpmn:UserTask': 'User Task',
            'bpmn:ServiceTask': 'Service Task',
            'bpmn:StartEvent': 'Start Event',
            'bpmn:EndEvent': 'End Event',
            'bpmn:Gateway': 'Gateway',
            'bpmn:ExclusiveGateway': 'Exclusive Gateway',
            'bpmn:ParallelGateway': 'Parallel Gateway',
            'bpmn:SubProcess': 'Sub Process'
        };

        return typeMap[type] || type.replace('bpmn:', '');
    }

    generateId() {
        return 'story_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

export default UserStoryManager;
