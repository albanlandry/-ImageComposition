import React, { useContext, useEffect, useRef, useReducer, useState } from 'react';
import DataTable from 'react-data-table-component';
import { DataGrid } from '@mui/x-data-grid';
import ReactModal from 'react-modal';
import Template from '../src/Template';
import { callback } from '../src/Utils';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CreateNewFolderOutlinedIcon from '@mui/icons-material/CreateNewFolderOutlined';
import Tooltip from '@mui/material/Tooltip';
import { useRouter } from 'next/router';
import Modal from 'react-modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';

// Table component

const URL_NEW_CATCH_POINT = '/catchpoints/new';

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
        // console.log(url);

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

/** Tables sub-headers */

/**
 * 
 * @param {*} props 
 * @returns 
 */
const CPSubHeaderComponent = (props) => {
    const router = props.router;

    return (
        <Stack direction="row" spacing={1}>
            <Tooltip title="새로 캐치 포인트">
                <IconButton aria-label="new" onClick={(e) => { router.push(URL_NEW_CATCH_POINT) } }>
                    <CreateNewFolderOutlinedIcon />
                </IconButton>
            </Tooltip>
        </Stack>
    );
}

// Mission table sub-header
/**
 * 
 * @param {*} props 
 * @returns 
 */
const MSubHeaderComponent = (props) => {
    const dispatch = props.dispatch;

    return (
        <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={(e) => { dispatch({type: DISPATCH_ACTIONS.SET_MODAL, value: true}); } }>
                미션 만들기
            </Button>
        </Stack>
    );
}

// Mission table UI

/**
 * 
 * @param {*} props 
 * @returns 
 */
const MissionTable = (props) => {
    const missions = useCPMissions({params: {cId: props.data.id}});
    const title = props.title || 'Missions';
    const columns = [
        { name: 'Title', selector: (row, _) => row.mission_title, sortable: true },
        { name: 'Description', selector: (row, _) => row.mission_desc, sortable: true },
        { name: 'Point', selector: (row, _) => row.mission_point },
        { name: 'thumbnail', selector: (row, _) => '-'/* row.mission_image */},
    ];
    const [progress, setProgress] = useState(true)

    return (
        <div className="flex">
            <div className="w-full">
                <div className="flex flex-1 p-3 flex-row justify-between">
                    <div className="font-light">
                        {title}
                    </div>
                </div>
                <div className="flex flex-1 p-3 flex-row justify-between">
                    <MSubHeaderComponent {...props} />
                </div>
            <DataTable columns={columns} data={missions} title="Missions"
                pointerOnHover={true}
                highlightOnHover={true}
                selectableRows
                pagination
                noHeader={true}
                />
            </div>
        </div>);
};

// Data and states management
const initialState = {openModal: false, selectedMission: {}};

const DISPATCH_ACTIONS = {
    SET_MODAL: 'open-modal'
};

/**
 * 
 * @param {*} state 
 * @param {*} action 
 * @returns 
 */
function reducer(state, action) {
    switch (action.type) {
        case DISPATCH_ACTIONS.SET_MODAL:
            return {...state, openModal: action.value};
        default:
            throw new Error();
    }
}

/**
 * 
 * @param {*} props 
 */
export default function Catchpoints(props) {
    const [state, dispatch] = useReducer(reducer, initialState);
    const router = useRouter();
    const data = useCatchpoints();
    const [modalIsOpen, setIsOpen] = React.useState(false);
    const RowActionsButtons = ({row}) => {
        return (
            <Stack direction="row" spacing={1}>
                <Tooltip title="수정">
                    <IconButton aria-label="edit">
                        <EditOutlinedIcon />
                    </IconButton>
                </Tooltip>

                <Tooltip title="삭제">
                    <IconButton aria-label="delete">
                        <DeleteOutlinedIcon />
                    </IconButton>
                </Tooltip>
            </Stack>
        );
    };

    const columns = [
        { name: 'Title', selector: (row, _) => row.cp_title, sortable: true },
        { name: 'Subtitle', selector: (row, _) => row.cp_subtitle, sortable: true },
        { name: 'Time', selector: (row, _) => row.cp_time },
        { name: 'Point', selector: (row, _) => row.cp_point },
        { name: 'Price', selector: (row, _) => row.cp_price },
        { name: 'CreatedAt', selector: (row, _) => {return new Intl.DateTimeFormat("ko-KR", {year: "numeric", month: "long", day: "2-digit"}).format(Date.parse(row.cp_date)); }, sortable: true },
        { name: 'Actions', selector: (row, _) => {return <RowActionsButtons row={row}/> } },
    ];


    /** Modal related elements ///////////////////////////////////////////////////////////////// */
    const customStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            width: '350px',
            transform: 'translate(-50%, -50%)',
        },
    };
      
    let subtitle;

    function afterOpenModal() {
        // references are now sync'd and can be accessed.
        // subtitle.style.color = '#f00';
    }
    
    function closeModal() {
        setIsOpen(false);
    }


    /** //////////////////////////////////////////////////////////////////////////////////////// */

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
        return <MissionTable data={props.data} dispatch={dispatch}/>;
    }

    const mainArea = <div className="py-2 px-8 m-auto w-10/12 h-full overflow-y-scroll">
        <DataTable columns={columns} data={data} title="Catch points"
        pointerOnHover={true}
        highlightOnHover={true}
        onRowClicked={handleRowClicked}
        expandableRows={true}
        expandableRowsComponent={ExpandableRowsComponent}
        fixedHeader
        subHeader={true}
        fixedHeaderScrollHeight="500px"
        subHeaderComponent={<CPSubHeaderComponent router={router} />}
        />
        <Modal
            isOpen={state.openModal}
            onAfterOpen={afterOpenModal}
            onRequestClose={closeModal}
            style={customStyles}
            contentLabel="Example Modal"
        >
            <NewMissionForm dispatch={dispatch} data={state.selectedMission} />
        </Modal>
    </div>

    return <Template mainArea={mainArea} />
}




/** Forms ////////////////////////////////////////////////////////////////////////////////////// */
const NewMissionForm = (props) => {
    const dispatch = props.dispatch || {};
    const data = props.data || {title: '', desc: '', point: ''};

    return (
        <Formik
            initialValues={data}
        >
            <Form>
                <div>
                    <Field className="block my-2 border p-1 w-full text-[75%] block" name="title" placeholder="미션 제목" />
                    <Field className="block my-2 border p-1 w-full h-36 text-[75%]" as="textarea" name="desc" placeholder="상세설명" />
                    <Field className="block my-2 border p-1 w-full text-[75%]" name="point" placeholder="포인트, ex: 10" />
                </div>
                <div>
                    <Stack direction='row' spacing={1} justifyContent="flex-end">
                        <Button variant='outlined'  onClick={(e) => { dispatch({type: DISPATCH_ACTIONS.SET_MODAL, value: false}); } }>취소</Button>
                        <Button variant='outlined'>정장</Button>
                    </Stack>
                </div>
            </Form>
        </Formik>
    )
};
