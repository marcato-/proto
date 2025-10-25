class DataStore {
    constructor() {
        this.storageKey = 'bpmn_modeling_tool_data';
        this.data = this.loadData();
    }

    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (err) {
            console.error('Error loading data from localStorage:', err);
        }

        return {
            userStories: [],
            bpmnXml: null,
            elementLinks: {} // elementId -> { storyIds: [], elementData: {} }
        };
    }

    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (err) {
            console.error('Error saving data to localStorage:', err);
        }
    }

    // User Story Methods
    getUserStories() {
        return this.data.userStories || [];
    }

    getUserStory(storyId) {
        return this.data.userStories.find(s => s.id === storyId);
    }

    saveUserStory(story) {
        const existingIndex = this.data.userStories.findIndex(s => s.id === story.id);

        if (existingIndex >= 0) {
            this.data.userStories[existingIndex] = story;
        } else {
            this.data.userStories.push(story);
        }

        this.saveData();
    }

    deleteUserStory(storyId) {
        // Remove story from user stories
        this.data.userStories = this.data.userStories.filter(s => s.id !== storyId);

        // Remove story from all element links
        Object.keys(this.data.elementLinks).forEach(elementId => {
            const link = this.data.elementLinks[elementId];
            link.storyIds = link.storyIds.filter(id => id !== storyId);

            // Clean up empty links
            if (link.storyIds.length === 0) {
                delete this.data.elementLinks[elementId];
            }
        });

        this.saveData();
    }

    // BPMN XML Methods
    saveBpmnXml(xml) {
        this.data.bpmnXml = xml;
        this.saveData();
    }

    getBpmnXml() {
        return this.data.bpmnXml;
    }

    // Element-Story Link Methods
    updateElementStoryLinks(elementId, storyIds, elementData) {
        if (!this.data.elementLinks) {
            this.data.elementLinks = {};
        }

        if (storyIds.length > 0) {
            this.data.elementLinks[elementId] = {
                storyIds: storyIds,
                elementData: elementData
            };
        } else {
            delete this.data.elementLinks[elementId];
        }

        this.saveData();
    }

    getElementLinks(elementId) {
        const link = this.data.elementLinks[elementId];
        return link ? link.storyIds : [];
    }

    getAllElementLinks() {
        return this.data.elementLinks || {};
    }

    getStoryLinkedElements(storyId) {
        const linkedElements = [];

        Object.keys(this.data.elementLinks).forEach(elementId => {
            const link = this.data.elementLinks[elementId];
            if (link.storyIds.includes(storyId)) {
                linkedElements.push({
                    id: elementId,
                    ...link.elementData
                });
            }
        });

        return linkedElements;
    }

    isStoryLinkedToElement(storyId, elementId) {
        const link = this.data.elementLinks[elementId];
        return link ? link.storyIds.includes(storyId) : false;
    }

    unlinkStoryFromElement(storyId, elementId) {
        const link = this.data.elementLinks[elementId];
        if (link) {
            link.storyIds = link.storyIds.filter(id => id !== storyId);

            if (link.storyIds.length === 0) {
                delete this.data.elementLinks[elementId];
            }

            this.saveData();
        }
    }

    // Export/Import Methods
    exportData() {
        return JSON.stringify(this.data, null, 2);
    }

    importData(jsonData) {
        try {
            const imported = JSON.parse(jsonData);
            this.data = imported;
            this.saveData();
            return true;
        } catch (err) {
            console.error('Error importing data:', err);
            return false;
        }
    }

    clearAll() {
        this.data = {
            userStories: [],
            bpmnXml: null,
            elementLinks: {}
        };
        this.saveData();
    }
}

export default DataStore;
