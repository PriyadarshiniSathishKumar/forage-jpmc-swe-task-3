import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
  setAttribute: (name: string, value: string) => void,
}

class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      ratio: 'float',
      upper_bound: 'float',
      lower_bound: 'float',
      trigger_alert: 'string',
      price_abc: 'float',
      price_def: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }

    if (this.table && elem) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      elem.setAttribute('view', 'y_line');
      elem.setAttribute('row-pivots', '["timestamp"]');
      elem.setAttribute('columns', '["ratio", "upper_bound", "lower_bound", "trigger_alert"]');
      elem.setAttribute('aggregates', JSON.stringify({
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'first',
        price_abc: 'avg',
        price_def: 'avg',
        timestamp: 'distinct count',
      }));

      // Initialize the table with the initial data
      this.table.update(DataManipulator.generateRow(this.props.data));
    }
  }

  componentDidUpdate(prevProps: IProps) {
    if (this.table && this.props.data !== prevProps.data) {
      // Only update the table if the data has changed
      this.table.update(DataManipulator.generateRow(this.props.data));
    }
  }

  render() {
    return React.createElement('perspective-viewer');
  }
}

export default Graph;
