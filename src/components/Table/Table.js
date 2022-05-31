import React from "react";
import './Table.scss'

const Row = ({addr, amount, nftOwned}) => (
    <div className="row">
        <div style={{ fontSize: 10, fontWeight: 'bold', display: 'flex', justifyContent: 'center', flexDirection: 'row', alignItems: 'center' }}>{addr}</div>
        <div>{amount}</div>
        <div>{nftOwned}</div>
    </div>
);

/*
  Table component written as an ES6 class
*/
class Table extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }

    render() {
        const rows = this.props.listData.map( (rowData) => <Row key={rowData.addr} {...rowData} />);

        return (
            <div className="table">
                <div className="header">
                    <div>Address</div>
                    <div>Reward Amount</div>
                    <div>NFT owned</div>
                </div>
                <div className="body">
                    {rows}
                </div>
            </div>
        );

    }
}

export default Table;
