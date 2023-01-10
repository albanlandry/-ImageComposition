import React, { useContext, useEffect, useRef, useReducer, useState } from 'react';
import DataTable from 'react-data-table-component';
import ReactModal from 'react-modal';
import Template from '../src/Template';
import { callback } from '../src/Utils';
import axios from 'axios';

const columns = [
    { name: 'Title', selector: (row, _) => row.cp_title, sortable: true },
    { name: 'Subtitle', selector: (row, _) => row.cp_subtitle, sortable: true },
    { name: 'Time', selector: (row, _) => row.cp_time },
    { name: 'Point', selector: (row, _) => row.cp_point },
    { name: 'Price', selector: (row, _) => row.cp_price },
    { name: 'CreatedAt', selector: (row, _) => row.cp_date, sortable: true },
];

/**
 * Fetches catchpoint data from the server
 * @returns 
 */
const useCatchpoints = () => {
    const [data, setData] = useState([])

    useEffect(() => {
        const fetchData = async() => {
            const config = {
                url: `http://localhost:3000/api/catchpoints`,
                method: 'GET',
            }

            try {
                const response = await axios.request(config);

                setData(response.data);
            } catch (error) {
                console.log({err: error.message})
            }
        }

        fetchData();
    }, [])

    return data;
}

/**
 * 
 * @param {*} props 
 */
export default function Catchpoints(props) {
    const data = useCatchpoints();

    const handleRowClicked = (row, event) => {
        console.log(row, event);
    }

    const ExpandableRowsComponent = (props) => {

        return (
            <div className="w-full h-[500px] bg-cyan-400 overflow-y-hidden">
                <div className="w-full h-[300px] overflow-y-hidden">
                    <img className="w-full h-auto" src={props.data.cp_image} />
                </div>
            </div>);
    }

    const mainArea = <div className="py-2 px-8 m-auto w-9/12 h-full overflow-y-scroll">
        <DataTable columns={columns} data={data} title="Catch points"
        pointerOnHover={true}
        highlightOnHover={true}
        onRowClicked={handleRowClicked}
        expandableRows={true}
        expandableRowsComponent={ExpandableRowsComponent}
        />
    </div>

    return <Template mainArea={mainArea} />
}