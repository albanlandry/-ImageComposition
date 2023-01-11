import React, { useContext, useEffect, useRef, useReducer, useState } from 'react';
import DataTable from 'react-data-table-component';
import ReactModal from 'react-modal';
import Template from '../src/Template';
import { callback } from '../src/Utils';
import axios from 'axios';

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
 * @param {*} obj - json object
 */
const buildQueryString = (obj) => {
    const keys = Object.keys(obj);

    return keys.reduce((acc, key) => { 
        if(obj[key]) {
            if(acc.length === 0) return acc+`${key}=${obj[key]}`;
            
            return acc+`&${key}=${obj[key]}`;
        }

        return acc;
    }, '')
}

/**
 * Fetches the missions data from the server
 * @returns 
 */
const useCPMissions = (options = {}) => {
    const queries = options.params || {};
    const [data, setData] = useState([])

    useEffect(() => {
        let queryString = buildQueryString(queries);
        const url = `http://localhost:3000/api/missions${queryString.length > 0? `?${queryString}` : ''}`;

        console.log(url);

        const fetchData = async() => {
            const config = {
                url: url,
                method: 'GET',
            }

            try {
                const response = await axios.request(config);

                if(response.data) setData(response.data);
            } catch (error) {
                console.log({err: error.message})
            }
        }

        fetchData();
    }, [])

    return data;
}

/** UI Items */

// Mission table UI
/**
 * 
 * @param {*} props 
 * @returns 
 */
const MissionTable = (props) => {
    console.log(props.data);
    const missions = useCPMissions({params: {cId: props.data.id}});
    const columns = [
        { name: 'Title', selector: (row, _) => row.mission_title, sortable: true },
        { name: 'Description', selector: (row, _) => row.mission_desc, sortable: true },
        { name: 'Point', selector: (row, _) => row.mission_point },
        { name: 'thumbnail', selector: (row, _) => row.mission_image },
    ];
    const [progress, setProgress] = useState(true)

    useEffect(() => {
        if(missions.length > 0) {
            // setProgress(false);
        }
    })

    return (
        <div className="flex">
            <div className="w-full overflow-y-hidden">
            <DataTable columns={columns} data={missions} title="Missions"
            pointerOnHover={true}
            highlightOnHover={true}
            // progressPending={progress}
            selectableRows
            pagination
            />
            </div>
        </div>);
};

/**
 * 
 * @param {*} props 
 */
export default function Catchpoints(props) {
    const data = useCatchpoints();
    const columns = [
        { name: 'Title', selector: (row, _) => row.cp_title, sortable: true },
        { name: 'Subtitle', selector: (row, _) => row.cp_subtitle, sortable: true },
        { name: 'Time', selector: (row, _) => row.cp_time },
        { name: 'Point', selector: (row, _) => row.cp_point },
        { name: 'Price', selector: (row, _) => row.cp_price },
        { name: 'CreatedAt', selector: (row, _) => {return new Intl.DateTimeFormat("ko-KR", {year: "numeric", month: "long", day: "2-digit"}).format(Date.parse(row.cp_date)); }, sortable: true },
    ];

    /**
     * 
     * @param {*} row 
     * @param {*} event 
     */
    const handleRowClicked = (row, event) => {
        console.log(row, event);
    }

    /**
     * 
     * @param {*} props 
     * @returns 
     */
    const ExpandableRowsComponent = (props) => {
        return <MissionTable data={props.data}/>;
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