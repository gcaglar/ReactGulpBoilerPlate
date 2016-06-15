var React = require('react');

class Child extends React.Component {
  render() {
    return (
      <div>
        and this is the best <b>{this.props.name}</b>.
      </div>
    );
  }
};

module.exports = Child;
