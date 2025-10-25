import Modeler from 'bpmn-js/lib/Modeler';

const initialDiagram = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="Definitions_1"
                   targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Task_1" name="Sample Task">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Task_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_1" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="158" y="145" width="25" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_1_di" bpmnElement="Task_1">
        <dc:Bounds x="240" y="80" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="400" y="145" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" />
        <di:waypoint x="240" y="120" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" />
        <di:waypoint x="392" y="120" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

class BpmnModeler {
    constructor(containerId, dataStore) {
        this.containerId = containerId;
        this.dataStore = dataStore;
        this.modeler = null;
        this.canvas = null;
        this.elementRegistry = null;
    }

    async init() {
        const container = document.getElementById(this.containerId);

        this.modeler = new Modeler({
            container: container,
            keyboard: {
                bindTo: window
            },
            additionalModules: []
        });

        // Get services
        this.canvas = this.modeler.get('canvas');
        this.elementRegistry = this.modeler.get('elementRegistry');

        // Import initial diagram
        try {
            await this.modeler.importXML(initialDiagram);
            this.canvas.zoom('fit-viewport');
        } catch (err) {
            console.error('Error importing initial diagram:', err);
        }

        // Setup element selection listener
        this.setupEventListeners();
    }

    setupEventListeners() {
        const eventBus = this.modeler.get('eventBus');

        eventBus.on('element.click', (event) => {
            const element = event.element;
            console.log('Element clicked:', element.id, element.type);
        });

        eventBus.on('element.changed', (event) => {
            console.log('Element changed:', event.element.id);
        });
    }

    async createNewDiagram() {
        try {
            await this.modeler.importXML(initialDiagram);
            this.canvas.zoom('fit-viewport');
        } catch (err) {
            console.error('Error creating new diagram:', err);
        }
    }

    async importXML(xml) {
        try {
            await this.modeler.importXML(xml);
            this.canvas.zoom('fit-viewport');
        } catch (err) {
            console.error('Error importing XML:', err);
            throw err;
        }
    }

    async saveXML() {
        try {
            const result = await this.modeler.saveXML({ format: true });
            return result;
        } catch (err) {
            console.error('Error saving XML:', err);
            throw err;
        }
    }

    async saveSVG() {
        try {
            const result = await this.modeler.saveSVG();
            return result;
        } catch (err) {
            console.error('Error saving SVG:', err);
            throw err;
        }
    }

    getElementAtPosition(x, y) {
        // This is a simplified version - in production you'd need proper hit testing
        const elements = this.elementRegistry.getAll();

        // Convert screen coordinates to canvas coordinates
        const viewbox = this.canvas.viewbox();

        for (let element of elements) {
            if (element.x && element.y && element.width && element.height) {
                if (x >= element.x && x <= element.x + element.width &&
                    y >= element.y && y <= element.y + element.height) {
                    return element;
                }
            }
        }

        return null;
    }

    getElementByBusinessObject(elementId) {
        return this.elementRegistry.get(elementId);
    }

    highlightElement(elementId, highlight) {
        const element = this.elementRegistry.get(elementId);
        if (!element) return;

        const modeling = this.modeler.get('modeling');

        if (highlight) {
            // Add a visual indicator that this element has story links
            modeling.setColor(element, {
                stroke: '#4CAF50',
                fill: '#E8F5E9'
            });
        } else {
            // Reset to default colors
            modeling.setColor(element, {
                stroke: null,
                fill: null
            });
        }
    }

    getAllElements() {
        return this.elementRegistry.getAll();
    }

    getElement(elementId) {
        return this.elementRegistry.get(elementId);
    }
}

export default BpmnModeler;
