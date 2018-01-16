import React from 'react';
import ReactDOM from 'react-dom';


// interface Props { rateNum: number }
// interface State { stars: [] }

export default class CircleTool extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.toggleCircle = this.toggleCircle.bind(this);
        this.clearCircle = this.clearCircle.bind(this);
        this.state = { active: true };
    } 


    componentDidMount() {
        this.setState({ active: true });
    }

    toggleCircle() {
        const currentState = this.state.active;
        this.props.updateMapByCir(currentState);
        this.setState({ active: !this.state.active });
    }

    clearCircle(){
        this.props.updateMapByClear();
    }

    render() {
        return (
            <div className='searchToolbar'>
                <div id="circle" className={this.state.active ? "active" : ""} onClick={this.toggleCircle}></div>
                <div id="clearCircle" className="active" onClick={this.clearCircle}></div>
            </div>
        );
    }
}