# BPMN Business Process Modeling Tool

A modern, interactive BPMN (Business Process Model and Notation) modeling tool with integrated user story management. Create business processes using drag-and-drop functionality and link user stories directly to process elements.

## Features

### BPMN Process Modeling
- **Drag-and-Drop Interface**: Intuitive canvas for creating BPMN diagrams
- **Full BPMN 2.0 Support**: Support for tasks, events, gateways, and flows
- **Visual Editing**: Real-time visual feedback as you build processes
- **Import/Export**: Import and export BPMN XML files
- **Auto-Save**: Processes are automatically saved to browser local storage

### User Story Management
- **Create User Stories**: Define user stories with title, description, and acceptance criteria
- **Link to Process Elements**: Connect user stories to specific BPMN elements (tasks, events, etc.)
- **Visual Indicators**: Linked elements are highlighted in the diagram
- **Relationship Tracking**: See which stories are linked to each process element

### Data Persistence
- **Local Storage**: All data is saved to browser local storage
- **Export/Import**: Export your entire workspace including processes and stories
- **Auto-Save**: Changes are automatically saved as you work

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:
```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Usage Guide

### Creating a BPMN Process

1. **Add Elements**: Use the palette on the left side of the canvas to drag and drop BPMN elements
2. **Connect Elements**: Click and drag from one element to another to create sequence flows
3. **Edit Properties**: Click on elements to edit their names and properties
4. **Save Process**: Click "Save Process" to persist your work

### Managing User Stories

1. **Add Story**: Click "+ Add Story" in the sidebar
2. **Fill Details**: Enter the story title, description, and acceptance criteria
3. **Save Story**: Click "Save Story" to add it to your list
4. **Edit Story**: Click on any story card to edit it

### Linking Stories to Process Elements

1. **Right-Click Element**: Right-click on any BPMN element in the diagram
2. **Select "Link User Story"**: Choose this option from the context menu
3. **Choose Stories**: Select one or more user stories to link
4. **Confirm**: Click "Link Selected" to create the associations

Linked elements will be highlighted in green on the canvas.

### Viewing Links

- **From Element**: Right-click an element and select "View Links" to see linked stories
- **From Story**: Edit a story to see all linked BPMN elements
- **Remove Links**: Click the × button next to a linked element in the story details

### Importing/Exporting

#### Export BPMN
Click "Export BPMN" to download the current process as a `.bpmn` XML file.

#### Import BPMN
Click "Import BPMN" and select a `.bpmn` file to load it into the modeler.

## Architecture

### Component Structure

```
src/
├── main.js                 # Application entry point
├── modeler/
│   └── BpmnModeler.js     # BPMN.js wrapper and modeler logic
├── stories/
│   └── UserStoryManager.js # User story CRUD and UI management
├── stores/
│   └── DataStore.js       # Data persistence and state management
└── styles/
    └── main.css           # Application styles
```

### Key Technologies

- **bpmn-js**: Industry-standard BPMN modeling library
- **Vite**: Fast build tool and development server
- **Vanilla JavaScript**: No framework dependencies for simplicity
- **LocalStorage API**: Browser-based data persistence

## Data Model

### User Story
```javascript
{
  id: string,
  title: string,
  description: string,
  acceptanceCriteria: string,
  linkedElements: string[] // BPMN element IDs
}
```

### Element Link
```javascript
{
  elementId: {
    storyIds: string[],
    elementData: {
      id: string,
      name: string,
      type: string
    }
  }
}
```

## Browser Compatibility

- Chrome/Edge: Latest versions
- Firefox: Latest versions
- Safari: Latest versions

Modern browser features required:
- ES6 Modules
- LocalStorage
- Flexbox/Grid

## Development Notes

### Adding Custom BPMN Elements

Edit `src/modeler/BpmnModeler.js` to add custom BPMN elements or extensions.

### Styling Customization

Modify `src/styles/main.css` to customize the look and feel.

### Data Storage

Change `src/stores/DataStore.js` to use different storage backends (e.g., IndexedDB, REST API).

## License

See LICENSE.md for details.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker.

---

Built with [bpmn-js](https://bpmn.io/toolkit/bpmn-js/) - A powerful BPMN 2.0 rendering toolkit
