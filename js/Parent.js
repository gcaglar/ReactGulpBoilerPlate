var React = require('react');
var Child =  require('./Child');

import { Button } from 'react-bootstrap';

class Parent extends React.Component {
  render() {
    const yay = () => alert('yayyay!');
    return (
      <div>
        <h1> This is the parent. </h1>
        <Child name="child"/>
        <br/>
        <Button bsStyle="success" onClick={yay}>Success</Button>
      </div>
    );
  }
};

module.exports = Parent;
